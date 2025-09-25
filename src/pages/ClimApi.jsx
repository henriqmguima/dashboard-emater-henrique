import { useCallback, useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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
  LineElement,
  BarElement
);

export default function ClimApi({ bairros }) {
  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [dataExecucao, setDataExecucao] = useState("2025-09-22");
  const [latitude] = useState(bairro.lat);
  const [longitude] = useState(bairro.lng);

  const [dadosHoje, setDadosHoje] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "633e59b0-7eb5-3cfe-8ade-d8544f8fa24e";

  const fetchVariavel = async (variavel, data) => {
    const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${data}/${longitude}/${latitude}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Erro ${variavel}: ${response.status}`);
    return response.json();
  };

  const calculaProbOrvalho = (tmin, dpt) => {
    const diff = tmin - dpt;
    let prob = Math.max(0, 100 - diff * 10);
    return Math.min(100, prob);
  };

  // Função auxiliar para formatar a data para DD/MM/YY
  const formatarData = (data) => {
    const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
    return new Date(data).toLocaleDateString('pt-BR', options);
  };

  const fetchHoje = useCallback(async () => {
    try {
      const [tempAtual, orvalho, tmax, tmin] = await Promise.all([
        fetchVariavel("tmpsfc", dataExecucao),
        fetchVariavel("dpt2m", dataExecucao),
        fetchVariavel("tmax2m", dataExecucao),
        fetchVariavel("tmin2m", dataExecucao),
      ]);

      const horaAtual = new Date().getHours();
      const tempAgora = tempAtual.find((d) => d.horas === `${horaAtual}:00`) || tempAtual[0];
      const orvalhoAgora = orvalho.find((d) => d.horas === `${horaAtual}:00`) || orvalho[0];

      setDadosHoje({
        atual: tempAgora.valor,
        orvalho: orvalhoAgora.valor,
        max: tmax[0].valor,
        min: tmin[0].valor,
        // Altera a amplitude para ter duas casas decimais
        amplitude: (tmax[0].valor - tmin[0].valor).toFixed(2),
      });
    } catch (err) {
      setError(err.message);
    }
  }, [dataExecucao, latitude, longitude]);

  const fetchSemana = useCallback(async () => {
    const semana = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(dataExecucao);
      data.setDate(data.getDate() - i);

      // Formata a data para DD/MM/YY
      const dataFormatada = formatarData(data);

      try {
        const [tmax, tmin, orvalho] = await Promise.all([
          fetchVariavel("tmax2m", data.toISOString().slice(0, 10)),
          fetchVariavel("tmin2m", data.toISOString().slice(0, 10)),
          fetchVariavel("dpt2m", data.toISOString().slice(0, 10)),
        ]);

        const varTemp = tmax[0].valor - tmin[0].valor;
        const probOrvalho = calculaProbOrvalho(tmin[0].valor, orvalho[0].valor);

        semana.push({
          data: dataFormatada,
          max: tmax[0].valor,
          min: tmin[0].valor,
          variacao: varTemp,
          probOrvalho,
        });
      } catch (err) {
        console.error("Erro semana:", err);
      }
    }
    setDadosSemana(semana.reverse());
  }, [dataExecucao, latitude, longitude]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchHoje(), fetchSemana()]).finally(() => setLoading(false));
  }, [fetchHoje, fetchSemana]);

  // === Render ===
  return (
    <div className="layout-emater">
      <Header />
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal" style={{ padding: "20px" }}>
          <h1>ClimAPI</h1>
          <h2>{nomeBairro}</h2>

          <label>
            Data de execução:{" "}
            <input
              className="input-data"
              type="date"
              value={dataExecucao}
              onChange={(e) => setDataExecucao(e.target.value)}
            />
          </label>

          {loading && <p>Carregando...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="cards-container">
            {/* === Bloco 1: Temperatura Atual === */}
            {dadosHoje && (
              <div className="card">
                <h3>Temperatura Atual</h3>
                <p>Atual: {dadosHoje.atual}°C</p>
                <p>Ponto de Orvalho: {dadosHoje.orvalho}°C</p>
              </div>
            )}

            {/* === Bloco 2: Variação Térmica === */}
            {dadosHoje && (
              <div className="card">
                <h3>Variação Térmica</h3>
                <p>Máx: {dadosHoje.max}°C</p>
                <p>Mín: {dadosHoje.min}°C</p>
                <p>Amplitude: {dadosHoje.amplitude}°C</p>
              </div>
            )}

            {/* === Bloco 3: Variação Semanal === */}
            {dadosSemana.length > 0 && (
              <div className="card">
                <h3>Variação Semanal</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Máx</th>
                      <th>Mín</th>
                      <th>Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosSemana.map((d, i) => (
                      <tr key={i}>
                        <td>{d.data}</td>
                        <td>{d.max}°C</td>
                        <td>{d.min}°C</td>
                        {/* Exibe a variação com duas casas decimais */}
                        <td>{d.variacao.toFixed(2)}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  Maior Variação:{" "}
                  {/* Exibe a maior variação com duas casas decimais */}
                  {Math.max(...dadosSemana.map((d) => d.variacao)).toFixed(2)}°C em{" "}
                  {dadosSemana.find(
                    (d) => d.variacao === Math.max(...dadosSemana.map((x) => x.variacao))
                  ).data}
                </p>
              </div>
            )}

            {/* === Bloco 4: Probabilidade de Orvalho === */}
            {dadosSemana.length > 0 && (
              <div className="card">
                <h3>Probabilidade de Orvalho</h3>
                <Bar
                  data={{
                    labels: dadosSemana.map((d) => d.data),
                    datasets: [
                      {
                        label: "Probabilidade de Orvalho (%)",
                        data: dadosSemana.map((d) => d.probOrvalho),
                        backgroundColor: "#69d01b",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
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