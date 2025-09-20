import { loadCSVData } from './dataLoader.js';
import { createPromedioSueñoChart } from './grafico_promedio_sueño.js';
import { createPorcentajeImpactoChart } from './grafico_porcentaje_impacto.js';

// Initialize all charts when the page loads
async function init() {
    const data = await loadCSVData();
    if (data.length > 0) {
        createPorcentajeImpactoChart(data);
        createPromedioSueñoChart(data);
    } else {
        console.error('No data loaded');
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);