// Lazy initialization: AudioContext se crea solo cuando el usuario interactúa
// (evita el error "AudioContext was not allowed to start" en Chrome)
let _audioCtx = null;
let _noiseBuffer = null;

const getAudioCtx = () => {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === 'suspended') {
        _audioCtx.resume();
    }
    return _audioCtx;
};

const getNoiseBuffer = (ctx) => {
    if (!_noiseBuffer) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        _noiseBuffer = buffer;
    }
    return _noiseBuffer;
};

export const playSFX = (type) => {
    try {
        const audioCtx = getAudioCtx();
        const now = audioCtx.currentTime;

        if (type === 'bus') {
            const noiseBuffer = getNoiseBuffer(audioCtx);
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
                osc1.start(hnow); osc1.stop(hnow + 0.3);
                osc2.start(hnow); osc2.stop(hnow + 0.3);
            }
            const rumble = audioCtx.createOscillator();
            const noise = audioCtx.createBufferSource();
            const rgain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            rumble.type = 'sawtooth';
            rumble.frequency.setValueAtTime(60, now);
            rumble.frequency.exponentialRampToValueAtTime(120, now + 2);
            rumble.frequency.exponentialRampToValueAtTime(40, now + 6);
            noise.buffer = noiseBuffer;
            noise.loop = true;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, now);
            rgain.gain.setValueAtTime(0, now);
            rgain.gain.linearRampToValueAtTime(0.8, now + 1);
            rgain.gain.exponentialRampToValueAtTime(0.01, now + 8);
            noise.connect(filter); filter.connect(rgain);
            rumble.connect(rgain); rgain.connect(audioCtx.destination);
            noise.start(now); rumble.start(now);
            noise.stop(now + 8); rumble.stop(now + 8);

        } else if (type === 'switch') {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            gainNode.gain.setValueAtTime(0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.05);

        } else if (type === 'door') {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(40, now + 1.5);
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
            osc.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 1.5);

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
            osc.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 1.6);

        } else if (type === 'register_on') {
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            gain.connect(audioCtx.destination);
            for (let i = 0; i < 4; i++) {
                const osc = audioCtx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(200 + i * 150, now + i * 0.08);
                osc.frequency.exponentialRampToValueAtTime(80, now + i * 0.08 + 0.1);
                osc.connect(gain);
                osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.12);
            }

        } else if (type === 'register_click') {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
            gainNode.gain.setValueAtTime(0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.15);

        } else if (type === 'clean') {
            const ctx = audioCtx;
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            source.buffer = buffer;
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(3000, now);
            filter.Q.setValueAtTime(0.5, now);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            source.connect(filter); filter.connect(gainNode); gainNode.connect(ctx.destination);
            source.start(now); source.stop(now + 0.5);

        } else if (type === 'anomaly') {
            // Stinger de horror: acorde disonante
            const frequencies = [220, 233, 247];
            frequencies.forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + i * 0.03);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 1.5);
                g.gain.setValueAtTime(0.15, now + i * 0.03);
                g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                osc.connect(g); g.connect(audioCtx.destination);
                osc.start(now + i * 0.03); osc.stop(now + 1.5);
            });
        }
    } catch (e) {
        // Silently fail if audio is not available
        console.warn('Audio error:', e);
    }
};
