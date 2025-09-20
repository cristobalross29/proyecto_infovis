export function createPorcentajeImpactoChart(data) {
    // Group data by usage hours and academic impact
    const groupedData = {};

    data.forEach(d => {
        const usageHours = parseFloat(d.Avg_Daily_Usage_Hours);
        const affectsAcademic = d.Affects_Academic_Performance;

        if (!isNaN(usageHours) && (affectsAcademic === 'Yes' || affectsAcademic === 'No')) {
            // Round to nearest 0.5 (30 minutes)
            const roundedHours = Math.round(usageHours * 2) / 2;
            if (!groupedData[roundedHours]) {
                groupedData[roundedHours] = { Yes: 0, No: 0 };
            }
            groupedData[roundedHours][affectsAcademic]++;
        }
    });

    // Sort hours and calculate percentages (limit to 7 hours)
    const sortedHours = Object.keys(groupedData).map(h => parseFloat(h)).filter(h => h <= 7).sort((a, b) => a - b);
    const percentageAffected = sortedHours.map(hour => {
        const total = groupedData[hour].Yes + groupedData[hour].No;
        return total > 0 ? (groupedData[hour].Yes / total) * 100 : 0;
    });

    // Trace for percentage affected (single red line)
    const tracePercentage = {
        x: sortedHours,
        y: percentageAffected,
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
        name: '% Afectado académicamente'
    };

    const layout = {
        title: '1. Porcentaje de estudiantes con problemas académicos por horas de uso',
        xaxis: {
            title: 'Horas de Uso Diario de Redes Sociales',
            dtick: 0.5
        },
        yaxis: {
            title: 'Porcentaje de Estudiantes Afectados (%)',
            range: [0, 105],
            dtick: 10
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

    Plotly.newPlot('chartPorcentajeImpacto', [tracePercentage], layout);
}