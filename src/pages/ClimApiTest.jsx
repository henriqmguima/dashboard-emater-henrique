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
  LineElement,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function TestApi() {
  const [variavel, setVariavel] = useState("dpt2m");
  const [dataExecucao, setDataExecucao] = useState("2025-08-30"); // formato YYYY-MM-DD
  const [latitude, setLatitude] = useState("-29.7");
  const [longitude, setLongitude] = useState("-51.5");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "633e59b0-7eb5-3cfe-8ade-d8544f8fa24e";

  // Lista de variáveis fornecidas pela API
  const variaveisDisponiveis = [
    { nome: "dpt2m", descricao: "2m above ground dew point temperature (°C)" },
    { nome: "apcpsfc", descricao: "Surface total precipitation (kg/m²)" },
    { nome: "gustsfc", descricao: "Surface wind speed (gust) (m/s)" },
    { nome: "hcdchcll", descricao: "High cloud cover (%)" },
    { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
    { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
    { nome: "pevprsfc", descricao: "Surface potential evaporation rate (mm/6h)" },
    { nome: "rh2m", descricao: "2m relative humidity (%)" },
    { nome: "soill0_10cm", descricao: "Soil moisture 0–10cm (proportion)" },
    { nome: "soill10_40cm", descricao: "Soil moisture 10–40cm (proportion)" },
    { nome: "soill40_100cm", descricao: "Soil moisture 40–100cm (proportion)" },
    { nome: "dswrfsfc", descricao: "Downward short wave radiation flux (W/m²)" },
    { nome: "sunsdsfc", descricao: "Surface sunshine duration (s)" },
    { nome: "tmax2m", descricao: "2m maximum temperature (°C)" },
    { nome: "tmin2m", descricao: "2m minimum temperature (°C)" },
    { nome: "pressfc", descricao: "Surface pressure (Pa)" },
    { nome: "tmpsfc", descricao: "Surface temperature (°C)" },
    { nome: "ugrd10m", descricao: "10m u-component of wind (m/s)" },
    { nome: "vgrd10m", descricao: "10m v-component of wind (m/s)" },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setDados(null);

    try {
      const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${dataExecucao}/${longitude}/${latitude}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const result = await response.json();
      setDados(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teste ClimAPI</h1>

      {/* Seleção de parâmetros */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Variável:{" "}
          <select value={variavel} onChange={(e) => setVariavel(e.target.value)}>
            {variaveisDisponiveis.map((v) => (
              <option key={v.nome} value={v.nome}>
                {v.nome} – {v.descricao}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Data de execução:{" "}
          <input
            type="date"
            value={dataExecucao}
            onChange={(e) => setDataExecucao(e.target.value)}
          />
        </label>
        <br />

        <label>
          Latitude:{" "}
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </label>
        <br />

        <label>
          Longitude:{" "}
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </label>
      </div>

      <button onClick={fetchData} disabled={loading}>
        {loading ? "Carregando..." : "Buscar dados"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Renderiza o gráfico */}
      {dados && (
        <div style={{ marginTop: "30px" }}>
          <Line
            data={{
              labels: dados.map((d) => d.horas),
              datasets: [
                {
                  label: variavel,
                  data: dados.map((d) => d.valor),
                  borderColor: "blue",
                  backgroundColor: "lightblue",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: `Previsão para ${variavel} em ${latitude}, ${longitude}`,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
