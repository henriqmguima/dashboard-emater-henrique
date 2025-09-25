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
import "../styles/Layout.css";


ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function ClimApi({ bairros }) {

  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [variavel, setVariavel] = useState("dpt2m");
  const [dataExecucao, setDataExecucao] = useState("2025-09-22"); // formato YYYY-MM-DD
  const [latitude, setLatitude] = useState(bairro.lat);
  const [longitude, setLongitude] = useState(bairro.lng);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "8c4040d2-0e13-363b-b5b5-7703d6cef658";

  // Lista de variáveis fornecidas pela API
  const variaveisDisponiveis = [
    { nome: "dpt2m", descricao: "2m above ground dew point temperature (°C)" },
    { nome: "apcpsfc", descricao: "Surface total precipitation (kg/m²)" },
    { nome: "gustsfc", descricao: "Surface wind speed (gust) (m/s)" },
    { nome: "hcdchcll", descricao: "High cloud cover (%)" },
    { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
    { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
    {
      nome: "pevprsfc",
      descricao: "Surface potential evaporation rate (mm/6h)",
    },
    { nome: "rh2m", descricao: "2m relative humidity (%)" },
    { nome: "soill0_10cm", descricao: "Soil moisture 0–10cm (proportion)" },
    { nome: "soill10_40cm", descricao: "Soil moisture 10–40cm (proportion)" },
    { nome: "soill40_100cm", descricao: "Soil moisture 40–100cm (proportion)" },
    {
      nome: "dswrfsfc",
      descricao: "Downward short wave radiation flux (W/m²)",
    },
    { nome: "sunsdsfc", descricao: "Surface sunshine duration (s)" },
    { nome: "tmax2m", descricao: "2m maximum temperature (°C)" },
    { nome: "tmin2m", descricao: "2m minimum temperature (°C)" },
    { nome: "pressfc", descricao: "Surface pressure (Pa)" },
    { nome: "tmpsfc", descricao: "Surface temperature (°C)" },
    { nome: "ugrd10m", descricao: "10m u-component of wind (m/s)" },
    { nome: "vgrd10m", descricao: "10m v-component of wind (m/s)" },
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
          <h2 className="titulo-bairro">{nomeBairro}</h2>

          <div className="grid-clima">
            {/* Temperatura atual (esquerda cima) */}
            <div className="card card-temperatura">
              <div className="card-header">
                <h3>Temperatura atual</h3>
                <span className="icon">🌡️</span>
              </div>
              <div className="card-info">
                <span className="valor">22°C</span>
                <span className="ponto-orvalho" style={{ color: "#A5D01B" }}>
                  Ponto de orvalho: 18°C
                </span>
              </div>
              <div className="card-grafico">
                {dados ? (
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
                    options={{ responsive: true }}
                  />
                ) : (
                  <p style={{ color: "#aaa", textAlign: "center" }}>Carregando dados...</p>
                )}
              </div>
            </div>

            {/* Variação térmica (direita cima) */}
            <div className="card card-variacao-termica">
              <div className="card-header">
                <h3>Variação Térmica</h3>
              </div>
              <div className="card-info spans-variacao">
                <div>
                  <span style={{ color: "#C4BE15" }}>26°C</span>
                  <small>Máx (12:00)</small>
                </div>
                <div>
                  <span style={{ color: "#19C388" }}>12°C</span>
                  <small>Min (00:00)</small>
                </div>
                <div>
                  <span style={{ color: "#60C034" }}>14°C</span>
                  <small>Amplitude térmica</small>
                </div>
              </div>
            </div>

            {/* Probabilidade de Carvalho (esquerda baixo) */}
            <div className="card card-carvalho">
              <div className="card-header">
                <h3>Probabilidade de Carvalho</h3>
                <span className="icon" style={{ color: "#18D5A0" }}>💧</span>
              </div>
              <div className="card-info">
                <span className="percentual" style={{ color: "#18D5A0" }}>80%</span>
                <span className="condicoes" style={{ color: "#18D5A0" }}>
                  Condições favoráveis (Temp. Min: 16°C | Ponto Orvalho: 18°C)
                </span>
              </div>
              <div className="card-grafico">
                {/* Placeholder do gráfico em barras */}
                <div className="grafico-barras">[Gráfico de barras aqui]</div>
              </div>
            </div>

            {/* Variação semanal (direita baixo) */}
            <div className="card card-variacao-semanal">
              <div className="card-header">
                <h3>Variação Semanal</h3>
                <span className="icon">🌡️</span>
              </div>
              <div className="card-info">
                <span style={{ color: "#60C034" }}>23/09 | Ensolarado</span>
                <small>Maior variação</small>
              </div>
              <div className="card-tabela">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Temp. Min.</th>
                      <th>Temp. Máx.</th>
                      <th>Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>23/09</td>
                      <td>12°C</td>
                      <td>26°C</td>
                      <td>14°C</td>
                    </tr>
                    <tr>
                      <td>24/09</td>
                      <td>13°C</td>
                      <td>25°C</td>
                      <td>12°C</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
