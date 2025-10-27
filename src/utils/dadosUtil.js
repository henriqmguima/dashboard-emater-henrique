export const cores = {
    chuva: "#4DB6AC",
    umidade: "#81C784",
    vento: "#64B5F6",
    solo: "#A5D6A7",
    nuvem: "#B0BEC5",
};

// === Variáveis da API ===
export const variaveisDisponiveis = [
    { nome: "apcpsfc", descricao: "Precipitação total (kg/m²)" },
    { nome: "dpt2m", descricao: "Ponto de orvalho a 2m (°C)" },
    { nome: "rh2m", descricao: "Umidade relativa a 2m (%)" },
    { nome: "gustsfc", descricao: "Velocidade do vento (m/s)" },
    { nome: "hcdchcll", descricao: "Nuvens altas (%)" },
    { nome: "mcdcmcll", descricao: "Nuvens médias (%)" },
    { nome: "lcdclcll", descricao: "Nuvens baixas (%)" },
    { nome: "soill0_10cm", descricao: "Umidade do solo 0–10cm (m³/m³)" },
    { nome: "soill10_40cm", descricao: "Umidade do solo 10–40cm (m³/m³)" },
    { nome: "soill40_100cm", descricao: "Umidade do solo 40–100cm (m³/m³)" },
];

// === Formatar data para dia da semana ===
export const formatarDataParaDiaSemana = (dataStr) => {
    let partes, data;
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
};

// === Buscar dados climáticos para um dia ===
export const fetchVariaveisDia = async (dataExecucao, latitude, longitude, token) => {
const resultados = {};

for (const { nome } of variaveisDisponiveis) {
    const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${nome}/${dataExecucao}/${longitude}/${latitude}`;
    try {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Erro ${nome}: ${response.status}`);

    const dados = await response.json();
    if (!Array.isArray(dados) || dados.length === 0) throw new Error("DATA_INVALIDA");

    const valoresValidos = dados
        .map((item) => item.valor)
        .filter((valor) => valor !== null && !isNaN(valor));

    let media = null;
    if (valoresValidos.length > 0) {
        const soma = valoresValidos.reduce((a, b) => a + b, 0);
        media = parseFloat((soma / valoresValidos.length).toFixed(2));
    }

    resultados[nome] = media;
    } catch (error) {
    console.error(`Erro ao buscar ${nome}:`, error);
    throw error;
    }
}

return resultados;
};
