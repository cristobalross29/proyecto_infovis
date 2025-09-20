export function createChart4(data) {
    const singleData = data.filter(d => d.Relationship_Status === 'Single');
    const relationshipData = data.filter(d => d.Relationship_Status === 'In Relationship');
    const complicatedData = data.filter(d => d.Relationship_Status === 'Complicated');
    
    const trace1 = {
        x: singleData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(singleData.length).fill('Soltero/a'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(128, 0, 128, 0.7)',
            size: 10
        },
        name: 'Soltero/a'
    };
    
    const trace2 = {
        x: relationshipData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(relationshipData.length).fill('En Relación'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(255, 127, 14, 0.7)',
            size: 10
        },
        name: 'En Relación'
    };
    
    const trace3 = {
        x: complicatedData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(complicatedData.length).fill('Complicado'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(214, 39, 40, 0.7)',
            size: 10
        },
        name: 'Complicado'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Estado de Relación',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Estado de Relación'
        }
    };
    
    Plotly.newPlot('chart4', [trace1, trace2, trace3], layout);
}