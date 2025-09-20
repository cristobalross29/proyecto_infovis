import { loadCSVData } from './dataLoader.js';
import { createChart1 } from './grafico_horassueño.js';
import { createChart2 } from './grafico_rendimientoacademico.js';
import { createChart3 } from './grafico_saludmental.js';
import { createChart4 } from './grafico_estadorelacion.js';
import { createChart5 } from './grafico_conflictos.js';
import { createPromedioSueñoChart } from './grafico_promedio_sueño.js';
import { createLineasImpactoChart } from './grafico_lineas_impacto.js';

// Initialize all charts when the page loads
async function init() {
    const data = await loadCSVData();
    if (data.length > 0) {
        createPromedioSueñoChart(data);
        createLineasImpactoChart(data);
        //createChart3(data);
        //createChart4(data);
        //createChart5(data);
        //createChart1(data);
        //createChart2(data);
    } else {
        console.error('No data loaded');
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);