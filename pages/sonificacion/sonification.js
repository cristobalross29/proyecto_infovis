// Tone.js is loaded via CDN in index.html
// Access it as window.Tone

export class AddictionSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.data = [];

        // Un solo sintetizador que se intensifica progresivamente
        this.mainSynth = new window.Tone.Synth({
            oscillator: { type: 'sawtooth' },  // Onda con carácter pero no demasiado dura
            envelope: {
                attack: 0.02,
                decay: 0.15,
                sustain: 0.4,
                release: 0.3
            },
            volume: -10
        }).toDestination();
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
        const now = window.Tone.now();

        // Factor de intensidad combinado (adicción + conflictos)
        const intensityFactor = ((addiction - 2) / 7) * 0.6 + (conflicts / 5) * 0.4;

        // 1. FRECUENCIA: Aumenta con la intensidad
        // Rango: 200 Hz (baja intensidad) a 1200 Hz (alta intensidad)
        const frequency = 200 + (intensityFactor * 1000);
        const note = window.Tone.Frequency(frequency).toNote();

        // 2. VOLUMEN: Aumenta progresivamente con la intensidad
        // De -18dB (suave) a -4dB (fuerte)
        const volume = -18 + (intensityFactor * 14);
        this.mainSynth.volume.rampTo(volume, 0.1);

        // 3. DURACIÓN: Notas más largas = más tensión sostenida
        // De '8n' (corta) a '2n' (muy larga)
        let duration;
        if (intensityFactor < 0.3) {
            duration = '8n';
        } else if (intensityFactor < 0.6) {
            duration = '4n';
        } else {
            duration = '2n';
        }

        // 4. TIPO DE ONDA: Cambia progresivamente para más agresividad
        if (intensityFactor < 0.4) {
            this.mainSynth.oscillator.type = 'sawtooth';  // Suave
        } else if (intensityFactor < 0.7) {
            this.mainSynth.oscillator.type = 'square';    // Medio
        } else {
            this.mainSynth.oscillator.type = 'square8';   // Muy agresivo
        }

        // Reproducir nota
        this.mainSynth.triggerAttackRelease(note, duration, now);

        // Resaltar punto en gráfico
        this.highlightPoint(this.currentStep);

        // Avanzar al siguiente punto
        this.currentStep++;

        // Tiempo entre notas: se acelera con más intensidad
        const noteInterval = 900 - (intensityFactor * 400); // De 900ms a 500ms
        setTimeout(() => this.playSequence(), noteInterval);
    }

    pause() {
        this.isPlaying = false;
        window.Tone.Transport.pause();
    }

    stop() {
        this.isPlaying = false;
        this.currentStep = 0;

        // Detener sintetizador
        this.mainSynth.triggerRelease();

        window.Tone.Transport.stop();
        window.Tone.Transport.cancel();

        // Resetear volumen
        this.mainSynth.volume.value = -10;

        // Quitar resaltado
        this.clearHighlight();
    }

    highlightPoint(index) {
        // Actualizar gráfico para resaltar el punto actual añadiendo un marcador
        const chart = document.getElementById('chart-adiccion-conflictos');
        if (!chart) return;

        const point = this.data[index];

        // Crear un marcador temporal para el punto actual
        const markerTrace = {
            x: [point.addiction],
            y: [point.avgConflicts],
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 20,
                color: 'rgba(255, 215, 0, 0.8)',
                line: {
                    color: 'rgba(255, 165, 0, 1)',
                    width: 3
                }
            },
            hoverinfo: 'skip',
            showlegend: false
        };

        // Eliminar marcador anterior si existe (el último trace es siempre el highlight)
        const expectedTraces = this.data.length; // line segments + main trace
        if (chart.data.length > expectedTraces) {
            Plotly.deleteTraces('chart-adiccion-conflictos', chart.data.length - 1);
        }
        Plotly.addTraces('chart-adiccion-conflictos', markerTrace);
    }

    clearHighlight() {
        const chart = document.getElementById('chart-adiccion-conflictos');
        if (!chart) return;

        // Eliminar el marcador temporal si existe
        const expectedTraces = this.data.length; // line segments + main trace
        if (chart.data.length > expectedTraces) {
            Plotly.deleteTraces('chart-adiccion-conflictos', chart.data.length - 1);
        }
    }

    async playSinglePoint(pointIndex) {
        if (pointIndex < 0 || pointIndex >= this.data.length) return;

        // Iniciar contexto de audio si es necesario
        await window.Tone.start();

        const point = this.data[pointIndex];
        const addiction = point.addiction;
        const conflicts = point.avgConflicts;

        // Si está reproduciendo la secuencia completa, detenerla
        const wasPlaying = this.isPlaying;
        if (wasPlaying) {
            this.stop();
        }

        const now = window.Tone.now();

        // Factor de intensidad combinado
        const intensityFactor = ((addiction - 2) / 7) * 0.6 + (conflicts / 5) * 0.4;

        // Frecuencia
        const frequency = 200 + (intensityFactor * 1000);
        const note = window.Tone.Frequency(frequency).toNote();

        // Volumen
        const volume = -18 + (intensityFactor * 14);
        this.mainSynth.volume.rampTo(volume, 0.1);

        // Duración
        let duration;
        if (intensityFactor < 0.3) {
            duration = '4n';
        } else if (intensityFactor < 0.6) {
            duration = '2n';
        } else {
            duration = '1n';
        }

        // Tipo de onda
        if (intensityFactor < 0.4) {
            this.mainSynth.oscillator.type = 'sawtooth';
        } else if (intensityFactor < 0.7) {
            this.mainSynth.oscillator.type = 'square';
        } else {
            this.mainSynth.oscillator.type = 'square8';
        }

        // Reproducir nota
        this.mainSynth.triggerAttackRelease(note, duration, now);

        // Resaltar punto en gráfico
        this.highlightPoint(pointIndex);

        // Limpiar después
        setTimeout(() => {
            this.mainSynth.volume.value = -10;
            this.clearHighlight();
        }, 1500);
    }

    dispose() {
        this.stop();
        this.mainSynth.dispose();
    }
}
