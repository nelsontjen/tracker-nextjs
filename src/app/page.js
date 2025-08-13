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

  // Load dari localStorage
  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(savedExpenses);
  }, []);

  // Simpan ke localStorage tiap ada perubahan
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    if (!description || !amount) return;
    const newExpense = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date: date ? date.toISOString() : new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);
    setDescription("");
    setAmount("");
    setDate(null);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Filter bulan
  const filteredExpenses =
  chartMonthFilter !== "all"
    ? expenses.filter((exp) => new Date(exp.date).getMonth() + 1 === chartMonthFilter)
    : monthFilter === "all"
    ? expenses
    : expenses.filter(
        (exp) => new Date(exp.date).getMonth() + 1 === parseInt(monthFilter)
      );
// Pass function ke chart
<ExpenseChart
  expenses={expenses}
  onMonthClick={(month) => setChartMonthFilter(month)}
/>
  const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

      {/* Form Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center">
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
          className="bg-blue-500 text-white p-2 rounded w-full md:w-auto md:ml-auto"
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
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
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
