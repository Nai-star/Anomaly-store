const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const createNoiseBuffer = () => {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

const noiseBuffer = createNoiseBuffer();

export const playSFX = (type) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (type === 'bus') {
        // 1. CHUCHITO HORN (Double beep)
        for (let j = 0; j < 2; j++) {
            const hnow = now + j * 0.5;
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const hgain = audioCtx.createGain();
            osc1.frequency.setValueAtTime(320, hnow);
            osc2.frequency.setValueAtTime(440, hnow);
            hgain.gain.setValueAtTime(0, hnow);
            hgain.gain.linearRampToValueAtTime(0.5, hnow + 0.05);
            hgain.gain.linearRampToValueAtTime(0, hnow + 0.3);
            osc1.connect(hgain);
            osc2.connect(hgain);
            hgain.connect(audioCtx.destination);
            osc1.start(hnow);
            osc1.stop(hnow + 0.3);
            osc2.start(hnow);
            osc2.stop(hnow + 0.3);
        }

        // 2. ENGINE START + DRIVE (Loud rumble)
        const rumble = audioCtx.createOscillator();
        const noise = audioCtx.createBufferSource();
        const rgain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(60, now);
        rumble.frequency.exponentialRampToValueAtTime(120, now + 2); // Accelerating
        rumble.frequency.exponentialRampToValueAtTime(40, now + 6); // Fading away

        noise.buffer = noiseBuffer;
        noise.loop = true;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);

        rgain.gain.setValueAtTime(0, now);
        rgain.gain.linearRampToValueAtTime(0.8, now + 1);
        rgain.gain.exponentialRampToValueAtTime(0.01, now + 8);

        noise.connect(filter);
        filter.connect(rgain);
        rumble.connect(rgain);
        rgain.connect(audioCtx.destination);

        noise.start(now);
        rumble.start(now);
        noise.stop(now + 8);
        rumble.stop(now + 8);

    } else if (type === 'switch') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'door') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(40, now + 1.5);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.5);
    } else if (type === 'phone') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        gainNode.gain.setValueAtTime(0, now);
        for (let i = 0; i < 4; i++) {
            gainNode.gain.setValueAtTime(0.3, now + i * 0.4);
            gainNode.gain.setValueAtTime(0, now + i * 0.4 + 0.2);
        }
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
    }
};
