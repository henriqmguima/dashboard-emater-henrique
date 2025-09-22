import React from "react";
import "../styles/Layout.css";
import { Plant } from "@phosphor-icons/react";

const icone = [
    <Plant size={40} />
];
export default function Header() {
    return (

        <header className="header-emater">
            <div className="header-left">
                <h1>
                    PROJETO <span>EMATER</span>
                </h1>
                <span className="icone-planta">{icone}</span>
            </div>

            <div className="header-right">
                <input type="date" className="input-header" />
                <select className="input-header">
                    <option>Localização</option>
                    <option>IFSUL - Câmpus Charqueadas</option>
                    <option>Granja Käfer</option>
                    <option>Granja Carola</option>
                    <option>Guaíba City</option>
                </select>
            </div>
        </header>
    );
}
