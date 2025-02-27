import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./ChartComponent.css";

Chart.register(...registerables);

const ChartComponent = ({ data }) => {
  if (!data.some(row => row.some(cell => cell !== ""))) {
    return <div className="chart-placeholder">⚠ No Data Available</div>;
  }

  const chartData = {
    labels: data.map((_, index) => `Row ${index + 1}`),
    datasets: [
      {
        label: "Cell Values",
        data: data.map((row) =>
          row.reduce((sum, cell) => {
            if (typeof cell === "string" && cell.trim() !== "") {
              if (/[a-zA-Z]/.test(cell)) {
                return sum + cell.length;
              }
            }
            return sum + (Number(cell) || 0);
          }, 0)
        ),
        backgroundColor: "linear-gradient(135deg, #00c6ff, #0072ff)",
        borderColor: "#0072ff",
        borderWidth: 3,
        borderRadius: 12,
        hoverBackgroundColor: "#00c6ff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ChartComponent;
