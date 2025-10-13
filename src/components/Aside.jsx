import React from "react";
import "../styles/Layout.css";
import { Thermometer, CloudSun, Drop, PresentationChart } from "@phosphor-icons/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function Aside() {
    const navigate = useNavigate();
    const { nomeBairro } = useParams();
    const location = useLocation();

    const opcoes = [
        { icon: <Thermometer size={45} />, rota: "temperatura", descricao: "Temperatura e Condição do Ar" },
        { icon: <CloudSun size={45} />, rota: "nuvens", descricao: "Cobertura de Nuvens e Sol" },
        { icon: <Drop size={45} />, rota: "agua", descricao: "Umidade do Solo e Chuva" },
        { icon: <PresentationChart size={45} />, rota: "dados", descricao: "Resumo dos Dados" },
    ];

    // Se ainda não houver parametro (por exemplo renderização inicial), evita crash
    if (!nomeBairro) return null;

    return (
        <nav className="aside-emater">
            <nav>
                {opcoes.map(({ icon, rota, descricao }) => {
                    const rotaAtual = `/clima/${encodeURIComponent(nomeBairro)}/${rota}`;
                    const ativo = location.pathname === rotaAtual;
                    return (
                        <div
                            key={rota}
                            className={`aside-item ${ativo ? "ativo" : ""}`}
                            onClick={() => navigate(rotaAtual)}
                            title={descricao}
                        >
                            <span>{icon}</span>
                        </div>
                    );
                })}

            </nav>

            <div className="aside-footer">
                <img src="/ifsul-vertical.png" alt="IFSUL" />
            </div>
        </nav >
    );
}
