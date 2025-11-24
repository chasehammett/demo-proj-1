import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      role: Role;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
