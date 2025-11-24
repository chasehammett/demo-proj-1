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
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { EditUser, Role } from "../types/userTypes";

type Props = {
  open: boolean;
  user: EditUser | null;
  onClose: () => void;
  onSaved: () => void; // refresh list
};

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setError("");
    }
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      await api.put(`/users/${user.id}`, { name, role });
      onSaved();
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setError(e?.response?.data?.error ?? "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <form id="edit-user" onSubmit={submit}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Email"
              value={user?.email ?? ""}
              disabled
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
              onChange={(e) => setRole(e.target.value as Role)}
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
          form="edit-user"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
