import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../css/pages/Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();
    return (
        <div className="leaderboard-container">
            <div className="leaderboard-box">
                <h1 className="leaderboard-title">TOP EMPLEADOS</h1>
                <div className="leaderboard-divider" />
                <div className="leaderboard-empty">
                    <p>No hay datos aún.</p>
                    <p className="leaderboard-hint">Completa un turno para aparecer en el ranking.</p>
                </div>
                <button className="leaderboard-btn" onClick={() => navigate('/')}>
                    VOLVER AL MENÚ
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;