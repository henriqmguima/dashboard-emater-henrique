// App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import TempPage from "./pages/TempPage";
import NuvensPage from "./pages/NuvensPage";
import AguaPage from "./pages/AguaPage";
/* import DadosPage from "./pages/DadosPage" */

const bairros = [
  { nome: "IFSul - Câmpus Charqueadas", lat: -29.9642251, lng: -51.6290038 },
  { nome: "Capororoca", lat: -30.0412793, lng: -51.6467932 },
  { nome: "Granja Carola", lat: -29.9554248, lng: -51.5556481 },
  { nome: "Guaíba City", lat: -30.0016011, lng: -51.4928193 },
  { nome: "Fazenda Umbu", lat: -29.9956883, lng: -51.6268506 },
];

function AppContent() {
  const location = useLocation();
  const isIndex = location.pathname === "/";

  const [dataExecucao, setDataExecucao] = useState(new Date().toISOString().slice(0, 10));
  const [bairroSelecionado, setBairroSelecionado] = useState(bairros[0].nome);

  return (
    <>
      {!isIndex && (
        <Header
          bairros={bairros}
          dataExecucao={dataExecucao}
          setDataExecucao={setDataExecucao}
          bairroSelecionado={bairroSelecionado}
          setBairroSelecionado={setBairroSelecionado}
        />
      )}

      <Routes>
        <Route path="/" element={<Index bairros={bairros} />} />
        <Route
          path="/clima/:nomeBairro/temperatura"
          element={
            <TempPage
              bairros={bairros}
              dataExecucao={dataExecucao}
              bairroSelecionado={bairroSelecionado}
              setBairroSelecionado={setBairroSelecionado}
            />
          }
        />
        <Route
          path="/clima/:nomeBairro/nuvens"
          element={
            <NuvensPage
              bairros={bairros}
              dataExecucao={dataExecucao}
              bairroSelecionado={bairroSelecionado}
              setBairroSelecionado={setBairroSelecionado}
            />
          }
        />
        <Route
          path="/clima/:nomeBairro/agua"
          element={
            <AguaPage
              bairros={bairros}
              dataExecucao={dataExecucao}
              bairroSelecionado={bairroSelecionado}
              setBairroSelecionado={setBairroSelecionado}
            />
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}