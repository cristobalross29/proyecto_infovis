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
    
    // Sort hours and create arrays for the lines (limit to 7 hours)
    const sortedHours = Object.keys(groupedData).map(h => parseInt(h)).filter(h => h <= 7).sort((a, b) => a - b);
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
        name: 'Afecta rendimiento académico'
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
        name: 'No afecta rendimiento académico'
    };
    
    const layout = {
        title: '1. Más horas de redes sociales = Más estudiantes con problemas académicos',
        xaxis: {
            title: 'Horas de Uso Diario de Redes Sociales',
            dtick: 1
        },
        yaxis: {
            title: 'Cantidad de Personas'
        },
        showlegend: true,
        legend: {
            x: 0.1,
            y: 1,
            xanchor: 'left',
            yanchor: 'top',
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: 'rgba(0,0,0,0.2)',
            borderwidth: 1
        }
    };
    
    Plotly.newPlot('chartLineasImpacto', [traceAffected, traceNotAffected], layout);
}