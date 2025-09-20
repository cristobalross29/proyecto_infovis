export function createChart3(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Mental_Health_Score)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(50, 171, 96, 0.7)',
            size: 8,
            line: {
                color: 'rgba(50, 171, 96, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: '3. Más horas de redes sociales = Peor salud mental',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Puntuación de Salud Mental'
        }
    };
    
    Plotly.newPlot('chart3', [trace], layout);
}