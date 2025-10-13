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
import ChartDataLabels from "chartjs-plugin-datalabels";

import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import "../styles/TempPage.css";
import "../styles/Layout.css";
import "../styles/Index.css";
ChartJS.register(ChartDataLabels);

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

export default function TempPage({ bairros, dataExecucao, bairroSelecionado, setBairroSelecionado }) {
  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === bairroSelecionado);


  //const [dataExecucao, setDataExecucao] = useState("2025-09-25");
  const latitude = bairro?.lat;
  const longitude = bairro?.lng;


  const [dadosHoje, setDadosHoje] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = import.meta.env.VITE_CLIMAPI_TOKEN;

  useEffect(() => {
  if (nomeBairro && nomeBairro !== bairroSelecionado){
    setBairroSelecionado(nomeBairro)
  }
}, [nomeBairro, bairroSelecionado, setBairroSelecionado]);


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
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    return new Date(data).toLocaleDateString("pt-BR", options);
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
      const tempAgora =
        tempAtual.find((d) => d.horas === `${horaAtual}:00`) || tempAtual[0];
      const orvalhoAgora =
        orvalho.find((d) => d.horas === `${horaAtual}:00`) || orvalho[0];

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
{/*       <Header /> */}
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal" >
          <h1>Temperatura e Condição do Ar</h1>
          <h2>{bairroSelecionado}</h2>

          {/* <label>
            Data de execução:{" "}
            <input
              className="input-data"
              type="date"
              value={dataExecucao}
              onChange={(e) => setDataExecucao(e.target.value)}
            />
          </label> */}

          {loading && <p>Carregando...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="cards-container">
            {/* === Bloco 1: Temperatura Atual === */}
            {dadosHoje && (
              <div className="card">
                <h3>Temperatura Atual</h3>
                <div className="buttons-container2">
                  <div className="buttons-container">
                    <button>
                      <strong className="dados">{dadosHoje.atual}°C</strong>
                      Atual
                    </button>
                    <button>
                      <strong className="dados">{dadosHoje.orvalho}°C</strong>
                      Ponto de Orvalho
                    </button>
                  </div>
                </div>
              </div>
            )}
            {dadosHoje && (
              <div className="card">
                <h3>Variação Térmica</h3>
                <div className="buttons-container2">
                  <div className="btns">
                    <button className="btn-max">
                      <strong className="dados">{dadosHoje.max}°C</strong>
                      Máxima
                    </button>
                    <button className="btn-min">
                      <strong className="dados">{dadosHoje.min}°C</strong>
                      Mínima
                    </button>
                  </div>
                  <button className="btn-am">
                    <strong className="dados">{dadosHoje.amplitude}°C</strong>
                    Amplitude
                  </button>
                </div>
              </div>
            )}


            {/* === Bloco 3: Variação Semanal === */}

            {dadosSemana.length > 0 && (
              <div className="card">
                <h3>Variação Semanal</h3>
                <button className="highlight-button">
                  Maior Variação:{" "}
                  {/* Exibe a maior variação com duas casas decimais */}
                  {Math.max(...dadosSemana.map((d) => d.variacao)).toFixed(2)}°C
                  em{" "}
                  {
                    dadosSemana.find(
                      (d) =>
                        d.variacao ===
                        Math.max(...dadosSemana.map((x) => x.variacao))
                    ).data
                  }
                </button>

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
                        <td>{d.variacao}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === Bloco 4: Probabilidade de Orvalho === */}
            {dadosSemana.length > 0 && (
              <div className="card" id="chart-card">
                <h3>Probabilidade de Orvalho</h3>
                <div className="chart-container">
                  <Bar
                    data={{
                      labels: dadosSemana.map((d) => d.data),
                      datasets: [
                        {
                          label: "Probabilidade de Orvalho (%)",
                          data: dadosSemana.map((d) => d.probOrvalho),
                          backgroundColor: "#19c388",
                          borderRadius: 5,
                          barPercentage: 0.8,
                          hoverBackgroundColor: "#17a374",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        datalabels: {
                          color: "#fff", // cor padrão do texto
                          anchor: "end",
                          align: "end", // 👈 "end" = acima da barra | "start" = dentro da barra
                          clip: false, // permite que apareça mesmo fora do canvas
                          font: { size: 12, weight: "bold" },
                          formatter: (value) => `${value.toFixed(1)}%`, // arredonda para 1 casa
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#fff", font: { size: 12 } },
                          grid: { display: false, drawBorder: false },
                        },
                        y: {
                          beginAtZero: true,
                          suggestedMax: 110, // dá espaço para mostrar até 100% sem cortar
                          ticks: { color: "#A5D01B", font: { size: 12 } },
                          border: { color: "#A5D01B" },
                          grid: { display: false, drawBorder: false },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
