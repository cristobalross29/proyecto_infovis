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

        // Ruta del nuevo audio
        this.audioUrl = 'pages/sonificacion/3-36681a89.mp3';

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

        // Determinar si es el primer o último punto
        const isFirst = pointIndex === 0;
        const isLast = pointIndex === totalPoints - 1;

        // Reproducir audio con duración fija de 2.6 segundos
        this.playAudioWithFixedDuration(dataPoint, isFirst, isLast);

        this.currentStep++;

        // Todos los puntos duran exactamente 2.6 segundos
        const fixedDuration = 2600; // ms

        setTimeout(() => this.playSequence(), fixedDuration);
    }

    playAudioWithFixedDuration(dataPoint, isFirst, isLast) {
        const { avgMentalHealth } = dataPoint;
        const fixedDuration = 2600; // ms

        console.log(`🎵 Salud mental: ${avgMentalHealth.toFixed(1)}`);

        // Calcular playbackRate base
        let basePlaybackRate = 2.5 - (avgMentalHealth * 0.2);

        // === PRIMER PUNTO: 1.3x más largo (más lento) ===
        if (isFirst) {
            basePlaybackRate = basePlaybackRate / 1.3;
            console.log(`🌟 PRIMER PUNTO: Reproducción 1.3x más lenta`);
        }

        // === ÚLTIMO PUNTO: Repetir 3 veces rápido ===
        if (isLast) {
            console.log(`🔚 ÚLTIMO PUNTO: Repetir 3 veces en 2.6s`);

            // Calcular playbackRate para que 3 repeticiones quepan en 2.6s
            const originalDuration = this.audioBuffer.duration;
            const durationPerRepetition = fixedDuration / 3 / 1000; // en segundos
            const fastPlaybackRate = originalDuration / durationPerRepetition;

            // Detener player anterior
            this.stopCurrentPlayer();

            // Reproducir 3 veces con pausas mínimas
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const player = new window.Tone.Player({
                        url: this.audioUrl,
                        playbackRate: fastPlaybackRate,
                        loop: false,
                        onload: () => player.start()
                    }).toDestination();

                    // Guardar referencia solo del último
                    if (i === 2) {
                        this.currentPlayer = player;
                    }
                }, i * (fixedDuration / 3));
            }

            return;
        }

        // === PUNTOS INTERMEDIOS ===
        const originalDuration = this.audioBuffer.duration;
        const audioDuration = (originalDuration / basePlaybackRate) * 1000; // en ms

        console.log(`⚡ Velocidad base: ${basePlaybackRate.toFixed(2)}x`);
        console.log(`⏱️ Duración del audio: ${audioDuration.toFixed(0)}ms`);

        // Detener player anterior
        this.stopCurrentPlayer();

        if (audioDuration < fixedDuration) {
            // Audio es más corto → repetir hasta llenar 2.6s
            const repetitions = Math.floor(fixedDuration / audioDuration);
            const remainder = fixedDuration - (repetitions * audioDuration);

            console.log(`🔁 Repetir ${repetitions} veces + ${remainder.toFixed(0)}ms extra`);

            for (let i = 0; i < repetitions; i++) {
                setTimeout(() => {
                    const player = new window.Tone.Player({
                        url: this.audioUrl,
                        playbackRate: basePlaybackRate,
                        loop: false,
                        onload: () => player.start()
                    }).toDestination();

                    // Guardar referencia solo del último
                    if (i === repetitions - 1) {
                        this.currentPlayer = player;
                    }
                }, i * audioDuration);
            }
        } else {
            // Audio es más largo → reproducir y se corta automáticamente a los 2.6s
            console.log(`✂️ Audio se cortará a los 2.6s`);

            this.currentPlayer = new window.Tone.Player({
                url: this.audioUrl,
                playbackRate: basePlaybackRate,
                loop: false,
                onload: () => {
                    this.currentPlayer.start();
                    // Detener automáticamente a los 2.6s
                    setTimeout(() => {
                        if (this.currentPlayer) {
                            this.currentPlayer.stop();
                        }
                    }, fixedDuration);
                }
            }).toDestination();
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

        // Calcular playbackRate simple para punto único
        const playbackRate = 2.5 - (dataPoint.avgMentalHealth * 0.2);

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

        // Limpiar resaltado después de la reproducción
        const originalDuration = this.audioBuffer.duration;
        const audioDuration = (originalDuration / playbackRate) * 1000;

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