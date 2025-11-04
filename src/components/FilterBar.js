// src/components/FilterBar.js
"use client";
// import { Button } from "@/components/ui/button"; // Ganti dengan path yang benar

export const FilterBar = ({ selectedMonth, selectedYear, onMonthChange, onYearChange, onReset }) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center rounded-2xl bg-card p-4 shadow-[var(--shadow-sm)]">
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
        className="p-2 bg-input rounded-md w-full md:w-auto"
      >
        {months.map((month, index) => (
          <option key={index} value={index}>{month}</option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="p-2 bg-input rounded-md w-full md:w-auto"
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <button variant="ghost" onClick={onReset} className="w-full md:w-auto">
        Reset
      </button>
    </div>
  );
};