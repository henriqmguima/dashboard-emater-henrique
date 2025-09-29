const cores = {
  alta: "#647840",
  media: "#60C034",
  baixa: "#B0D387",
  sol: "#15C788",
  evap: "#A5D01B",
};

export const formatarData = (data) => {
  const options = { day: "2-digit", month: "2-digit" };
  return new Date(data).toLocaleDateString("pt-BR", options);
};

// Somar valores de uma variável de forma segura
export const somarValores = (dadosDia, nomeVariavel) => {
  const variavel = dadosDia.find((d) => d.nome === nomeVariavel)?.dados || [];
  return variavel.reduce((acc, h) => acc + (h.valor || 0), 0);
};


// Buscar dados de uma variável para um dia específico
export const fetchDataDia = async (
  data,
  latitude,
  longitude,
  token,
  variaveisDisponiveis
) => {
  const resultados = await Promise.all(
    variaveisDisponiveis.map(async (v) => {
      const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${v.nome}/${data}/${longitude}/${latitude}`;
      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const result = await response.json();
        return { nome: v.nome, dados: result };
      } catch (err) {
        console.error(`Erro fetch ${v.nome} dia ${data}:`, err);
        return { nome: v.nome, dados: [] };
      }
    })
  );
  return resultados;
};

// Buscar dados da semana e calcular métricas
export const fetchDadosSemana = async (
  dataExecucao,
  fetchDataDiaFn,
  latitude,
  longitude,
  token,
  variaveisDisponiveis
) => {
  const semana = [];

  for (let i = 0; i < 7; i++) {
    const data = new Date(dataExecucao);
    data.setDate(data.getDate() - i);
    const dataString = data.toISOString().slice(0, 10);

    try {
      const dadosDia = await fetchDataDiaFn(
        dataString,
        latitude,
        longitude,
        token,
        variaveisDisponiveis
      );

      const horasSol = somarValores(dadosDia, "sunsdsfc") / 3600;
      const coberturaAlta =
        somarValores(dadosDia, "hcdchcll") /
        (dadosDia.find((d) => d.nome === "hcdchcll")?.dados.length || 1);
      const coberturaMedia =
        somarValores(dadosDia, "mcdcmcll") /
        (dadosDia.find((d) => d.nome === "mcdcmcll")?.dados.length || 1);
      const coberturaBaixa =
        somarValores(dadosDia, "lcdclcll") /
        (dadosDia.find((d) => d.nome === "lcdclcll")?.dados.length || 1);
      const coberturaTotal = coberturaAlta + coberturaMedia + coberturaBaixa;

      semana.push({
        data: formatarData(data),
        horasSol: Number(horasSol.toFixed(2)),
        coberturaTotal: Number(coberturaTotal.toFixed(2)),
        classificacao: horasSol >= 6 ? "Sol" : "Nublado",
      });
    } catch (err) {
      console.error(`Erro semana:`, err);
      semana.push({
        data: formatarData(data),
        horasSol: 0,
        coberturaTotal: 0,
        classificacao: "❌ Falha",
      });
    }
  }

  return semana.reverse();
};

export { cores };
