    import React from "react";
    import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    } from "chart.js";
    import { Line, Bar, Pie } from "react-chartjs-2";

    ChartJS.register(
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement
    );

    export default function GraphCanva({ tipo = "line", labels, dados, titulo }) {
    const chartData = {
        labels,
        datasets: dados.map((d) => ({
        label: d.label,
        data: d.data.map((v) => Number(v.toFixed(2))), // arredonda pra 2 casas
        borderColor: d.borderColor || "#33A02C",
        backgroundColor: d.backgroundColor || "#E3E4CB",
        tension: 0.3,
        borderWidth: 2,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        title: {
            display: true,
            text: titulo,
            font: { size: 18 },
        },
        tooltip: {
            enabled: true,
            callbacks: {
            label: (context) =>
                `${context.dataset.label}: ${context.formattedValue}`,
            },
        },
        legend: {
            display: true,
            position: "bottom",
            labels: { boxWidth: 12 },
        },
        },
        scales: {
        y: { beginAtZero: true },
        x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
        },
    };

    return (
        <div
        className="graph-container"
        style={{
            backgroundColor: "#f4f8f2",
            borderRadius: "8px",
            padding: "10px",
        }}
        >
        {tipo === "line" && <Line data={chartData} options={options} />}
        {tipo === "bar" && <Bar data={chartData} options={options} />}
        {tipo === "pie" && <Pie data={chartData} options={options} />}
        </div>
    );
    }
