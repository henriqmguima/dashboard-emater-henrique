import { useEffect, useState } from "react";
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
import {
    formatarDataParaDiaSemana, fetchVariaveisDia
} from "../utils/dadosUtil.js";
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

/* const variaveisDisponiveis = [
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

export default function Agua({ bairros, dataExecucao, bairroSelecionado, setBairroSelecionado }) {
const { nomeBairro } = useParams();
const bairro = bairros.find((b) => b.nome === bairroSelecionado);

const latitude = bairro?.lat;
const longitude = bairro?.lng;

const [dados, setDados] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const token = import.meta.env.VITE_CLIMAPI_TOKEN;

useEffect(() => {
    if (nomeBairro && nomeBairro !== bairroSelecionado){
        setBairroSelecionado(nomeBairro)
    }
}, [nomeBairro, bairroSelecionado, setBairroSelecionado])

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
}, [latitude, longitude, dataExecucao]); */

export default function DadosPage ({ bairros, dataExecucao, bairroSelecionado, setBairroSelecionado }){
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


    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);  
    
    useEffect(() => {
    if (nomeBairro && nomeBairro !== bairroSelecionado){
        setBairroSelecionado(nomeBairro)
    }
    }, [nomeBairro, bairroSelecionado, setBairroSelecionado]);

    useEffect(() => {
        const fetchData = async () => {
            if(!latitude || !longitude) return;
            setLoading(true);
            setError(null);

            try{
                const result = await fetchVariaveisDia(
                    dataExecucao,
                    latitude,
                    longitude,
                    token
                );
                setDados(result);
            }catch(err){
                console.log("Erro: ", err);
                if(err.message === "DATA_INVALIDA"){
                    setError("DATA_INVALIDA");
                }else if(err instanceof TypeError && /fetch|network/i.test(err.message)){
                    setError("ERRO_DE_CONEXAO");
                }else{
                    const match = String(err.message).match(/Erro\s+\w+:\s*(\d+)/);
                    const codigo = match ? Number(match[1]) : null;
                    setError(codigo);
                }
            }finally{
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude, dataExecucao, token]);


// === Render ===
return (
    <div className="layout-emater">
{/*     <Header /> */}
    <div className="layout-inferior">
        <div className="aside_space"><Aside /></div>
        <div className="conteudo-principal" style={{ padding: "20px" }}>
        <h1>Resumo dos Dados</h1>
        <h2>{bairroSelecionado}</h2>
        <div className="data-container">

            <p className="texto-data" style={{ textAlign: "center" }}>
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

        {!error && !loading && dados && (
            <>
            <div>
                <h3>Superfície</h3>
                <div className="card-container card-container--4">
                <div className="card_agua">
                    <h4>🌧️ Precipitação total</h4>
                    <p className="texto-dados">{dados?.apcpsfc || 0} kg/m2</p>
                </div>
                <div className="card_agua">
                    <h4>💧 Ponto de orvalho a 2m</h4>
                    <p className="texto-dados">{dados?.dpt2m || 0} °C</p>
                </div>
                <div className="card_agua">
                    <h4>💦 Umidade relativa a 2m</h4>
                    <p className="texto-dados">{dados?.rh2m || 0} %</p>
                </div>
                <div className="card_agua">
                    <h4>🌪️ Velocidade do vento</h4>
                    <p className="texto-dados">{dados?.gustsfc || 0} m/s</p>
                </div>
                </div>

                <h3>Cobertura de nuvens</h3>
                <div className="card-container card-container--3">
                <div className="card_nuvens">
                    <h4>☁️ Nuvens altas</h4>
                    <p className="texto-dados">{dados?.hcdchcll || 0} %</p>
                </div>
                <div className="card_nuvens">
                    <h4>🌥️ Nuvens médias</h4>
                    <p className="texto-dados">{dados?.mcdcmcll || 0} %</p>
                </div>
                <div className="card_nuvens">
                    <h4>🌫️ Nuvens baixas</h4>
                    <p className="texto-dados">{dados?.lcdclcll || 0} %</p>
                </div>
                </div>

                <h3>Umidade volumétrica do solo</h3>
                <div className="card-container card-container--3">
                <div className="card_solo">
                    <h4>🌱 0 a 10cm</h4>
                    <p className="texto-dados">
                    {dados?.soill0_10cm || 0} m³/m³
                    </p>
                </div>
                <div className="card_solo">
                    <h4>🌿 10 a 40cm</h4>
                    <p className="texto-dados">
                    {dados?.soill10_40cm || 0} m³/m³
                    </p>
                </div>
                <div className="card_solo">
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
    