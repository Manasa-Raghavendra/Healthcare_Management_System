// src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "doctor";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

// ✅ get backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  // -----------------------------
  // LOGIN
  // -----------------------------
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) return false;

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  }

  // -----------------------------
  // SIGNUP
  // -----------------------------
  async function signup(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          password,
          role,
        }),
      });

      if (!res.ok) return false;

      // auto login
      return await login(email, password);
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
