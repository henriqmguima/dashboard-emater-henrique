import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapaBairros = ({ bairros }) => {
  const navigate = useNavigate();

  const handleMarkerClick = (bairroNome) => {
    navigate(`/clima/${bairroNome}`);
  };

  const handleClimaClick = () => {
    navigate("/clima");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "1rem",
      }}
    >
      <MapContainer
        center={[-29.9667, -51.6333]}
        zoom={12}
        style={{ height: "80vh", width: "80%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {bairros.map((bairro, index) => (
          <Marker
            key={index}
            position={[bairro.lat, bairro.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(bairro.nome),
            }}
          >
            <Tooltip>{bairro.nome}</Tooltip>
            <Popup>{bairro.nome}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Botão para rota /clima */}
      <button
        onClick={handleClimaClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Ir para Clima
      </button>
    </div>
  );
};

export default MapaBairros;
