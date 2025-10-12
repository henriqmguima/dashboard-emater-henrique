import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

import Header from "../components/Header";
import Aside from "../components/Aside";
import "../styles/AguaPage.css";

import {
    fetchDataDia,
    fetchDadosSemana,
    cores,
    calcularMediaUmidade,
    calcularChuvaTotal,
} from "../utils/aguaUtil";

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

export default function AguaPage({ bairros, dataExecucao, bairroSelecionado, setBairroSelecionado }) {
    const { nomeBairro } = useParams();
    const bairro = bairros.find((b) => b.nome === bairroSelecionado);

    // 🗓️ Data padrão = dia anterior
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    //const dataFormatada = ontem.toISOString().split("T")[0];
    //const [dataExecucao, setDataExecucao] = useState(dataFormatada);

    useEffect(() => {
    if (nomeBairro && nomeBairro !== bairroSelecionado){
    setBairroSelecionado(nomeBairro)
    }
}, [nomeBairro, bairroSelecionado, setBairroSelecionado]);

    const [dados, setDados] = useState(null);
    const [dadosSemana, setDadosSemana] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const latitude = bairro?.lat;
    const longitude = bairro?.lng;
    const token = import.meta.env.VITE_CLIMAPI_TOKEN;

    const variaveisDisponiveis = [
        { nome: "soill0_10cm", descricao: "Umidade do Solo (0–10 cm)" },
        { nome: "apcpsfc", descricao: "Chuva Acumulada (mm)" },
    ];

    const fetchData = useCallback(async () => {
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
        } finally {
            setLoading(false);
        }
    }, [dataExecucao, latitude, longitude]);

    useEffect(() => {
        if (latitude && longitude) fetchData();
    }, [fetchData, latitude, longitude]);

    // === Preparar dados ===
    const horas = dados?.[0]?.dados.map((d) => d.horas) || [];
    const umidadeSolo = dados?.find(d => d.nome === "soill0_10cm")?.dados.map(d => +d.valor.toFixed(2)) || [];
    const chuva = dados?.find(d => d.nome === "apcpsfc")?.dados.map(d => +d.valor.toFixed(2)) || [];

    const mediaUmidade = calcularMediaUmidade(dados || []);
    const totalChuva = calcularChuvaTotal(dados || []);
    const classificacaoDia =
        totalChuva > 10 ? "Chuvoso" :
            mediaUmidade > 70 ? "Úmido" :
                mediaUmidade < 40 ? "Seco" : "Normal";

    const opcoes = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "bottom" },
            tooltip: { enabled: true },
        },
    };

    const graficoUmidade = {
        labels: horas,
        datasets: [
            {
                label: "Umidade do Solo (%)",
                data: umidadeSolo,
                borderColor: cores.umidade,
                backgroundColor: cores.umidade,
                tension: 0.3,
            },
        ],
    };

    const graficoChuva = {
        labels: horas,
        datasets: [
            {
                label: "Chuva Acumulada (mm)",
                data: chuva,
                backgroundColor: cores.chuva,
                borderColor: cores.chuva,
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="layout-emater">
{/*             <Header /> */}
            <div className="layout-inferior">
                <Aside />
                <div className="conteudo-principal">
                    <h1>ClimAPI - Água</h1>
                    <h2>{bairroSelecionado}</h2>

                    {loading && <p className="loading">Carregando...</p>}
                    {error && <p className="error">{error}</p>}

                    {dados && (
                        <>
                            <div className="cards-resumo">
                                <div className="card resumo-umidade">
                                    <h4>💧 Umidade Média</h4>
                                    <p className="valor-umidade">{mediaUmidade}%</p>
                                    <small>Camada 0–10 cm</small>
                                </div>
                                <div className="card resumo-chuva">
                                    <h4>🌧️ Chuva Total</h4>
                                    <p className="valor-chuva">{totalChuva} mm</p>
                                    <small>Acumulada do dia</small>
                                </div>
                                <div className="card resumo-classificacao">
                                    <h4>📊 Classificação</h4>
                                    <p>{classificacaoDia}</p>
                                </div>
                            </div>

                            <div className="card">
                                <h3>📅 Histórico Semanal de Umidade e Chuva</h3>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="tabela-semana">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Umidade (%)</th>
                                                <th>Chuva (mm)</th>
                                                <th>Classificação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dadosSemana.map((dia, i) => (
                                                <tr key={i}>
                                                    <td>{dia.data}</td>
                                                    <td>{dia.umidade}</td>
                                                    <td>{dia.chuva}</td>
                                                    <td>{dia.classificacao}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="graficos-verticais">
                                <div className="card">
                                    <h3>Umidade do Solo ao Longo do Dia</h3>
                                    <div className="grafico-container">
                                        <Line data={graficoUmidade} options={opcoes} />
                                    </div>
                                </div>

                                <div className="card">
                                    <h3>Chuva Acumulada ao Longo do Dia</h3>
                                    <div className="grafico-container">
                                        <Bar data={graficoChuva} options={opcoes} />
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