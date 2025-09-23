import React from "react";
import "../styles/Layout.css";
import { Thermometer, CloudSun, Drop, PresentationChart } from "@phosphor-icons/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function Aside() {
    const navigate = useNavigate();
    const { nomeBairro } = useParams();
    const location = useLocation();

    const opcoes = [
        { icon: <Thermometer size={40} />, rota: "temperatura" },
        { icon: <CloudSun size={40} />, rota: "nuvens" },
        { icon: <Drop size={40} />, rota: "agua" },
        { icon: <PresentationChart size={40} />, rota: "dados" }
    ];

    // Se ainda não houver parametro (por exemplo renderização inicial), evita crash
    if (!nomeBairro) return null;

    return (
        <aside className="aside-emater">
            <nav>
                {opcoes.map(({ icon, rota }, index) => {
                    // codifica o nome do bairro igual ao que o browser faz na URL
                    const rotaAtual = `/clima/${encodeURIComponent(nomeBairro)}/${rota}`;
                    const ativo = location.pathname === rotaAtual;

                    return (
                        <div
                            key={index}
                            className={`aside-item ${ativo ? "ativo" : ""}`}
                            onClick={() => navigate(rotaAtual)}
                        >
                            <span>{icon}</span>
                        </div>
                    );
                })}
            </nav>

            <div className="aside-footer">
                <img src="/ifsul-vertical.png" alt="IFSUL" />
            </div>
        </aside>
    );
}
