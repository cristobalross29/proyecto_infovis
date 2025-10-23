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

    // Calcular porcentaje de disminución desde el inicio hasta las 8 horas (o el último punto disponible)
    const baselineMentalHealth = mentalHealthScores[0];
    const lastIndex = hours.length - 1;
    const finalMentalHealth = mentalHealthScores[lastIndex];
    const finalHours = hours[lastIndex];
    const percentageDecrease = Math.round(((baselineMentalHealth - finalMentalHealth) / baselineMentalHealth) * 100);

    const trace = {
        x: hours,
        y: mentalHealthScores,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Salud Mental',
        line: {
            color: 'rgba(55, 128, 191, 1.0)',
            width: 3
        },
        marker: {
            size: 8,
            color: 'rgba(55, 128, 191, 0.8)',
            line: {
                color: 'rgba(55, 128, 191, 1.0)',
                width: 2
            }
        },
        hovertemplate: '<b>Horas de uso:</b> %{x:.1f}h<br>' +
                       '<b>Salud Mental (promedio):</b> %{y:.2f}<extra></extra>'
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
                x: hours[lastIndex],
                y: mentalHealthScores[lastIndex],
                text: `La salud mental disminuye<br>un ${percentageDecrease}% a las ${finalHours.toFixed(1)} horas de uso`,
                showarrow: true,
                arrowhead: 2,
                ax: -80,
                ay: -50,
                font: {
                    size: fontSizes.annotation,
                    color: 'black',
                    family: 'Arial, sans-serif'
                },
                bgcolor: 'white',
                bordercolor: 'black',
                borderwidth: 1,
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
