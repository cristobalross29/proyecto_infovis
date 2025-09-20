export function createChart1(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Sleep_Hours_Per_Night)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(55, 128, 191, 0.7)',
            size: 8,
            line: {
                color: 'rgba(55, 128, 191, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Horas de Sueño por Noche',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Horas de Sueño por Noche'
        }
    };
    
    Plotly.newPlot('chart1', [trace], layout);
}