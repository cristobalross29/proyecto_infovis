// Sonificación de Salud Mental en Caída
// Representa el deterioro de la salud mental con el aumento del uso de redes sociales
// Usa audio de respiración real que se manipula para representar ansiedad creciente

export class MentalHealthSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.chartData = null;
        this.audioBuffer = null;
        this.audioLoaded = false;
        this.reverbReady = false;

        // Ruta del audio
        this.audioUrl = 'pages/sonificacion/9dbc5d02.mp3';

        // Cargar el audio primero usando Tone.Buffer
        this.audioBuffer = new window.Tone.Buffer(
            this.audioUrl,
            () => {
                this.audioLoaded = true;
                console.log('✓ Audio de respiración cargado correctamente');
                console.log('Duración del audio:', this.audioBuffer.duration, 'segundos');
            },
            (error) => {
                console.error('❌ Error cargando audio con ruta absoluta:', error);
                console.log('Intentando ruta relativa como fallback...');
                // Fallback: intentar con ruta relativa al documento HTML
                this.audioUrl = './9dbc5d02.mp3';
                this.audioBuffer = new window.Tone.Buffer(
                    this.audioUrl,
                    () => {
                        this.audioLoaded = true;
                        console.log('✓ Audio cargado con ruta relativa');
                    },
                    (err) => {
                        console.error('❌ No se pudo cargar el audio con ninguna ruta:', err);
                        console.error('Verifica que el archivo 9dbc5d02.mp3 exista en pages/sonificacion/');
                    }
                );
            }
        );

        // Crear reverb
        this.reverb = new window.Tone.Reverb({
            decay: 1.5,
            wet: 0.2
        }).toDestination();

        this.reverb.generate().then(() => {
            console.log('✓ Reverb listo');
            this.reverbReady = true;
        });

        // Crear filtro
        this.breathFilter = new window.Tone.Filter({
            type: 'lowpass',
            frequency: 2000,
            rolloff: -24,
            Q: 1
        });

        // Pitch shift
        this.pitchShift = new window.Tone.PitchShift({
            pitch: 0,
            windowSize: 0.1,
            delayTime: 0,
            feedback: 0
        });

        // Distorsión
        this.distortion = new window.Tone.Distortion({
            distortion: 0,
            wet: 0
        });

        // Tremolo
        this.tremolo = new window.Tone.Tremolo({
            frequency: 0,
            depth: 0
        }).start();

        // Conectar cadena de efectos
        this.breathFilter.connect(this.reverb);
        this.distortion.connect(this.breathFilter);
        this.tremolo.connect(this.distortion);
        this.pitchShift.connect(this.tremolo);

        // Ruido de pánico
        this.panicNoise = new window.Tone.Noise({
            type: 'white',
            volume: -40
        });

        this.panicFilter = new window.Tone.Filter({
            type: 'highpass',
            frequency: 1000,
            rolloff: -12
        }).toDestination();

        this.panicNoise.connect(this.panicFilter);

        // Player actual que usaremos
        this.currentPlayer = null;
    }

    setData(chartData) {
        this.chartData = chartData;
    }

    async play() {
        if (this.isPlaying || !this.chartData || this.chartData.length === 0) return;

        // Iniciar contexto de audio
        await window.Tone.start();
        console.log('🎵 Iniciando contexto de audio...');

        // Esperar a que todo esté listo
        while (!this.audioLoaded || !this.reverbReady) {
            console.log('⏳ Esperando recursos...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('✅ Todo listo, comenzando sonificación');

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

        // Producir respiración con audio manipulado
        const breathDuration = this.triggerBreath(dataPoint);

        this.currentStep++;

        // Pausa después de completar respiración (más corta con peor salud)
        const restPause = dataPoint.avgMentalHealth >= 8 ? 800 :
                         dataPoint.avgMentalHealth >= 6 ? 500 :
                         dataPoint.avgMentalHealth >= 4 ? 300 :
                         dataPoint.avgMentalHealth >= 2 ? 150 : 100;

        // Tiempo total = duración del audio + pausa
        const totalInterval = breathDuration + restPause;

        setTimeout(() => this.playSequence(), totalInterval);
    }

    triggerBreath(dataPoint) {
        const { avgMentalHealth } = dataPoint;

        console.log(`🫁 Reproduciendo respiración para salud mental: ${avgMentalHealth.toFixed(1)}`);

        // === MAPEO CLARO DE SALUD MENTAL A PARÁMETROS ===
        // 10-8: Respiración muy tranquila y profunda (lenta, grave)
        // 7-5: Respiración normal
        // 4-3: Respiración acelerada (rápida, agitada)
        // <3: Hiperventilación/pánico (muy rápida, aguda, con jadeos)

        // === 1. VELOCIDAD DE REPRODUCCIÓN (playbackRate) ===
        const playbackRate = avgMentalHealth >= 8 ? 0.7 :   // Muy lento y profundo
                            avgMentalHealth >= 6 ? 0.9 :    // Normal-lento
                            avgMentalHealth >= 4 ? 1.1 :    // Ligeramente acelerado
                            avgMentalHealth >= 2 ? 1.4 :    // Acelerado
                            1.8;                             // Hiperventilación

        // === 2. VOLUMEN ===
        const volume = avgMentalHealth >= 8 ? -12 :   // Suave
                      avgMentalHealth >= 6 ? -8 :     // Normal
                      avgMentalHealth >= 4 ? -4 :     // Fuerte
                      avgMentalHealth >= 2 ? 0 :      // Muy fuerte
                      3;                               // Jadeo intenso

        // === 3. PITCH SHIFT (tono más agudo = tensión) ===
        const pitchShift = avgMentalHealth >= 8 ? -2 :   // Grave y relajado
                          avgMentalHealth >= 6 ? 0 :     // Normal
                          avgMentalHealth >= 4 ? 2 :     // Más agudo
                          avgMentalHealth >= 2 ? 4 :     // Muy agudo
                          6;                              // Extremadamente agudo

        this.pitchShift.pitch = pitchShift;

        // === 4. TREMOLO (temblor en la respiración) ===
        const tremoloFreq = avgMentalHealth >= 6 ? 0 :     // Sin temblor
                           avgMentalHealth >= 4 ? 4 :      // Temblor leve
                           avgMentalHealth >= 2 ? 8 :      // Temblor moderado
                           12;                              // Temblor intenso

        const tremoloDepth = avgMentalHealth >= 6 ? 0 :
                            avgMentalHealth >= 4 ? 0.3 :
                            avgMentalHealth >= 2 ? 0.5 :
                            0.7;

        this.tremolo.frequency.value = tremoloFreq;
        this.tremolo.depth.value = tremoloDepth;

        // === 5. DISTORSIÓN (tensión vocal) ===
        const distortion = avgMentalHealth >= 6 ? 0 :
                          avgMentalHealth >= 4 ? 0.1 :
                          avgMentalHealth >= 2 ? 0.3 :
                          0.5;

        const distortionWet = avgMentalHealth >= 6 ? 0 :
                             avgMentalHealth >= 4 ? 0.2 :
                             avgMentalHealth >= 2 ? 0.4 :
                             0.6;

        this.distortion.distortion = distortion;
        this.distortion.wet.value = distortionWet;

        // === 6. FILTRO (brillo/sibilancia) ===
        const filterFreq = avgMentalHealth >= 8 ? 1500 :   // Suave
                          avgMentalHealth >= 6 ? 2500 :    // Normal
                          avgMentalHealth >= 4 ? 4000 :    // Brillante
                          avgMentalHealth >= 2 ? 6000 :    // Muy brillante
                          8000;                             // Sibilante

        const filterQ = avgMentalHealth >= 6 ? 1 :
                       avgMentalHealth >= 4 ? 2 :
                       avgMentalHealth >= 2 ? 4 :
                       6;

        this.breathFilter.frequency.value = filterFreq;
        this.breathFilter.Q.value = filterQ;

        // === 7. REVERB (profundidad) ===
        const reverbWet = avgMentalHealth >= 6 ? 0.15 :
                         avgMentalHealth >= 4 ? 0.25 :
                         0.35;

        this.reverb.wet.value = reverbWet;

        // === 8. RUIDO DE PÁNICO (solo en ansiedad extrema) ===
        if (avgMentalHealth < 4) {
            const panicVolume = avgMentalHealth >= 2 ? -28 : -20;
            const panicDuration = avgMentalHealth >= 2 ? 0.15 : 0.25;

            this.panicNoise.volume.value = panicVolume;
            this.panicNoise.start();
            this.panicNoise.stop(`+${panicDuration}`);
        }

        // === REPRODUCIR AUDIO ===
        // Crear nuevo player cada vez usando la URL directamente
        if (this.currentPlayer) {
            try {
                this.currentPlayer.disconnect();
                this.currentPlayer.dispose();
            } catch (e) {}
        }

        // Usar la URL directamente en lugar del buffer
        this.currentPlayer = new window.Tone.Player({
            url: this.audioUrl,
            playbackRate: playbackRate,
            volume: volume,
            loop: false,
            onload: () => {
                // Player cargado y listo
                this.currentPlayer.start();
            }
        }).connect(this.pitchShift);

        // Calcular duración real del audio considerando playbackRate
        const originalDuration = this.audioBuffer.duration;
        const actualDuration = (originalDuration / playbackRate) * 1000; // en ms

        return actualDuration;
    }

    stop() {
        this.isPlaying = false;
        this.currentStep = 0;

        // Detener reproductor de audio
        if (this.currentPlayer) {
            try {
                this.currentPlayer.stop();
                this.currentPlayer.disconnect();
                this.currentPlayer.dispose();
                this.currentPlayer = null;
            } catch (e) {
                console.error('Error deteniendo player:', e);
            }
        }

        try {
            this.panicNoise.stop();
        } catch (e) {}

        // Resetear parámetros a valores por defecto
        this.pitchShift.pitch = 0;
        this.tremolo.frequency.value = 0;
        this.tremolo.depth.value = 0;
        this.distortion.distortion = 0;
        this.distortion.wet.value = 0;
        this.breathFilter.frequency.value = 2000;
        this.breathFilter.Q.value = 1;
        this.reverb.wet.value = 0.2;

        window.Tone.Transport.stop();
        window.Tone.Transport.cancel();

        // Quitar resaltado
        this.clearHighlight();

        console.log('⏹️ Sonificación detenida');
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

        // Esperar a que todo esté listo
        while (!this.audioLoaded || !this.reverbReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const wasPlaying = this.isPlaying;
        if (wasPlaying) {
            this.stop();
        }

        const dataPoint = this.chartData[pointIndex];

        // Resaltar punto clickeado
        this.highlightPoint(pointIndex);

        console.log(`🎵 Reproduciendo punto único: salud mental ${dataPoint.avgMentalHealth.toFixed(1)}`);

        // Reproducir 3 ciclos de respiración para este punto
        const breathDuration = this.triggerBreath(dataPoint);
        const pauseBetweenBreaths = 400;

        for (let i = 1; i < 3; i++) {
            setTimeout(() => {
                if (!this.isPlaying) { // Solo si no está reproduciendo la secuencia completa
                    this.triggerBreath(dataPoint);
                }
            }, i * (breathDuration + pauseBetweenBreaths));
        }

        // Limpiar resaltado después de las respiraciones
        setTimeout(() => {
            if (!this.isPlaying) {
                this.clearHighlight();
            }
        }, 3 * (breathDuration + pauseBetweenBreaths));
    }

    dispose() {
        this.stop();

        // Limpiar todos los componentes de audio
        if (this.currentPlayer) {
            this.currentPlayer.dispose();
        }
        this.breathFilter.dispose();
        this.pitchShift.dispose();
        this.distortion.dispose();
        this.reverb.dispose();
        this.tremolo.dispose();
        this.panicNoise.dispose();
        this.panicFilter.dispose();
    }
}
