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
import Carregando from "../components/Carregando";
import Erro from "../components/Erro";
import "../styles/TempPage.css";
import "../styles/Layout.css";
import "../styles/Index.css";
import {
  fetchDadosDia,
  fetchDadosSemana,
  calcularAmplitude,
  arredondar,
  cores,
} from "../utils/tempUtil"
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
  const latitude = bairro?.lat;
  const longitude = bairro?.lng;

  // === Seleção de token automático (muda só ao recarregar a página) ===
  const tokensString = import.meta.env.VITE_CLIMAPI_TOKENS || '';
  const tokensArray = tokensString.split(',').map(t => t.trim());

  // Função auxiliar para pegar e salvar índice
  function getNextToken() {
    let currentIndex = parseInt(localStorage.getItem('lastTokenIndex')) || 0;
    const token = tokensArray[currentIndex];

    // Calcula o próximo índice cíclico
    const nextIndex = (currentIndex + 1) % tokensArray.length;
    localStorage.setItem('lastTokenIndex', nextIndex);

    return { token, nextIndex };
  }

  // Se já existe um token nesta sessão, usa o mesmo
  // Se for reload, gera um novo
  let tokenInfo = sessionStorage.getItem('currentToken');

  if (!tokenInfo) {
    const { token, nextIndex } = getNextToken();
    sessionStorage.setItem('currentToken', token);

    // Log informativo
    console.log('🔑 Token atual:', token);
    console.log('➡️ Próximo token será:', tokensArray[nextIndex]);
  } else {
    console.log('🔑 Token atual (mesmo da sessão):', tokenInfo);

    const nextIndex = parseInt(localStorage.getItem('lastTokenIndex')) || 0;
    console.log('➡️ Próximo token será:', tokensArray[nextIndex]);
  }

  const token = sessionStorage.getItem('currentToken');



  const [dadosHoje, setDadosHoje] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (nomeBairro && nomeBairro !== bairroSelecionado){
      setBairroSelecionado(nomeBairro);
    }
  }, [nomeBairro, bairroSelecionado, setBairroSelecionado]);

  const fetchHoje = useCallback(async () => {
    const variaveis = [
      { nome: "tmpsfc" },
      { nome: "dpt2m" },
      { nome: "tmax2m" },
      { nome: "tmin2m" },
    ];

    const dados = await fetchDadosDia(dataExecucao, latitude, longitude, token, variaveis);

    const tempAtual = dados.find((d) => d.nome === "tmpsfc")?.dados || [];
    const orvalho = dados.find((d) => d.nome === "dpt2m")?.dados || [];
    const tmax = dados.find((d) => d.nome === "tmax2m")?.dados[0]?.valor || 0;
    const tmin = dados.find((d) => d.nome === "tmin2m")?.dados[0]?.valor || 0;

    const horaAtual = new Date().getHours();
    const tempAgora = tempAtual.find((d) => d.horas === `${horaAtual}:00`)?.valor || tempAtual[0]?.valor || 0;
    const orvalhoAgora = orvalho.find((d) => d.horas === `${horaAtual}:00`)?.valor || orvalho[0]?.valor || 0;

    setDadosHoje({
      atual: tempAgora,
      orvalho: orvalhoAgora,
      max: tmax,
      min: tmin,
      amplitude: calcularAmplitude(tmax, tmin),
    });
  }, [dataExecucao, latitude, longitude, token]);

  const fetchSemana = useCallback(async () => {
    const semana = await fetchDadosSemana(dataExecucao, latitude, longitude, token);
    setDadosSemana(semana);
  }, [dataExecucao, latitude, longitude, token]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchHoje(), fetchSemana()]);
      } catch (err) {
        const msg = String(err.message);
        if (msg === "DATA_INVALIDA") setError("DATA_INVALIDA");
        else if (msg === "COORDENADAS_INVALIDAS") setError("COORDENADAS_INVALIDAS");
        else if (err instanceof TypeError && /fetch|network/i.test(msg)) setError("ERRO_DE_CONEXAO");
        else {
          const match = msg.match(/Erro(?:\s+\w+)?:\s*(\d+)/);
          setError(match ? Number(match[1]) : "ERRO_DESCONHECIDO");
        }
        setDadosHoje(null);
        setDadosSemana([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchHoje, fetchSemana, latitude, longitude]);

  const maiorVariacaoObj = dadosSemana.length > 0
    ? dadosSemana.reduce((a, b) => (b.amplitude > a.amplitude ? b : a), dadosSemana[0])
    : null;

  // === Render único ===
  return (
    <div className="layout-emater">
      {/* <Header /> */}
      <div className="layout-inferior">
        <div className="aside_space"><Aside /></div>
        <div className="conteudo-principal">
          <h1>Temperatura e Condição do Ar</h1>
          <h2>{bairroSelecionado}</h2>

                {loading && (
                    <div className="info-container">
                    <Carregando />
                    </div>
                )}

                {error && (
                    <div className="info-container">
                    <Erro codigo={error} />
                    </div>
                )}  

          {!loading && !error && dadosHoje && (
            <div className="cards-container">
              {/* Temperatura Atual */}
              <div className="card">
                <h3>Temperatura Atual</h3>
                <div className="buttons-container2">
                  <button>
                    <strong className="dados" style={{ color: cores.max }}>
                      {arredondar(dadosHoje.atual)}°C
                    </strong>
                    Atual
                  </button>
                  <button>
                    <strong className="dados" style={{ color: cores.orvalho }}>
                      {arredondar(dadosHoje.orvalho)}°C
                    </strong>
                    Ponto de Orvalho
                  </button>
                </div>
              </div>

              {/* Variação Térmica */}
              <div className="card">
                <h3>Variação Térmica</h3>
                <div className="buttons-container2">
                  <button style={{ background: cores.max }}>
                    <strong className="dados">{arredondar(dadosHoje.max)}°C</strong> Máxima
                  </button>
                  <button style={{ background: cores.min }}>
                    <strong className="dados">{arredondar(dadosHoje.min)}°C</strong> Mínima
                  </button>
                  <button style={{ background: cores.amplitude }}>
                    <strong className="dados">{arredondar(dadosHoje.amplitude)}°C</strong> Amplitude
                  </button>
                </div>
              </div>

              {/* Semana */}
              {dadosSemana.length > 0 && (
                <>
                  <div className="card">
                    <h3>Variação Semanal</h3>
                    {maiorVariacaoObj && (
                      <button className="highlight-button">
                        Maior Variação: {arredondar(maiorVariacaoObj.amplitude)}°C em {maiorVariacaoObj.data}
                      </button>
                    )}
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
                            <td>{arredondar(d.max)}°C</td>
                            <td>{arredondar(d.min)}°C</td>
                            <td>{arredondar(d.amplitude)}°C</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Gráfico Orvalho */}
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
                              backgroundColor: cores.orvalho,
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
                              color: "#fff",
                              anchor: "end",
                              align: "end",
                              clip: false,
                              font: { size: 12, weight: "bold" },
                              formatter: (value) => `${arredondar(value)}%`,
                            },
                          },
                          scales: {
                            x: { ticks: { color: "#fff", font: { size: 12 } }, grid: { display: false, drawBorder: false } },
                            y: { beginAtZero: true, suggestedMax: 110, ticks: { color: "#A5D01B", font: { size: 12 } }, border: { color: "#A5D01B" }, grid: { display: false, drawBorder: false } },
                          },
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}