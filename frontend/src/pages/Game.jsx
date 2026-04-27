import React, { createContext, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, SoftShadows, Sky, Stars } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, Noise, Vignette, BrightnessContrast } from '@react-three/postprocessing';
import Store from '../components/Game/Store';
import Player from '../components/Game/Player';
import Exterior from '../components/Game/Exterior';
import './../css/pages/Game.css';

export const GameContext = createContext();

const Game = () => {
    const [active, setActive] = useState(false);
    const [doorOpen, setDoorOpen] = useState(false);
    const [lightsOn, setLightsOn] = useState(false);

    const [registerOn, setRegisterOn] = useState(false);
    const [registerClosed, setRegisterClosed] = useState(true);

    const [phoneRinging, setPhoneRinging] = useState(false);
    const [phoneAnswered, setPhoneAnswered] = useState(false);

    const [bathroomClean, setBathroomClean] = useState(false);

    // Anomalies state
    const [activeAnomalies, setActiveAnomalies] = useState([]); // List of IDs
    const [reportedAnomalies, setReportedAnomalies] = useState([]);

    // Time is minutes from 12:00 AM
    const [time, setTime] = useState(0);

    const [interactionMsg, setInteractionMsg] = useState('');
    const [bossMessage, setBossMessage] = useState('');

    // List of possible anomalies
    const ANOMALIES_POOL = [
        { id: 'floating_mannequin', name: 'Maniquí Flotante', chance: 0.1 },
        { id: 'red_lights', name: 'Luces Rojas', chance: 0.15 },
        { id: 'moving_bag', name: 'Bolso Movido', chance: 0.2 },
        { id: 'extra_box', name: 'Caja Extra', chance: 0.2 },
    ];

    // Clock tick
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                const nextTime = prev + 1;
                // Every 10 in-game minutes, check for an anomaly
                if (nextTime % 10 === 0 && nextTime > 20) {
                    ANOMALIES_POOL.forEach(anomaly => {
                        if (Math.random() < anomaly.chance && !activeAnomalies.includes(anomaly.id)) {
                            setActiveAnomalies(current => [...current, anomaly.id]);
                            console.log("¡ANOMALÍA DETECTADA INTERNAMENTE!", anomaly.id);
                        }
                    });
                }
                return nextTime;
            });
        }, 2000); // 1 in-game minute every 2 real seconds
        return () => clearInterval(timer);
    }, [activeAnomalies]);

    // Phone event when lights turn on
    useEffect(() => {
        if (lightsOn && !phoneAnswered && !phoneRinging) {
            setTimeout(() => setPhoneRinging(true), 2000); // rings 2 seconds after lights
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

    return (
        <GameContext.Provider value={{
            doorOpen, setDoorOpen,
            lightsOn, setLightsOn,
            registerOn, setRegisterOn,
            registerClosed, setRegisterClosed,
            phoneRinging, setPhoneRinging,
            phoneAnswered, setPhoneAnswered,
            bathroomClean, setBathroomClean,
            time,
            activeAnomalies,
            reportAnomaly,
            setInteractionMsg
        }}>
            <div className="game-container">
                {!active && (
                    <div className="start-screen" onClick={() => setActive(true)}>
                        <h1>SAYRAY: TURNO DE NOCHE</h1>
                        <p>Haz clic para comenzar el turno...</p>
                        <div className="controls-hint">
                            W,A,S,D - Moverse | E - Interactuar | Mouse - Mirar
                        </div>
                    </div>
                )}

                {/* UI Overlay */}
                <div className="crosshair">+</div>

                {/* Interaction Prompt (Lower middle) */}
                {interactionMsg && (
                    <div className="interaction-prompt">
                        {interactionMsg}
                    </div>
                )}

                {/* Boss Phone Transcript (Top middle) */}
                {bossMessage && (
                    <div className="boss-subtitle">
                        [JEFE]: "{bossMessage}"
                    </div>
                )}

                {/* 3D Canvas */}
                <Canvas shadows camera={{ fov: 75, position: [0, 3, 19] }}>
                    <SoftShadows size={25} samples={10} focus={0.5} />

                    <color attach="background" args={['#020308']} />
                    <fog attach="fog" args={['#020308', 15, 60]} />

                    <Sky distance={450000} sunPosition={[0, -1, 0]} inclination={0} azimuth={0.25} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    <ambientLight intensity={0.4} color="#4466ff" />

                    {/* Luz de emergencia tenue cerca del interruptor */}
                    <pointLight position={[-2, 2.5, 13]} intensity={0.5} color="#ffffff" distance={8} castShadow shadow-mapSize={[1024, 1024]} />

                    {/* Luces principales (Grid de 6 luces) */}
                    {lightsOn && (
                        <group name="CeilingLights">
                            <pointLight position={[-6, 4.5, 5]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[6, 4.5, 5]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[-6, 4.5, -5]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[6, 4.5, -5]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[-6, 4.5, -15]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                            <pointLight position={[6, 4.5, -15]} intensity={5} color="#ffffff" distance={25} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
                        </group>
                    )}

                    {/* Luces del Almacen y Baño */}
                    {lightsOn && <pointLight position={[-8, 4, -18]} intensity={1.5} color="#e0f7ff" castShadow distance={15} decay={2} shadow-mapSize={[512, 512]} />}
                    {lightsOn && <pointLight position={[8, 4, -18]} intensity={1.5} color="#e0f7ff" castShadow distance={15} decay={2} shadow-mapSize={[512, 512]} />}

                    {active && <PointerLockControls />}

                    <Suspense fallback={null}>
                        <Physics gravity={[0, -20, 0]}>
                            <Player setBossMessage={setBossMessage} active={active} />
                            <Exterior active={active} />
                            <Store />
                        </Physics>
                    </Suspense>

                    <EffectComposer disableNormalPass>
                        <Bloom luminanceThreshold={1} intensity={1.5} levels={8} mipmapBlur />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                        <Noise opacity={0.06} />
                        <BrightnessContrast brightness={0.05} contrast={0.1} />
                    </EffectComposer>

                </Canvas>
            </div>
        </GameContext.Provider>
    );
};

export default Game;
