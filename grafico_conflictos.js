export function createChart5(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Conflicts_Over_Social_Media)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(255, 65, 54, 0.7)',
            size: 8,
            line: {
                color: 'rgba(255, 65, 54, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Conflictos por Redes Sociales',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Conflictos por Redes Sociales'
        }
    };
    
    Plotly.newPlot('chart5', [trace], layout);
}