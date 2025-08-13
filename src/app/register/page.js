"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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
  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/login"); // setelah register redirect ke login
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
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
        onClick={handleRegister}
        className="bg-green-500 text-white p-2 rounded w-full"
      >
        Register
      </button>

      <p className="mt-2 text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 underline">
          Login
        </a>
      </p>
    </div>
  );
}
