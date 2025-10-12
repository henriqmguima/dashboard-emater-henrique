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
  ArcElement,
} from "chart.js";

//import Header from "../components/Header";
import Aside from "../components/Aside";
import "../styles/NuvensPage.css";

import {
  fetchDataDia,
  fetchDadosSemana,
  cores,
  calcularHorasSolDia,
  calcularCoberturaTotal,
} from "../utils/nuvensUtil";
import { useParams } from "react-router-dom";

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

export default function NuvensPage({ bairros, dataExecucao, bairroSelecionado, setBairroSelecionado }) {
  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === bairroSelecionado);

  //const hoje = new Date().toISOString().split("T")[0];

  //const [selected, setSelected] = useState(bairro);
  const [dados, setDados] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    useEffect(() => {
    if (nomeBairro && nomeBairro !== bairroSelecionado){
      setBairroSelecionado(nomeBairro)
    }
  }, [nomeBairro, bairroSelecionado, setBairroSelecionado]);

  const latitude = bairro?.lat;
  const longitude = bairro?.lng;
  const token = import.meta.env.VITE_CLIMAPI_TOKEN;

  const variaveisDisponiveis = [
    { nome: "hcdchcll", descricao: "Nuvens Altas (%)" },
    { nome: "mcdcmcll", descricao: "Nuvens Médias (%)" },
    { nome: "lcdclcll", descricao: "Nuvens Baixas (%)" },
    { nome: "pevprsfc", descricao: "Evaporação (mm/6h)" },
    { nome: "sunsdsfc", descricao: "Horas de Sol (s)" },
  ];

  //função para buscar dados
  const fetchData = useCallback(async () => {
  if(!latitude || !longitude) return;

    setLoading(true);
    setError(null);

    try {
      const dadosHoje = await fetchDataDia(
        dataExecucao,
        latitude,
        longitude,
        token,
        variaveisDisponiveis
      );
      setDados(dadosHoje);

      const semana = await fetchDadosSemana(
        dataExecucao,
        fetchDataDia,
        latitude,
        longitude,
        token,
        variaveisDisponiveis
      );
      setDadosSemana(semana);
    } catch (err) {
      setError(err.message || "Erro ao buscar dados");
      setDados(null);
      setDadosSemana([]);
    } finally {
      setLoading(false);
    }
  }, [dataExecucao, latitude, longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //tratamento dos dados
  const horas = dados?.[0]?.dados.map((d) => d.horas) || [];
  const coberturaAlta =
    dados?.find((d) => d.nome === "hcdchcll")?.dados.map((d) => +d.valor.toFixed(2)) || [];
  const coberturaMedia =
    dados?.find((d) => d.nome === "mcdcmcll")?.dados.map((d) => +d.valor.toFixed(2)) || [];
  const coberturaBaixa =
    dados?.find((d) => d.nome === "lcdclcll")?.dados.map((d) => +d.valor.toFixed(2)) || [];
  const coberturaTotal = calcularCoberturaTotal(dados || []);
  const horasSol =
    dados?.find((d) => d.nome === "sunsdsfc")?.dados.map((d) => +(d.valor / 3600).toFixed(2)) ||
    [];
  const horasSolDia = calcularHorasSolDia(dados || []);
  const taxaEvaporacao =
    dados?.find((d) => d.nome === "pevprsfc")?.dados.map((d) => +d.valor.toFixed(2)) || [];

  const totalHorasSol = horasSolDia ? +horasSolDia.toFixed(2) : 0;
  const mediaCobertura = coberturaTotal.length
    ? +(coberturaTotal.reduce((acc, c) => acc + c, 0) / coberturaTotal.length).toFixed(2)
    : 0;
  const totalEvaporacao = +taxaEvaporacao.reduce((acc, e) => acc + e, 0).toFixed(2);


  //config dos gráficos
  const opcoesCompactas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom", labels: { boxWidth: 12 } },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    elements: {
      point: { radius: 3, hoverRadius: 6 },
      line: { borderWidth: 2 },
      bar: { borderWidth: 1 },
    },
  };

  const graficoLinhasNuvens = {
    labels: horas,
    datasets: [
      {
        label: "Nuvens Altas",
        data: coberturaAlta,
        borderColor: cores.alta,
        backgroundColor: "#647840",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Nuvens Médias",
        data: coberturaMedia,
        borderColor: cores.media,
        backgroundColor: "#5ab430",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Nuvens Baixas",
        data: coberturaBaixa,
        borderColor: cores.baixa,
        backgroundColor: "#b0d387",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const graficoSolVsNuvens = {
    labels: horas,
    datasets: [
      {
        label: "Horas de Sol",
        data: horasSol,
        backgroundColor: "#5ab430",
        borderColor: cores.sol,
        borderWidth: 1,
      },
    ],
  };

  
  if (error) return <p className="error">{error}</p>;
  if (loading) return <p className="loading">Carregando...</p>;

  const classificacao =
  totalHorasSol === 0 && mediaCobertura === 0
    ? "Falha"
    : totalHorasSol >= 6
    ? "Ensolarado"
    : "Nublado";


  return (
    <div className="layout-emater">
      {/* <Header /> */}
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal">
          <h1>Nuvens e Sol</h1>
          <h2>{bairroSelecionado}</h2>

          {!error && dados && (
            <>
              {/* === Cards de Resumo === */}
              <div className="cards-resumo">
                <div className="card resumo-sol">
                  <h4>☀️ Horas de Sol</h4>
                  <p className="valor-sol">{totalHorasSol}h</p>
                  <small>de 12h possíveis</small>
                </div>
                <div className="card resumo-nuvens">
                  <h4>☁️ Cobertura Média</h4>
                  <p className="valor-nuvens">{mediaCobertura}%</p>
                  <small>de nuvens no céu</small>
                </div>
                <div className="card resumo-evap">
                  <h4>💧 Evaporação</h4>
                  <p className="valor-evap">{totalEvaporacao}mm</p>
                  <small>Total do dia</small>
                </div>
                <div className="card resumo-classificacao">
                  <h4>📊 Classificação</h4>
                  <p>{classificacao}</p>
                  <small>Critério: ≥6h de sol</small>
                </div>
              </div>

              {/* === Tabela Detalhada da Semana === */}
              <div className="card">
                <h3>📅 Histórico Semanal Detalhado</h3>
                <div style={{ overflowX: "auto" }}>
                  <table className="tabela-semana">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Horas de Sol</th>
                        <th>Cobertura Média (%)</th>
                        <th>Classificação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosSemana.length === 0 && (
                        <tr>
                          <td colSpan="4">Falha ao carregar dados</td>
                        </tr>
                      )}
                      {dadosSemana.map((dia, i) => (
                        <tr key={i}>
                          <td>{dia.data}</td>
                          <td
                            className={dia.horasSol >= 6 ? "sol" : "nublado"}
                          >
                            {dia.horasSol}h
                          </td>
                          <td
                            className={
                              dia.coberturaTotal > 50
                                ? "cobertura-alta"
                                : "cobertura-baixa"
                            }
                          >
                            {dia.coberturaTotal}%
                          </td>
                          <td>{dia.classificacao || "Falha"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* === Gráficos Verticais === */}
              <div className="graficos-verticais">
                <div className="card">
                  <h3>Cobertura de Nuvens por Altitude</h3>
                  <div className="grafico-container">
                    <Line data={graficoLinhasNuvens} options={opcoesCompactas} />
                  </div>
                </div>

                <div className="card">
                  <h3>Horas de Sol ao Longo do Dia</h3>
                  <div className="grafico-container">
                    <Bar data={graficoSolVsNuvens} options={opcoesCompactas} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
