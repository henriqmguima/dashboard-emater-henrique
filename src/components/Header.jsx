import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "../styles/Layout.css";
import { Plant, CaretDown } from "@phosphor-icons/react";

const icone = [<Plant size={40} />];

const locais = [
    "IFSUL - Câmpus Charqueadas",
    "Granja Käfer",
    "Granja Carola",
    "Guaíba City",
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("Localização");
    const dropdownRef = useRef();
    const nodeRef = useRef(null); // para CSSTransition

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setSelected(item);
        setOpen(false);
    };

    return (
        <header className="header-emater">
            <div className="header-left">
                <h1 onClick={() => window.location.href = "/"} className="header-title" title="Voltar para a página inicial">
                    PROJETO <span>EMATER</span>
                </h1>
                <span className="icone-planta">{icone}</span>
            </div>

            <div className="header-right">
                <input type="date" className="input-header" />

                <div className="dropdown" ref={dropdownRef}>
                    <div
                        className="dropdown-selected"
                        onClick={() => setOpen(!open)}
                    >
                        {selected} <CaretDown size={20} weight="bold" />
                    </div>

                    <CSSTransition
                        in={open}
                        timeout={350}
                        classNames="dropdown-anim"
                        unmountOnExit
                        nodeRef={nodeRef}
                    >
                        <ul className="dropdown-list" ref={nodeRef}>
                            {locais.map((item, i) => (
                                <li
                                    key={i}
                                    className="dropdown-item"
                                    onClick={() => handleSelect(item)}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CSSTransition>
                </div>
            </div>
        </header>
    );
}
