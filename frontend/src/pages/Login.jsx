import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../css/pages/Login.css';

const Login = () => {
    const navigate = useNavigate();
    return (
        <div className="login-container">
            <div className="login-overlay" />
            <div className="login-content">
                <div className="login-badge">SAYRAY</div>
                <h1 className="login-title">TURNO DE NOCHE</h1>
                <p className="login-subtitle">Convenience Store · Horror Survival</p>
                <div className="login-divider" />
                <div className="login-rules">
                    <p>⏰ Turno: 12:00 AM - 6:00 AM</p>
                    <p>📞 Atiende el teléfono del jefe</p>
                    <p>👻 Reporta cualquier anomalía</p>
                    <p>🧹 Mantén la tienda en orden</p>
                    <p>💀 Sobrevive hasta el amanecer</p>
                </div>
                <button className="login-btn" onClick={() => navigate('/game')}>
                    COMENZAR TURNO
                </button>
                <button className="login-btn-secondary" onClick={() => navigate('/leaderboard')}>
                    LEADERBOARD
                </button>
            </div>
        </div>
    );
};

export default Login;