import React, { useRef, useEffect, useContext, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { GameContext } from '../../pages/Game';
import { playSFX } from '../../utils/audio';

const Player = ({ setBossMessage, active }) => {
    const { camera } = useThree();
    const keys = useRef({ w: false, a: false, s: false, d: false, e: false });
    const speed = 4.0;

    const rigidBodyRef = useRef();

    const {
        doorOpen, setDoorOpen,
        lightsOn, setLightsOn,
        registerOn, setRegisterOn,
        registerClosed, setRegisterClosed,
        phoneRinging, setPhoneRinging,
        phoneAnswered, setPhoneAnswered,
        bathroomClean, setBathroomClean,
        activeAnomalies, reportAnomaly,
        setInteractionMsg
    } = useContext(GameContext);

    const lastInteraction = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
        };
        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // When phone rings, start ringing effect
    useEffect(() => {
        let interval;
        if (phoneRinging) {
            playSFX('phone');
            interval = setInterval(() => {
                playSFX('phone');
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [phoneRinging]);

    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointer = useMemo(() => new THREE.Vector2(0, 0), []); // Center of screen

    useFrame((state) => {
        if (!rigidBodyRef.current || !active) return;

        rigidBodyRef.current.wakeUp();

        const translation = rigidBodyRef.current.translation();
        camera.position.set(translation.x, translation.y + 0.6, translation.z);

        const velocity = new THREE.Vector3(0, 0, 0);
        if (keys.current.w) velocity.z -= 1;
        if (keys.current.s) velocity.z += 1;
        if (keys.current.a) velocity.x -= 1;
        if (keys.current.d) velocity.x += 1;

        velocity.normalize().multiplyScalar(speed);

        const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
        velocity.applyEuler(euler);

        const currentVelocity = rigidBodyRef.current.linvel();
        rigidBodyRef.current.setLinvel({ x: velocity.x, y: currentVelocity.y, z: velocity.z }, true);

        // ----- LOGICA INTERACTIVA CON RAYCAST -----
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(state.scene.children, true);

        let message = '';
        const now = Date.now();
        const canInteract = now - lastInteraction.current > 500;

        // Detect interactables by distance as fallback or specific names
        const pos = new THREE.Vector3(translation.x, translation.y, translation.z);

        // Z > 15 es AFUERA. Z < 15 es ADENTRO.
        const isInside = pos.z < 14.8;

        const distToDoor = pos.distanceTo(new THREE.Vector3(0, 1.5, 15));
        const distToLightSwitch = isInside ? pos.distanceTo(new THREE.Vector3(-2.5, 1.5, 14.4)) : 999;
        const distToRegister = isInside ? pos.distanceTo(new THREE.Vector3(-1, 1.25, 11.9)) : 999;
        const distToPhone = isInside ? pos.distanceTo(new THREE.Vector3(1.5, 1.1, 12)) : 999;
        const distToToilet = isInside ? pos.distanceTo(new THREE.Vector3(-13, 1, -23)) : 999;

        let closest = null;
        let currentMin = 999;

        // AFUERA: Prioridad a la puerta
        if (!isInside && distToDoor < 5) {
            closest = 'door';
            currentMin = distToDoor;
        }

        // ADENTRO: Prioridad al interruptor o lo más cercano
        if (isInside) {
            if (distToLightSwitch < 4) { closest = 'light'; currentMin = distToLightSwitch; }
            if (distToDoor < 3 && distToDoor < currentMin) { closest = 'door'; currentMin = distToDoor; }
            if (distToRegister < 1.5 && distToRegister < currentMin) { closest = 'register'; currentMin = distToRegister; }
            if (distToPhone < 1.5 && distToPhone < currentMin) { closest = 'phone'; currentMin = distToPhone; }
            if (distToToilet < 2 && distToToilet < currentMin) { closest = 'toilet'; currentMin = distToToilet; }
        }

        // Anomalías (solo adentros)
        if (isInside && activeAnomalies.includes('floating_mannequin') && pos.distanceTo(new THREE.Vector3(0, 3, 0)) < 4 && 4 < currentMin) closest = 'floating_mannequin';
        if (isInside && activeAnomalies.includes('rotating_mannequin') && pos.distanceTo(new THREE.Vector3(5, 0, 6)) < 4 && 4 < currentMin) closest = 'rotating_mannequin';
        if (isInside && activeAnomalies.includes('fallen_clothes') && pos.distanceTo(new THREE.Vector3(-4, 0, -2)) < 4 && 4 < currentMin) closest = 'fallen_clothes';
        if (isInside && activeAnomalies.includes('extra_box') && pos.distanceTo(new THREE.Vector3(0, 0.5, 5)) < 3 && 3 < currentMin) closest = 'extra_box';
        if (isInside && activeAnomalies.includes('moving_bag') && pos.distanceTo(new THREE.Vector3(0, 0.3, 8)) < 3 && 3 < currentMin) closest = 'moving_bag';

        if (keys.current.e) console.log("INTERACTION KEY [E] PRESSED");

        if (closest === 'door') {
            message = doorOpen ? 'Presiona [E] para CERRAR PUERTA' : 'Presiona [E] para ABRIR PUERTA';
            if (keys.current.e && canInteract) {
                console.log("INTENTANDO TOGGLE PUERTA. Estado actual:", doorOpen);
                setDoorOpen(!doorOpen);
                playSFX('door');
                lastInteraction.current = now;
            }
        } else if (closest === 'light') {
            const isRed = activeAnomalies.includes('red_lights');
            message = isRed ? 'Presiona [E] para REPORTAR Luces Rojas' : (lightsOn ? 'Presiona [E] para APAGAR Luces' : 'Presiona [E] para ENCENDER Luces');
            if (keys.current.e && canInteract) {
                if (isRed) reportAnomaly('red_lights');
                else { setLightsOn(!lightsOn); playSFX('switch'); }
                lastInteraction.current = now;
            }
        } else if (closest === 'floating_mannequin') {
            message = 'Presiona [E] para REPORTAR MANIQUÍ';
            if (keys.current.e && canInteract) { reportAnomaly('floating_mannequin'); lastInteraction.current = now; }
        } else if (closest === 'rotating_mannequin') {
            message = 'Presiona [E] para REPORTAR MANIQUÍ EXTRAÑO';
            if (keys.current.e && canInteract) { reportAnomaly('rotating_mannequin'); lastInteraction.current = now; }
        } else if (closest === 'fallen_clothes') {
            message = 'Presiona [E] para REPORTAR ROPA CAÍDA';
            if (keys.current.e && canInteract) { reportAnomaly('fallen_clothes'); lastInteraction.current = now; }
        } else if (closest === 'extra_box') {
            message = 'Presiona [E] para REPORTAR OBJETO EXTRA';
            if (keys.current.e && canInteract) { reportAnomaly('extra_box'); lastInteraction.current = now; }
        } else if (closest === 'moving_bag') {
            message = 'Presiona [E] para REPORTAR POSICIÓN EXTRAÑA';
            if (keys.current.e && canInteract) { reportAnomaly('moving_bag'); lastInteraction.current = now; }
        } else if (closest === 'phone') {
            if (phoneRinging) {
                message = 'Presiona [E] para CONTESTAR Teléfono';
                if (keys.current.e && canInteract) {
                    playSFX('switch');
                    setPhoneRinging(false);
                    setPhoneAnswered(true);
                    setBossMessage("¡Buenas noches! Las reglas están en la pared. Si ves algo raro... huye o repórtalo. ¡Buena suerte con el turno!");
                    setTimeout(() => setBossMessage(''), 10000); // 10 secs
                    lastInteraction.current = now;
                }
            } else if (phoneAnswered) {
                message = '(Teléfono contestado)';
            }
        } else if (closest === 'register') {
            if (!registerOn) {
                message = 'Presiona [E] para REINICIAR Caja Registradora';
                if (keys.current.e && canInteract) {
                    playSFX('register_on');
                    setRegisterOn(true);
                    setRegisterClosed(true);
                    lastInteraction.current = now;
                }
            } else {
                message = registerClosed ? 'Presiona [E] para ABRIR Caja' : 'Presiona [E] para CERRAR Caja';
                if (keys.current.e && canInteract) {
                    playSFX('register_click');
                    setRegisterClosed(!registerClosed);
                    lastInteraction.current = now;
                }
            }
        } else if (closest === 'toilet') {
            if (!bathroomClean) {
                message = 'Presiona [E] para LIMPIAR Baño';
                if (keys.current.e && canInteract) {
                    playSFX('clean');
                    setBathroomClean(true);
                    setTimeout(() => setBathroomClean(false), 30000);
                    lastInteraction.current = now;
                }
            } else {
                message = '(Baño reluciente)';
            }
        }

        setInteractionMsg(message);
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={[0, 3, 19]}
            colliders="capsule"
            mass={1}
            type="dynamic"
            lockRotations
        >
            <mesh visible={false}>
                <capsuleGeometry args={[0.3, 1, 4]} />
                <meshBasicMaterial color="red" />
            </mesh>
        </RigidBody>
    );
};

export default Player;
