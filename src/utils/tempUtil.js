// 🎨 Paleta de cores para gráficos e dados
export const cores = {
max: "#F25050",       // vermelho para máxima
min: "#4AA3D9",       // azul para mínima
orvalho: "#19C388",   // verde água
amplitude: "#F2C94C", // amarelo para amplitude
};

// 🗓️ Formata uma data para DD/MM/YY
export const formatarData = (data) => {
const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
return new Date(data).toLocaleDateString("pt-BR", options);
};

// 🔢 Arredonda valores de forma segura
export const arredondar = (valor, casas = 2) => {
return Number.parseFloat(valor).toFixed(casas);
};

// 🌡️ Calcula amplitude térmica
export const calcularAmplitude = (tmax, tmin) => {
if (typeof tmax !== "number" || typeof tmin !== "number") return 0;
return Number((tmax - tmin).toFixed(2));
};

// 💧 Calcula probabilidade de orvalho
export const calcularProbOrvalho = (tmin, dpt) => {
const diff = tmin - dpt;
let prob = Math.max(0, 100 - diff * 10);
return Math.min(100, prob);
};

// 🌍 Função genérica para buscar uma variável da API
const fetchVariavel = async (variavel, data, latitude, longitude, token) => {
const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${variavel}/${data}/${longitude}/${latitude}`;

const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
});


if (!response.ok) {
    throw new Error(`Erro ${variavel}: ${response.status} `);
}

return response.json();
};

// 📅 Busca dados do dia para múltiplas variáveis
export const fetchDadosDia = async (
data,
latitude,
longitude,
token,
variaveisDisponiveis
) => {
if (!Array.isArray(variaveisDisponiveis)) variaveisDisponiveis = [];

const resultados = await Promise.all(
    variaveisDisponiveis.map(async (v) => {
    const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${v.nome}/${data}/${longitude}/${latitude}`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error(`Erro ${v.nome}: ${response.status} `);
    }

    const result = await response.json();

    if (!Array.isArray(result) || result.length === 0) {
        throw new Error("DATA_INVALIDA");
    }
    return { nome: v.nome, dados: result };
    })
);

return resultados;
};

// 📆 Busca dados dos últimos 7 dias
export const fetchDadosSemana = async (
dataExecucao,
latitude,
longitude,
token
) => {
const semana = [];

for (let i = 0; i < 7; i++) {
    const data = new Date(dataExecucao);
    data.setDate(data.getDate() - i);
    const dataString = data.toISOString().slice(0, 10);
    const dataFormatada = formatarData(data);

    const [tmax, tmin, orvalho] = await Promise.all([
    fetchVariavel("tmax2m", dataString, latitude, longitude, token),
    fetchVariavel("tmin2m", dataString, latitude, longitude, token),
    fetchVariavel("dpt2m", dataString, latitude, longitude, token),
    ]);

    const amplitude = calcularAmplitude(tmax[0].valor, tmin[0].valor);
    const probOrvalho = calcularProbOrvalho(tmin[0].valor, orvalho[0].valor);

    semana.push({
    data: dataFormatada,
    max: tmax[0].valor,
    min: tmin[0].valor,
    amplitude,
    probOrvalho,
    });
}

return semana.reverse();
};
