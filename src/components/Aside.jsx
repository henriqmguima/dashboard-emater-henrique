import React, { useState } from "react";
import "../styles/Layout.css";
import { Thermometer, Wind, CloudSun, Drop, PresentationChart } from "@phosphor-icons/react";

export default function Aside() {
    const [ativo, setAtivo] = useState(0);

    const icones = [
        <Thermometer size={40} />, // temperatura
        // <Wind size={40} />, // vento
        <CloudSun size={40} />, // nuvens
        <Drop size={40} />, // água
        <PresentationChart size={40} /> // dados


    ];

    return (
        <aside className="aside-emater">
            <nav>
                {icones.map((icone, index) => (
                    <div
                        key={index}
                        className={`aside-item ${ativo === index ? "ativo" : ""}`}
                        onClick={() => setAtivo(index)}
                    >
                        <span>{icone}</span>
                    </div>
                ))}
            </nav>

            <div className="aside-footer">
                <img src="/ifsul-vertical.png" alt="IFSUL" />
            </div>
        </aside>
    );
}
