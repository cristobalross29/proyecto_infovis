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
    
    const layout = {
        title: {
            text: 'Impacto de las redes sociales en la calidad del sueño',
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
        }
    };
    
    Plotly.newPlot('chart-promedio', [trace], layout);
}