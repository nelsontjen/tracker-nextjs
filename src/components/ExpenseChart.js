"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale, // <-- Diubah dari LogarithmicScale
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale, // <-- Diubah dari LogarithmicScale
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ExpenseChart({
  expenses,
  onMonthClick,
  chartMonthFilter,
}) {
  const monthlyData = Array(12).fill(0);
  const monthlyCount = Array(12).fill(0);

  expenses.forEach((exp) => {
    const month = new Date(exp.date).getMonth();
    monthlyData[month] += exp.amount;
    monthlyCount[month] += 1;
  });

  // --- Palet Warna yang Ditingkatkan ---
  const COLOR_BASE = "#3b82f6"; // Tailwind blue-500
  const COLOR_BASE_HOVER = "#2563eb"; // Tailwind blue-600
  const COLOR_CURRENT = "#10b981"; // Tailwind emerald-500
  const COLOR_CURRENT_HOVER = "#059669"; // Tailwind emerald-600
  const COLOR_ACTIVE = "#ef4444"; // Tailwind red-500
  const COLOR_ACTIVE_HOVER = "#dc2626"; // Tailwind red-600

  const currentMonthIndex = new Date().getMonth();

  const backgroundColors = Array(12)
    .fill(COLOR_BASE)
    .map((color, index) => {
      const isActive = chartMonthFilter === index + 1;
      const isCurrent = currentMonthIndex === index;

      if (isActive) return COLOR_ACTIVE;
      if (isCurrent) return COLOR_CURRENT;
      return color;
    });

  const hoverBackgroundColors = Array(12)
    .fill(COLOR_BASE_HOVER)
    .map((color, index) => {
      const isActive = chartMonthFilter === index + 1;
      const isCurrent = currentMonthIndex === index;

      if (isActive) return COLOR_ACTIVE_HOVER;
      if (isCurrent) return COLOR_CURRENT_HOVER;
      return color;
    });
  // --- Akhir Palet Warna ---

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((label, i) => (i === currentMonthIndex ? `${label} (Now)` : label)),
    datasets: [
      {
        label: "Pengeluaran Bulanan",
        data: monthlyData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors, // <-- Efek hover
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 6, // <-- Sudut bulat
        borderSkipped: "bottom",
        minBarLength: 10, // <-- Sedikit lebih kecil
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Pengeluaran per Bulan",
        font: {
          size: 18,
          weight: "600", // <-- Membuat judul lebih tebal
        },
        padding: {
          bottom: 20, // <-- Memberi jarak
        },
      },
      tooltip: {
        backgroundColor: "#1e293b", // slate-800
        titleColor: "#f8fafc", // slate-50
        bodyColor: "#e2e8f0", // slate-200
        borderColor: "#334155", // slate-700
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        callbacks: {
          // Callback Anda sudah bagus, tidak perlu diubah
          label: function (context) {
            const month = context.label;
            const total = context.raw;
            const count = monthlyCount[context.dataIndex];
            const avg = count > 0 ? Math.round(total / count) : 0;

            return [
              `Total: Rp ${total.toLocaleString("id-ID")}`,
              `Rata-rata: Rp ${avg.toLocaleString("id-ID")}`,
              `Transaksi: ${count}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        type: "linear", // <-- Mengganti dari 'logarithmic'
        ticks: {
          callback: (value) => `Rp ${value.toLocaleString("id-ID")}`,
          maxTicksLimit: 6,
          color: "#6b7280", // <-- Warna teks muted (gray-500)
        },
        grid: {
          color: "#e5e7eb", // <-- Warna grid lebih lembut (gray-200)
          borderDash: [3, 5], // <-- Membuat grid putus-putus
        },
        border: {
          display: false, // <-- Menghilangkan garis sumbu Y
        },
      },
      x: {
        ticks: {
          color: "#6b7280", // <-- Warna teks muted (gray-500)
        },
        grid: {
          display: false, // <-- Tetap false, sudah bagus
        },
        border: {
          display: false, // <-- Menghilangkan garis sumbu X
        },
      },
    },
    animation: {
      duration: 750, // <-- Sedikit lebih cepat
      easing: "easeOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    // 'elements' bisa dihapus karena sudah di-set di dataset
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const monthIndex = elements[0].index;
        onMonthClick(monthIndex + 1);
      }
    },
  };

  return (
    // JSX Anda sudah bagus, tidak ada perubahan
    <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-md)] mb-6">
      <h2 className="mb-6 text-lg font-semibold">Monthly Expenses</h2>
      <div className="relative h-[400px] w-full">
        <Bar data={data} options={options} />
        {expenses.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80">
            <p className="text-muted-foreground">No expense data</p>
          </div>
        )}
      </div>
    </div>
  );
}
