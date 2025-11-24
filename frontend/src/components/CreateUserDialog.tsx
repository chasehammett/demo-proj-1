import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useState } from "react";
import { api } from "../lib/api";

type Props = { open: boolean; onClose: () => void; onCreated: () => void };

export default function CreateUserDialog({ open, onClose, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
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
      setEmail("");
      setName("");
      setRole("USER");
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setError(e?.response?.data?.error ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create User</DialogTitle>
      <DialogContent>
        <form id="create-user" onSubmit={submit}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
              fullWidth
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </TextField>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          form="create-user"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Creating…" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
