"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpenseChart from "../components/ExpenseChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]); // list sesuai filter
  const [allExpenses, setAllExpenses] = useState([]); // semua data untuk chart
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartMonthFilter, setChartMonthFilter] = useState(
    String(new Date().getMonth() + 1)
  ); // default: bulan sekarang
  const [chartYearFilter, setChartYearFilter] = useState(
    new Date().getFullYear()
  );
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
      setAllExpenses((prev) => sortedByDate([...prev, savedExpense]));

      // 2. Update expenses jika sesuai dengan filter aktif
      const expenseMonth = new Date(savedExpense.date).getMonth() + 1;
      const expenseYear = new Date(savedExpense.date).getFullYear();
      // update list sesuai filter
      const shouldAddToFiltered =
        (chartMonthFilter === "all" ||
          expenseMonth === parseInt(chartMonthFilter)) &&
        expenseYear === chartYearFilter;

      if (shouldAddToFiltered) {
        setExpenses((prev) => sortedByDate([...prev, savedExpense]));
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
    <div className="text-foreground min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <TrendingDown className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Expense Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 transition-all hover:scale-[1.02]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)]">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Add New Expense
            </h2>
            <form onSubmit={addExpense} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-all focus:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-all focus:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="relative flex items-center">
                  <CalendarIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date"
                    wrapperClassName="w-full"
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm transition-all hover:cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring",
                      !date && "text-muted-foreground"
                    )}
                  />
                </div>
              </div>

              <button
                onClick={addExpense}
                disabled={adding}
                className="inline-flex items-center justify-center w-full rounded-md h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-gradient-to-r from-primary to-accent transition-all hover:opacity-90 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
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
                {adding ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Expenses</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Select Bulan */}
              <select
                value={chartMonthFilter}
                onChange={(e) => {
                  setChartMonthFilter(e.target.value);
                  fetchFilteredExpenses(e.target.value, chartYearFilter);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none h-10 text-sm"
              >
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {/* Dirapikan ke satu baris */}
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              {/* Select Tahun */}
              <select
                value={chartYearFilter}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setChartYearFilter(year);
                  fetchFilteredExpenses(chartMonthFilter, year);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none h-10 text-sm"
              >
                {/* Dirapikan ke satu baris return */}
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i - 2;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              {/* Tombol Reset */}
              {chartMonthFilter !== "all" && (
                <button
                  onClick={() => {
                    setChartMonthFilter("all");
                    setChartYearFilter(new Date().getFullYear());
                    fetchAllExpenses(); // Asumsi Anda memiliki fungsi ini
                  }}
                  className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all h-10 text-sm"
                >
                  Reset
                </button>
              )}
            </div>
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
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-[var(--shadow-lg)] mb-6">
          <p className="mb-1 text-sm font-medium opacity-90">Total Expenses</p>
          <p className="text-3xl font-bold">
            Rp{" "}
            {(chartMonthFilter === "all"
              ? allExpenses.filter(
                  (e) => new Date(e.date).getFullYear() === chartYearFilter
                )
              : filteredExpenses
            )
              .reduce((sum, exp) => sum + exp.amount, 0)
              .toLocaleString()}
          </p>
        </div>

        {/* List */}
        <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)]">
          <h2 className="mb-4 text-lg font-semibold">
            Recent Expenses
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (
              {
                (chartMonthFilter === "all"
                  ? allExpenses.filter(
                      (e) => new Date(e.date).getFullYear() === chartYearFilter
                    )
                  : filteredExpenses
                ).length
              }{" "}
              items)
            </span>
          </h2>
          <div className="space-y-3">
            {(chartMonthFilter === "all"
              ? allExpenses.filter(
                  (e) => new Date(e.date).getFullYear() === chartYearFilter
                )
              : filteredExpenses
            ).map((exp) => (
              <div
                key={exp.id}
                className="group rounded-xl bg-muted/50 p-4 transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{exp.description}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        📅{" "}
                        {new Date(exp.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-destructive">
                        💰 Rp {exp.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
