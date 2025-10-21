import { getResponsiveFontSizes, updateChartResponsiveness } from '../../responsiveUtils.js';

export function createMentalHealthChart(data) {
    // Procesar datos: agrupar por horas de uso y calcular promedio de salud mental
    function processDataByUsageHours(rawData) {
        const hourlyData = {};

        rawData.forEach(entry => {
            const hours = parseFloat(entry.Avg_Daily_Usage_Hours);
            const mentalHealthScore = parseInt(entry.Mental_Health_Score);

            if (!isNaN(hours) && !isNaN(mentalHealthScore)) {
                // Redondear a 0.5 horas para agrupar mejor
                const roundedHours = Math.round(hours * 2) / 2;

                if (!hourlyData[roundedHours]) {
                    hourlyData[roundedHours] = {
                        scores: [],
                        count: 0
                    };
                }

                hourlyData[roundedHours].scores.push(mentalHealthScore);
                hourlyData[roundedHours].count++;
            }
        });

        // Calcular promedios
        const processedData = [];
        Object.keys(hourlyData)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(hours => {
                const scores = hourlyData[hours].scores;
                const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

                processedData.push({
                    hours: hours,
                    avgMentalHealth: avgScore,
                    count: hourlyData[hours].count
                });
            });

        return processedData;
    }

    const processedData = processDataByUsageHours(data);

    // Extraer arrays para el gráfico
    const hours = processedData.map(d => d.hours);
    const mentalHealthScores = processedData.map(d => d.avgMentalHealth);
    const counts = processedData.map(d => d.count);

    // Crear colores degradados del verde (salud alta) al rojo (salud baja)
    const colors = mentalHealthScores.map(score => {
        // Normalizar score (asumiendo rango típico 1-10)
        const normalized = (score - 1) / 9;

        // Verde (alta salud) a Rojo (baja salud)
        const red = Math.round(255 * (1 - normalized));
        const green = Math.round(255 * normalized);

        return `rgb(${red}, ${green}, 50)`;
    });

    const trace = {
        x: hours,
        y: mentalHealthScores,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Salud Mental',
        line: {
            color: 'rgba(150, 50, 200, 0.8)',
            width: 4,
            shape: 'spline'
        },
        marker: {
            size: 10,
            color: colors,
            line: {
                color: 'white',
                width: 2
            },
            symbol: 'circle'
        },
        hovertemplate: '<b>Horas de uso:</b> %{x:.1f}h<br>' +
                       '<b>Salud Mental (promedio):</b> %{y:.2f}<br>' +
                       '<b>Usuarios:</b> %{text}<extra></extra>',
        text: counts
    };

    // Get responsive font sizes
    const fontSizes = getResponsiveFontSizes('chart-mental-health');

    const layout = {
        title: {
            text: 'Salud Mental vs. Horas de Uso Diario',
            font: {
                size: fontSizes.title,
                family: 'Arial, sans-serif',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Horas de Uso Diario (promedio)',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial, sans-serif'
                }
            },
            showgrid: false,
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
                text: 'Puntaje de Salud Mental (1-10)',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial, sans-serif'
                }
            },
            range: [1, 10],
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial, sans-serif'
            }
        },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
        autosize: true,
        margin: { l: 100, r: 80, t: 150, b: 100 },
        hovermode: 'closest',
        annotations: [
            {
                x: hours[0],
                y: mentalHealthScores[0],
                text: '✓ Salud óptima',
                showarrow: true,
                arrowhead: 2,
                arrowcolor: 'green',
                ax: 40,
                ay: -40,
                font: {
                    size: fontSizes.annotation,
                    color: 'green',
                    family: 'Arial, sans-serif',
                    weight: 'bold'
                },
                bgcolor: 'rgba(200, 255, 200, 0.8)',
                borderpad: 4
            },
            {
                x: hours[hours.length - 1],
                y: mentalHealthScores[mentalHealthScores.length - 1],
                text: '⚠ Deterioro significativo',
                showarrow: true,
                arrowhead: 2,
                arrowcolor: 'red',
                ax: -40,
                ay: -40,
                font: {
                    size: fontSizes.annotation,
                    color: 'red',
                    family: 'Arial, sans-serif',
                    weight: 'bold'
                },
                bgcolor: 'rgba(255, 200, 200, 0.8)',
                borderpad: 4
            }
        ]
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('chart-mental-health', [trace], layout, config);

    // Setup responsive font updates
    updateChartResponsiveness('chart-mental-health', document.getElementById('chart-mental-health'));

    // Return processed data for sonification
    return processedData;
}
