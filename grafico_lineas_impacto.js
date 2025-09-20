export function createLineasImpactoChart(data) {
    // Group data by usage hours and academic impact
    const groupedData = {};
    
    data.forEach(d => {
        const usageHours = Math.round(parseFloat(d.Avg_Daily_Usage_Hours));
        const affectsAcademic = d.Affects_Academic_Performance;
        
        if (!isNaN(usageHours) && (affectsAcademic === 'Yes' || affectsAcademic === 'No')) {
            if (!groupedData[usageHours]) {
                groupedData[usageHours] = { Yes: 0, No: 0 };
            }
            groupedData[usageHours][affectsAcademic]++;
        }
    });
    
    // Sort hours and create arrays for the lines
    const sortedHours = Object.keys(groupedData).map(h => parseInt(h)).sort((a, b) => a - b);
    const affectsCount = sortedHours.map(hour => groupedData[hour].Yes);
    const notAffectsCount = sortedHours.map(hour => groupedData[hour].No);
    
    // Trace for people affected (red line)
    const traceAffected = {
        x: sortedHours,
        y: affectsCount,
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: 'red',
            width: 3
        },
        marker: {
            color: 'red',
            size: 8
        },
        name: 'Afecta en estudios'
    };
    
    // Trace for people not affected (blue line)
    const traceNotAffected = {
        x: sortedHours,
        y: notAffectsCount,
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: 'blue',
            width: 3
        },
        marker: {
            color: 'blue',
            size: 8
        },
        name: 'No afecta en estudios'
    };
    
    const layout = {
        title: 'Impacto Académico por Horas de Uso de Redes Sociales',
        xaxis: {
            title: 'Horas de Uso Diario',
            dtick: 1
        },
        yaxis: {
            title: 'Cantidad de Personas'
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: 'rgba(0,0,0,0.2)',
            borderwidth: 1
        }
    };
    
    Plotly.newPlot('chartLineasImpacto', [traceAffected, traceNotAffected], layout);
}