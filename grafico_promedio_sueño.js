export function createPromedioSueñoChart(data) {
    // Filter valid data
    const validData = data
        .filter(d => d.Avg_Daily_Usage_Hours && d.Sleep_Hours_Per_Night)
        .map(d => ({
            usage: parseFloat(d.Avg_Daily_Usage_Hours),
            sleep: parseFloat(d.Sleep_Hours_Per_Night)
        }))
        .filter(d => !isNaN(d.usage) && !isNaN(d.sleep));
    
    // Group by usage hours (rounded to 30 min) and calculate average sleep hours
    const groupedData = {};
    validData.forEach(d => {
        const usageHour = Math.round(d.usage * 2) / 2;
        if (!groupedData[usageHour]) {
            groupedData[usageHour] = [];
        }
        groupedData[usageHour].push(d.sleep);
    });

    // Calculate averages for each usage hour (limit to 7 hours)
    const averageData = Object.keys(groupedData)
        .map(usageHour => ({
            usage: parseFloat(usageHour),
            avgSleep: groupedData[usageHour].reduce((sum, sleep) => sum + sleep, 0) / groupedData[usageHour].length
        }))
        .filter(d => d.usage <= 7)
        .sort((a, b) => a.usage - b.usage);
    
    const trace = {
        x: averageData.map(d => d.usage),
        y: averageData.map(d => d.avgSleep),
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: 'rgba(55, 128, 191, 1.0)',
            width: 3
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
    
    const layout = {
        title: '2. Más horas de redes sociales, menos horas de sueño',
        xaxis: {
            title: 'Horas de Uso Diario de Redes Sociales',
            dtick: 0.5
        },
        yaxis: {
            title: 'Promedio de Horas de Sueño por Noche'
        }
    };
    
    Plotly.newPlot('chart-promedio', [trace], layout);
}