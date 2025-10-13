// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TempPage from "./pages/TempPage";
import NuvensPage from "./pages/NuvensPage";
import AguaPage from "./pages/AguaPage";
import DadosPage from "./pages/DadosPage";

import InmetApiTest from "./pages/InmetApiTest";
import DadosPage from "./pages/DadosPage";

const bairros = [
  { nome: "IFSul - Câmpus Charqueadas", lat: -29.9642251, lng: -51.6290038 },
  { nome: "Capororoca", lat: -30.0412793, lng: -51.6467932 },
  { nome: "Granja Carola", lat: -29.9554248, lng: -51.5556481 },
  { nome: "Guaíba City", lat: -30.0016011, lng: -51.4928193 },
  { nome: "Fazenda Umbu", lat: -29.9956883, lng: -51.6268506 },
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial com o mapa */}
        <Route path="/" element={<Index bairros={bairros} />} />

        {/* Rotas de clima específicas */}
        <Route
          path="/clima/:nomeBairro/temperatura"
          element={<TempPage bairros={bairros} />}
        />
        <Route
          path="/clima/:nomeBairro/nuvens"
          element={<NuvensPage bairros={bairros} />}
        />

        {/* Futuras rotas comentadas */}
        {/* <Route path="/clima/:nomeBairro/agua" element={<AguaPage bairros={bairros} />} /> */}
        <Route
          path="/clima/:nomeBairro/dados"
          element={<DadosPage bairros={bairros} />}
        />
        <Route path="/api/inmet" element={<InmetApiTest />} />
      </Routes>
    </Router>
  );
}

export default App;
