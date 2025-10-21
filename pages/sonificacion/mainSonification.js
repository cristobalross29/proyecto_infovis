import { loadCSVData } from '../../dataLoader.js';
import { createMentalHealthChart } from './grafico_mental_health.js';
import { MentalHealthSonification } from './mentalHealthSonification.js';

let mentalHealthSonification;
let mentalHealthChartData;

async function initializeApplication() {
    try {
        const data = await loadCSVData();

        if (data.length === 0) {
            console.error('No se pudieron cargar los datos del CSV');
            return;
        }

        // Initialize sonification
        mentalHealthSonification = new MentalHealthSonification();

        // Setup audio controls
        setupMentalHealthAudioControls();

        // Render chart and get data
        mentalHealthChartData = createMentalHealthChart(data);

        // Update sonification with chart data
        if (mentalHealthSonification && mentalHealthChartData) {
            mentalHealthSonification.setData(mentalHealthChartData);
        }

        // Setup click listeners on chart points
        setupMentalHealthChartClickListeners();

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

function setupMentalHealthAudioControls() {
    const playBtn = document.getElementById('play-btn-mental-health');
    const stopBtn = document.getElementById('stop-btn-mental-health');
    const statusDiv = document.getElementById('audio-status-mental-health');

    playBtn.addEventListener('click', async () => {
        if (!mentalHealthChartData || mentalHealthChartData.length === 0) {
            statusDiv.textContent = '⚠️ No hay datos para sonificar';
            return;
        }

        playBtn.disabled = true;
        statusDiv.textContent = '🎵 Reproduciendo sonificación...';

        try {
            await mentalHealthSonification.play();
            statusDiv.textContent = '✅ Reproducción completada';
        } catch (error) {
            console.error('Error en sonificación de salud mental:', error);
            statusDiv.textContent = '❌ Error al reproducir';
        } finally {
            playBtn.disabled = false;
        }
    });

    stopBtn.addEventListener('click', () => {
        mentalHealthSonification.stop();
        playBtn.disabled = false;
        statusDiv.textContent = '⏹️ Detenido';
    });
}

function setupMentalHealthChartClickListeners() {
    const chartDiv = document.getElementById('chart-mental-health');

    if (!chartDiv) return;

    // Add click event listener to the chart
    chartDiv.on('plotly_click', async (data) => {
        if (!mentalHealthChartData || mentalHealthChartData.length === 0) {
            console.warn('No hay datos disponibles');
            return;
        }

        // Get the point index that was clicked
        const pointIndex = data.points[0].pointIndex;

        // Play sonification for this single point
        if (mentalHealthSonification && pointIndex !== undefined) {
            const statusDiv = document.getElementById('audio-status-mental-health');
            const point = mentalHealthChartData[pointIndex];

            statusDiv.textContent = `🎵 ${point.hours.toFixed(1)}h de uso | Salud Mental: ${point.avgMentalHealth.toFixed(1)}`;

            await mentalHealthSonification.playSinglePoint(pointIndex);

            // Reset status after a delay
            setTimeout(() => {
                if (!mentalHealthSonification.isPlaying) {
                    statusDiv.textContent = 'Listo para reproducir';
                }
            }, 1600);
        }
    });

    // Add hover effect to make it clear points are clickable
    chartDiv.on('plotly_hover', () => {
        chartDiv.style.cursor = 'pointer';
    });

    chartDiv.on('plotly_unhover', () => {
        chartDiv.style.cursor = 'default';
    });
}

document.addEventListener('DOMContentLoaded', initializeApplication);