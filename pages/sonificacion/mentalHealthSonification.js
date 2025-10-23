// Sonificación Simplificada de Salud Mental
// Representa el deterioro de la salud mental mediante la velocidad de reproducción
// A menor puntaje de salud mental, más rápido se reproduce el audio

export class MentalHealthSonification {
    constructor() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.chartData = null;
        this.audioBuffer = null;
        this.audioLoaded = false;
        this.speedMultiplier = 1.0; // Multiplicador de velocidad (1x a 5x)

        // Ruta del nuevo audio
        this.audioUrl = 'pages/sonificacion/1-36681a89.mp3';

        // Cargar el audio usando Tone.Buffer
        this.audioBuffer = new window.Tone.Buffer(
            this.audioUrl,
            () => {
                this.audioLoaded = true;
                console.log('✓ Audio cargado correctamente');
                console.log('Duración del audio:', this.audioBuffer.duration, 'segundos');
            },
            (error) => {
                console.error('❌ Error cargando audio:', error);
                console.error('Verifica que el archivo 3-36681a89.mp3 exista en pages/sonificacion/');
            }
        );

        // Player actual
        this.currentPlayer = null;
    }

    setData(chartData) {
        this.chartData = chartData;
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
        console.log(`🎚️ Multiplicador de velocidad: ${multiplier.toFixed(1)}x`);
    }

    async play() {
        if (this.isPlaying || !this.chartData || this.chartData.length === 0) return;

        // Iniciar contexto de audio
        await window.Tone.start();
        console.log('🎵 Iniciando sonificación...');

        // Esperar a que el audio esté cargado
        while (!this.audioLoaded) {
            console.log('⏳ Esperando audio...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('✅ Comenzando reproducción');

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
        const pointIndex = this.currentStep;
        const totalPoints = this.chartData.length;

        // Resaltar punto actual en el gráfico
        this.highlightPoint(this.currentStep);

        // Determinar si es el último punto
        const isLast = pointIndex === totalPoints - 1;

        // Reproducir audio y obtener la duración real
        const audioDuration = this.playAudioAtSpeed(dataPoint, isLast);

        this.currentStep++;

        // Esperar la duración real del audio antes de pasar al siguiente
        setTimeout(() => this.playSequence(), audioDuration);
    }

    playAudioAtSpeed(dataPoint, isLast) {
        const { avgMentalHealth } = dataPoint;

        console.log(`🎵 Salud mental: ${avgMentalHealth.toFixed(1)}`);

        // Duración original del audio en segundos
        const originalDuration = this.audioBuffer.duration;

        // Detener player anterior
        this.stopCurrentPlayer();

        // === ÚLTIMO PUNTO: Repetir 3 veces ===
        if (isLast) {
            console.log(`🔚 ÚLTIMO PUNTO: Repetir 3 veces`);
            const playbackRate = 1.0; // Velocidad normal

            // Duración de cada repetición
            const singleDuration = (originalDuration / playbackRate) * 1000; // en ms
            const totalDuration = singleDuration * 3;

            // Reproducir 3 veces con la velocidad calculada
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const player = new window.Tone.Player({
                        url: this.audioUrl,
                        playbackRate: playbackRate,
                        loop: false,
                        onload: () => player.start()
                    }).toDestination();

                    if (i === 2) {
                        this.currentPlayer = player;
                    }
                }, i * singleDuration);
            }

            return totalDuration;
        }

        // === CÁLCULO DE VELOCIDAD SEGÚN SALUD MENTAL (INVERSO) ===
        // Salud mental = 9 → velocidad 0.33x (3 veces más lento)
        // Salud mental = 5 → velocidad 1x (normal/original)
        // Interpolación lineal entre 5 y 9

        let basePlaybackRate;

        if (avgMentalHealth >= 9) {
            basePlaybackRate = 0.33; // 3 veces más lento
        } else if (avgMentalHealth <= 5) {
            basePlaybackRate = 1.0; // Velocidad normal
        } else {
            // Interpolación lineal: y = mx + b
            // Punto 1: (9, 0.33)  Punto 2: (5, 1.0)
            // m = (1.0 - 0.33) / (5 - 9) = 0.67 / -4 = -0.1675
            // Cuando x=9: y = -0.1675(9) + b → 0.33 = -1.5075 + b → b = 1.8375
            basePlaybackRate = -0.1675 * avgMentalHealth + 1.8375;
        }

        // Aplicar multiplicador de velocidad
        const playbackRate = basePlaybackRate * this.speedMultiplier;

        this.currentPlayer = new window.Tone.Player({
            url: this.audioUrl,
            playbackRate: playbackRate,
            loop: false,
            onload: () => this.currentPlayer.start()
        }).toDestination();

        // Calcular duración real del audio con la velocidad aplicada
        const actualDuration = (originalDuration / playbackRate) * 1000; // en ms

        console.log(`⚡ Velocidad base: ${basePlaybackRate.toFixed(2)}x | Multiplicador: ${this.speedMultiplier.toFixed(1)}x | Final: ${playbackRate.toFixed(2)}x | Duración: ${actualDuration.toFixed(0)}ms`);

        return actualDuration;
    }

    repeatAudio(times, totalDuration, originalDuration) {
        // Calcular cuánto dura cada repetición
        const durationPerRepetition = totalDuration / times / 1000; // en segundos

        // Calcular playbackRate para que cada repetición quepa en su tiempo asignado
        const playbackRate = originalDuration / durationPerRepetition;

        console.log(`🔁 Repetir ${times} veces | Velocidad: ${playbackRate.toFixed(2)}x`);

        // Reproducir múltiples veces
        for (let i = 0; i < times; i++) {
            setTimeout(() => {
                const player = new window.Tone.Player({
                    url: this.audioUrl,
                    playbackRate: playbackRate,
                    loop: false,
                    onload: () => player.start()
                }).toDestination();

                // Guardar referencia solo del último
                if (i === times - 1) {
                    this.currentPlayer = player;
                }
            }, i * (totalDuration / times));
        }
    }

    stopCurrentPlayer() {
        if (this.currentPlayer) {
            try {
                this.currentPlayer.stop();
                this.currentPlayer.disconnect();
                this.currentPlayer.dispose();
                this.currentPlayer = null;
            } catch (e) {
                console.error('Error deteniendo player anterior:', e);
            }
        }
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

        // Esperar a que el audio esté cargado
        while (!this.audioLoaded) {
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

        // Usar la MISMA lógica que playAudioAtSpeed
        const { avgMentalHealth } = dataPoint;
        const originalDuration = this.audioBuffer.duration;

        // === CÁLCULO DE VELOCIDAD SEGÚN SALUD MENTAL (INVERSO) ===
        let basePlaybackRate;

        if (avgMentalHealth >= 9) {
            basePlaybackRate = 0.33; // 3 veces más lento
        } else if (avgMentalHealth <= 5) {
            basePlaybackRate = 1.0; // Velocidad normal
        } else {
            // Interpolación lineal igual que en playAudioAtSpeed
            basePlaybackRate = -0.1675 * avgMentalHealth + 1.8375;
        }

        // Aplicar multiplicador de velocidad
        const playbackRate = basePlaybackRate * this.speedMultiplier;

        // Reproducir una sola vez
        this.stopCurrentPlayer();

        this.currentPlayer = new window.Tone.Player({
            url: this.audioUrl,
            playbackRate: playbackRate,
            loop: false,
            onload: () => {
                this.currentPlayer.start();
            }
        }).toDestination();

        // Calcular duración real del audio
        const audioDuration = (originalDuration / playbackRate) * 1000;

        console.log(`⚡ Velocidad base: ${basePlaybackRate.toFixed(2)}x | Multiplicador: ${this.speedMultiplier.toFixed(1)}x | Final: ${playbackRate.toFixed(2)}x | Duración: ${audioDuration.toFixed(0)}ms`);

        // Limpiar resaltado después de la reproducción
        setTimeout(() => {
            if (!this.isPlaying) {
                this.clearHighlight();
            }
        }, audioDuration);
    }

    dispose() {
        this.stop();

        // Limpiar player
        if (this.currentPlayer) {
            this.currentPlayer.dispose();
        }

        // Limpiar buffer
        if (this.audioBuffer) {
            this.audioBuffer.dispose();
        }
    }
}