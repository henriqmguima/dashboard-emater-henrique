import React from 'react';
import { useParams, Link } from 'react-router-dom';

const DetalheBairro = () => {
    const { nomeBairro } = useParams();

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>{`Detalhes do Bairro: ${nomeBairro}`}</h1>
            <p>Tela com Dashboard</p>
            <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
                Voltar para o Mapa
            </Link>
        </div>
    );
};

export default DetalheBairro;