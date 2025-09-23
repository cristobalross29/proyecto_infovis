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

    // Area superior (azul) - desde la línea hasta arriba
    const traceAreaSuperior = {
        x: sortedHours,
        y: percentageAffected,
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        fillcolor: 'rgba(70, 130, 180, 0.6)',
        name: 'No afectados',
        hoverinfo: 'skip'
    };

    // Area inferior (roja) - desde abajo hasta la línea
    const traceAreaInferior = {
        x: sortedHours,
        y: percentageAffected,
        fill: 'tozeroy',
        type: 'scatter',
        mode: 'none',
        fillcolor: 'rgba(220, 20, 60, 0.6)',
        name: 'Afectados',
        hoverinfo: 'skip'
    };

    // Línea negra separadora
    const traceLine = {
        x: sortedHours,
        y: percentageAffected,
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'black',
            width: 3
        },
        name: '% Afectado académicamente',
        hovertemplate: '%{y:.1f}% afectados<extra></extra>'
    };

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