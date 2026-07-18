import React, { useContext, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, MeshReflectorMaterial } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { GameContext } from '../../pages/Game';

const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#111133',
    metalness: 0.95,
    roughness: 0.05,
    envMapIntensity: 2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
});

// ─── ANIMATED DOOR ─────────────────────────────────────────────────────────────
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
                <meshPhysicalMaterial color="#1a1a2e" metalness={0.95} roughness={0.05} envMapIntensity={2} clearcoat={0.2} />
            </mesh>
            <CuboidCollider args={[1.9, 2, 0.1]} />
            <mesh position={[1.5, 0, 0.1]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshPhysicalMaterial color="#aaa" metalness={0.9} roughness={0.1} />
            </mesh>
        </RigidBody>
    );
};

const formatTime = (minutes) => {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mm = m < 10 ? '0' + m : m;
    return `${h}:${mm} ${ampm}`;
};

// ─── ANOMALÍA: MANIQUÍ FLOTANTE (componente propio para usar useFrame) ─────────
const FloatingMannequinAnomaly = () => {
    const groupRef = useRef();
    const glowRef = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = 3 + Math.sin(t * 2) * 0.35;
        }
        if (glowRef.current) {
            glowRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 10) * 1.2;
        }
    });

    return (
        <group ref={groupRef} position={[0, 3, 0]}>
            <mesh castShadow>
                <capsuleGeometry args={[0.4, 1, 4]} />
                <meshPhysicalMaterial color="#eeeeee" metalness={0.8} roughness={0.1} envMapIntensity={3} clearcoat={0.5} />
            </mesh>
            <mesh ref={glowRef} position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.6]} />
                <meshPhysicalMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} transparent opacity={0.25} />
            </mesh>
            <Text position={[0, 1.8, 0]} fontSize={0.25} color="#ff0000" outlineColor="#000" outlineWidth={0.02} anchorX="center">
                MÍRAME
                <meshPhysicalMaterial emissive="#ff0000" emissiveIntensity={8} color="#ff0000" />
            </Text>
            <pointLight color="#ff0000" intensity={4} distance={6} decay={2} />
        </group>
    );
};

// ─── ANOMALÍA: MANIQUÍ GIRANDO ─────────────────────────────────────────────────
const RotatingMannequinAnomaly = () => {
    const groupRef = useRef();
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.025;
        }
    });
    return (
        <group ref={groupRef} position={[5, 0, 6]}>
            <StoreMannequin position={[0, 0, 0]} color="#cc3333" clothColor="#550000" />
            <Text position={[0, 2.4, 0]} fontSize={0.2} color="#ff4400" outlineColor="#000" outlineWidth={0.01} anchorX="center">
                ¿POR QUÉ GIRO?
                <meshPhysicalMaterial emissive="#ff4400" emissiveIntensity={6} color="#ff4400" />
            </Text>
            <pointLight color="#ff2200" intensity={3} distance={5} decay={2} />
        </group>
    );
};

// ─── ANOMALÍA: ROPA CAÍDA ──────────────────────────────────────────────────────
const FallenClothes = () => {
    const clothes = useMemo(() => [
        { pos: [-3.8, 0.08, -2], rot: [0.1, 0.4, -0.3], color: '#8b0000' },
        { pos: [-3.5, 0.05, -1.6], rot: [-0.2, 0.9, 0.1], color: '#2d2d6b' },
        { pos: [-4.2, 0.06, -2.3], rot: [0.05, 1.4, 0.2], color: '#1a4a1a' },
    ], []);

    return (
        <group>
            {clothes.map((c, i) => (
                <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
                    <boxGeometry args={[1.1, 0.04, 0.7]} />
                    <meshPhysicalMaterial color={c.color} roughness={0.9} metalness={0} />
                </mesh>
            ))}
            <Text position={[-4, 1.2, -2]} fontSize={0.18} color="#ffaa00" outlineColor="#000" outlineWidth={0.01} anchorX="center">
                ROPA TIRADA
                <meshPhysicalMaterial emissive="#ffaa00" emissiveIntensity={5} color="#ffaa00" />
            </Text>
        </group>
    );
};

// ─── MANIQUÍ DECORATIVO (permanente en la tienda) ──────────────────────────────
const StoreMannequin = ({ position, rotation, color = '#e8ddd0', clothColor = null }) => {
    const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color, roughness: 0.4, metalness: 0.05, clearcoat: 0.2,
    }), [color]);
    const clothMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: clothColor || '#2a2a3a', roughness: 0.85, metalness: 0,
    }), [clothColor]);
    const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#888', metalness: 0.9, roughness: 0.1,
    }), []);

    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Head */}
            <mesh position={[0, 1.9, 0]} castShadow>
                <sphereGeometry args={[0.18, 10, 10]} />
                <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 1.68, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
                <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Torso with clothes */}
            <mesh position={[0, 1.22, 0]} castShadow>
                <boxGeometry args={[0.52, 0.72, 0.26]} />
                <primitive object={clothMat} attach="material" />
            </mesh>
            {/* Hips */}
            <mesh position={[0, 0.78, 0]} castShadow>
                <boxGeometry args={[0.46, 0.37, 0.26]} />
                <primitive object={clothMat} attach="material" />
            </mesh>
            {/* Left leg */}
            <mesh position={[-0.13, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.09, 0.65, 8]} />
                <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Right leg */}
            <mesh position={[0.13, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.09, 0.65, 8]} />
                <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Left arm */}
            <mesh position={[-0.33, 1.27, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
                <cylinderGeometry args={[0.07, 0.06, 0.52, 8]} />
                <primitive object={clothMat} attach="material" />
            </mesh>
            {/* Right arm */}
            <mesh position={[0.33, 1.27, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
                <cylinderGeometry args={[0.07, 0.06, 0.52, 8]} />
                <primitive object={clothMat} attach="material" />
            </mesh>
            {/* Base pole */}
            <mesh position={[0, -0.38, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 0.82, 8]} />
                <primitive object={metalMat} attach="material" />
            </mesh>
            {/* Base disc */}
            <mesh position={[0, -0.82, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.33, 0.055, 12]} />
                <primitive object={metalMat} attach="material" />
            </mesh>
        </group>
    );
};

// ─── STORE ─────────────────────────────────────────────────────────────────────
const Store = () => {
    const { lightsOn, doorOpen, time, phoneRinging, registerOn, registerClosed, activeAnomalies } = useContext(GameContext);

    return (
        <group>
            <RigidBody type="fixed" colliders="cuboid">
                {/* FLOOR - Reflective polished tile */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -5]} receiveShadow>
                    <planeGeometry args={[30, 40]} />
                    <MeshReflectorMaterial
                        blur={[300, 100]} resolution={1024} mixBlur={0.5} mixStrength={3}
                        roughness={0.15} depthScale={0.5} minDepthThreshold={0.4} maxDepthThreshold={1.4}
                        color="#c8c8c8" metalness={0.3}
                    />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                {/* ROOF */}
                <mesh position={[0, 6, -5]} receiveShadow castShadow>
                    <boxGeometry args={[31, 0.5, 41]} />
                    <meshPhysicalMaterial color={activeAnomalies.includes('red_lights') ? "#440000" : "#1a1a1a"} roughness={0.8} metalness={0.1} />
                </mesh>
                {/* Light Panels on ceiling */}
                <group position={[0, 5.75, 0]}>
                    {[[-6, 5], [6, 5], [-6, -5], [6, -5], [-6, -15], [6, -15]].map(([x, z], i) => (
                        <mesh key={i} position={[x, 0, z]}>
                            <boxGeometry args={[2, 0.1, 1]} />
                            <meshPhysicalMaterial
                                color="#ffffff"
                                emissive={lightsOn ? "#fff8e0" : "#222"}
                                emissiveIntensity={lightsOn ? 3 : 0}
                                roughness={0.1} metalness={0.2}
                            />
                        </mesh>
                    ))}
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
                <mesh position={[0, 3, -25]} receiveShadow><boxGeometry args={[30, 6, 0.5]} /><meshPhysicalMaterial color="#b8b8b8" roughness={0.6} metalness={0.05} /></mesh>
                <mesh position={[0, 0.2, -24.7]}><boxGeometry args={[30, 0.4, 0.1]} /><meshPhysicalMaterial color="#333" roughness={0.8} /></mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-15, 3, -5]} receiveShadow><boxGeometry args={[0.5, 6, 40]} /><meshPhysicalMaterial color="#d0d0d0" roughness={0.4} metalness={0.05} /></mesh>
                <mesh position={[-14.7, 0.2, -5]}><boxGeometry args={[0.1, 0.4, 40]} /><meshPhysicalMaterial color="#333" roughness={0.8} /></mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[15, 3, -5]} receiveShadow><boxGeometry args={[0.5, 6, 40]} /><meshPhysicalMaterial color="#d0d0d0" roughness={0.4} metalness={0.05} /></mesh>
                <mesh position={[14.7, 0.2, -5]}><boxGeometry args={[0.1, 0.4, 40]} /><meshPhysicalMaterial color="#333" roughness={0.8} /></mesh>
            </RigidBody>

            {/* CEILING BEAMS */}
            <group position={[0, 5.8, -5]}>
                {[0, 10, -10].map((z, i) => (
                    <mesh key={i} position={[0, 0, z]}>
                        <boxGeometry args={[30, 0.2, 0.4]} />
                        <meshPhysicalMaterial color="#111" roughness={0.9} metalness={0.3} />
                    </mesh>
                ))}
            </group>

            {/* DIVIDER WALLS */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 3, -10.25]} receiveShadow><boxGeometry args={[10, 6, 0.5]} /><meshPhysicalMaterial color="#a8a8a8" roughness={0.5} metalness={0.05} /></mesh>
                <mesh position={[-11.5, 3, -10.25]} receiveShadow><boxGeometry args={[7, 6, 0.5]} /><meshPhysicalMaterial color="#a8a8a8" roughness={0.5} metalness={0.05} /></mesh>
                <mesh position={[11.5, 3, -10.25]} receiveShadow><boxGeometry args={[7, 6, 0.5]} /><meshPhysicalMaterial color="#a8a8a8" roughness={0.5} metalness={0.05} /></mesh>
                <mesh position={[0, 3, -17.5]}><boxGeometry args={[0.5, 6, 15]} /><meshPhysicalMaterial color="#989898" roughness={0.5} metalness={0.05} /></mesh>
            </RigidBody>

            <AnimatedDoor doorOpen={doorOpen} />

            {/* ─── ANOMALÍAS ACTIVAS ────────────────────────────────────────── */}
            {activeAnomalies.includes('floating_mannequin') && <FloatingMannequinAnomaly />}
            {activeAnomalies.includes('rotating_mannequin') && <RotatingMannequinAnomaly />}
            {activeAnomalies.includes('fallen_clothes') && <FallenClothes />}

            {/* BOLSO MOVIDO */}
            {activeAnomalies.includes('moving_bag') && (
                <mesh position={[0, 0.3, 8]} castShadow>
                    <boxGeometry args={[0.6, 0.5, 0.3]} />
                    <meshPhysicalMaterial color="#8844aa" metalness={0.3} roughness={0.4} envMapIntensity={1.5} />
                </mesh>
            )}

            {/* CAJA EXTRA */}
            {activeAnomalies.includes('extra_box') && (
                <group position={[0, 0.5, 5]}>
                    <mesh castShadow>
                        <boxGeometry args={[1.2, 1, 1.2]} />
                        <meshPhysicalMaterial color="#8B4513" roughness={0.7} metalness={0.1} />
                    </mesh>
                    <mesh position={[0, 0.6, 0.61]}>
                        <planeGeometry args={[0.8, 0.4]} />
                        <meshPhysicalMaterial color="#fff" />
                    </mesh>
                    <Text position={[0, 0.6, 0.62]} fontSize={0.15} color="#000" anchorX="center" anchorY="middle">?</Text>
                </group>
            )}

            {/* ─── SIGNS / TEXTS ────────────────────────────────────────────── */}
            <Text position={[0, 4.8, 15.3]} fontSize={1.8} color="#ff2a6d"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
                anchorX="center" anchorY="middle">
                Sayray
                <meshPhysicalMaterial emissive="#ff2a6d" emissiveIntensity={40} color="#ff2a6d" roughness={0.2} metalness={0.1} />
            </Text>
            <mesh position={[0, 4.8, 15.1]}>
                <planeGeometry args={[6, 1.5]} />
                <meshPhysicalMaterial color="#ff2a6d" emissive="#ff2a6d" emissiveIntensity={2} transparent opacity={0.15} roughness={0.5} />
            </mesh>

            <Text position={[-6.5, 4.5, -9.7]} fontSize={0.8} color="#ccc">BAÑO</Text>
            <Text position={[6.5, 4.5, -9.7]} fontSize={0.8} color="#ccc">ALMACÉN</Text>

            {/* CLOCK */}
            <mesh position={[0, 4.5, -9.7]} castShadow><boxGeometry args={[2.5, 1, 0.1]} /><meshPhysicalMaterial color="#0a0a0a" roughness={0.8} metalness={0.3} /></mesh>
            <Text position={[0, 4.5, -9.6]} fontSize={0.6} color="#ff0000">
                {formatTime(time)}
                <meshPhysicalMaterial emissive="#ff0000" emissiveIntensity={6} color="#ff0000" roughness={0.2} />
            </Text>

            {/* RULES POSTER */}
            <group position={[-14.7, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh castShadow receiveShadow><planeGeometry args={[3, 4]} /><meshStandardMaterial color="#fffbee" /></mesh>
                <Text position={[0, 1.5, 0.05]} fontSize={0.3} color="#aa0000">REGLAS</Text>
                <Text position={[0, 0.5, 0.05]} fontSize={0.18} color="#111" maxWidth={2.5} textAlign="center">
                    1. NO atender a gente sin cara.{"\n\n"}
                    2. NO atender a gente sin ojos.{"\n\n"}
                    3. NO atender a gente que no habla.{"\n\n"}
                    4. Reporta anomalías de inmediato.{"\n\n"}
                    5. Mantén la tienda en orden.
                </Text>
            </group>

            {/* CCTV */}
            <CCTVCamera position={[-14, 5.5, 14]} rotation={[0, Math.PI / 4, 0]} />
            <CCTVCamera position={[14, 5.5, 14]} rotation={[0, -Math.PI / 4, 0]} />

            {/* LIGHT SWITCH */}
            <group position={[-2.5, 1.5, 14.4]}>
                <mesh castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.05]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0, 0, -0.01]}>
                    <boxGeometry args={[0.65, 0.85, 0.01]} />
                    <meshStandardMaterial color={lightsOn ? "#55ff55" : "#ff3333"} emissive={lightsOn ? "#00ff00" : "#ff0000"} emissiveIntensity={5} />
                </mesh>
                <mesh position={[0.1, 0, 0.05]} rotation={[lightsOn ? -0.4 : 0.4, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.3, 0.1]} />
                    <meshStandardMaterial color="#ddd" />
                </mesh>
                <mesh position={[-0.1, 0, 0.05]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color={lightsOn ? "#00ff00" : "#ff0000"} emissive={lightsOn ? "#00ff00" : "#ff0000"} emissiveIntensity={10} />
                </mesh>
                <Text position={[0, 0.6, 0.05]} fontSize={0.2} color="#fff">
                    INTERRUPTOR LUCES
                    <meshStandardMaterial emissive="#fff" emissiveIntensity={5} />
                </Text>
            </group>

            {/* ─── MANIQUÍES DECORATIVOS (permanentes) ──────────────────────── */}
            {/* Escaparate frontal */}
            <StoreMannequin position={[-10, 0, 13.5]} rotation={[0, Math.PI, 0]} color="#e8ddd0" clothColor="#1a1a2e" />
            <StoreMannequin position={[10, 0, 13.5]} rotation={[0, Math.PI, 0]} color="#d4c9b8" clothColor="#2a1a0a" />
            {/* Sala principal */}
            <StoreMannequin position={[-7, 0, 5]} rotation={[0, 0.5, 0]} color="#e0d0c0" clothColor="#3a1a3a" />
            <StoreMannequin position={[7, 0, 5]} rotation={[0, -0.5, 0]} color="#ddd0c0" clothColor="#0a2a1a" />
            <StoreMannequin position={[0, 0, 0]} rotation={[0, 0, 0]} color="#e5dbd0" clothColor="#1a0a0a" />

            {/* FURNITURE WITH SOLID COLLIDERS */}
            <RigidBody type="fixed" colliders="cuboid"><ModernShelves position={[-10, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ModernShelves position={[10, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[-4, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[4, 0, -2]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[-4, 0, 4]} /></RigidBody>
            <RigidBody type="fixed" colliders="cuboid"><ClothingRack position={[4, 0, 4]} /></RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                {/* COUNTER */}
                <mesh position={[0, 0.5, 12]} castShadow receiveShadow>
                    <boxGeometry args={[6, 1.0, 1.5]} />
                    <meshPhysicalMaterial color="#d4d4d4" roughness={0.3} metalness={0.2} envMapIntensity={1.5} clearcoat={0.5} clearcoatRoughness={0.3} />
                </mesh>
                <mesh position={[0, 1.05, 12]} castShadow receiveShadow>
                    <boxGeometry args={[6.2, 0.1, 1.6]} />
                    <meshPhysicalMaterial color="#4a2810" roughness={0.4} metalness={0.1} envMapIntensity={1} clearcoat={0.3} />
                </mesh>
            </RigidBody>

            {/* Phone */}
            <group position={[1.5, 1.1, 12]} rotation={[0, -0.2, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.6, 0.15, 0.8]} />
                    <meshPhysicalMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.15, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.1, 0.7]} />
                    <meshPhysicalMaterial color="#111" roughness={0.8} metalness={0.3} />
                </mesh>
                <mesh position={[0, 0.2, 0]}>
                    <sphereGeometry args={[0.06]} />
                    <meshPhysicalMaterial emissive={phoneRinging ? "#ff0000" : "#111"} emissiveIntensity={phoneRinging ? 8 : 0} color={phoneRinging ? "#ff0000" : "#222"} />
                </mesh>
                {phoneRinging && <pointLight color="#ff0000" intensity={2} distance={3} decay={2} />}
            </group>

            {/* Register */}
            <group position={[-1, 1.25, 11.9]} rotation={[0.2, 0, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[1, 0.8, 0.8]} />
                    <meshPhysicalMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} envMapIntensity={2} />
                </mesh>
                <mesh position={[0, 0.3, 0.4]}>
                    <boxGeometry args={[0.8, 0.5, 0.05]} />
                    <meshPhysicalMaterial emissive={registerOn ? (registerClosed ? "#0044ff" : "#00ff44") : "#000"} emissiveIntensity={registerOn ? 3 : 0} color="#111" roughness={0.3} metalness={0.5} />
                </mesh>
                {registerOn && (
                    <mesh position={[0, 0.35, 0.55]}>
                        <planeGeometry args={[0.5, 0.25]} />
                        <meshPhysicalMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={0.5} transparent opacity={0.3} />
                    </mesh>
                )}
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

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────────

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
                <mesh position={[-0.8, y + 0.4, 0]} castShadow><boxGeometry args={[1, 0.7, 1]} /><meshStandardMaterial color="#8B5A2B" /></mesh>
                <mesh position={[0.8, y + 0.4, 0]} castShadow><boxGeometry args={[1, 0.7, 1]} /><meshStandardMaterial color="#8B5A2B" /></mesh>
                <Text position={[-0.8, y + 0.4, 0.51]} fontSize={0.1} color="#000" anchorX="center" anchorY="middle">CAMISA - NEGRA {"\n"}$20 - STOCK: 4</Text>
                <Text position={[0.8, y + 0.4, 0.51]} fontSize={0.1} color="#000" anchorX="center" anchorY="middle">ZAPATO - ROJO {"\n"}$40 - STOCK: 2</Text>
            </group>
        ))}
    </group>
);

// Colores fijos para los estantes (evita Math.random en render)
const SHELF_COLORS = [
    ['#3d2020', '#202050', '#204020', '#503020', '#202040', '#402020'],
    ['#1a3040', '#403020', '#302040', '#204030', '#402030', '#303020'],
    ['#2a1a30', '#1a2a30', '#2a2a1a', '#1a302a', '#302a1a', '#1a1a30'],
];

const ModernShelves = ({ position, rotation }) => {
    // Colores memorizados para que no cambien en cada render
    const shelfColors = useMemo(() => SHELF_COLORS, []);

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
                        const colorIdx = levelIndex * 3 + itemIndex;
                        return (
                            <mesh key={itemIndex} position={[itemX, y + (isBag ? 0.3 : 0.15), 0]} castShadow>
                                {isBag ? (
                                    <boxGeometry args={[0.6, 0.5, 0.3]} />
                                ) : (
                                    <boxGeometry args={[0.3, 0.2, 0.5]} />
                                )}
                                <meshStandardMaterial color={shelfColors[levelIndex % shelfColors.length][itemIndex % 6]} roughness={0.8} metalness={0.1} />
                            </mesh>
                        );
                    })}
                </group>
            ))}
        </group>
    );
};

const ClothingRack = ({ position }) => {
    const clothColors = useMemo(() => [
        '#1a0a2a', '#2a1a0a', '#0a1a2a', '#2a0a0a', '#0a2a0a', '#1a1a0a'
    ], []);

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
                    <meshStandardMaterial color={clothColors[i % clothColors.length]} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

export default Store;
