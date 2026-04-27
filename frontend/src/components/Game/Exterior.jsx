import React, { useMemo, useRef } from 'react';
import { Instances, Instance, SpotLight } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playSFX } from '../../utils/audio';

const Forest = () => {
    const trees = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 250; i++) {
            const radius = 25 + Math.random() * 70;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            if (
                (Math.abs(x) < 22 && Math.abs(z) < 22) ||
                (Math.abs(x) < 30 && z > 18 && z < 32)
            ) continue;

            const scale = 0.8 + Math.random() * 1.5;
            temp.push({ position: [x, 0, z], scale });
        }
        return temp;
    }, []);

    return (
        <group>
            {trees.map((t, i) => (
                <RigidBody key={`tree-col-${i}`} type="fixed" position={[t.position[0], 0, t.position[2]]}>
                    <CuboidCollider args={[0.5, 8, 0.5]} />
                </RigidBody>
            ))}

            <Instances limit={250} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.7, 4, 8]} />
                <meshStandardMaterial color="#1a0f08" roughness={1} />
                {trees.map((t, i) => (
                    <Instance key={`trunk-${i}`} position={[t.position[0], 2 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
                ))}
            </Instances>

            <Instances limit={250} castShadow receiveShadow>
                <coneGeometry args={[3.5, 7, 8]} />
                <meshStandardMaterial color="#0d1f0d" roughness={0.9} />
                {trees.map((t, i) => (
                    <Instance key={`leaf1-${i}`} position={[t.position[0], 5 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
                ))}
            </Instances>
            <Instances limit={250} castShadow receiveShadow>
                <coneGeometry args={[2.5, 6, 8]} />
                <meshStandardMaterial color="#112911" roughness={0.9} />
                {trees.map((t, i) => (
                    <Instance key={`leaf2-${i}`} position={[t.position[0], 7.5 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
                ))}
            </Instances>
        </group>
    );
};

const StreetLamp = ({ position, rotation }) => {
    const targetObj = useMemo(() => {
        const obj = new THREE.Object3D();
        return obj;
    }, []);

    return (
        <group position={position} rotation={rotation}>
            {/* Pole */}
            <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 8]} />
                <meshStandardMaterial color="#1a1c1e" metalness={0.7} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 1]} />
                <meshStandardMaterial color="#1a1c1e" />
            </mesh>
            {/* Arm */}
            <mesh position={[1, 7.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 2]} />
                <meshStandardMaterial color="#1a1c1e" />
            </mesh>
            {/* Lamp Head */}
            <mesh position={[2, 7.8, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.5]} />
                <meshStandardMaterial color="#050505" />
            </mesh>

            {/* Bulb emitting ultra high intensity for Bloom */}
            <mesh position={[2, 7.65, 0]}>
                <planeGeometry args={[0.6, 0.4]} />
                <meshStandardMaterial emissive="#ffc355" emissiveIntensity={5} color="#ffffff" />
            </mesh>

            {/* Volumetric Spotlight using drei */}
            <primitive object={targetObj} position={[2, 0, 0]} />
            <SpotLight
                position={[2, 7.6, 0]}
                target={targetObj}
                angle={0.45}
                penumbra={0.8}
                intensity={80} // Heavy intensity for sharp pools of light
                color="#ffc355"
                castShadow
                volumetric={false} // Volumetric is expensive, the high penumbra light does the job
                distance={20}
                decay={2}
            />

            {/* Lamp Collision Pole */}
            <RigidBody type="fixed" position={[0, 4, 0]}>
                <CuboidCollider args={[0.2, 4, 0.2]} />
            </RigidBody>
        </group>
    );
};

const AnimatedBus = ({ active }) => {
    const busRef = useRef();
    const [driving, setDriving] = React.useState(false);

    React.useEffect(() => {
        if (active && !driving) {
            setDriving(true);
            playSFX('bus');
        }
    }, [active]);

    useFrame(() => {
        if (driving && busRef.current) {
            const p = busRef.current.translation();
            // Move bus to the left along the road automatically over time
            busRef.current.setNextKinematicTranslation({ x: p.x - 0.15, y: p.y, z: p.z });
        }
    });

    return (
        <RigidBody ref={busRef} type="kinematicPosition" position={[8, 0, 26.5]}>
            <mesh position={[0, 2, 0]} castShadow>
                <boxGeometry args={[12, 4, 3]} />
                <meshStandardMaterial color="#88270b" />
            </mesh>
            <mesh position={[0, 2.5, 1.55]}>
                <boxGeometry args={[10, 1.5, 0.1]} />
                <meshStandardMaterial color="#1b2226" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-4, 0.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.5, 32]} />
                <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[4, 0.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.5, 32]} />
                <meshStandardMaterial color="#111111" />
            </mesh>
        </RigidBody>
    );
};

const Exterior = ({ active }) => {
    return (
        <group>
            <RigidBody type="fixed">
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#060a06" roughness={1} />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed">
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 24]} receiveShadow>
                    <planeGeometry args={[100, 8]} />
                    <meshStandardMaterial color="#1a1b1d" roughness={0.8} />
                </mesh>
            </RigidBody>

            {[...Array(12)].map((_, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-44 + (i * 8), 0.02, 24]} receiveShadow>
                    <planeGeometry args={[4, 0.3]} />
                    <meshStandardMaterial color="#c28b00" roughness={0.5} />
                </mesh>
            ))}

            <RigidBody type="fixed">
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 17.5]} receiveShadow>
                    <planeGeometry args={[40, 5]} />
                    <meshStandardMaterial color="#2d2d2d" roughness={1} />
                </mesh>
            </RigidBody>

            <StreetLamp position={[-15, 0, 19.5]} rotation={[0, -Math.PI / 2, 0]} />
            <StreetLamp position={[15, 0, 19.5]} rotation={[0, -Math.PI / 2, 0]} />
            <StreetLamp position={[0, 0, 28.5]} rotation={[0, Math.PI / 2, 0]} />

            <Forest />

            <AnimatedBus active={active} />
        </group>
    );
};

export default Exterior;
