"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpenseChart from "../components/ExpenseChart";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]); // list sesuai filter
  const [allExpenses, setAllExpenses] = useState([]); // semua data untuk chart
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartMonthFilter, setChartMonthFilter] = useState(String(new Date().getMonth() + 1)); // default: bulan sekarang
  const [chartYearFilter, setChartYearFilter] = useState(new Date().getFullYear());
  const [date, setDate] = useState(null);
  const [token, setToken] = useState(null);
  const [adding, setAdding] = useState(false);

  // === Helper ===
  const formatLocalDate = (d) => {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const sortedByDate = (arr) =>
    Array.isArray(arr)
      ? [...arr].sort((a, b) => new Date(b.date) - new Date(a.date)) // DESC
      : [];

  const isExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  // === Cek login & set auto logout ===
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t || isExpired(t)) {
      localStorage.removeItem("token");
      router.replace("/login");
    } else {
      setToken(t);
      setLoading(false);
      const payload = JSON.parse(atob(t.split(".")[1]));
      const expireTime = payload.exp * 1000;
      const remainingTime = expireTime - Date.now();

      const timerId = setTimeout(() => {
        handleLogout();
      }, remainingTime);

      return () => clearTimeout(timerId);
    }
  }, [router]);

  // === Fetch data bulan yang dipilih ===
  const fetchFilteredExpenses = async (m, y) => {
    try {
      const res = await fetch(`/api/expenses?month=${m}&year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExpenses(sortedByDate(data));
    } catch (err) {
      console.error(err);
    }
  };

  // === Fetch semua data untuk chart ===
  const fetchAllExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllExpenses(sortedByDate(data));
    } catch (err) {
      console.error(err);
    }
  };

  // === Load data pertama kali ===
  useEffect(() => {
    if (!token) return;
    fetchFilteredExpenses(month, year);
    fetchAllExpenses();
  }, [token]);

  // === Event ganti bulan/tahun ===
  useEffect(() => {
    if (!token) return;
    fetchFilteredExpenses(month, year);
  }, [month, year]);

  // === Tambah expense ===
  const addExpense = async () => {
    if (!description || !amount) return;

    setAdding(true);
    const newExpense = {
      description,
      amount: parseFloat(amount),
      date: date ? formatLocalDate(date) : formatLocalDate(new Date()),
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });
      const savedExpense = await res.json();
      // 1. Selalu update allExpenses (untuk chart)
      setAllExpenses(prev => sortedByDate([...prev, savedExpense]));

      // 2. Update expenses jika sesuai dengan filter aktif
      const expenseMonth = new Date(savedExpense.date).getMonth() + 1;
      const expenseYear = new Date(savedExpense.date).getFullYear();
      // update list sesuai filter
      const shouldAddToFiltered =
        (chartMonthFilter === "all" || expenseMonth === parseInt(chartMonthFilter)) &&
        expenseYear === chartYearFilter;

      if (shouldAddToFiltered) {
        setExpenses(prev => sortedByDate([...prev, savedExpense]));
      }
      // update chart
      // setAllExpenses((prev) => sortedByDate([...prev, savedExpense]));
      setDescription("");
      setAmount("");
      setDate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  // === Hapus expense ===
  const deleteExpense = async (id) => {
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      setAllExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses =
    chartMonthFilter !== "all"
      ? expenses.filter(
        (exp) =>
          new Date(exp.date).getMonth() + 1 === parseInt(chartMonthFilter) &&
          new Date(exp.date).getFullYear() === chartYearFilter
      )
      : expenses.filter(
        (exp) => new Date(exp.date).getFullYear() === chartYearFilter
      );

  if (loading) return <div>Redirecting to login...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Expense Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <button
              onClick={handleLogout}
              className="flex bg-red-500 items-center text-sm hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {/* Form Input */}
      <div className="bg-gray-800 p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Tambah Pengeluaran</h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
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
              className="border p-2 w-full md:w-1/4"
            />
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="border p-2 w-full md:flex-1 min-w-[120px]"
            />
          </div>

          <button
            onClick={addExpense}
            disabled={adding}
            className={`bg-blue-500 text-white p-2 rounded w-full md:w-auto md:ml-auto mt-2 md:mt-0 flex items-center justify-center gap-2 ${adding ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {adding && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
      {/* Chart */}
      {/* Chart + Filter */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-center mb-4">
          {/* Container untuk filter bulan+tahun */}
          <div className="flex flex-1 gap-2 w-full">
            {/* Filter Bulan */}
            <select
              value={chartMonthFilter}
              onChange={(e) => {
                setChartMonthFilter(e.target.value);
                fetchFilteredExpenses(e.target.value, chartYearFilter);
              }}
              className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all" className="text-black">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="text-black">
                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                </option>
              ))}
            </select>

            {/* Filter Tahun */}
            <select
              value={chartYearFilter}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                setChartYearFilter(year);
                fetchFilteredExpenses(chartMonthFilter, year);
              }}
              className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() + i - 2;
                return (
                  <option key={year} value={year} className="text-black">
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Reset Button */}
          {chartMonthFilter !== "all" && (
            <button
              onClick={async () => {
                setChartMonthFilter("all");
                setChartYearFilter(new Date().getFullYear());
                await fetchAllExpenses();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <ExpenseChart
          expenses={allExpenses}
          onMonthClick={(month) => {
            setChartMonthFilter(month);
            fetchFilteredExpenses(month, chartYearFilter);
          }}
          chartMonthFilter={chartMonthFilter}
        />
      </div>

      {/* Total */}
      <h2 className="text-xl font-bold mb-2">
        Total: Rp{" "}
        {(chartMonthFilter === "all" ? allExpenses.filter(e => new Date(e.date).getFullYear() === chartYearFilter) : filteredExpenses).reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
      </h2>

      {/* List */}
      <ul className="space-y-3">
        {(chartMonthFilter === "all"
          ? allExpenses.filter(e => new Date(e.date).getFullYear() === chartYearFilter)
          : filteredExpenses
        ).map((exp) => (
          <li
            key={exp.id}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{exp.description}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span className="mr-2">
                  📅 {new Date(exp.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="font-medium text-red-500">
                  Rp{exp.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <button
              onClick={() => deleteExpense(exp.id)}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
