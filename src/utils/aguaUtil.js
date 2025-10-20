    // === Cores padrão ===
    export const cores = {
        umidade: "#15C788",
        chuva: "#60C034",
        destaque: "#A5D01B",
        fundo: "#0D1B2A",
    };

    // === Formatar data DD/MM ===
    export const formatarData = (data) => {
    const options = { day: "2-digit", month: "2-digit" };
    return new Date(data).toLocaleDateString("pt-BR", options);
    };

    // === Calcular média de umidade do solo ===
    export const calcularMediaUmidade = (dadosDia) => {
    const valores = dadosDia.find(d => d.nome === "soill0_10cm")?.dados.map(d => d.valor) || [];
    if (valores.length === 0) return 0;
    const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
    return +media.toFixed(2);
    };

    // === Calcular total de chuva acumulada ===
    export const calcularChuvaTotal = (dadosDia) => {
    const valores = dadosDia.find(d => d.nome === "apcpsfc")?.dados.map(d => d.valor) || [];
    const total = valores.reduce((acc, v) => acc + v, 0);
    return +total.toFixed(2);
    };

    // === Buscar dados de um dia ===
    export const fetchDataDia = async (data, latitude, longitude, token, variaveisDisponiveis) => {
    const resultados = await Promise.all(
        variaveisDisponiveis.map(async (v) => {
        const url = `https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs/${v.nome}/${data}/${longitude}/${latitude}`;
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok){
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

    // === Buscar dados da semana ===
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
        const dadosDia = await fetchDataDiaFn(dataString, latitude, longitude, token, variaveisDisponiveis);
        const umidade = calcularMediaUmidade(dadosDia);
        const chuva = calcularChuvaTotal(dadosDia);

        semana.push({
            data: formatarData(data),
            umidade,
            chuva,
            classificacao:
            chuva > 10 ? "Chuvoso" :
            umidade > 70 ? "Úmido" :
            umidade < 40 ? "Seco" : "Normal",
        });
        } catch (err) {
        console.error(`Erro semana água:`, err);
        semana.push({
            data: formatarData(data),
            umidade: 0,
            chuva: 0,
            classificacao: "❌ Falha",
        });
        }
    }

    return semana.reverse();
    };
