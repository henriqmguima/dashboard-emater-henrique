import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "../styles/Layout.css";
import { Plant, CaretDown } from "@phosphor-icons/react";
import {  useNavigate } from "react-router-dom";


export default function Header({
bairros,
dataExecucao,
setDataExecucao,
bairroSelecionado,
setBairroSelecionado,
}) {
const [open, setOpen] = useState(false);
const dropdownRef = useRef();
const nodeRef = useRef(null);
const navigate = useNavigate();

useEffect(() => {
    const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
    }};
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

    
}, []);

const handleBairroChange = (bairro) => {
    setBairroSelecionado(bairro);
    setOpen(false);
    navigate(`/clima/${bairro}/temperatura`, { replace: true }); //temperatura vai ser a página 'default'
}

return (
    <header className="header-emater">
    <div className="header-left">
        <h1 onClick={() => navigate("/")} className="header-title">
        PROJETO <span>EMATER</span>
        </h1>
        <span className="icone-planta"><Plant size={40} /></span>
    </div>

    <div className="header-right">
        <input
        type="date"
        className="input-header"
        value={dataExecucao}
        onChange={(e) => setDataExecucao(e.target.value)}
        />

        <div className="dropdown" ref={dropdownRef}>
        <div className="dropdown-selected" onClick={() => setOpen(!open)}>
            {bairroSelecionado || "Localização"} <CaretDown size={20} weight="bold" />
        </div>

        <CSSTransition
            in={open}
            timeout={350}
            classNames="dropdown-anim"
            unmountOnExit
            nodeRef={nodeRef}
        >
            <ul className="dropdown-list" ref={nodeRef}>
            {bairros.map((item, i) => (
                <li
                key={i}
                className="dropdown-item"
                onClick={() => {
                    handleBairroChange(item.nome)
                }}
                >
                {item.nome}
                </li>
            ))}
            </ul>
        </CSSTransition>
        </div>
    </div>
    </header>
);
}