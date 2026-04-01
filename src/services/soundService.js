// src/services/soundService.js
class SoundService {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    beep(freq = 800, duration = 0.1, type = 'sine') {
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Sound play failed", e);
        }
    }

    playSuccess() {
        this.beep(880, 0.08, 'sine');
    }

    playError() {
        this.beep(220, 0.3, 'square');
    }
}

export const soundService = new SoundService();
