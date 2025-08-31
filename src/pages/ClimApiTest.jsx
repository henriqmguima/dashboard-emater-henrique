// 1️⃣ Importações no topo do arquivo
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

// 2️⃣ Registrar os componentes do ChartJS
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// 3️⃣ Componente React
export default function TestApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "d077f1d2-7ff2-37b3-95f1-ad1ee842e100";

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const variavel = "dpt2m";
    const dataExecucao = "2025-08-30";
    const latitude = "-29.7";
    const longitude = "-51.5";

    const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${dataExecucao}/${longitude}/${latitude}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teste ClimAPI</h1>
      <button onClick={fetchData} disabled={loading}>
        {loading ? "Carregando..." : "Buscar dados"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 4️⃣ Aqui renderizamos o gráfico */}
      {data && (
        <Line
          data={{
            labels: data.map(d => d.horas),
            datasets: [
              {
                label: "Temperatura do ponto de orvalho (°C)",
                data: data.map(d => d.valor),
                borderColor: "blue",
                backgroundColor: "lightblue",
              },
            ],
          }}
          options={{ responsive: true }}
        />
      )}
    </div>
  );
}
