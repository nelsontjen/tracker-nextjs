"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const addExpense = () => {
    if (!title || !amount) return;
    const newExpense = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
    };
    setExpenses([...expenses, newExpense]);
    setTitle("");
    setAmount("");
  };
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

        {/* Form */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nama pengeluaran"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="number"
            placeholder="Jumlah (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <button
            onClick={addExpense}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Tambah
          </button>
        </div>

        {/* Daftar Pengeluaran */}
        <ul>
          {expenses.map((exp) => (
            <li
              key={exp.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{exp.title}</span>
              <span>Rp {exp.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        {/* ✅ TOTAL PENGELUARAN */}
        <div className="mt-4 font-bold text-lg border-t pt-2">
          Total: Rp {total.toLocaleString()}
        </div>
      </div>
    </main>
  );
}
