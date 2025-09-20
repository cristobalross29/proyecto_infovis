export function createChart2(data) {
    const yesData = data.filter(d => d.Affects_Academic_Performance === 'Yes');
    const noData = data.filter(d => d.Affects_Academic_Performance === 'No');
    
    const trace1 = {
        x: yesData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(yesData.length).fill('Sí'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(219, 64, 82, 0.7)',
            size: 10
        },
        name: 'Afecta Rendimiento'
    };
    
    const trace2 = {
        x: noData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(noData.length).fill('No'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(55, 128, 191, 0.7)',
            size: 10
        },
        name: 'No Afecta Rendimiento'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Afectación del Rendimiento Académico',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Afecta Rendimiento Académico'
        }
    };
    
    Plotly.newPlot('chart2', [trace1, trace2], layout);
}