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
import "../Index.css";
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

export default function Agua({ bairros }) {
    const { nomeBairro } = useParams();
    const bairro = bairros.find((b) => b.nome === nomeBairro);

    const [dataExecucao, setDataExecucao] = useState("2025-09-25");
    const [latitude] = useState(bairro.lat);
    const [longitude] = useState(bairro.lng);

    const [dadosHoje, setDadosHoje] = useState(null);
    const [dadosSemana, setDadosSemana] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = "2a428260-f19f-32fa-8152-753f2586501d";

    const fetchVariavel = async (variavel, data) => {
        const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${data}/${longitude}/${latitude}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Erro ${variavel}: ${response.status}`);
        return response.json();
    };


    // Função auxiliar para formatar a data para DD/MM/YY
    const formatarData = (data) => {
        const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        return new Date(data).toLocaleDateString('pt-BR', options);
    };


    // === Render ===
    return (
        <div className="layout-emater">
            <Header />
            <div className="layout-inferior">
                <Aside />
                <div className="conteudo-principal" style={{ padding: "20px" }}>
                    <h1>Resumo dos Dados</h1>
                    <h2>{nomeBairro}</h2>

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

                </div>
            </div>
        </div>
    );
}