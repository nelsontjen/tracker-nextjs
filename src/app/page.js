"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, TrendingDown, Calendar as CalendarIcon, Pencil, Trash2, X, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpenseChart from "../components/ExpenseChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExpenses } from "./hooks/useExpenses";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const { token, loading, handleLogout } = useAuth();

  const {
    expenses,
    allExpenses,
    adding,
    chartMonthFilter,
    setChartMonthFilter,
    chartYearFilter,
    setChartYearFilter,
    description,
    setDescription,
    amount,
    setAmount,
    date,
    setDate,
    addExpense,
    deleteExpense,
    editExpense,
    fetchFilteredExpenses,
    fetchAllExpenses
  } = useExpenses(token);

  // === State untuk Modal Edit ===
  const [editingExpense, setEditingExpense] = useState(null); // expense yang sedang diedit
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setEditDesc(exp.description);
    setEditAmount(exp.amount.toLocaleString("id-ID"));
    setEditDate(new Date(exp.date));
  };

  const closeEditModal = () => {
    setEditingExpense(null);
    setEditDesc("");
    setEditAmount("");
    setEditDate(null);
  };

  const handleSaveEdit = async () => {
    if (!editDesc || !editAmount) return;
    const numericAmount = editAmount.toString().replace(/\./g, "").replace(/,/g, "");
    const dateStr = editDate
      ? `${editDate.getFullYear()}-${String(editDate.getMonth() + 1).padStart(2, "0")}-${String(editDate.getDate()).padStart(2, "0")}`
      : null;

    setSaving(true);
    const ok = await editExpense(editingExpense.id, {
      description: editDesc,
      amount: parseFloat(numericAmount),
      date: dateStr,
    });
    setSaving(false);
    if (ok) closeEditModal();
  };

  // === Helper ===
  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/[^0-9]/g, "");
    if (numericValue === "") { setAmount(""); return; }
    setAmount(Number(numericValue).toLocaleString("id-ID"));
  };

  const handleEditAmountChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/[^0-9]/g, "");
    if (numericValue === "") { setEditAmount(""); return; }
    setEditAmount(Number(numericValue).toLocaleString("id-ID"));
  };

  if (loading) return <div>Redirecting to login...</div>;

  return (
    <div className="text-foreground min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* ====== MODAL EDIT ====== */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Expense</h2>
              <button onClick={closeEditModal} className="rounded-lg p-1 hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amount (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={handleEditAmountChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Date</label>
                <div className="relative flex items-center">
                  <CalendarIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <DatePicker
                    selected={editDate}
                    onChange={(d) => setEditDate(d)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date"
                    wrapperClassName="w-full"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeEditModal}
                className="flex-1 h-10 rounded-md border border-input text-sm font-medium hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 h-10 rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : <Check className="h-4 w-4" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== HEADER ====== */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <TrendingDown className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 transition-all hover:scale-[1.02]">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* ====== FORM ADD ====== */}
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)]">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Add New Expense</h2>
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
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                  value={amount}
                  onChange={handleAmountChange}
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
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {adding ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>

          {/* ====== FILTER ====== */}
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Expenses</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={chartMonthFilter}
                onChange={(e) => { setChartMonthFilter(e.target.value); fetchFilteredExpenses(e.target.value, chartYearFilter); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none h-10 text-sm"
              >
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={chartYearFilter}
                onChange={(e) => { const y = parseInt(e.target.value); setChartYearFilter(y); fetchFilteredExpenses(chartMonthFilter, y); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none h-10 text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i - 2;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              {chartMonthFilter !== "all" && (
                <button
                  onClick={() => { setChartMonthFilter("all"); setChartYearFilter(new Date().getFullYear()); fetchAllExpenses(); }}
                  className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all h-10 text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ====== CHART ====== */}
          <ExpenseChart
            expenses={allExpenses.filter((exp) => new Date(exp.date).getFullYear() === chartYearFilter)}
            onMonthClick={(month) => { setChartMonthFilter(month); fetchFilteredExpenses(month, chartYearFilter); }}
            chartMonthFilter={chartMonthFilter}
          />
        </div>

        {/* ====== TOTAL ====== */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-[var(--shadow-lg)] mb-6 mt-6">
          <p className="mb-1 text-sm font-medium opacity-90">Total Expenses</p>
          <p className="text-3xl font-bold">
            Rp {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </p>
        </div>

        {/* ====== LIST ====== */}
        <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)]">
          <h2 className="mb-4 text-lg font-semibold">
            Recent Expenses
            <span className="ml-2 text-sm font-normal text-muted-foreground">({expenses.length} items)</span>
          </h2>
          <div className="space-y-3">
            {expenses.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Belum ada pengeluaran di periode ini.</p>
            )}
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="group rounded-xl bg-muted/50 p-4 transition-all hover:scale-[1.01] hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="font-semibold">{exp.description}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        📅{" "}
                        {new Date(exp.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-destructive whitespace-nowrap">
                        💰 Rp {exp.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Edit & Delete */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
