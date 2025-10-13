import { useState, useEffect } from "react";

import "../styles/TempPage.css";
import "../styles/DadosPage.css";
import "../styles/Carregando.css";

export default function Carregando() {
const [pontos, setPontos] = useState("");

useEffect(() => {
    const intervalo = setInterval(() => {
    setPontos((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(intervalo);
}, []);

return (
    <div className="card card--carregando">
    <p className="texto-carregando">Carregando{pontos}</p>
    </div>
);
}
