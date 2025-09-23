import { loadCSVData } from './dataLoader.js';
import { createPromedioSueñoChart } from './grafico_promedio_sueño.js';
import { createPorcentajeImpactoChart } from './grafico_porcentaje_impacto.js';

async function initializeApplication() {
    try {
        const data = await loadCSVData();

        if (data.length === 0) {
            console.error('No se pudieron cargar los datos del CSV');
            return;
        }

        createPorcentajeImpactoChart(data);
        createPromedioSueñoChart(data);

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApplication);