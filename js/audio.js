// 音频管理器
const AudioSys = {
    ctx: null, bgmGainNode: null, isMuted: false,
    init: function() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    playShoot: function(type) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        if (type === 'shotgun') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        } else if (type === 'sniper') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        }
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start(); osc.stop(this.ctx.currentTime + 0.15);
    },
    playDash: function() {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        osc.start(); osc.stop(this.ctx.currentTime + 0.2);
    },
    playPowerUp: function(type) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sine';
        let freqStart = 600; if(type === 'bomb') freqStart = 300; if(type === 'speed') freqStart = 800;
        osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freqStart * 2, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
    },
    playExplosion: function(isBig = false) {
        if (!this.ctx || this.isMuted) return;
        const bufferSize = this.ctx.sampleRate * (isBig ? 1.0 : 0.5);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 1000;
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(isBig ? 0.5 : 0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (isBig ? 1.0 : 0.5));
        noise.start();
    },
    startBGM: function() {
        if (!this.ctx) return;
        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.connect(this.ctx.destination);
        this.bgmGainNode.gain.value = this.isMuted ? 0 : 0.05;
        const freqs = [55, 110];
        freqs.forEach((f, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.bgmGainNode);
            osc.type = 'sine'; osc.frequency.value = f;
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine'; lfo.frequency.value = 0.05 + (index * 0.02);
            const lfoGain = this.ctx.createGain(); lfoGain.gain.value = 0.01;
            lfo.connect(lfoGain.gain);
            gain.gain.value = 0.5; osc.start(); lfo.start();
        });
    },
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if(this.bgmGainNode) this.bgmGainNode.gain.setTargetAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime, 0.1);
        muteBtn.innerText = "静音: " + (this.isMuted ? "ON" : "OFF");
        muteBtn.style.color = this.isMuted ? "#f05" : "#aaa";
    }
};