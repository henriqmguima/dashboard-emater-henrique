import { useCallback, useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import "../styles/ClimApi.css";


ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function NuvensPage({ bairros }) {

  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [variavel, setVariavel] = useState("hcdchcll");
  const [dataExecucao, setDataExecucao] = useState("2025-09-22"); // formato YYYY-MM-DD
  const [latitude, setLatitude] = useState(bairro.lat);
  const [longitude, setLongitude] = useState(bairro.lng);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "8c4040d2-0e13-363b-b5b5-7703d6cef658";

  // Lista de variáveis fornecidas pela API
  const variaveisDisponiveis = [
    { nome: "hcdchcll", descricao: "High cloud cover (%)" },
    { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
    { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
    {nome: "pevprsfc",descricao: "Surface potential evaporation rate (mm/6h)",},
    { nome: "sunsdsfc", descricao: "Surface sunshine duration (s)" },
  ];

  const fetchData = useCallback(async () => {
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
  }, [dataExecucao, latitude, longitude, variavel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="layout-emater">
      <Header />
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal">




          <div style={{ padding: "20px" }}>
            <h1>ClimAPI</h1>
            <h2>{nomeBairro}</h2>

            {/* Seleção de parâmetros */}
            <div style={{ marginBottom: "20px" }}>
              <label>
                Variável:{" "}
                <select
                  value={variavel}
                  onChange={(e) => setVariavel(e.target.value)}
                >
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
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Renderiza o gráfico */}
            {dados && (
              <div className="grafico" style={{ marginTop: "30px" }}>
                <Line
                  data={{
                    labels: dados.map((d) => d.horas),
                    datasets: [
                      {
                        label: variavel,
                        data: dados.map((d) => d.valor),
                        borderColor: "#33A02C",
                        backgroundColor: "#A5D01B",
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
        </div>
      </div>
    </div>
  );
}
