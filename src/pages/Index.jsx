import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "../styles/index.css";
import { MapPinPlus, ThermometerHot, Drop, CloudSun, ChartBar } from "@phosphor-icons/react";

// Configuração do ícone padrão do Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const atalhos = [
  { label: "IFSUL", bairroNome: "IFSul - Câmpus Charqueadas" },
  { label: "GRANJA KAFER", bairroNome: "Granja Käfer" },
  { label: "GRANJA CAROLA", bairroNome: "Granja Carola" },
  { label: "GUAIBA CITY", bairroNome: "Guaíba City" },
];

const icones = [
  <ThermometerHot size={50} />,
  <CloudSun size={50} />,
  <Drop size={50} />,
  <ChartBar size={50} />
];

L.Marker.prototype.options.icon = DefaultIcon;

const Index = ({ bairros }) => {
  const navigate = useNavigate();

  // Agora já manda para a rota padrão: temperatura
  const irParaBairro = (nome) => {
    navigate(`/clima/${nome}/temperatura`);
  };

  return (
    <div className="pagina-emater">
      {/* BLOCO DO MEIO */}
      <div className="meio">
        {/* ESQUERDA */}
        <div className="meio-esquerda">
          <div>
            <h1 className="titulo">
              <span>PROJETO</span> <span className="emater">EMATER</span>
            </h1>
            <p className="subtitulo">
              <strong>Dashboard</strong> de consulta de dados meteorológicos
            </p>
          </div>

          <p className="paragrafo">
            A <strong className="emater">EMATER</strong> de <i>Charqueadas</i> auxilia os produtores rurais sobre importantes tomadas de decisão sobre as atividades do agronegócio. Eles atuam em toda a Zona Rural de <i>Charqueadas</i> e os agricultores confiam muito no trabalho da <strong className="emater">EMATER</strong>. Disponibilizar uma ferramenta tecnológica para <strong className="emater">EMATER</strong> é atender a uma comunidade que o câmpus jamais chegou, pois a <strong className="emater">EMATER</strong> tem a confiança do produtor.
          </p>

          {/* Botões de atalho */}
          <div className="botoes-atalho">
            {atalhos.map(({ label, bairroNome }) => (
              <button
                key={bairroNome}
                onClick={() => irParaBairro(bairroNome)}
                className="botao-atalho"
              >
                <MapPinPlus size={25} color="#69d01b" weight="duotone" className="botao-icone" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DIREITA - MAPA */}
        <div className="meio-direita">
          <MapContainer
            center={[-30, -51.6]}
            zoom={12.2}
            className="mapa-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {bairros.map((bairro, i) => (
              <Marker
                key={i}
                position={[bairro.lat, bairro.lng]}
                eventHandlers={{
                  click: () => irParaBairro(bairro.nome),
                }}
              >
                <Tooltip>{bairro.nome}</Tooltip>
                <Popup>{bairro.nome}</Popup>
              </Marker>
            ))}
          </MapContainer>
          <p className="mapa-legenda">
            Mapa de Charqueadas com distritos marcados
          </p>
        </div>
      </div>

      {/* BLOCO INFERIOR */}
      <div className="rodape">
        <div className="botoes-inferiores">
          {[
            "Variação térmica",
            "Cobertura de nuvens",
            "Umidade do solo",
            "Apresentação com gráficos",
          ].map((titulo, i) => (
            <div key={i} className="botao-inferior">
              {icones[i]}
              <span>{titulo}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Desenvolvido na disciplina de Extensão</p>
          <img src="/ifsul.png" alt="IFSUL" />
        </div>
      </div>
    </div>
  );
};

export default Index;
