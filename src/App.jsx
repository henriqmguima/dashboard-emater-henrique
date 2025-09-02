import ClimApiTest from "./pages/ClimApiTest";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapaBairros from "./pages/MapaBairros";
import DetalheBairro from "./pages/DetalheBairro";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapaBairros />} />
        <Route path="/bairro/:nomeBairro" element={<DetalheBairro />} />
        <Route path="/clima" element={<ClimApiTest />} />
      </Routes>
    </Router>
  );
}

export default App;
