import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@demo.dev");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      setError("");
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      setError(e?.response?.data?.error ?? "Login failed");
    }
  }

  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: "center", p: 2 }}>
      <Card
        sx={{ width: 380, maxWidth: "100%" }}
        component="form"
        onSubmit={submit}
      >
        <CardHeader title="Sign in" />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth>
              Sign in
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
