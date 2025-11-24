import type { AxiosError } from "axios";
import { useState } from "react";
import { api } from "../lib/api";
import type { Role } from "../types/userTypes";

interface Props {
  onClose: () => void;
  onCreated: () => void; // call to refresh list
}

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/users", { email, name, role });
      onCreated();
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setError(e?.response?.data?.error ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create User</h2>
          <button
            onClick={onClose}
            className="text-sm opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full border rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full border rounded p-2"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
