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
  LineElement
);

export default function ClimApi({ bairros }) {

  const { nomeBairro } = useParams();
  const bairro = bairros.find((b) => b.nome === nomeBairro);

  const [variavel, setVariavel] = useState("dpt2m");
  const [dataExecucao, setDataExecucao] = useState("2025-09-22"); // formato YYYY-MM-DD
  const [latitude, setLatitude] = useState(bairro.lat);
  const [longitude, setLongitude] = useState(bairro.lng);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = "8c4040d2-0e13-363b-b5b5-7703d6cef658";

  // Lista de variáveis fornecidas pela API
  const variaveisDisponiveis = [
    { nome: "dpt2m", descricao: "2m above ground dew point temperature (°C)" },
    { nome: "apcpsfc", descricao: "Surface total precipitation (kg/m²)" },
    { nome: "gustsfc", descricao: "Surface wind speed (gust) (m/s)" },
    { nome: "hcdchcll", descricao: "High cloud cover (%)" },
    { nome: "lcdclcll", descricao: "Low cloud cover (%)" },
    { nome: "mcdcmcll", descricao: "Medium cloud cover (%)" },
    {
      nome: "pevprsfc",
      descricao: "Surface potential evaporation rate (mm/6h)",
    },
    { nome: "rh2m", descricao: "2m relative humidity (%)" },
    { nome: "soill0_10cm", descricao: "Soil moisture 0–10cm (proportion)" },
    { nome: "soill10_40cm", descricao: "Soil moisture 10–40cm (proportion)" },
    { nome: "soill40_100cm", descricao: "Soil moisture 40–100cm (proportion)" },
    {
      nome: "dswrfsfc",
      descricao: "Downward short wave radiation flux (W/m²)",
    },
    { nome: "sunsdsfc", descricao: "Surface sunshine duration (s)" },
    { nome: "tmax2m", descricao: "2m maximum temperature (°C)" },
    { nome: "tmin2m", descricao: "2m minimum temperature (°C)" },
    { nome: "pressfc", descricao: "Surface pressure (Pa)" },
    { nome: "tmpsfc", descricao: "Surface temperature (°C)" },
    { nome: "ugrd10m", descricao: "10m u-component of wind (m/s)" },
    { nome: "vgrd10m", descricao: "10m v-component of wind (m/s)" },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDados(null);

    try {
      const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${dataExecucao}/${longitude}/${latitude}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const result = await response.json();
      setDados(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataExecucao, latitude, longitude, variavel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="layout-emater">
      <Header />
      <div className="layout-inferior">
        <Aside />
        <div className="conteudo-principal">
          <h2 className="titulo-bairro">{nomeBairro}</h2>

        </div>
      </div>
    </div>
  );
}
