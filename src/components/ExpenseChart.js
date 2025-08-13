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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ExpenseChart({ expenses, onMonthClick, chartMonthFilter }) {
  const monthlyData = Array(12).fill(0);
  const monthlyCount = Array(12).fill(0);

  expenses.forEach((exp) => {
    const month = new Date(exp.date).getMonth();
    monthlyData[month] += exp.amount;
    monthlyCount[month] += 1;
  });

  const baseColors = [
    "#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#dbeafe","#eff6ff",
    "#f97316","#fb923c","#fdba74","#fed7aa","#fef3c7","#fefce8",
  ];

  const backgroundColors = baseColors.map((color, index) =>
    chartMonthFilter === index + 1 ? "#ef4444" : color // highlight merah
  );

  const data = {
    labels: [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ],
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
      legend: { position: "top" },
      title: { display: true, text: "Pengeluaran per Bulan" },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const monthIndex = tooltipItem.dataIndex;
            const total = monthlyData[monthIndex];
            const count = monthlyCount[monthIndex];
            return `${count} transaksi - Rp ${total.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "Rp " + value.toLocaleString(),
        },
      },
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const monthIndex = elements[0].index;
        onMonthClick(monthIndex + 1);
      }
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
