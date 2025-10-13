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
import "../styles/DadosPage.css";
import "../styles/Layout.css";
import "../styles/Index.css";
import Carregando from "../components/Carregando";
import Erro from "../components/Erro";
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

const variaveisDisponiveis = [
  { nome: "apcpsfc", descricao: "Surface total precipitation (kg/m²)" },
  { nome: "dpt2m", descricao: "2m above ground dew point temperature (°C)" },
  { nome: "rh2m", descricao: "2m relative humidity (%)" },
  { nome: "gustsfc", descricao: "Surface wind speed (gust) (m/s)" },
  { nome: "hcdchcll", descricao: "High cloud cover (%)" },
  { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
  { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
  { nome: "soill0_10cm", descricao: "Soil moisture 0–10cm (proportion)" },
  { nome: "soill10_40cm", descricao: "Soil moisture 10–40cm (proportion)" },
  { nome: "soill40_100cm", descricao: "Soil moisture 40–100cm (proportion)" },
];

function formatarDataParaDiaSemana(dataStr) {
  let partes;
  let data;

  if (dataStr.includes("-")) {
    partes = dataStr.split("-");
    data = new Date(partes[0], partes[1] - 1, partes[2]);
  } else if (dataStr.includes("/")) {
    partes = dataStr.split("/");
    data = new Date(partes[2], partes[1] - 1, partes[0]);
  } else {
    return "";
  }

  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const nomeDia = diasSemana[data.getDay()];
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");

  return `${nomeDia} (${dia}/${mes})`;
}

export default function Agua({ bairros }) {
  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [dataExecucao, setDataExecucao] = useState("2025-10-05");
  const [latitude] = useState(bairro.lat);
  const [longitude] = useState(bairro.lng);

  const [dadosHoje, setDadosHoje] = useState(null);
  const [dadosSemana, setDadosSemana] = useState([]);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "8adc3c70-eb98-347a-a50d-36f52d5e1eeb";

  useEffect(() => {
    const buscarVariaveis = async () => {
      setLoading(true);
      setError(null);
      try {
        const resultados = {};

        for (const { nome } of variaveisDisponiveis) {
          const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${nome}/${dataExecucao}/${longitude}/${latitude}`;
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error(`Erro ${nome}: ${response.status}`);
          }

          const dados = await response.json();

          if (!Array.isArray(dados) || dados.length === 0) {
            throw new Error("DATA_INVALIDA");
          }

          const valoresValidos = dados
            .map((item) => item.valor)
            .filter((valor) => valor !== null && !isNaN(valor));

          let media = null;
          if (valoresValidos.length > 0) {
            const soma = valoresValidos.reduce((a, b) => a + b, 0);
            media = parseFloat((soma / valoresValidos.length).toFixed(2));
          }

          resultados[nome] = media;
        }

        setDados(resultados);
      } catch (error) {
        console.error("Erro geral:", error);

        if (error.message === "DATA_INVALIDA") {
          setError("DATA_INVALIDA");
        } else if (
          error instanceof TypeError &&
          /fetch|network/i.test(error.message)
        ) {
          setError("ERRO_DE_CONEXAO");
        } else {
          const match = String(error.message).match(/Erro\s+\w+:\s*(\d+)/);
          const codigo = match ? Number(match[1]) : null;
          setError(codigo);
        }
      } finally {
        setLoading(false);
      }
    };

    buscarVariaveis();
  }, [latitude, longitude, dataExecucao]);

  // === Render ===
  return (
    <div className="layout-emater">
      <Header />
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal" style={{ padding: "20px" }}>
          <h1>Resumo dos Dados</h1>
          <h2>{nomeBairro}</h2>
          <div className="data-container">
            <label>
              <span className="texto-data">Data de execução:</span>
              <input
                className="input-data"
                type="date"
                value={dataExecucao}
                onChange={(e) => setDataExecucao(e.target.value)}
              />
            </label>

            <p className="texto-data">
              {formatarDataParaDiaSemana(dataExecucao)}
            </p>
          </div>

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

          {!error && !loading && (
            <>
              <div>
                <h3>Superfície</h3>
                <div className="card-container card-container--4">
                  <div className="card">
                    <h4>🌧️ Precipitação total</h4>
                    <p className="texto-dados">{dados?.apcpsfc || 0} kg/m2</p>
                  </div>
                  <div className="card">
                    <h4>💧 Ponto de orvalho a 2m</h4>
                    <p className="texto-dados">{dados?.dpt2m || 0} °C</p>
                  </div>
                  <div className="card">
                    <h4>💦 Umidade relativa a 2m</h4>
                    <p className="texto-dados">{dados?.rh2m || 0} %</p>
                  </div>
                  <div className="card">
                    <h4>🌪️ Velocidade do vento</h4>
                    <p className="texto-dados">{dados?.gustsfc || 0} m/s</p>
                  </div>
                </div>

                <h3>Cobertura de nuvens</h3>
                <div className="card-container card-container--3">
                  <div className="card">
                    <h4>☁️ Nuvens altas</h4>
                    <p className="texto-dados">{dados?.hcdchcll || 0} %</p>
                  </div>
                  <div className="card">
                    <h4>🌥️ Nuvens médias</h4>
                    <p className="texto-dados">{dados?.mcdcmcll || 0} %</p>
                  </div>
                  <div className="card">
                    <h4>🌫️ Nuvens baixas</h4>
                    <p className="texto-dados">{dados?.lcdclcll || 0} %</p>
                  </div>
                </div>

                <h3>Umidade volumétrica do solo</h3>
                <div className="card-container card-container--3">
                  <div className="card">
                    <h4>🌱 0 a 10cm</h4>
                    <p className="texto-dados">
                      {dados?.soill0_10cm || 0} m³/m³
                    </p>
                  </div>
                  <div className="card">
                    <h4>🌿 10 a 40cm</h4>
                    <p className="texto-dados">
                      {dados?.soill10_40cm || 0} m³/m³
                    </p>
                  </div>
                  <div className="card">
                    <h4>🌾 40cm a 1m</h4>
                    <p className="texto-dados">
                      {dados?.soill40_100cm || 0} m³/m³
                    </p>
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
