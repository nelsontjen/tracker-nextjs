"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
// --- Cek token saat halaman dibuka ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/"); // langsung redirect kalau token ada
    }
  }, [router]);
  const handleLogin = async (e) => {
    e.preventDefault(); // supaya tidak reload page

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="username"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          type="submit" // penting
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Login
        </button>
      </form>

      <p className="mt-2 text-center text-sm">
        Dont have an account?{" "}
        <a href="/register" className="text-blue-500 underline">
          Register
        </a>
      </p>
    </div>
  );
}
