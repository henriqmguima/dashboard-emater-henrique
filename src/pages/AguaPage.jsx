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
import ChartDataLabels from "chartjs-plugin-datalabels";

import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import "../styles/TempPage.css";
import "../styles/Layout.css";
import "../styles/Index.css";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartDataLabels
);

export default function Agua({ bairros }) {
    const { nomeBairro } = useParams();
    const bairro = bairros.find((b) => b.nome === nomeBairro);

    // Validação de bairro
    if (!bairro) return <p>Bairro não encontrado.</p>;

    const latitude = parseFloat(bairro.lat);
    const longitude = parseFloat(bairro.lng);

    const [dataExecucao] = useState(new Date().toISOString().split("T")[0]);
    const [umidadeSemana, setUmidadeSemana] = useState([]);
    const [chuvaSemana, setChuvaSemana] = useState([]);
    const [labelsSemana, setLabelsSemana] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = "2a428260-f19f-32fa-8152-753f2586501d";

    const fetchVariavel = async (variavel, data) => {
        const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${data}/${longitude}/${latitude}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Erro ao buscar ${variavel} (${response.status})`);
        const json = await response.json();
        if (!json || !Array.isArray(json) || json.length === 0) throw new Error(`Dados de ${variavel} não encontrados`);
        return json[0]; // Pegando o primeiro valor (ajustável se quiser todas as horas)
    };

    const fetchDadosSemana = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const umidade = [];
            const chuva = [];
            const labels = [];

            for (let i = 6; i >= 0; i--) {
                const data = new Date();
                data.setDate(data.getDate() - i);
                const dataStr = data.toISOString().split("T")[0];

                const [u, c] = await Promise.all([
                    fetchVariavel("soil-moisture", dataStr),
                    fetchVariavel("precipitation", dataStr),
                ]);

                umidade.push(u);
                chuva.push(c);
                labels.push(`${data.getDate()}/${data.getMonth() + 1}`);
            }

            setUmidadeSemana(umidade);
            setChuvaSemana(chuva);
            setLabelsSemana(labels);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        fetchDadosSemana();
    }, [fetchDadosSemana]);

    return (
        <div className="layout-emater">
            <Header />
            <div className="layout-inferior">
                <Aside />
                <div className="conteudo-principal" style={{ padding: "20px" }}>
                    <h1>Umidade do Solo e Chuva</h1>
                    <h2>{nomeBairro}</h2>

                    {loading && <p>Carregando...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}

                    {!loading && !error && umidadeSemana.length > 0 && (
                        <div style={{ marginTop: "30px" }}>
                            <Line
                                data={{
                                    labels: labelsSemana,
                                    datasets: [
                                        {
                                            label: "Umidade do Solo (%)",
                                            data: umidadeSemana,
                                            borderColor: "blue",
                                            backgroundColor: "rgba(0,0,255,0.2)",
                                            yAxisID: "y1",
                                        },
                                        {
                                            label: "Chuva (mm)",
                                            data: chuvaSemana,
                                            borderColor: "green",
                                            backgroundColor: "rgba(0,255,0,0.2)",
                                            yAxisID: "y2",
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    interaction: { mode: "index", intersect: false },
                                    stacked: false,
                                    plugins: { legend: { position: "top" } },
                                    scales: {
                                        y1: {
                                            type: "linear",
                                            display: true,
                                            position: "left",
                                            title: { display: true, text: "Umidade (%)" },
                                        },
                                        y2: {
                                            type: "linear",
                                            display: true,
                                            position: "right",
                                            title: { display: true, text: "Chuva (mm)" },
                                            grid: { drawOnChartArea: false },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
