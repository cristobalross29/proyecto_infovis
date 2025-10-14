// Tone.js is loaded via CDN in index.html
// Access it as window.Tone

export class AddictionSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.data = [];

        // Sintetizador principal (melodía base)
        this.synth = new window.Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            }
        }).toDestination();

        // Sintetizador para latidos cardíacos
        this.heartbeat = new window.Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0,
                release: 0.2
            }
        }).toDestination();

        // Sintetizador de ruido (conflictos/estrés)
        this.noise = new window.Tone.Noise('pink').toDestination();
        this.noise.volume.value = -20; // Empieza bajo

        // Filtro de ruido
        this.noiseFilter = new window.Tone.Filter({
            type: 'lowpass',
            frequency: 500,
            Q: 1
        }).toDestination();
        this.noise.connect(this.noiseFilter);

        // Control de volumen de ruido
        this.noiseGain = new window.Tone.Gain(0).toDestination();
        this.noise.disconnect();
        this.noise.connect(this.noiseGain);
        this.noiseGain.connect(this.noiseFilter);

        // Distorsión (aumenta con conflictos)
        this.distortion = new window.Tone.Distortion(0).toDestination();
        this.synth.disconnect();
        this.synth.connect(this.distortion);

        // Secuenciador para latidos
        this.heartbeatLoop = null;
    }

    setData(chartData) {
        this.data = chartData;
    }

    async play() {
        if (this.isPlaying) return;

        // Iniciar contexto de audio (requerido por navegadores)
        await window.Tone.start();
        console.log('Audio iniciado');

        this.isPlaying = true;
        this.currentStep = 0;

        // Iniciar ruido de fondo
        this.noise.start();

        // Reproducir secuencia
        this.playSequence();
    }

    playSequence() {
        if (!this.isPlaying || this.currentStep >= this.data.length) {
            this.stop();
            return;
        }

        const point = this.data[this.currentStep];
        const addiction = point.addiction;
        const conflicts = point.avgConflicts;

        // 1. TONO BASE: Aumenta frecuencia con adicción
        // Escala de adicción (2-9) a frecuencia (200Hz - 800Hz)
        const baseFreq = 200 + ((addiction - 2) / 7) * 600;

        // Añadir disonancia (intervalo aumentado) para altas adicciones
        const harmonyFreq = baseFreq * (addiction > 6 ? 1.414 : 1.5); // Tritono vs quinta

        // 2. DISTORSIÓN: Aumenta con conflictos
        // Escala de conflictos (0-5) a distorsión (0 - 0.8)
        const distortionAmount = (conflicts / 5) * 0.8;
        this.distortion.distortion = distortionAmount;

        // 3. RUIDO: Aumenta volumen con conflictos
        const noiseGain = (conflicts / 5) * 0.3;
        this.noiseGain.gain.rampTo(noiseGain, 0.1);

        // 4. LATIDOS CARDÍACOS: Más rápidos con adicción
        const heartbeatRate = 60 / (60 + addiction * 5); // De 1 seg a 0.5 seg
        this.updateHeartbeat(heartbeatRate);

        // Reproducir tono principal
        const now = window.Tone.now();
        this.synth.triggerAttackRelease(baseFreq, '4n', now);

        // Añadir armonía para enfatizar disonancia
        if (addiction > 5) {
            this.synth.triggerAttackRelease(harmonyFreq, '8n', now + 0.1);
        }

        // Resaltar punto en gráfico
        this.highlightPoint(this.currentStep);

        // Avanzar al siguiente punto
        this.currentStep++;

        // Tiempo entre notas: más rápido con adicción alta
        const noteInterval = 800 - (addiction * 50); // De 800ms a 350ms
        setTimeout(() => this.playSequence(), noteInterval);
    }

    updateHeartbeat(rate) {
        // Detener loop anterior si existe
        if (this.heartbeatLoop) {
            this.heartbeatLoop.stop();
            this.heartbeatLoop.dispose();
        }

        // Crear nuevo loop de latidos
        this.heartbeatLoop = new window.Tone.Loop((time) => {
            this.heartbeat.triggerAttackRelease('C1', '8n', time);
        }, rate).start(0);
    }

    pause() {
        this.isPlaying = false;
        if (this.heartbeatLoop) {
            this.heartbeatLoop.stop();
        }
        window.Tone.Transport.pause();
    }

    stop() {
        this.isPlaying = false;
        this.currentStep = 0;

        // Detener todo
        this.noise.stop();

        if (this.heartbeatLoop) {
            this.heartbeatLoop.stop();
            this.heartbeatLoop.dispose();
            this.heartbeatLoop = null;
        }

        window.Tone.Transport.stop();
        window.Tone.Transport.cancel();

        // Resetear efectos
        this.distortion.distortion = 0;
        this.noiseGain.gain.value = 0;

        // Quitar resaltado
        this.clearHighlight();
    }

    highlightPoint(index) {
        // Actualizar gráfico para resaltar el punto actual
        const chart = document.getElementById('chart-adiccion-conflictos');
        if (!chart) return;

        const update = {
            'marker.line.width': this.data.map((_, i) => i === index ? 4 : 2),
            'marker.line.color': this.data.map((_, i) =>
                i === index ? 'rgba(255, 215, 0, 1)' : 'rgba(0, 0, 0, 0.5)'
            )
        };

        Plotly.restyle('chart-adiccion-conflictos', update, [0]);
    }

    clearHighlight() {
        const chart = document.getElementById('chart-adiccion-conflictos');
        if (!chart) return;

        const update = {
            'marker.line.width': this.data.map(() => 2),
            'marker.line.color': this.data.map(() => 'rgba(0, 0, 0, 0.5)')
        };

        Plotly.restyle('chart-adiccion-conflictos', update, [0]);
    }

    dispose() {
        this.stop();
        this.synth.dispose();
        this.heartbeat.dispose();
        this.noise.dispose();
        this.distortion.dispose();
        this.noiseFilter.dispose();
        this.noiseGain.dispose();
    }
}
