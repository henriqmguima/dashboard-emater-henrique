import React from "react";
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement } from "chart.js";
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

export default function GraphCanva({ tipo = "line", labels, dados, label, titulo }) {
    const chartData = {
        labels,
        datasets: [
        {
            label,
            data: dados,
            borderColor: "#33A02C",
            backgroundColor: "#E3E4CB",
        },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
        title: {
            display: true,
            text: titulo,
        },
        },
    };

    switch (tipo) {
        case "line":
        return <Line key={titulo} data={chartData} options={options} />;
        case "bar":
        return <Bar key={titulo} data={chartData} options={options} />;
        case "pie":
        return <Pie key={titulo} data={chartData} options={options} />;
        default:
        return null;
    }
}
