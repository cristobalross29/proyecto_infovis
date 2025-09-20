export function createPromedioSueñoChart(data) {
    // Filter valid data
    const validData = data
        .filter(d => d.Avg_Daily_Usage_Hours && d.Sleep_Hours_Per_Night)
        .map(d => ({
            usage: parseFloat(d.Avg_Daily_Usage_Hours),
            sleep: parseFloat(d.Sleep_Hours_Per_Night)
        }))
        .filter(d => !isNaN(d.usage) && !isNaN(d.sleep));
    
    // Group by usage hours (rounded) and calculate average sleep hours
    const groupedData = {};
    validData.forEach(d => {
        const usageHour = Math.round(d.usage);
        if (!groupedData[usageHour]) {
            groupedData[usageHour] = [];
        }
        groupedData[usageHour].push(d.sleep);
    });
    
    // Calculate averages for each usage hour
    const averageData = Object.keys(groupedData)
        .map(usageHour => ({
            usage: parseInt(usageHour),
            avgSleep: groupedData[usageHour].reduce((sum, sleep) => sum + sleep, 0) / groupedData[usageHour].length
        }))
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
        title: 'Promedio de Horas de Sueño por Horas de Uso Diario',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Promedio de Horas de Sueño por Noche'
        }
    };
    
    Plotly.newPlot('chart-promedio', [trace], layout);
}