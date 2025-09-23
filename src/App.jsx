// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapaBairros from "./pages/MapaBairros";
import ClimApi from "./pages/ClimApi";
import NuvensPage from "./pages/NuvensPage";


const bairros = [
  { nome: "IFSul - Câmpus Charqueadas", lat: -29.9642251, lng: -51.6290038 },
  { nome: "Granja Käfer", lat: -30.0412793, lng: -51.6467932 },
  { nome: "Granja Carola", lat: -29.9554248, lng: -51.5556481 },
  { nome: "Guaíba City", lat: -30.03435, lng: -51.5785155 },
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial com o mapa */}
        <Route path="/" element={<MapaBairros bairros={bairros} />} />

        {/* Rotas de clima específicas */}
        <Route
          path="/clima/:nomeBairro/temperatura"
          element={<ClimApi bairros={bairros} />}
        />
        <Route
          path="/clima/:nomeBairro/nuvens"
          element={<NuvensPage bairros={bairros} />}
        />

        {/* Futuras rotas comentadas */}
        {/* <Route path="/clima/:nomeBairro/agua" element={<AguaPage bairros={bairros} />} /> */}
        {/* <Route path="/clima/:nomeBairro/dados" element={<DadosPage bairros={bairros} />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
