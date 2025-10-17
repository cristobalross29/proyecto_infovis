import { loadCSVData } from './dataLoader.js';
import { createPromedioSueñoChart } from './pages/filtros/grafico_promedio_sueño.js';
import { createPorcentajeImpactoChart } from './pages/filtros/grafico_porcentaje_impacto.js';
import { DataFilters, FilterUI } from './pages/filtros/filters.js';
import { createAdiccionConflictosChart } from './pages/sonificacion/grafico_adiccion_conflictos.js';
import { createMentalHealthChart } from './pages/sonificacion/grafico_mental_health.js';
import { AddictionSonification } from './pages/sonificacion/sonification.js';
import { MentalHealthSonification } from './pages/sonificacion/mentalHealthSonification.js';

let dataFilters;
let filterUI;
let sonification;
let currentChartData;
let mentalHealthSonification;
let mentalHealthChartData;

async function initializeApplication() {
    try {
        const data = await loadCSVData();

        if (data.length === 0) {
            console.error('No se pudieron cargar los datos del CSV');
            return;
        }

        // Initialize filter system
        dataFilters = new DataFilters();
        dataFilters.setData(data);

        // Initialize filter UI
        filterUI = new FilterUI(dataFilters, onFiltersChanged);

        // Render initial charts with all data for filters section
        renderFilterCharts(data);

        // Update data info display
        filterUI.updateDataInfo();

        // Initialize sonifications
        sonification = new AddictionSonification();
        mentalHealthSonification = new MentalHealthSonification();

        // Setup audio controls for both sonification charts
        setupAudioControls();
        setupMentalHealthAudioControls();

        // Render sonification charts and get data
        currentChartData = createAdiccionConflictosChart(data);
        mentalHealthChartData = createMentalHealthChart(data);

        // Update sonifications with chart data
        if (sonification && currentChartData) {
            sonification.setData(currentChartData);
        }

        if (mentalHealthSonification && mentalHealthChartData) {
            mentalHealthSonification.setData(mentalHealthChartData);
        }

        // Setup click listeners on sonification chart points
        setupChartClickListeners();
        setupMentalHealthChartClickListeners();

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

function onFiltersChanged(filteredData) {
    renderFilterCharts(filteredData);
}

function renderFilterCharts(data) {
    // Clear existing charts
    Plotly.purge('chartPorcentajeImpacto');
    Plotly.purge('chart-promedio');

    // Render charts with filtered data
    createPorcentajeImpactoChart(data);
    createPromedioSueñoChart(data);
}

// Sonification controls for Addiction-Conflicts chart
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

function setupChartClickListeners() {
    const chartDiv = document.getElementById('chart-adiccion-conflictos');

    if (!chartDiv) return;

    // Add click event listener to the chart
    chartDiv.on('plotly_click', async (data) => {
        if (!currentChartData || currentChartData.length === 0) {
            console.warn('No hay datos disponibles');
            return;
        }

        // Get the point index that was clicked
        const pointIndex = data.points[0].pointIndex;

        // Play sonification for this single point
        if (sonification && pointIndex !== undefined) {
            const statusDiv = document.getElementById('audio-status');
            const point = currentChartData[pointIndex];

            statusDiv.textContent = `🎵 Adicción: ${point.addiction} | Conflictos: ${point.avgConflicts.toFixed(2)}`;

            await sonification.playSinglePoint(pointIndex);

            // Reset status after a delay
            setTimeout(() => {
                if (!sonification.isPlaying) {
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

// Sonification controls for Mental Health chart
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
