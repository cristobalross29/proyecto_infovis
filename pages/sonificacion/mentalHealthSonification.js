// Sonificación de Salud Mental en Caída
// Representa el deterioro de la salud mental con el aumento del uso de redes sociales

export class MentalHealthSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.chartData = null;

        // Sintetizador principal para la melodía descendente (muy melancólica)
        this.mainSynth = new window.Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.5,    // Ataque muy lento = más suave y triste
                decay: 0.8,
                sustain: 0.7,
                release: 2.5    // Release muy largo = más melancólico
            },
            volume: -6
        }).toDestination();
    }

    setData(chartData) {
        this.chartData = chartData;
    }

    async play() {
        if (this.isPlaying || !this.chartData || this.chartData.length === 0) return;

        // Iniciar contexto de audio
        await window.Tone.start();
        console.log('Sonificación de salud mental iniciada');

        this.isPlaying = true;
        this.currentStep = 0;

        // Reproducir secuencia completa
        this.playSequence();
    }

    playSequence() {
        if (!this.isPlaying || this.currentStep >= this.chartData.length) {
            this.stop();
            return;
        }

        const dataPoint = this.chartData[this.currentStep];
        const now = window.Tone.now();

        // Resaltar punto actual en el gráfico
        this.highlightPoint(this.currentStep);

        // Sonificar el punto actual
        this.sonifyDataPoint(dataPoint, now);

        this.currentStep++;

        // Velocidad de reproducción: MÁS LENTA con peor salud mental (más dramático)
        const playbackSpeed = dataPoint.avgMentalHealth > 7 ? 700 :
                             dataPoint.avgMentalHealth > 5 ? 900 :
                             dataPoint.avgMentalHealth > 3 ? 1100 : 1400;
        setTimeout(() => this.playSequence(), playbackSpeed);
    }

    sonifyDataPoint(dataPoint, startTime = window.Tone.now()) {
        const { avgMentalHealth } = dataPoint;

        // Melodía principal: frecuencia DISMINUYE DRÁSTICAMENTE con menor salud mental
        // Rango más amplio: 1100 Hz (salud alta) a 165 Hz (salud baja) - cambio muy notable
        const baseFreq = 165 + (avgMentalHealth / 10) * 935;
        const mainNote = window.Tone.Frequency(baseFreq).toNote();

        // Nota principal con duración MUY larga para efecto muy melancólico
        const mainDuration = avgMentalHealth > 7 ? '2n' : avgMentalHealth > 5 ? '1n' : '1n.'; // Más largo = más triste
        this.mainSynth.triggerAttackRelease(mainNote, mainDuration, startTime);
    }

    stop() {
        this.isPlaying = false;
        this.currentStep = 0;

        // Detener el sintetizador
        this.mainSynth.triggerRelease();

        window.Tone.Transport.stop();
        window.Tone.Transport.cancel();

        // Quitar resaltado
        this.clearHighlight();
    }

    highlightPoint(pointIndex) {
        const chart = document.getElementById('chart-mental-health');
        if (!chart || !this.chartData || pointIndex >= this.chartData.length) return;

        const dataPoint = this.chartData[pointIndex];

        // Crear marcador vertical en la posición actual
        const verticalLine = {
            type: 'line',
            x0: dataPoint.hours,
            x1: dataPoint.hours,
            y0: 0,
            y1: 10,
            line: {
                color: 'rgba(255, 215, 0, 0.7)',
                width: 4,
                dash: 'dash'
            }
        };

        // Círculo en el punto actual
        const circle = {
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: dataPoint.hours - 0.2,
            x1: dataPoint.hours + 0.2,
            y0: dataPoint.avgMentalHealth - 0.3,
            y1: dataPoint.avgMentalHealth + 0.3,
            fillcolor: 'rgba(255, 215, 0, 0.5)',
            line: {
                color: 'rgba(255, 215, 0, 1)',
                width: 3
            }
        };

        const annotation = {
            x: dataPoint.hours,
            y: dataPoint.avgMentalHealth,
            text: `${dataPoint.hours.toFixed(1)}h | Score: ${dataPoint.avgMentalHealth.toFixed(1)}`,
            showarrow: true,
            arrowhead: 2,
            arrowcolor: 'gold',
            ax: 0,
            ay: -40,
            bgcolor: 'rgba(255, 215, 0, 0.9)',
            font: {
                color: 'black',
                size: 11,
                family: 'Arial, sans-serif',
                weight: 'bold'
            },
            borderpad: 4
        };

        Plotly.relayout('chart-mental-health', {
            shapes: [verticalLine, circle],
            annotations: [annotation]
        });
    }

    clearHighlight() {
        const chart = document.getElementById('chart-mental-health');
        if (!chart) return;

        Plotly.relayout('chart-mental-health', {
            shapes: [],
            annotations: []
        });
    }

    async playSinglePoint(pointIndex) {
        if (pointIndex < 0 || pointIndex >= this.chartData.length) return;

        // Iniciar contexto de audio
        await window.Tone.start();

        const wasPlaying = this.isPlaying;
        if (wasPlaying) {
            this.stop();
        }

        const dataPoint = this.chartData[pointIndex];

        // Resaltar punto clickeado
        this.highlightPoint(pointIndex);

        // Reproducir sonificación del punto
        this.sonifyDataPoint(dataPoint);

        // Limpiar resaltado después de 2 segundos
        setTimeout(() => {
            if (!this.isPlaying) {
                this.clearHighlight();
            }
        }, 2000);
    }

    dispose() {
        this.stop();
        this.mainSynth.dispose();
    }
}
