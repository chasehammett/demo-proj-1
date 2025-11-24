import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  type SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import CreateUserDialog from "../components/CreateUserDialog";
import EditUserDialog from "../components/EditUsersDialogue";
import { api } from "../lib/api";
import type { EditUser, Role, User } from "../types/userTypes";

type SortKey = "createdAt" | "name" | "email" | "role";
type SortDir = "asc" | "desc";

interface ToastState {
  open: boolean;
  msg: string;
  severity: "success" | "error";
}

export default function Users() {
  const { logout } = useAuth();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<User[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<SortDir>("desc");
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<EditUser | null>(null);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    msg: "",
    severity: "success",
  });

  const params = useMemo(
    () => new URLSearchParams({ q, page: String(page), sort, dir }).toString(),
    [q, page, sort, dir]
  );

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get(`/users?${params}`);
      setItems(data.items);
      setPages(data.pages);
      setError("");
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setError(e.response?.data?.error ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/users/${id}`);
      await load();
      setToast({ open: true, msg: "User deleted", severity: "success" });
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setToast({
        open: true,
        msg: e.response?.data?.error ?? "Delete failed",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function roleChip(role: Role) {
    const color: "warning" | "info" = role === "ADMIN" ? "warning" : "info";
    return <Chip label={role} color={color} size="small" />;
  }

  useEffect(() => {
    void load();
  }, [params]);

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Users
          </Typography>

          {/* Sort field */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="sort-by-label">Sort by</InputLabel>
            <Select<SortKey>
              labelId="sort-by-label"
              label="Sort by"
              value={sort}
              onChange={(e: SelectChangeEvent<SortKey>) => {
                setPage(1);
                setSort(e.target.value as SortKey);
              }}
            >
              <MenuItem value="createdAt">Created</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="role">Role</MenuItem>
            </Select>
          </FormControl>

          {/* Sort direction */}
          <ToggleButtonGroup
            size="small"
            exclusive
            value={dir}
            onChange={(_, v: SortDir | null) => {
              if (v) {
                setPage(1);
                setDir(v);
              }
            }}
            aria-label="sort direction"
          >
            <ToggleButton value="asc" aria-label="asc">
              Asc
            </ToggleButton>
            <ToggleButton value="desc" aria-label="desc">
              Desc
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create
          </Button>
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Typography>Loading…</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Stack spacing={1}>
              {items.map((u) => (
                <Card key={u.id} variant="outlined">
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{u.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {u.email}
                        </Typography>
                        {roleChip(u.role)}
                      </Stack>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(u.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelected(u);
                        setOpenEdit(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => void deleteUser(u.id)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? "Deleting…" : "Delete"}
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>

            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination
                count={pages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Stack>
          </>
        )}
      </Container>

      <CreateUserDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false);
          void load();
          setToast({ open: true, msg: "User created", severity: "success" });
        }}
      />

      <EditUserDialog
        open={openEdit}
        user={selected}
        onClose={() => setOpenEdit(false)}
        onSaved={() => {
          setOpenEdit(false);
          setSelected(null);
          void load();
          setToast({ open: true, msg: "User updated", severity: "success" });
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
