export function createPorcentajeImpactoChart(data) {
    const MAX_HOURS = 7;
    const MINUTES_INTERVAL = 0.5;

    const groupedData = {};

    data.forEach(entry => {
        const usageHours = parseFloat(entry.Avg_Daily_Usage_Hours);
        const affectsAcademic = entry.Affects_Academic_Performance;

        if (isValidEntry(usageHours, affectsAcademic)) {
            const roundedHours = Math.round(usageHours * 2) / 2;

            if (!groupedData[roundedHours]) {
                groupedData[roundedHours] = { Yes: 0, No: 0 };
            }
            groupedData[roundedHours][affectsAcademic]++;
        }
    });

    function isValidEntry(hours, affects) {
        return !isNaN(hours) && (affects === 'Yes' || affects === 'No');
    }

    const sortedHours = Object.keys(groupedData)
        .map(h => parseFloat(h))
        .filter(h => h <= MAX_HOURS)
        .sort((a, b) => a - b);

    const percentageAffected = sortedHours.map(hour => {
        const total = groupedData[hour].Yes + groupedData[hour].No;
        return total > 0 ? (groupedData[hour].Yes / total) * 100 : 0;
    });

    const traceAreaSuperior = createAreaTrace({
        x: sortedHours,
        y: percentageAffected,
        fill: 'tonexty',
        fillcolor: 'rgba(70, 130, 180, 0.6)',
        name: 'No afectados'
    });

    const traceAreaInferior = createAreaTrace({
        x: sortedHours,
        y: percentageAffected,
        fill: 'tozeroy',
        fillcolor: 'rgba(220, 20, 60, 0.6)',
        name: 'Afectados'
    });

    const traceLine = createLineTrace({
        x: sortedHours,
        y: percentageAffected,
        color: 'black',
        width: 3,
        name: '% Afectado académicamente'
    });

    function createAreaTrace({ x, y, fill, fillcolor, name }) {
        return {
            x, y, fill, fillcolor, name,
            type: 'scatter',
            mode: 'none',
            hoverinfo: 'skip'
        };
    }

    function createLineTrace({ x, y, color, width, name }) {
        return {
            x, y, name,
            mode: 'lines',
            type: 'scatter',
            line: { color, width },
            hovertemplate: '%{y:.1f}% afectados<extra></extra>'
        };
    }

    const layout = {
        title: {
            text: 'Impacto de las redes sociales en el rendimiento académico',
            font: {
                size: 41,
                family: 'Times New Roman, serif',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Horas de Uso Diario de Redes Sociales',
                font: {
                    size: 27,
                    family: 'Times New Roman, serif'
                }
            },
            dtick: 1,
            showgrid: false,
            range: [0, null],
            tickfont: {
                size: 22,
                family: 'Times New Roman, serif'
            }
        },
        yaxis: {
            title: {
                text: '% estudiantes afectados negativamente',
                font: {
                    size: 27,
                    family: 'Times New Roman, serif'
                }
            },
            range: [0, 105],
            dtick: 10,
            showgrid: false,
            tickfont: {
                size: 22,
                family: 'Times New Roman, serif'
            }
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

    Plotly.newPlot('chartPorcentajeImpacto', [traceAreaSuperior, traceAreaInferior, traceLine], layout);
}