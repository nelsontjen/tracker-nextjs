"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,LogarithmicScale);

export default function ExpenseChart({ expenses, onMonthClick, chartMonthFilter }) {
  const monthlyData = Array(12).fill(0);
  const monthlyCount = Array(12).fill(0);

  expenses.forEach((exp) => {
    const month = new Date(exp.date).getMonth();
    monthlyData[month] += exp.amount;
    monthlyCount[month] += 1;
  });

  const baseColors = [
    "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff",
    "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fef3c7", "#fefce8",
  ];

  const backgroundColors = Array(12).fill().map((_, index) => {
    const isActive = chartMonthFilter === index + 1;
    const isCurrentMonth = new Date().getMonth() === index;

    return isActive
      ? "#ef4444" // Merah untuk bulan aktif
      : isCurrentMonth
        ? "#10b981" // Hijau untuk bulan berjalan
        : `hsl(${index * 30}, 70%, 60%)`; // Warna rainbow
  });


  const currentMonth = new Date().getMonth();

  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ].map((label, i) => i === currentMonth ? `${label} (now)` : label),
    datasets: [
      {
        label: "Pengeluaran Bulanan",
        data: monthlyData,
        backgroundColor: backgroundColors,
        borderColor: "#1e3a8a",
        borderWidth: 1,
        minBarLength: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Nonaktifkan legend default
      },
      // Buat custom legend
      afterDraw: (chart) => {
        // Implementasi custom legend di sini
      },
      title: { display: true, text: "Pengeluaran per Bulan" },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const month = context.label;
            const total = context.raw;
            const count = monthlyCount[context.dataIndex];
            const avg = count > 0 ? Math.round(total / count) : 0;

            return [
              `Total: Rp ${total.toLocaleString()}`,
              `Rata-rata: Rp ${avg.toLocaleString()}`,
              `Transaksi: ${count}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        type: 'logarithmic',
        ticks: {
          callback: (value) => `Rp ${Math.round(value).toLocaleString('id-ID')}`,
          maxTicksLimit: 6
        },
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      bar: {
        borderRadius: 6, // Bulatkan sudut bar
        borderSkipped: false,
      }
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const monthIndex = elements[0].index;
        onMonthClick(monthIndex + 1);
      }
    },
  };

  return (
    <div className="relative h-[400px] w-full bg-white rounded-lg p-4 shadow-md">
      <Bar data={data} options={options} />
      {expenses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <p className="text-gray-500">Tidak ada data pengeluaran</p>
        </div>
      )}
    </div>
  );
}
