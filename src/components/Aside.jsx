import React from "react";
import "../styles/Layout.css";
import { Thermometer, Wind, CloudSun, Drop, PresentationChart } from "@phosphor-icons/react";
import { useNavigate, useParams } from  "react-router-dom";

export default function Aside() {
    //Deixei comentado caso decidir reverter 
    //const [ativo, setAtivo] = useState(0);
    //const icones = [
        //<Thermometer size={40} />, // temperatura
        // <Wind size={40} />, // vento
        //<CloudSun size={40} />, // nuvens
        //<Drop size={40} />, // água
        //<PresentationChart size={40} /> // dados
    //];

    const navigate = useNavigate();
    const { nomeBairro } = useParams();

    const opcoes = [
        {icon: <Thermometer size={40} />, rota: "temperatura"},
        {icon: <Wind size={40} />, rota: "vento"},
        {icon: <CloudSun size={40} />, rota: "nuvens"},
        {icon: <Drop size={40} />, rota: "agua"},
        {icon: <PresentationChart size={40} />, rota: "dados"}
    ];

    return (
        <aside className="aside-emater">
            <nav>
                {opcoes.map(({icon, rota}, index) => (
                    <div
                        key={index}
                        className="aside-item"
                        onClick={() => navigate(`/clima/${nomeBairro}/${rota}`)}
                    >
                        <span>{icon}</span>
                    </div>
                ))}
            </nav>

            <div className="aside-footer">
                <img src="/ifsul-vertical.png" alt="IFSUL" />
            </div>
        </aside>
    );
}
