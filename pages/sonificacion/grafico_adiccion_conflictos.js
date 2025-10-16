import { getResponsiveFontSizes, updateChartResponsiveness } from '../../responsiveUtils.js';

export function createAdiccionConflictosChart(data) {
    // Group data by addiction score and count conflicts
    const processedData = processDataByAddiction(data);

    function processDataByAddiction(rawData) {
        const grouped = {};

        rawData.forEach(entry => {
            const addiction = parseInt(entry.Addicted_Score);
            const conflicts = parseInt(entry.Conflicts_Over_Social_Media);

            if (!isNaN(addiction) && !isNaN(conflicts)) {
                if (!grouped[addiction]) {
                    grouped[addiction] = [];
                }
                grouped[addiction].push(conflicts);
            }
        });

        // Calculate average conflicts per addiction level
        const result = [];
        Object.keys(grouped).forEach(addiction => {
            const avgConflicts = grouped[addiction].reduce((sum, val) => sum + val, 0) / grouped[addiction].length;
            result.push({
                addiction: parseInt(addiction),
                avgConflicts: avgConflicts,
                count: grouped[addiction].length
            });
        });

        return result.sort((a, b) => a.addiction - b.addiction);
    }

    // Create scatter plot trace
    const trace = {
        x: processedData.map(d => d.addiction),
        y: processedData.map(d => d.avgConflicts),
        mode: 'markers+lines',
        type: 'scatter',
        marker: {
            size: processedData.map(d => Math.sqrt(d.count) * 8),
            color: processedData.map(d => d.addiction),
            colorscale: [
                [0, 'rgba(100, 200, 100, 0.7)'],      // Verde (baja adicción)
                [0.5, 'rgba(255, 200, 0, 0.7)'],      // Amarillo
                [1, 'rgba(220, 20, 60, 0.7)']         // Rojo (alta adicción)
            ],
            showscale: true,
            colorbar: {
                title: 'Nivel de<br>Adicción',
                thickness: 15,
                len: 0.7
            },
            line: {
                color: 'rgba(0, 0, 0, 0.5)',
                width: 2
            }
        },
        line: {
            color: 'rgba(100, 100, 100, 0.4)',
            width: 2,
            shape: 'spline'
        },
        text: processedData.map(d => `${d.count} estudiantes`),
        hovertemplate: '<b>Adicción:</b> %{x}<br>' +
                       '<b>Conflictos promedio:</b> %{y:.2f}<br>' +
                       '<b>Estudiantes:</b> %{text}<extra></extra>'
    };

    // Get responsive font sizes
    const fontSizes = getResponsiveFontSizes('chart-adiccion-conflictos');

    const layout = {
        title: {
            text: 'Relación entre Adicción a Redes Sociales y Conflictos Interpersonales',
            font: {
                size: fontSizes.title,
                family: 'Arial, sans-serif',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Nivel de Adicción (Score)',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial, sans-serif'
                }
            },
            range: [1, 10],
            dtick: 1,
            showgrid: true,
            gridcolor: 'rgba(200, 200, 200, 0.3)',
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial, sans-serif'
            }
        },
        yaxis: {
            title: {
                text: 'Promedio de Conflictos por Redes Sociales',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial, sans-serif'
                }
            },
            range: [0, 5.5],
            dtick: 1,
            showgrid: true,
            gridcolor: 'rgba(200, 200, 200, 0.3)',
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial, sans-serif'
            }
        },
        annotations: [
            {
                x: 3,
                y: 1.5,
                text: 'Zona de baja adicción<br>Pocos conflictos',
                showarrow: true,
                arrowhead: 2,
                ax: -80,
                ay: -40,
                font: {
                    size: fontSizes.annotation,
                    color: 'green',
                    family: 'Arial, sans-serif'
                },
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                bordercolor: 'green',
                borderwidth: 1
            },
            {
                x: 8.5,
                y: 4,
                text: 'Alta adicción<br>Muchos conflictos',
                showarrow: true,
                arrowhead: 2,
                ax: 60,
                ay: 30,
                font: {
                    size: fontSizes.annotation,
                    color: 'crimson',
                    family: 'Arial, sans-serif'
                },
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                bordercolor: 'crimson',
                borderwidth: 1
            }
        ],
        autosize: true,
        margin: { l: 150, r: 100, t: 180, b: 120 }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('chart-adiccion-conflictos', [trace], layout, config);

    // Setup responsive font updates
    updateChartResponsiveness('chart-adiccion-conflictos', document.getElementById('chart-adiccion-conflictos'));

    // Return processed data for sonification
    return processedData;
}
