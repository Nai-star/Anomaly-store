import React, { createContext, useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, SoftShadows, Sky, Stars, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, Noise, Vignette, BrightnessContrast, SMAA, SSAO, ToneMapping, ChromaticAberration } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import Store from '../components/Game/Store';
import Player from '../components/Game/Player';
import Exterior from '../components/Game/Exterior';
import './../css/pages/Game.css';

export const GameContext = createContext();

const SHIFT_END = 360; // 6 AM
const ANOMALIES = [
    { id: 'floating_mannequin', name: 'Maniquí Flotante', chance: 0.1 },
    { id: 'rotating_mannequin', name: 'Maniquí Girando', chance: 0.1 },
    { id: 'fallen_clothes', name: 'Ropa Caída', chance: 0.15 },
    { id: 'red_lights', name: 'Luces Rojas', chance: 0.15 },
    { id: 'moving_bag', name: 'Bolso Movido', chance: 0.2 },
    { id: 'extra_box', name: 'Caja Extra', chance: 0.2 },
];

const formatTime = (minutes) => {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
};

const Game = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [doorOpen, setDoorOpen] = useState(false);
    const [lightsOn, setLightsOn] = useState(false);
    const [registerOn, setRegisterOn] = useState(false);
    const [registerClosed, setRegisterClosed] = useState(true);
    const [phoneRinging, setPhoneRinging] = useState(false);
    const [phoneAnswered, setPhoneAnswered] = useState(false);
    const [bathroomClean, setBathroomClean] = useState(false);
    const [activeAnomalies, setActiveAnomalies] = useState([]);
    const [reportedAnomalies, setReportedAnomalies] = useState([]);
    const [missedAnomalies, setMissedAnomalies] = useState(0);
    const [time, setTime] = useState(0);
    const [interactionMsg, setInteractionMsg] = useState('');
    const [bossMessage, setBossMessage] = useState('');
    const [anomalyAlert, setAnomalyAlert] = useState('');
    const anomalyAlertTimer = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                const nextTime = prev + 1;
                if (nextTime >= SHIFT_END) {
                    setGameOver(true);
                    clearInterval(timer);
                    return prev;
                }
                if (nextTime > 20 && nextTime % 30 === 0) {
                    setActiveAnomalies(current => {
                        const missed = current.length;
                        if (missed > 0) {
                            setMissedAnomalies(prev => prev + missed);
                            return [];
                        }
                        return current;
                    });
                }
                if (nextTime % 10 === 0 && nextTime > 20) {
                    ANOMALIES.forEach(anomaly => {
                        if (Math.random() < anomaly.chance) {
                            setActiveAnomalies(current => {
                                if (!current.includes(anomaly.id)) {
                                    setAnomalyAlert(`⚠️ ALERTA: ${anomaly.name}`);
                                    if (anomalyAlertTimer.current) clearTimeout(anomalyAlertTimer.current);
                                    anomalyAlertTimer.current = setTimeout(() => setAnomalyAlert(''), 4000);
                                    return [...current, anomaly.id];
                                }
                                return current;
                            });
                        }
                    });
                }
                return nextTime;
            });
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (lightsOn && !phoneAnswered && !phoneRinging) {
            setTimeout(() => setPhoneRinging(true), 2000);
        }
    }, [lightsOn]);

    const reportAnomaly = (anomalyId) => {
        if (activeAnomalies.includes(anomalyId)) {
            setActiveAnomalies(prev => prev.filter(a => a !== anomalyId));
            setReportedAnomalies(prev => [...prev, anomalyId]);
            setBossMessage("Reporte recibido. Procesando anomalía...");
            setTimeout(() => setBossMessage(""), 5000);
            return true;
        } else {
            setBossMessage("ERROR: No se detectó ninguna anomalía ahí.");
            setTimeout(() => setBossMessage(""), 5000);
            return false;
        }
    };

    const handleRestart = () => {
        setGameOver(false);
        setActive(false);
        setDoorOpen(false);
        setLightsOn(false);
        setRegisterOn(false);
        setRegisterClosed(true);
        setPhoneRinging(false);
        setPhoneAnswered(false);
        setBathroomClean(false);
        setActiveAnomalies([]);
        setReportedAnomalies([]);
        setMissedAnomalies(0);
        setTime(0);
        setInteractionMsg('');
        setBossMessage('');
        setAnomalyAlert('');
    };

    const score = (reportedAnomalies.length * 100) + (lightsOn ? 50 : 0) + (phoneAnswered ? 50 : 0) + (bathroomClean ? 50 : 0) + (registerOn ? 50 : 0);
    const totalAnomalies = reportedAnomalies.length + missedAnomalies;
    const shiftComplete = time >= SHIFT_END;

    return (
        <GameContext.Provider value={{
            doorOpen, setDoorOpen, lightsOn, setLightsOn,
            registerOn, setRegisterOn, registerClosed, setRegisterClosed,
            phoneRinging, setPhoneRinging, phoneAnswered, setPhoneAnswered,
            bathroomClean, setBathroomClean, time, activeAnomalies,
            reportAnomaly, setInteractionMsg, setMissedAnomalies,
        }}>
            <div className="game-container">
                {!active && !gameOver && (
                    <div className="start-screen" onClick={() => setActive(true)}>
                        <div className="start-badge">SAYRAY</div>
                        <h1 className="start-title">TURNO DE NOCHE</h1>
                        <p className="start-subtitle">12:00 AM - 6:00 AM</p>
                        <div className="start-rules">
                            <p>📋 Mantén la tienda funcionando</p>
                            <p>👻 Reporta cualquier anomalía al jefe</p>
                            <p>🧹 Limpia el baño cuando sea necesario</p>
                            <p>⚠️ No ignores las señales</p>
                        </div>
                        <div className="start-hint">HAZ CLIC PARA COMENZAR</div>
                        <div className="start-controls">WASD · E Interactuar · Mouse Mirar</div>
                    </div>
                )}

                {gameOver && (
                    <div className="gameover-screen">
                        <div className="gameover-box">
                            <h1 className="gameover-title">
                                {shiftComplete ? 'TURNO COMPLETADO' : 'TURNO TERMINADO'}
                            </h1>
                            <div className="gameover-time">{formatTime(time)}</div>
                            <div className="gameover-divider" />
                            <div className="gameover-stats">
                                <div className="stat">
                                    <span className="stat-label">ANOMALÍAS REPORTADAS</span>
                                    <span className="stat-value">{reportedAnomalies.length}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">ANOMALÍAS PERDIDAS</span>
                                    <span className="stat-value">{missedAnomalies}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">TAREAS COMPLETADAS</span>
                                    <span className="stat-value">{[(lightsOn ? 1 : 0), (phoneAnswered ? 1 : 0), (bathroomClean ? 1 : 0), (registerOn ? 1 : 0)].filter(Boolean).length}/4</span>
                                </div>
                            </div>
                            <div className="gameover-divider" />
                            <div className="gameover-score">
                                <span className="score-label">PUNTAJE TOTAL</span>
                                <span className="score-value">{score}</span>
                            </div>
                            <div className="gameover-buttons">
                                <button className="gameover-btn" onClick={handleRestart}>
                                    REINTENTAR
                                </button>
                                <button className="gameover-btn-secondary" onClick={() => navigate('/')}>
                                    MENÚ PRINCIPAL
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!gameOver && (
                    <>
                        {/* HUD */}
                        <div className="hud-top">
                            <div className="hud-clock">{formatTime(time)}</div>
                            <div className="hud-anomalies">
                                <span className="hud-dot" /> {activeAnomalies.length} ACTIV{activeAnomalies.length !== 1 ? 'AS' : 'A'}
                            </div>
                        </div>
                        <div className="hud-bottom">
                            <div className="hud-tasks">
                                <span className={`task-indicator ${lightsOn ? 'done' : ''}`}>💡</span>
                                <span className={`task-indicator ${phoneAnswered ? 'done' : ''}`}>📞</span>
                                <span className={`task-indicator ${bathroomClean ? 'done' : ''}`}>🧹</span>
                                <span className={`task-indicator ${registerOn ? 'done' : ''}`}>💳</span>
                            </div>
                            <div className="hud-progress">
                                <div className="hud-progress-bar">
                                    <div className="hud-progress-fill" style={{ width: `${(time / SHIFT_END) * 100}%` }} />
                                </div>
                                <span className="hud-progress-label">{Math.floor((time / SHIFT_END) * 100)}%</span>
                            </div>
                        </div>
                        <div className="crosshair">+</div>
                        {anomalyAlert && (
                            <div className="anomaly-alert">{anomalyAlert}</div>
                        )}
                        {interactionMsg && (
                            <div className="interaction-prompt">{interactionMsg}</div>
                        )}
                        {bossMessage && (
                            <div className="boss-subtitle">[JEFE]: "{bossMessage}"</div>
                        )}
                    </>
                )}

                <Canvas shadows camera={{ fov: 75, position: [0, 3, 19], near: 0.1, far: 100 }}>
                    <color attach="background" args={['#060814']} />
                    <fog attach="fog" args={['#060814', 15, 60]} />
                    <Sky distance={450000} sunPosition={[0, -1, 0]} inclination={0} azimuth={0.25} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Suspense fallback={null}>
                        <Environment preset="night" />
                    </Suspense>
                    <ambientLight intensity={0.45} color="#3344cc" />
                    <directionalLight position={[10, 20, 10]} intensity={0.25} color="#88aaff" />
                    <pointLight position={[-2, 2.5, 13]} intensity={0.8} color="#ff8844" distance={15} decay={1.5} castShadow shadow-mapSize={[512, 512]} />
                    {lightsOn && (
                        <group name="CeilingLights">
                            <pointLight position={[-6, 4.5, 5]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                            <pointLight position={[6, 4.5, 5]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                            <pointLight position={[-6, 4.5, -5]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                            <pointLight position={[6, 4.5, -5]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                            <pointLight position={[-6, 4.5, -15]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                            <pointLight position={[6, 4.5, -15]} intensity={8} color="#ffeedd" distance={30} decay={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
                        </group>
                    )}
                    {lightsOn && <pointLight position={[-8, 4, -18]} intensity={3} color="#e0f7ff" castShadow distance={20} decay={1.5} shadow-mapSize={[1024, 1024]} />}
                    {lightsOn && <pointLight position={[8, 4, -18]} intensity={3} color="#e0f7ff" castShadow distance={20} decay={1.5} shadow-mapSize={[1024, 1024]} />}
                    {active && <PointerLockControls />}
                    <Suspense fallback={null}>
                        <Physics gravity={[0, -20, 0]}>
                            <Player setBossMessage={setBossMessage} active={active} />
                            <Exterior active={active} />
                            <Store />
                        </Physics>
                    </Suspense>
                    <EffectComposer>
                        <SMAA />
                        <Bloom luminanceThreshold={0.8} intensity={1.8} levels={8} mipmapBlur />
                        <ChromaticAberration offset={[0.002, 0.001]} />
                        <ToneMapping mode={3} />
                        <Vignette eskil={false} offset={0.05} darkness={1.4} />
                        <Noise opacity={0.04} />
                        <BrightnessContrast brightness={-0.02} contrast={0.15} />
                    </EffectComposer>
                </Canvas>
            </div>
        </GameContext.Provider>
    );
};

export default Game;