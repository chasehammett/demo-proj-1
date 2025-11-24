import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

(async () => {
  const email = "admin@demo.dev";
  const password = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email },
    create: { email, password, name: "Admin", role: Role.ADMIN },
    update: { role: Role.ADMIN },
  });
  console.log("Seeded admin:", email, "password: Admin123!");
  await prisma.$disconnect();
})();
