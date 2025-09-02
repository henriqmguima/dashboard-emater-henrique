import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


const bairros = [
    { nome: 'Centro', lat: -29.9667, lng: -51.6333 },
    { nome: 'Sul', lat: -29.9678, lng: -51.6250 },
    { nome: 'Beira Rio', lat: -29.9700, lng: -51.6300 },
    { nome: 'Vila Fátima', lat: -29.9650, lng: -51.6200 },
    { nome: 'Parque Ipanema', lat: -29.9600, lng: -51.6350 },
];

const MapaBairros = () => {
    const navigate = useNavigate();

    const handleMarkerClick = (bairroNome) => {
        navigate(`/bairro/${bairroNome}`);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <MapContainer
                center={[-29.9667, -51.6333]} 
                zoom={15}
                style={{ height: '80vh', width: '80%' }}
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
                        <Popup>{bairro.nome}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapaBairros;