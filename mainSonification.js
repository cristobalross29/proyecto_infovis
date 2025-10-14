import { loadCSVData } from './dataLoader.js';
import { createAdiccionConflictosChart } from './grafico_adiccion_conflictos.js';
import { AddictionSonification } from './sonification.js';

let sonification;
let currentChartData;

async function initializeApplication() {
    try {
        const data = await loadCSVData();

        if (data.length === 0) {
            console.error('No se pudieron cargar los datos del CSV');
            return;
        }

        // Initialize sonification
        sonification = new AddictionSonification();

        // Setup audio controls
        setupAudioControls();

        // Render chart and get data
        currentChartData = createAdiccionConflictosChart(data);

        // Update sonification with chart data
        if (sonification && currentChartData) {
            sonification.setData(currentChartData);
        }

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

function setupAudioControls() {
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const statusDiv = document.getElementById('audio-status');

    playBtn.addEventListener('click', async () => {
        if (!currentChartData || currentChartData.length === 0) {
            statusDiv.textContent = '⚠️ No hay datos para sonificar';
            return;
        }

        playBtn.disabled = true;
        statusDiv.textContent = '🎵 Reproduciendo...';

        try {
            await sonification.play();
            statusDiv.textContent = '✅ Reproducción completada';
        } catch (error) {
            console.error('Error en sonificación:', error);
            statusDiv.textContent = '❌ Error al reproducir';
        } finally {
            playBtn.disabled = false;
        }
    });

    stopBtn.addEventListener('click', () => {
        sonification.stop();
        playBtn.disabled = false;
        statusDiv.textContent = '⏹️ Detenido';
    });
}

document.addEventListener('DOMContentLoaded', initializeApplication);