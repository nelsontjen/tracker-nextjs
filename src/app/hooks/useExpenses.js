import { useState, useEffect } from "react";

// === Helper Functions (moved from page.js) ===
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

export function useExpenses(token) {
    const [expenses, setExpenses] = useState([]); // list sesuai filter
    const [allExpenses, setAllExpenses] = useState([]); // semua data untuk chart
    const [adding, setAdding] = useState(false);

    // State for filtering
    const [chartMonthFilter, setChartMonthFilter] = useState(
        String(new Date().getMonth() + 1)
    );
    const [chartYearFilter, setChartYearFilter] = useState(
        new Date().getFullYear()
    );

    // Form State
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(null);

    // === Fetch data bulan yang dipilih ===
    const fetchFilteredExpenses = async (m, y) => {
        if (!token) return;
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
        if (!token) return;
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

    // === Tambah expense ===
    const addExpense = async (e) => {
        if (e) e.preventDefault(); // allow calling from form submit
        if (!description || !amount) return;
        const numericAmount = amount.replace(/\./g, "");
        setAdding(true);
        const newExpense = {
            description,
            amount: parseFloat(numericAmount),
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
        if (!token) return;
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

    // Load data initially and when filters change
    useEffect(() => {
        if (token) {
            fetchFilteredExpenses(chartMonthFilter, chartYearFilter);
        }
    }, [token, chartMonthFilter, chartYearFilter]);

    useEffect(() => {
        if (token) {
            fetchAllExpenses();
        }
    }, [token]);

    return {
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
        fetchFilteredExpenses,
        fetchAllExpenses
    };
}
