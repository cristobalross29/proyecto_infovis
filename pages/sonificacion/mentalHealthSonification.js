// Sonificación de Salud Mental en Caída
// Representa el deterioro de la salud mental con el aumento del uso de redes sociales

export class MentalHealthSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.chartData = null;
        this.breathInterval = null;

        // === INHALACIÓN (aire entrando) ===
        // Sintetizador para el flujo de aire (tono descendente = inhalando)
        this.inhaleSynth = new window.Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.6,
                release: 0.1
            },
            volume: -18
        }).toDestination();

        // Ruido de aire para la inhalación
        this.inhaleNoise = new window.Tone.Noise({
            type: 'pink',
            volume: -25
        }).toDestination();

        // Filtro para inhalación (más grave = aire entrando)
        this.inhaleFilter = new window.Tone.Filter({
            type: 'lowpass',
            frequency: 400,
            rolloff: -12
        }).toDestination();

        this.inhaleSynth.connect(this.inhaleFilter);
        this.inhaleNoise.connect(this.inhaleFilter);

        // === EXHALACIÓN (aire saliendo) ===
        // Sintetizador para suspiro/exhalación (tono descendente más lento)
        this.exhaleSynth = new window.Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.02,
                decay: 0.15,
                sustain: 0.5,
                release: 0.6
            },
            volume: -16
        }).toDestination();

        // Ruido de aire para la exhalación
        this.exhaleNoise = new window.Tone.Noise({
            type: 'brown',
            volume: -22
        }).toDestination();

        // Filtro para exhalación (más agudo = aire saliendo)
        this.exhaleFilter = new window.Tone.Filter({
            type: 'lowpass',
            frequency: 600,
            rolloff: -12
        }).toDestination();

        this.exhaleSynth.connect(this.exhaleFilter);
        this.exhaleNoise.connect(this.exhaleFilter);
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

        // Resaltar punto actual en el gráfico
        this.highlightPoint(this.currentStep);

        // Producir respiración completa (inhalar + exhalar)
        this.triggerBreath(dataPoint);

        this.currentStep++;

        // Calcular duración total de la respiración para espaciar correctamente
        const inhaleDuration = dataPoint.avgMentalHealth >= 8 ? 1.8 :
                              dataPoint.avgMentalHealth >= 6 ? 1.2 :
                              dataPoint.avgMentalHealth >= 4 ? 0.7 :
                              dataPoint.avgMentalHealth >= 2 ? 0.4 : 0.25;

        const exhaleDuration = dataPoint.avgMentalHealth >= 8 ? 2.2 :
                              dataPoint.avgMentalHealth >= 6 ? 1.5 :
                              dataPoint.avgMentalHealth >= 4 ? 0.9 :
                              dataPoint.avgMentalHealth >= 2 ? 0.5 : 0.3;

        const pauseDuration = dataPoint.avgMentalHealth >= 8 ? 0.3 :
                             dataPoint.avgMentalHealth >= 6 ? 0.2 :
                             dataPoint.avgMentalHealth >= 4 ? 0.1 : 0.05;

        // Pausa después de completar respiración (más corta con peor salud)
        const restPause = dataPoint.avgMentalHealth >= 8 ? 1500 :
                         dataPoint.avgMentalHealth >= 6 ? 800 :
                         dataPoint.avgMentalHealth >= 4 ? 400 :
                         dataPoint.avgMentalHealth >= 2 ? 200 : 100;

        // Tiempo total = inhalar + pausa + exhalar + descanso
        const totalInterval = (inhaleDuration + pauseDuration + exhaleDuration) * 1000 + restPause;

        setTimeout(() => this.playSequence(), totalInterval);
    }

    triggerBreath(dataPoint) {
        const { avgMentalHealth } = dataPoint;
        const now = window.Tone.now();

        // === MAPEO CLARO DE SALUD MENTAL A PARÁMETROS ===
        // 10-8: Respiración muy tranquila y profunda (3-4 seg total)
        // 7-5: Respiración normal (2-2.5 seg total)
        // 4-3: Respiración acelerada (1-1.5 seg total)
        // <3: Hiperventilación/pánico (0.5-0.8 seg total)

        // Duración de inhalación: más corta con peor salud
        const inhaleDuration = avgMentalHealth >= 8 ? 1.8 :
                              avgMentalHealth >= 6 ? 1.2 :
                              avgMentalHealth >= 4 ? 0.7 :
                              avgMentalHealth >= 2 ? 0.4 : 0.25;

        // Duración de exhalación: más corta con peor salud
        const exhaleDuration = avgMentalHealth >= 8 ? 2.2 :
                              avgMentalHealth >= 6 ? 1.5 :
                              avgMentalHealth >= 4 ? 0.9 :
                              avgMentalHealth >= 2 ? 0.5 : 0.3;

        // Pausa entre inhalación y exhalación (se acorta con ansiedad)
        const pauseDuration = avgMentalHealth >= 8 ? 0.3 :
                             avgMentalHealth >= 6 ? 0.2 :
                             avgMentalHealth >= 4 ? 0.1 : 0.05;

        // === TONO: Más agudo = más tensión ===
        const inhaleFreq = avgMentalHealth >= 6 ? 150 : // Grave y relajado
                          avgMentalHealth >= 4 ? 220 :  // Normal
                          avgMentalHealth >= 2 ? 330 :  // Tenso
                          440;                           // Muy tenso

        const exhaleFreq = avgMentalHealth >= 6 ? 180 :
                          avgMentalHealth >= 4 ? 250 :
                          avgMentalHealth >= 2 ? 360 :
                          480;

        // === VOLUMEN: Más fuerte con peor salud (respiración forzada) ===
        const inhaleVolume = avgMentalHealth >= 6 ? -20 : // Suave
                            avgMentalHealth >= 4 ? -16 :  // Normal
                            avgMentalHealth >= 2 ? -12 :  // Fuerte
                            -8;                            // Muy fuerte

        const exhaleVolume = avgMentalHealth >= 6 ? -18 :
                            avgMentalHealth >= 4 ? -14 :
                            avgMentalHealth >= 2 ? -10 :
                            -6;

        // === FILTRO: Más brillante con peor salud (respiración tensa) ===
        const inhaleFilterFreq = avgMentalHealth >= 6 ? 350 :  // Suave y profundo
                                avgMentalHealth >= 4 ? 500 :   // Normal
                                avgMentalHealth >= 2 ? 700 :   // Más agudo
                                900;                            // Muy agudo

        const exhaleFilterFreq = avgMentalHealth >= 6 ? 450 :
                                avgMentalHealth >= 4 ? 650 :
                                avgMentalHealth >= 2 ? 850 :
                                1100;

        // === PASO 1: INHALACIÓN (aire entrando) ===
        this.inhaleSynth.volume.value = inhaleVolume;
        this.inhaleFilter.frequency.value = inhaleFilterFreq;

        // Tono de inhalación (sube ligeramente para simular aire entrando)
        this.inhaleSynth.frequency.setValueAtTime(inhaleFreq * 0.9, now);
        this.inhaleSynth.frequency.exponentialRampToValueAtTime(inhaleFreq, now + inhaleDuration);
        this.inhaleSynth.triggerAttackRelease(inhaleDuration, now);

        // Ruido de aire para inhalación
        this.inhaleNoise.start(now);
        this.inhaleNoise.stop(now + inhaleDuration);

        // === PASO 2: EXHALACIÓN (aire saliendo) - después de pausa ===
        const exhaleStart = now + inhaleDuration + pauseDuration;

        this.exhaleSynth.volume.value = exhaleVolume;
        this.exhaleFilter.frequency.value = exhaleFilterFreq;

        // Tono de exhalación (baja para simular aire saliendo - suspiro)
        this.exhaleSynth.frequency.setValueAtTime(exhaleFreq, exhaleStart);
        this.exhaleSynth.frequency.exponentialRampToValueAtTime(exhaleFreq * 0.7, exhaleStart + exhaleDuration);
        this.exhaleSynth.triggerAttackRelease(exhaleDuration, exhaleStart);

        // Ruido de aire para exhalación (más prolongado)
        this.exhaleNoise.start(exhaleStart);
        this.exhaleNoise.stop(exhaleStart + exhaleDuration);
    }

    stop() {
        this.isPlaying = false;
        this.currentStep = 0;

        // Detener todos los sonidos
        try {
            this.inhaleNoise.stop();
            this.exhaleNoise.stop();
        } catch (e) {
            // Ignorar si ya están detenidos
        }

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

        // Calcular duración de una respiración completa
        const inhaleDuration = dataPoint.avgMentalHealth >= 8 ? 1.8 :
                              dataPoint.avgMentalHealth >= 6 ? 1.2 :
                              dataPoint.avgMentalHealth >= 4 ? 0.7 :
                              dataPoint.avgMentalHealth >= 2 ? 0.4 : 0.25;

        const exhaleDuration = dataPoint.avgMentalHealth >= 8 ? 2.2 :
                              dataPoint.avgMentalHealth >= 6 ? 1.5 :
                              dataPoint.avgMentalHealth >= 4 ? 0.9 :
                              dataPoint.avgMentalHealth >= 2 ? 0.5 : 0.3;

        const pauseDuration = dataPoint.avgMentalHealth >= 8 ? 0.3 :
                             dataPoint.avgMentalHealth >= 6 ? 0.2 :
                             dataPoint.avgMentalHealth >= 4 ? 0.1 : 0.05;

        const breathCycleDuration = (inhaleDuration + pauseDuration + exhaleDuration) * 1000;

        // Reproducir 3 ciclos de respiración para este punto
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.triggerBreath(dataPoint);
            }, i * (breathCycleDuration + 500));
        }

        // Limpiar resaltado después de las respiraciones
        setTimeout(() => {
            if (!this.isPlaying) {
                this.clearHighlight();
            }
        }, 3 * (breathCycleDuration + 500));
    }

    dispose() {
        this.stop();
        this.inhaleSynth.dispose();
        this.inhaleNoise.dispose();
        this.inhaleFilter.dispose();
        this.exhaleSynth.dispose();
        this.exhaleNoise.dispose();
        this.exhaleFilter.dispose();
    }
}
