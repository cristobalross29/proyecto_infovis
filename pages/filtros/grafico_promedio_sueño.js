import { getResponsiveFontSizes, updateChartResponsiveness } from '../../responsiveUtils.js';

export function createPromedioSueñoChart(data) {
    const MAX_HOURS = 7;
    const MIN_HOURS = 0;

    const validData = filterValidData(data);
    const groupedData = groupDataByUsageHours(validData);
    const averageData = calculateAverages(groupedData);
    const { minUsage, maxUsage } = findDataRange(averageData);

    function filterValidData(rawData) {
        return rawData
            .filter(entry => entry.Avg_Daily_Usage_Hours && entry.Sleep_Hours_Per_Night)
            .map(entry => ({
                usage: parseFloat(entry.Avg_Daily_Usage_Hours),
                sleep: parseFloat(entry.Sleep_Hours_Per_Night)
            }))
            .filter(entry => !isNaN(entry.usage) && !isNaN(entry.sleep));
    }

    function groupDataByUsageHours(data) {
        const grouped = {};
        data.forEach(entry => {
            const usageHour = Math.round(entry.usage * 2) / 2;
            if (!grouped[usageHour]) {
                grouped[usageHour] = [];
            }
            grouped[usageHour].push(entry.sleep);
        });
        return grouped;
    }

    function calculateAverages(grouped) {
        return Object.keys(grouped)
            .map(usageHour => ({
                usage: parseFloat(usageHour),
                avgSleep: calculateAverage(grouped[usageHour])
            }))
            .filter(entry => entry.usage <= MAX_HOURS)
            .sort((a, b) => a.usage - b.usage);
    }

    function calculateAverage(sleepHours) {
        return sleepHours.reduce((sum, sleep) => sum + sleep, 0) / sleepHours.length;
    }

    function findDataRange(data) {
        if (data.length === 0) {
            return { minUsage: MIN_HOURS, maxUsage: MAX_HOURS };
        }
        return {
            minUsage: Math.min(...data.map(d => d.usage)),
            maxUsage: Math.max(...data.map(d => d.usage))
        };
    }

    const trace = createSleepTrace(averageData);

    function createSleepTrace(data) {
        return {
            x: data.map(d => d.usage),
            y: data.map(d => d.avgSleep),
            mode: 'lines',
            type: 'scatter',
            line: {
                color: 'rgba(55, 128, 191, 1.0)',
                width: 6
            },
            marker: {
                color: 'rgba(55, 128, 191, 0.8)',
                size: 8,
                line: {
                    color: 'rgba(55, 128, 191, 1.0)',
                    width: 2
                }
            },
            name: 'Promedio de Horas de Sueño'
        };
    }

    // Calculate percentage decrease from baseline to maximum usage hour with data
    const baselineSleep = averageData.length > 0 ? averageData[0].avgSleep : 8;
    const lastHourData = averageData.length > 0 ? averageData[averageData.length - 1] : null;
    const lastHourUsage = lastHourData ? lastHourData.usage : null;
    const lastHourSleep = lastHourData ? lastHourData.avgSleep : null;
    const percentageDecrease = lastHourSleep ? Math.round(((baselineSleep - lastHourSleep) / baselineSleep) * 100) : 0;

    // Encontrar dinámicamente el punto donde comienza la mayor caída en el sueño
    let maxDecreasePoint = 4; // valor por defecto
    let maxDecrease = 0;

    for (let i = 1; i < averageData.length; i++) {
        const decrease = averageData[i-1].avgSleep - averageData[i].avgSleep;
        if (decrease > maxDecrease) {
            maxDecrease = decrease;
            maxDecreasePoint = averageData[i].usage;
        }
    }

    // Get responsive font sizes
    const fontSizes = getResponsiveFontSizes('chart-promedio');

    const layout = {
        title: {
            text: 'Impacto de las redes sociales en las horas de sueño',
            font: {
                size: fontSizes.title,
                family: 'Arial',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Horas de Uso Diario',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial'
                }
            },
            dtick: 1,
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            range: [0, 7.5],
            fixedrange: true,
            tickmode: 'linear',
            tick0: 0,
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial'
            }
        },
        yaxis: {
            title: {
                text: 'Promedio de Horas de Sueño por Noche',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial'
                }
            },
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            range: [0, 10],
            dtick: 1,
            ticklen: 8,
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial'
            }
        },
        shapes: [
            // Área gris al inicio si no hay datos desde 0
            ...(minUsage > MIN_HOURS ? [{
                type: 'rect',
                x0: MIN_HOURS,
                x1: minUsage,
                y0: 0,
                y1: 10,
                fillcolor: 'rgba(200, 200, 200, 0.3)',
                line: {
                    width: 0
                },
                layer: 'below'
            }] : []),
            // Área gris al final si no hay datos hasta 7
            ...(maxUsage < MAX_HOURS ? [{
                type: 'rect',
                x0: maxUsage,
                x1: MAX_HOURS,
                y0: 0,
                y1: 10,
                fillcolor: 'rgba(200, 200, 200, 0.3)',
                line: {
                    width: 0
                },
                layer: 'below'
            }] : []),
            // Línea roja vertical
            {
                type: 'line',
                x0: maxDecreasePoint,
                x1: maxDecreasePoint,
                y0: 0,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dash'
                }
            }
        ],
        annotations: [
            // Texto "Sin Datos" al inicio si no hay datos desde 0
            ...(minUsage > MIN_HOURS ? [{
                x: (MIN_HOURS + minUsage) / 2,
                y: 5,
                text: 'Sin Datos',
                textangle: -90,
                showarrow: false,
                font: {
                    size: fontSizes.title * 1.6,
                    color: 'rgba(100, 100, 100, 0.8)',
                    family: 'Arial'
                }
            }] : []),
            // Texto "Sin Datos" al final si no hay datos hasta 7
            ...(maxUsage < MAX_HOURS ? [{
                x: (maxUsage + MAX_HOURS) / 2,
                y: 5,
                text: 'Sin Datos',
                textangle: -90,
                showarrow: false,
                font: {
                    size: fontSizes.title * 1.6,
                    color: 'rgba(100, 100, 100, 0.8)',
                    family: 'Arial'
                }
            }] : []),
            {
                x: maxDecreasePoint + 0.1,
                y: 1.8,
                text: `A partir de ${maxDecreasePoint.toFixed(1)} hrs<br> se nota una caída<br> en las horas de sueño`,
                showarrow: true,
                arrowhead: 2,
                ax: 120,
                ay: 0,
                font: {
                    size: fontSizes.annotation,
                    color: 'black',
                    family: 'Arial'
                },
                bgcolor: "rgba(255, 255, 255, 1)",
                bordercolor: "black",
                borderwidth: 1,
                borderpad: 4
            },
            ...(lastHourSleep ? [{
                x: lastHourUsage - 0.02,
                y: lastHourSleep + 1,
                text: `A las ${lastHourUsage.toFixed(1)} hrs se registra<br>una disminución del<br>${percentageDecrease}% en las hrs de sueño`,
                showarrow: true,
                arrowhead: 2,
                ax: -12,
                ay: -100,
                font: {
                    size: fontSizes.annotation,
                    color: 'black',
                    family: 'Arial'
                },
                bgcolor: "rgba(255, 255, 255, 1)",
                bordercolor: "black",
                borderwidth: 1,
                borderpad: 4
            }] : [])
        ],
        autosize: true,
        margin: { l: 150, r: 80, t: 180, b: 120 }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('chart-promedio', [trace], layout, config);

    // Setup responsive font updates
    updateChartResponsiveness('chart-promedio', document.getElementById('chart-promedio'));
}
