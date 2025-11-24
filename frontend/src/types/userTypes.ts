export type Role = "ADMIN" | "USER";

export interface EditUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface User extends EditUser {
  createdAt: string;
}
