"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpenseChart from "../components/ExpenseChart";

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [chartMonthFilter, setChartMonthFilter] = useState("all");
  const [date, setDate] = useState(null);

  // --- Helpers ---
  const formatLocalDate = (d) => {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const sortedByDate = (arr) =>
    [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));

  // --- Load data dari backend ---
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch("/api/expenses");
        const data = await res.json();
        setExpenses(sortedByDate(data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchExpenses();
  }, []);

  // --- Tambah expense ---
  const addExpense = async () => {
    if (!description || !amount) return;

    const newExpense = {
      description,
      amount: parseFloat(amount),
      date: date ? formatLocalDate(date) : formatLocalDate(new Date()),
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
      const savedExpense = await res.json();
      setExpenses((prev) => sortedByDate([...prev, savedExpense]));
      setDescription("");
      setAmount("");
      setDate(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Hapus expense ---
  const deleteExpense = async (id) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Filter bulan ---
  const filteredExpenses =
    chartMonthFilter !== "all"
      ? expenses.filter(
          (exp) => new Date(exp.date).getMonth() + 1 === chartMonthFilter
        )
      : monthFilter === "all"
      ? expenses
      : expenses.filter(
          (exp) => new Date(exp.date).getMonth() + 1 === parseInt(monthFilter)
        );

  // --- Total ---
  const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

      {/* Form Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center mb-4">
        <div className="flex flex-col md:flex-row gap-2 flex-grow">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full md:w-1/2"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full md:w-1/2"
          />
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            className="border p-2 w-full md:w-1/1"
          />
        </div>
        <button
          onClick={addExpense}
          className="bg-blue-500 text-white p-2 rounded w-full md:w-auto md:ml-auto mt-2 md:mt-0"
        >
          Add
        </button>
      </div>

      {/* Filter Bulan */}
      <div className="mb-4">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="border p-2"
        >
          <option value="all">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="my-4">
        <ExpenseChart
          expenses={expenses}
          onMonthClick={(month) => setChartMonthFilter(month)}
          chartMonthFilter={chartMonthFilter}
        />
        {chartMonthFilter !== "all" && (
          <button
            onClick={() => setChartMonthFilter("all")}
            className="mt-2 bg-gray-300 p-1 rounded"
          >
            Reset Chart Filter
          </button>
        )}
      </div>

      {/* List */}
      <ul>
        {filteredExpenses.map((exp) => (
          <li
            key={exp.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <p>{exp.description}</p>
              <small>
                {new Date(exp.date).toLocaleDateString()} - Rp{" "}
                {exp.amount.toLocaleString()}
              </small>
            </div>
            <button
              onClick={() => deleteExpense(exp.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Total */}
      <h2 className="mt-4 text-xl font-bold">
        Total: Rp {total.toLocaleString()}
      </h2>
    </div>
  );
}
