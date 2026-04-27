import React, { useContext, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, MeshReflectorMaterial } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { GameContext } from '../../pages/Game';

const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#222222',
    metalness: 0.9,
    roughness: 0.1,
});

const AnimatedDoor = ({ doorOpen }) => {
    const doorRef = useRef();
    useFrame(() => {
        if (!doorRef.current) return;
        const targetX = doorOpen ? -3.5 : 0;
        const pos = doorRef.current.translation();
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        currentPos.lerp(new THREE.Vector3(targetX, 2, 15), 0.1);
        doorRef.current.setNextKinematicTranslation(currentPos);
    });
    return (
        <RigidBody ref={doorRef} type="kinematicPosition" position={[0, 2, 15]}>
            <mesh receiveShadow>
                <boxGeometry args={[3.8, 4, 0.15]} />
                <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
            </mesh>
            <CuboidCollider args={[1.9, 2, 0.1]} />
            <mesh position={[1.5, 0, 0.1]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
            </mesh>
        </RigidBody>
    );
};

const formatTime = (minutes) => {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 should be 12
    const mm = m < 10 ? '0' + m : m;
    return `${h}:${mm} ${ampm}`;
};

const Store = () => {
    const { lightsOn, doorOpen, time, phoneRinging, registerOn, registerClosed, activeAnomalies } = useContext(GameContext);

    return (
        <group>
            <RigidBody type="fixed" colliders="cuboid">
                {/* FLOOR */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -5]} receiveShadow>
                    <planeGeometry args={[30, 40]} />
                    <MeshReflectorMaterial
                        blur={[200, 50]} resolution={512} mixBlur={1} mixStrength={1.5}
                        roughness={0.2} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4}
                        color="#e0e0e0" metalness={0.2}
                    />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                {/* ROOF */}
                <mesh position={[0, 6, -5]} receiveShadow castShadow>
                    <boxGeometry args={[31, 0.5, 41]} />
                    <meshStandardMaterial color={activeAnomalies.includes('red_lights') ? "#330000" : "#2a2a2a"} roughness={0.9} />
                </mesh>
                {/* Light Panels on ceiling */}
                <group position={[0, 5.75, 0]}>
                    <mesh position={[-6, 0, 5]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                    <mesh position={[6, 0, 5]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                    <mesh position={[-6, 0, -5]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                    <mesh position={[6, 0, -5]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                    <mesh position={[-6, 0, -15]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                    <mesh position={[6, 0, -15]}><boxGeometry args={[2, 0.1, 1]} /><meshStandardMaterial emissive={lightsOn ? "#fff" : "#222"} emissiveIntensity={lightsOn ? 2 : 0} /></mesh>
                </group>
            </RigidBody>

            {/* WALLS WITH SOLID COLLIDERS */}
            {/* FRONT WALLS / WINDOWS */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-8.5, 3, 15]} receiveShadow>
                    <boxGeometry args={[13, 6, 0.2]} />
                    <primitive object={glassMaterial} attach="material" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[8.5, 3, 15]} receiveShadow>
                    <boxGeometry args={[13, 6, 0.2]} />
                    <primitive object={glassMaterial} attach="material" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 5, 15]} receiveShadow>
                    <boxGeometry args={[4, 2, 0.2]} />
                    <primitive object={glassMaterial} attach="material" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 3, -25]} receiveShadow><boxGeometry args={[30, 6, 0.5]} /><meshStandardMaterial color="#c0c0c0" /></mesh>
                <mesh position={[0, 0.2, -24.7]}><boxGeometry args={[30, 0.4, 0.1]} /><meshStandardMaterial color="#333" /></mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-15, 3, -5]} receiveShadow><boxGeometry args={[0.5, 6, 40]} /><meshStandardMaterial color="#dcdcdc" /></mesh>
                <mesh position={[-14.7, 0.2, -5]}><boxGeometry args={[0.1, 0.4, 40]} /><meshStandardMaterial color="#333" /></mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[15, 3, -5]} receiveShadow><boxGeometry args={[0.5, 6, 40]} /><meshStandardMaterial color="#dcdcdc" /></mesh>
                <mesh position={[14.7, 0.2, -5]}><boxGeometry args={[0.1, 0.4, 40]} /><meshStandardMaterial color="#333" /></mesh>
            </RigidBody>

            {/* CEILING BEAMS */}
            <group position={[0, 5.8, -5]}>
                <mesh position={[0, 0, 0]}><boxGeometry args={[30, 0.2, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                <mesh position={[0, 0, 10]}><boxGeometry args={[30, 0.2, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                <mesh position={[0, 0, -10]}><boxGeometry args={[30, 0.2, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
            </group>

            {/* DIVIDER WALLS */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 3, -10.25]} receiveShadow><boxGeometry args={[10, 6, 0.5]} /><meshStandardMaterial color="#b0b0b0" /></mesh>
                <mesh position={[-11.5, 3, -10.25]} receiveShadow><boxGeometry args={[7, 6, 0.5]} /><meshStandardMaterial color="#b0b0b0" /></mesh>
                <mesh position={[11.5, 3, -10.25]} receiveShadow><boxGeometry args={[7, 6, 0.5]} /><meshStandardMaterial color="#b0b0b0" /></mesh>
                <mesh position={[0, 3, -17.5]}><boxGeometry args={[0.5, 6, 15]} /><meshStandardMaterial color="#a0a0a0" /></mesh>
            </RigidBody>

            <AnimatedDoor doorOpen={doorOpen} />

            {/* --- ANOMALÍA: MANIQUÍ FLOTANTE --- */}
            {activeAnomalies.includes('floating_mannequin') && (
                <group position={[0, 3 + Math.sin(Date.now() * 0.002), 0]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.4, 1, 4]} />
                        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.1} />
                    </mesh>
                    <Text position={[0, 1.5, 0]} fontSize={0.2} color="red">MÍRAME</Text>
                </group>
            )}

            {/* Signs / Texts */}
            <Text position={[0, 4.8, 15.3]} fontSize={1.5} color="#ff2a6d" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" anchorX="center" anchorY="middle">
                Sayray
                <meshStandardMaterial emissive="#ff2a6d" emissiveIntensity={25} color="#ff2a6d" />
            </Text>

            <Text position={[-6.5, 4.5, -9.7]} fontSize={0.8} color="#111">BAÑO</Text>
            <Text position={[6.5, 4.5, -9.7]} fontSize={0.8} color="#111">ALMACÉN</Text>

            {/* CLOCK */}
            <mesh position={[0, 4.5, -9.7]} castShadow><boxGeometry args={[2.5, 1, 0.1]} /><meshStandardMaterial color="#000" /></mesh>
            <Text position={[0, 4.5, -9.6]} fontSize={0.6} color="#ff0000">{formatTime(time)}<meshStandardMaterial emissive="#ff0000" emissiveIntensity={4} color="#ff0000" /></Text>

            {/* RULES POSTER */}
            <group position={[-14.7, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh castShadow receiveShadow><planeGeometry args={[3, 4]} /><meshStandardMaterial color="#fffbee" /></mesh>
                <Text position={[0, 1.5, 0.05]} fontSize={0.3} color="#aa0000">REGLAS</Text>
                <Text position={[0, 0.5, 0.05]} fontSize={0.18} color="#111" maxWidth={2.5} textAlign="center">
                    1. NO atender a gente sin cara.{"\n\n"}
                    2. NO atender a gente sin ojos.{"\n\n"}
                    3. NO atender a gente que no habla.{"\n\n"}
                    4. Limpia el baño.
                </Text>
            </group>

            {/* CCTV */}
            <CCTVCamera position={[-14, 5.5, 14]} rotation={[0, Math.PI / 4, 0]} />
            <CCTVCamera position={[14, 5.5, 14]} rotation={[0, -Math.PI / 4, 0]} />

            {/* LIGHT SWITCH / INTERRUPTOR (Frente, Pared interior izquierda) */}
            <group position={[-2.5, 1.5, 14.4]}>
                {/* Back Plate */}
                <mesh castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.05]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Glow Border */}
                <mesh position={[0, 0, -0.01]}>
                    <boxGeometry args={[0.65, 0.85, 0.01]} />
                    <meshStandardMaterial color={lightsOn ? "#55ff55" : "#ff3333"} emissive={lightsOn ? "#00ff00" : "#ff0000"} emissiveIntensity={5} />
                </mesh>
                {/* Switch lever */}
                <mesh position={[0.1, 0, 0.05]} rotation={[lightsOn ? -0.4 : 0.4, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.3, 0.1]} />
                    <meshStandardMaterial color="#ddd" />
                </mesh>
                {/* Status Lamp on switch */}
                <mesh position={[-0.1, 0, 0.05]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color={lightsOn ? "#00ff00" : "#ff0000"} emissive={lightsOn ? "#00ff00" : "#ff0000"} emissiveIntensity={10} />
                </mesh>

                <Text position={[0, 0.6, 0.05]} fontSize={0.2} color="#fff">
                    INTERRUPTOR LUCES
                    <meshStandardMaterial emissive="#fff" emissiveIntensity={5} />
                </Text>
            </group>

            {/* FURNITURE WITH SOLID COLLIDERS */}
            <RigidBody type="fixed" colliders="cuboid"><ModernShelves position={[-10, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ModernShelves position={[10, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[-4, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[4, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[-4, 0, 4]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[4, 0, 4]} /></RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                {/* COUNTER */}
                <mesh position={[0, 0.5, 12]} castShadow receiveShadow><boxGeometry args={[6, 1.0, 1.5]} /><meshStandardMaterial color="#dfdfdf" /></mesh>
                <mesh position={[0, 1.05, 12]} castShadow receiveShadow><boxGeometry args={[6.2, 0.1, 1.6]} /><meshStandardMaterial color="#5c3a21" /></mesh>
            </RigidBody>

            {/* --- ANOMALÍA: BOLSO MOVIDO --- */}
            {activeAnomalies.includes('moving_bag') && (
                <mesh position={[0, 0.3, 8]} castShadow>
                    <boxGeometry args={[0.6, 0.5, 0.3]} />
                    <meshStandardMaterial color="purple" />
                </mesh>
            )}

            {/* Phone */}
            <group position={[1.5, 1.1, 12]} rotation={[0, -0.2, 0]}>
                <mesh castShadow><boxGeometry args={[0.6, 0.15, 0.8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[0.4, 0.1, 0.7]} /><meshStandardMaterial color="#111" /></mesh>
                <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial emissive={phoneRinging ? "#ff0000" : "#000"} emissiveIntensity={phoneRinging ? 5 : 0} color="#ff0000" /></mesh>
            </group>

            {/* Register */}
            <group position={[-1, 1.25, 11.9]} rotation={[0.2, 0, 0]}>
                <mesh castShadow><boxGeometry args={[1, 0.8, 0.8]} /><meshStandardMaterial color="#333" /></mesh>
                <mesh position={[0, 0.3, 0.4]}><boxGeometry args={[0.8, 0.5, 0.05]} /><meshStandardMaterial emissive={registerOn ? (registerClosed ? "#0033aa" : "#00aa33") : "#000"} emissiveIntensity={2} color="#111" /></mesh>
            </group>

            {/* Warehouse */}
            <RigidBody type="fixed" colliders="trimesh">
                <WarehouseRack position={[6, 0, -24]} />
                <WarehouseRack position={[10, 0, -24]} />
                <WarehouseRack position={[14, 0, -24]} />
                <WarehouseRack position={[14, 0, -18]} rotation={[0, -Math.PI / 2, 0]} />
            </RigidBody>

            {/* Bathroom */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh position={[-13, 0.5, -23]} castShadow><boxGeometry args={[1, 1, 1.5]} /><meshStandardMaterial color="#fff" /></mesh>
                <mesh position={[-13, 1.2, -23.5]} castShadow><boxGeometry args={[1, 1, 0.5]} /><meshStandardMaterial color="#f0f0f0" /></mesh>
                <mesh position={[-6, 2.5, -24.9]}><planeGeometry args={[2, 1.5]} /><MeshReflectorMaterial resolution={256} color="#aaa" metalness={1} roughness={0} /></mesh>
                <mesh position={[-6, 1.2, -24]} castShadow><boxGeometry args={[2, 0.2, 1]} /><meshStandardMaterial color="#fff" /></mesh>
            </RigidBody>

        </group>
    );
};

const CCTVCamera = ({ position, rotation }) => (
    <group position={position} rotation={rotation}>
        <mesh castShadow><boxGeometry args={[0.3, 0.3, 0.6]} /><meshStandardMaterial color="#ededed" /></mesh>
        <mesh position={[0, 0, 0.35]}><cylinderGeometry args={[0.1, 0.1, 0.1]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.4]}><sphereGeometry args={[0.05]} /><meshStandardMaterial emissive="#ff0000" emissiveIntensity={2} color="#ff0000" /></mesh>
    </group>
);

const WarehouseRack = ({ position, rotation }) => (
    <group position={position} rotation={rotation || [0, 0, 0]}>
        <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[3, 4, 1.5]} /><meshStandardMaterial color="#ccc" roughness={0.9} metalness={0.8} /></mesh>
        {[0.5, 1.5, 2.5, 3.5].map((y) => (
            <group key={y}>
                <mesh position={[0, y, 0]} castShadow><boxGeometry args={[2.8, 0.1, 1.4]} /><meshStandardMaterial color="#b0b0b0" /></mesh>
                {/* Boxes on shelves */}
                <mesh position={[-0.8, y + 0.4, 0]} castShadow><boxGeometry args={[1, 0.7, 1]} /><meshStandardMaterial color="#8B5A2B" /></mesh>
                <mesh position={[0.8, y + 0.4, 0]} castShadow><boxGeometry args={[1, 0.7, 1]} /><meshStandardMaterial color="#8B5A2B" /></mesh>
                {/* Stock Labels */}
                <Text position={[-0.8, y + 0.4, 0.51]} fontSize={0.1} color="#000" anchorX="center" anchorY="middle">CAMISA - NEGRA {"\n"}$20 - STOCK: 4</Text>
                <Text position={[0.8, y + 0.4, 0.51]} fontSize={0.1} color="#000" anchorX="center" anchorY="middle">ZAPATO - ROJO {"\n"}$40 - STOCK: 2</Text>
            </group>
        ))}
    </group>
)

const ModernShelves = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 4, 1.2]} />
                <meshStandardMaterial color="#2d2d2d" roughness={0.7} />
            </mesh>
            {[0.5, 1.5, 2.5, 3.5].map((y, levelIndex) => (
                <group key={levelIndex}>
                    <mesh position={[0, y, 0]} castShadow receiveShadow>
                        <boxGeometry args={[3.8, 0.05, 1.1]} />
                        <meshStandardMaterial color="#e8e8e8" />
                    </mesh>
                    {[...Array(3)].map((_, itemIndex) => {
                        const isBag = levelIndex > 1;
                        const itemX = -1.2 + (itemIndex * 1.2);
                        return (
                            <mesh key={itemIndex} position={[itemX, y + (isBag ? 0.3 : 0.15), 0]} castShadow>
                                {isBag ? (
                                    <boxGeometry args={[0.6, 0.5, 0.3]} />
                                ) : (
                                    <boxGeometry args={[0.3, 0.2, 0.5]} />
                                )}
                                <meshStandardMaterial color={new THREE.Color(`hsl(${Math.random() * 360}, 30%, 35%)`)} roughness={0.8} metalness={0.1} />
                            </mesh>
                        );
                    })}
                </group>
            ))}
        </group>
    );
};

const ClothingRack = ({ position }) => {
    return (
        <group position={position}>
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[0.05, 3, 3]} />
                <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.9, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
            </mesh>
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[0, 1.8, -1.2 + (i * 0.48)]} castShadow>
                    <boxGeometry args={[1.2, 2.2, 0.05]} />
                    <meshStandardMaterial color={new THREE.Color(`hsl(${Math.random() * 360}, 40%, 45%)`)} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

export default Store;
