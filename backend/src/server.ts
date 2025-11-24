// src/server.ts
import { Prisma, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const env = z
  .object({
    JWT_SECRET: z.string().min(1),
    PORT: z.string().optional(),
  })
  .parse(process.env);

const listUsersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  q: z.string().default(""),
  sort: z.enum(["createdAt", "name", "email", "role"]).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

// ✅ Fail fast if missing token
const JWT_SECRET = env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

// A helper type (optional, but clear)
type JwtUser = { id: number; role: Role };

// Strongly typed middleware
function auth(requiredRole?: Role): express.RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const payload = jwt.verify(token, JWT_SECRET!) as {
        id: number;
        role: Role;
      };
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole)
        return res.status(403).json({ error: "Forbidden" });
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ errors: z.treeifyError(parsed.error) });
  const { email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name: email.split("@")[0] || "New User" },
  });
  res.json({ id: user.id });
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ errors: z.treeifyError(parsed.error) });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid creds" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role } satisfies JwtUser,
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// Users CRUD (protected; admin for write ops)
app.get("/api/users", auth(Role.ADMIN), async (req, res) => {
  const parsed = listUsersQuery.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ errors: parsed.error.flatten() });

  const { page, q, sort, dir } = parsed.data;
  const take = 10;
  const skip = (page - 1) * take;

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      skip,
      take,
      orderBy: { [sort]: dir }, // 👈 dynamic sort
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / take) });
});

// Zod wants the runtime enum object (top-level Role is perfect)
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
});

app.post("/api/users", auth(Role.ADMIN), async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ errors: z.treeifyError(parsed.error) });

  const { email, name, role } = parsed.data;

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash("TempPass123!", 10),
      role: role ?? Role.USER, // ✅ ensures correct type
    },
  });

  res.json(user);
});

const idSchema = z.object({ id: z.coerce.number().int().positive() });

app.put("/api/users/:id", auth(Role.ADMIN), async (req, res) => {
  const idParsed = idSchema.safeParse(req.params);
  if (!idParsed.success)
    return res.status(400).json(z.treeifyError(idParsed.error));

  const parsed = userSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json(z.treeifyError(parsed.error));

  const updateData = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
  ) as Prisma.UserUpdateInput;

  const user = await prisma.user.update({
    where: { id: idParsed.data.id },
    data: updateData,
  });

  res.json(user);
});

// ❌ was: auth(Prisma.Role.ADMIN) —> ✅ use the imported Role enum
app.delete("/api/users/:id", auth(Role.ADMIN), async (req, res) => {
  const idParsed = idSchema.safeParse(req.params);
  if (!idParsed.success)
    return res.status(400).json(z.treeifyError(idParsed.error));
  await prisma.user.delete({ where: { id: idParsed.data.id } });
  res.json({ ok: true });
});

const port = Number(env.PORT || 4000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));

// (optional) graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
