import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapaBairros from './components/MapaBairros';
import DetalheBairro from './components/DetalheBairro';
import './App.css'; // Importa o CSS do Leaflet

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapaBairros />} />
        <Route path="/bairro/:nomeBairro" element={<DetalheBairro />} />
      </Routes>
    </Router>
  );
}

export default App;