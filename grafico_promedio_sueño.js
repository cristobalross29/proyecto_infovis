export function createPromedioSueñoChart(data) {
    const MAX_HOURS = 7;

    const validData = filterValidData(data);
    const groupedData = groupDataByUsageHours(validData);
    const averageData = calculateAverages(groupedData);

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

    // Calculate percentage decrease from baseline to 7 hours
    const baselineSleep = averageData.length > 0 ? averageData[0].avgSleep : 8;
    const sevenHourData = averageData.find(d => d.usage === 7);
    const sevenHourSleep = sevenHourData ? sevenHourData.avgSleep : null;
    const percentageDecrease = sevenHourSleep ? Math.round(((baselineSleep - sevenHourSleep) / baselineSleep) * 100) : 0;
    
    const layout = {
        title: {
            text: 'Impacto de las redes sociales en las horas de sueño',
            font: {
                size: 37,
                family: 'Arial, sans-serif',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Horas de Uso Diario',
                font: {
                    size: 27,
                    family: 'Arial, sans-serif'
                }
            },
            dtick: 1,
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            range: [0, null],
            tickfont: {
                size: 22,
                family: 'Arial, sans-serif'
            }
        },
        yaxis: {
            title: {
                text: 'Promedio de Horas de Sueño por Noche',
                font: {
                    size: 27,
                    family: 'Arial, sans-serif'
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
                size: 22,
                family: 'Arial, sans-serif'
            }
        },
        shapes: [{
            type: 'line',
            x0: 4,
            x1: 4,
            y0: 0,
            y1: 10,
            line: {
                color: 'red',
                width: 2,
                dash: 'dash'
            }
        }],
        annotations: [{
            x: 4.1,
            y: 4.5,
            text: 'A partir de 4h<br> se nota una caída<br> en las horas de sueño',
            showarrow: true,
            arrowhead: 2,
            ax: 130,
            ay: 0,
            font: {
                size: 20,
                color: 'black',
                family: 'Arial'
            },
            // bgcolor: 'rgba(255, 255, 255, 0.9)',
            // bordercolor: 'red',
            // borderwidth: 1
        }, 
        {
            x: 6.98,
            y: sevenHourSleep - 0.1,
            text: `A las 7hrs se registra<br>una disminución del<br>${percentageDecrease}% en las hrs de sueño`,
            showarrow: true,
            arrowhead: 2,
            ax: -100,
            ay: 90,
            font: {
                size: 18,
                color: 'black',
                family: 'Arial'
            },
            // bgcolor: 'rgba(255, 255, 255, 0.9)',
            // bordercolor: 'black',
            // borderwidth: 1
        }]
    };
    
    Plotly.newPlot('chart-promedio', [trace], layout);
}