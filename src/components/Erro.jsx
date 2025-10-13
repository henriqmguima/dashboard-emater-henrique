import "../styles/TempPage.css";
import "../styles/DadosPage.css";
import "../styles/Erro.css";

export default function Erro({ codigo }) {
const erros = {
    401: {
    titulo: "Token Expirado",
    descricao: "Limite de requisições no mês alcançado.",
    },
    429: {
    titulo: "Muitas Requisições",
    descricao:
        "Você está fazendo muitas requisições. Tente novamente mais tarde.",
    },
    404: {
    titulo: "Não Encontrado",
    descricao: "O recurso solicitado não foi encontrado.",
    },
    500: {
    titulo: "Erro Interno",
    descricao: "Ocorreu um erro no servidor. Tente novamente mais tarde.",
    },
    DATA_INVALIDA: {
    titulo: "Data Invalida",
    descricao: "Não existem dados para esse período",
    },
    ERRO_DE_CONEXAO: {
    titulo: "Erro de Conexão",
    descricao:
        "Você não está conectado a internet. Tente novamente mais tarde.",
    },
};

const erro = erros[codigo] || {
    titulo: "Erro Desconhecido",
    descricao: "Ocorreu um erro desconhecido.",
};

return (
    <div className="card card--erro">
    <p className="erro-titulo">{erro.titulo}</p>
    <p className="erro-descricao">{erro.descricao}</p>
    </div>
);
}