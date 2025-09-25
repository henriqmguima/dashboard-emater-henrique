import { useEffect, useState } from "react";
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const conversorData = (d) => {
  const [dia, mes, ano] = d.split("/");
  return `${ano}-${mes}-${dia}`;
};

function formatarHoraUTC(horaUTC) {
  const h = horaUTC.padStart(4, "0");
  const horas = h.slice(0, 2);
  const minutos = h.slice(2, 4);
  return `${horas}:${minutos}`;
}

function InmetApiTest() {
  const [dados, setDados] = useState([]);
  const [variavel, setVariavel] = useState("Temp. Ins. (C)");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [dataExecucao, setDataExecucao] = useState("");
  const [variaveisDisponiveis, setVariaveisDisponiveis] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/dadosEmater.json")
      .then((res) => res.json())
      .then((dados) => {
        setDados(dados);
        setVariaveisDisponiveis(Object.keys(dados[0]).filter((d, i) => i >= 2));

        const primeiraData = dados[0].Data;
        const ultimaData = dados[dados.length - 1].Data;

        setMinDate(conversorData(primeiraData));
        setMaxDate(conversorData(ultimaData));
        setDataExecucao(conversorData(primeiraData));
      })
      .catch(() => setError("Erro ao carregar os dados"));
  }, []);

  const dadosSelecionados = dados.filter(
    (d) => conversorData(d.Data) === dataExecucao
  );

  const dadosGrafico = {
    labels: dadosSelecionados.map((d) => formatarHoraUTC(d["Hora (UTC)"])),
    datasets: [
      {
        label: variavel,
        data: dadosSelecionados.map((d) =>
          parseFloat(d[variavel].replace(",", "."))
        ),
        borderColor: "blue",
        backgroundColor: "lightblue",
      },
    ],
  };

  console.log(dadosGrafico);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teste Inmet API</h1>
      <h2>Estação de Charqueadas</h2>

      {/* Seleção de parâmetros */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Variável:{" "}
          <select
            value={variavel}
            onChange={(e) => setVariavel(e.target.value)}
          >
            {variaveisDisponiveis.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Data de execução:{" "}
          <input
            type="date"
            min={minDate}
            max={maxDate}
            value={dataExecucao}
            onChange={(e) => setDataExecucao(e.target.value)}
          />
        </label>
        <br />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Renderiza o gráfico */}
      {dados && (
        <div style={{ marginTop: "30px", maxWidth: "1200px" }}>
          <Line
            data={dadosGrafico}
            options={{
              responsive: true,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default InmetApiTest;
