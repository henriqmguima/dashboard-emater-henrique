const cores = {
  alta: "#647840",
  media: "#60C034",
  baixa: "#B0D387",
  sol: "#15C788",
  evap: "#A5D01B",
};

// Formatar data para DD/MM
export const formatarData = (data) => {
  const options = { day: "2-digit", month: "2-digit" };
  return new Date(data).toLocaleDateString("pt-BR", options);
};

// Somar valores de uma variável de forma segura
export const somarValores = (dadosDia, nomeVariavel) => {
  const variavel = dadosDia.find((d) => d.nome === nomeVariavel)?.dados || [];
  return variavel.reduce((acc, h) => acc + (h.valor || 0), 0);
};

// Calcular total de horas de sol do dia
export const calcularHorasSolDia = (dadosDia) => {
  const horasSol = dadosDia.find(d => d.nome === "sunsdsfc")?.dados.map(d => d.valor / 3600) || [];
  return horasSol.reduce((acc, h) => acc + h, 0);
};

// Calcular cobertura total do dia (limitada a 100%)
export const calcularCoberturaTotal = (dadosDia) => {
  const alta = dadosDia.find(d => d.nome === "hcdchcll")?.dados.map(d => d.valor) || [];
  const media = dadosDia.find(d => d.nome === "mcdcmcll")?.dados.map(d => d.valor) || [];
  const baixa = dadosDia.find(d => d.nome === "lcdclcll")?.dados.map(d => d.valor) || [];
  return alta.map((a, i) => Math.min(a + (media[i] || 0) + (baixa[i] || 0), 100));
};

// Buscar dados de um dia
export const fetchDataDia = async (
  data, latitude, longitude, token, variaveisDisponiveis
) => {
  if (!Array.isArray(variaveisDisponiveis)) variaveisDisponiveis = [];

  const resultados = await Promise.all(
    variaveisDisponiveis.map(async (v) => {
      const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${v.nome}/${data}/${longitude}/${latitude}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (!response.ok) {
        throw new Error(`Erro ${v.nome}: ${response.status} `);
      }

      const result = await response.json();
      return { nome: v.nome, dados: result };
    })
  );

  return resultados;
};

// Buscar dados da semana
export const fetchDadosSemana = async (
  dataExecucao, fetchDataDiaFn, latitude, longitude, token, variaveisDisponiveis
) => {
  const semana = [];

  for (let i = 0; i < 7; i++) {
    const data = new Date(dataExecucao);
    data.setDate(data.getDate() - i);
    const dataString = data.toISOString().slice(0, 10);

    const dadosDia = await fetchDataDiaFn(dataString, latitude, longitude, token, variaveisDisponiveis);

    if (!dadosDia || !dadosDia.length) {
      throw new Error(`Falha ao buscar dados do dia ${dataString}`);
    }

    const horasSol = calcularHorasSolDia(dadosDia);
    const coberturaTotal = calcularCoberturaTotal(dadosDia);
    const mediaCobertura = coberturaTotal.length
      ? coberturaTotal.reduce((acc, c) => acc + c, 0) / coberturaTotal.length
      : 0;

    semana.push({
      data: formatarData(data),
      horasSol: Number(horasSol.toFixed(2)),
      coberturaTotal: Number(mediaCobertura.toFixed(2)),
      classificacao: horasSol >= 6 ? "Sol" : "Nublado",
    });
  }

  return semana.reverse();
};

export { cores };
