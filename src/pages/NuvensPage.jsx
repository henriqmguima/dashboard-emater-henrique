import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
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
import Header from "../components/Header";
import Aside from "../components/Aside";
import GraphCanva from "../components/GraphCanva";
import "../styles/ClimApi.css";

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

export default function NuvensPage({ bairros }) {
  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [dataExecucao, setDataExecucao] = useState("2025-09-22");
  const [latitude] = useState(bairro.lat);
  const [longitude] = useState(bairro.lng);
  const [dados, setDados] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "8c4040d2-0e13-363b-b5b5-7703d6cef658";

  const variaveisDisponiveis = [
    { nome: "hcdchcll", descricao: "High cloud cover (%)" },
    { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
    { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
    { nome: "pevprsfc", descricao: "Surface potential evaporation rate (mm/6h)" },
    { nome: "sunsdsfc", descricao: "Surface sunshine duration (s)" },
  ];

  // Paleta de cores
  const cores = {
    alta: "#647840",
    media: "#60C034", 
    baixa: "#B0D387",
    sol: "#15C788",
    perdido: "#C4BE15",
    evap: "#A5D01B",
    nublado: "#1A2E05",
    solPie: "#25971C"
  };

  // Função auxiliar para formatar a data
  const formatarData = (data) => {
    const options = { day: '2-digit', month: '2-digit' };
    return new Date(data).toLocaleDateString('pt-BR', options);
  };

  const fetchDataDia = useCallback(async (data) => {
    try {
      const resultados = await Promise.all(
        variaveisDisponiveis.map(async (v) => {
          const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${v.nome}/${data}/${longitude}/${latitude}`;
          const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) throw new Error(`Erro: ${response.status}`);
          const result = await response.json();
          return { nome: v.nome, dados: result };
        })
      );
      return resultados;
    } catch (err) {
      throw err;
    }
  }, [latitude, longitude]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDados(null);
    setDadosSemana([]);

    try {
      // Buscar dados do dia atual
      const dadosHoje = await fetchDataDia(dataExecucao);
      setDados(dadosHoje);

      // Buscar dados dos últimos 7 dias para a tabela
      const semana = [];
      for (let i = 0; i < 7; i++) {
        const data = new Date(dataExecucao);
        data.setDate(data.getDate() - i);
        const dataString = data.toISOString().slice(0, 10);

        try {
          const dadosDia = await fetchDataDia(dataString);
          const horasSol = dadosDia.find(d => d.nome === "sunsdsfc")?.dados.reduce((acc, h) => acc + h.valor, 0) / 3600 || 0;
          const coberturaAlta = dadosDia.find(d => d.nome === "hcdchcll")?.dados.reduce((acc, h) => acc + h.valor, 0) / dadosDia.find(d => d.nome === "hcdchcll")?.dados.length || 0;
          const coberturaMedia = dadosDia.find(d => d.nome === "mcdcmcll")?.dados.reduce((acc, h) => acc + h.valor, 0) / dadosDia.find(d => d.nome === "mcdcmcll")?.dados.length || 0;
          const coberturaBaixa = dadosDia.find(d => d.nome === "lcdclcll")?.dados.reduce((acc, h) => acc + h.valor, 0) / dadosDia.find(d => d.nome === "lcdclcll")?.dados.length || 0;
          const coberturaTotal = coberturaAlta + coberturaMedia + coberturaBaixa;
          
          semana.push({
            data: formatarData(data),
            horasSol: horasSol.toFixed(1),
            coberturaTotal: coberturaTotal.toFixed(1),
            classificacao: horasSol >= 6 ? "☀️ Sol" : "☁️ Nublado"
          });
        } catch (err) {
          console.error(`Erro dia ${dataString}:`, err);
        }
      }
      setDadosSemana(semana.reverse());

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataExecucao, fetchDataDia]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p style={{ padding: "20px" }}>Carregando...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  if (!dados) return null;

  // === Preparando dados do dia atual ===
  const horas = dados[0]?.dados.map((d) => d.horas) || [];
  const coberturaAlta = dados.find((d) => d.nome === "hcdchcll")?.dados.map((d) => d.valor) || [];
  const coberturaMedia = dados.find((d) => d.nome === "mcdcmcll")?.dados.map((d) => d.valor) || [];
  const coberturaBaixa = dados.find((d) => d.nome === "lcdclcll")?.dados.map((d) => d.valor) || [];
  const horasSol = dados.find((d) => d.nome === "sunsdsfc")?.dados.map((d) => d.valor / 3600) || [];
  const taxaEvaporacao = dados.find((d) => d.nome === "pevprsfc")?.dados.map((d) => d.valor) || [];

  // Calculando estatísticas
  const coberturaTotal = coberturaAlta.map((a, i) => a + coberturaMedia[i] + coberturaBaixa[i]);
  const totalHorasSol = horasSol.reduce((acc, h) => acc + h, 0).toFixed(1);
  const totalEvaporacao = taxaEvaporacao.reduce((acc, e) => acc + e, 0).toFixed(2);
  const mediaCobertura = (coberturaTotal.reduce((acc, c) => acc + c, 0) / coberturaTotal.length).toFixed(1);
  
  const X = 6; // critério para dia ensolarado
  const isDiaEnsolarado = parseFloat(totalHorasSol) >= X;

  // Estatísticas da semana
  const diasSolSemana = dadosSemana.filter(d => d.classificacao.includes("Sol")).length;
  const diasNubladosSemana = dadosSemana.length - diasSolSemana;

  // === Configurações dos gráficos (menores) ===
  const opcoesCompactas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
        labels: { boxWidth: 12, fontSize: 10 }
      },
    },
  };

  const graficoLinhasNuvens = {
    labels: horas,
    datasets: [
      {
        label: "Nuvens Altas",
        data: coberturaAlta,
        borderColor: cores.alta,
        backgroundColor: cores.alta + "40",
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: "Nuvens Médias", 
        data: coberturaMedia,
        borderColor: cores.media,
        backgroundColor: cores.media + "40",
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: "Nuvens Baixas",
        data: coberturaBaixa,
        borderColor: cores.baixa,
        backgroundColor: cores.baixa + "40",
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };

  const graficoSolVsNuvens = {
    labels: horas,
    datasets: [
      {
        label: "Horas de Sol",
        data: horasSol,
        backgroundColor: cores.sol,
        borderColor: cores.sol,
        borderWidth: 1,
      },
    ],
  };

  const graficoPizzaSemana = {
    labels: ["Dias com Sol", "Dias Nublados"],
    datasets: [
      {
        data: [diasSolSemana, diasNubladosSemana],
        backgroundColor: [cores.solPie, cores.nublado],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="layout-emater">
      <Header />
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal" style={{ padding: "20px" }}>
          <h1>ClimAPI - Nuvens e Sol</h1>
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

          {/* === Cards Resumo em Grid === */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '15px' }}>
              <h4>☀️ Horas de Sol</h4>
              <p style={{ fontSize: '24px', margin: '5px 0', color: cores.sol }}><strong>{totalHorasSol}h</strong></p>
              <small>de 12h possíveis</small>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '15px' }}>
              <h4>☁️ Cobertura Média</h4>
              <p style={{ fontSize: '24px', margin: '5px 0', color: cores.media }}><strong>{mediaCobertura}%</strong></p>
              <small>nuvens no céu</small>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '15px' }}>
              <h4>💧 Evaporação</h4>
              <p style={{ fontSize: '24px', margin: '5px 0', color: cores.evap }}><strong>{totalEvaporacao}mm</strong></p>
              <small>total do dia</small>
            </div>
            
            <div className="card" style={{ textAlign: 'center', padding: '15px' }}>
              <h4>📊 Classificação</h4>
              <p style={{ fontSize: '18px', margin: '5px 0' }}>
                {isDiaEnsolarado ? "🌞 Ensolarado" : "☁️ Nublado"}
              </p>
              <small>critério: ≥{X}h de sol</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* === Cobertura de Nuvens por Linhas === */}
            <div className="card">
              <h3>Cobertura de Nuvens por Altitude</h3>
              <div style={{ height: '250px' }}>
                <Line data={graficoLinhasNuvens} options={{
                  ...opcoesCompactas,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: { display: true, text: "Cobertura (%)" }
                    }
                  }
                }} />
              </div>
            </div>

            {/* === Horas de Sol === */}
            <div className="card">
              <h3>Horas de Sol ao Longo do Dia</h3>
              <div style={{ height: '250px' }}>
                <Bar data={graficoSolVsNuvens} options={{
                  ...opcoesCompactas,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Horas de Sol" }
                    }
                  }
                }} />
              </div>
            </div>

            {/* === Taxa de Evaporação === */}
            <div className="card">
              <h3>Taxa de Evaporação</h3>
              <div style={{ height: '250px' }}>
                <GraphCanva
                  tipo="line"
                  labels={horas}
                  dados={taxaEvaporacao}
                  label="Evaporação (mm/6h)"
                  titulo=""
                />
              </div>
            </div>

            {/* === Pizza da Semana === */}
            <div className="card">
              <h3>Resumo Semanal</h3>
              <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut data={graficoPizzaSemana} options={{
                  ...opcoesCompactas,
                  plugins: {
                    ...opcoesCompactas.plugins,
                    legend: { 
                      display: true,
                      position: 'bottom'
                    }
                  }
                }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
                <strong>{diasSolSemana}</strong> dias com sol | <strong>{diasNubladosSemana}</strong> dias nublados
              </div>
            </div>
          </div>

          {/* === Tabela Detalhada da Semana === */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>📅 Histórico Semanal Detalhado</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#2c3e50', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    <th style={{ 
                      padding: '12px 15px', 
                      border: '1px solid #34495e',
                      textAlign: 'left'
                    }}>Data</th>
                    <th style={{ 
                      padding: '12px 15px', 
                      border: '1px solid #34495e',
                      textAlign: 'center'
                    }}>Horas de Sol</th>
                    <th style={{ 
                      padding: '12px 15px', 
                      border: '1px solid #34495e',
                      textAlign: 'center'
                    }}>Cobertura Média (%)</th>
                    <th style={{ 
                      padding: '12px 15px', 
                      border: '1px solid #34495e',
                      textAlign: 'center'
                    }}>Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosSemana.map((dia, i) => (
                    <tr key={i} style={{ 
                      backgroundColor: i % 2 === 0 ? '#ecf0f1' : '#ffffff',
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d5dbdb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ecf0f1' : '#ffffff'}
                    >
                      <td style={{ 
                        padding: '10px 15px', 
                        border: '1px solid #bdc3c7',
                        fontWeight: '500',
                        color: '#2c3e50'
                      }}>{dia.data}</td>
                      <td style={{ 
                        padding: '10px 15px', 
                        border: '1px solid #bdc3c7', 
                        textAlign: 'center',
                        color: parseFloat(dia.horasSol) >= 6 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>{dia.horasSol}h</td>
                      <td style={{ 
                        padding: '10px 15px', 
                        border: '1px solid #bdc3c7', 
                        textAlign: 'center',
                        color: parseFloat(dia.coberturaTotal) > 50 ? '#e74c3c' : '#27ae60',
                        fontWeight: '500'
                      }}>{dia.coberturaTotal}%</td>
                      <td style={{ 
                        padding: '10px 15px', 
                        border: '1px solid #bdc3c7', 
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>{dia.classificacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* === Resumo da tabela === */}
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#27ae60', fontSize: '18px' }}>{diasSolSemana}</strong>
                <br />
                <small style={{ color: '#7f8c8d' }}>dias com sol</small>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#e74c3c', fontSize: '18px' }}>{diasNubladosSemana}</strong>
                <br />
                <small style={{ color: '#7f8c8d' }}>dias nublados</small>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#3498db', fontSize: '18px' }}>
                  {dadosSemana.length > 0 ? (dadosSemana.reduce((acc, d) => acc + parseFloat(d.horasSol), 0) / dadosSemana.length).toFixed(1) : '0.0'}h
                </strong>
                <br />
                <small style={{ color: '#7f8c8d' }}>média de sol/dia</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}