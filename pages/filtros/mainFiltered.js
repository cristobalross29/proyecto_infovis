import { loadCSVData } from '../../dataLoader.js';
import { createPromedioSueñoChart } from './grafico_promedio_sueño.js';
import { createPorcentajeImpactoChart } from './grafico_porcentaje_impacto.js';
import { DataFilters, FilterUI } from './filters.js';

let dataFilters;
let filterUI;

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

        // Render initial charts with all data
        renderCharts(data);

        // Update data info display
        filterUI.updateDataInfo();

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

function onFiltersChanged(filteredData) {
    renderCharts(filteredData);
}

function renderCharts(data) {
    // Clear existing charts
    Plotly.purge('chartPorcentajeImpacto');
    Plotly.purge('chart-promedio');

    // Render charts with filtered data
    createPorcentajeImpactoChart(data);
    createPromedioSueñoChart(data);
}

document.addEventListener('DOMContentLoaded', initializeApplication);