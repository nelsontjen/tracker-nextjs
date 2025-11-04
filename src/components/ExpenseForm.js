// src/components/ExpenseForm.js
"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { Button } from "@/components/ui/button"; // Ganti dengan path yang benar

export const ExpenseForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      description,
      amount: parseFloat(amount),
      date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
    };

    onAddExpense(newExpense);

    // Reset form
    setDescription("");
    setAmount("");
    setDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Add New Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 bg-input rounded-md"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 bg-input rounded-md"
        />
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          dateFormat="dd/MM/yyyy"
          className="p-2 bg-input rounded-md w-full"
        />
      </div>
      <button type="submit" className="w-full md:w-auto">
        Add Expense
      </button>
    </form>
  );
};