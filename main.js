// Function to load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('DataSetSocialMedia.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(row);
            }
        }
        return data;
    } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
    }
}

// Chart 1: Avg_Daily_Usage_Hours vs Sleep_Hours_Per_Night
function createChart1(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Sleep_Hours_Per_Night)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(55, 128, 191, 0.7)',
            size: 8,
            line: {
                color: 'rgba(55, 128, 191, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Horas de Sueño por Noche',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Horas de Sueño por Noche'
        }
    };
    
    Plotly.newPlot('chart1', [trace], layout);
}

// Chart 2: Avg_Daily_Usage_Hours vs Affects_Academic_Performance
function createChart2(data) {
    const yesData = data.filter(d => d.Affects_Academic_Performance === 'Yes');
    const noData = data.filter(d => d.Affects_Academic_Performance === 'No');
    
    const trace1 = {
        x: yesData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(yesData.length).fill('Sí'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(219, 64, 82, 0.7)',
            size: 10
        },
        name: 'Afecta Rendimiento'
    };
    
    const trace2 = {
        x: noData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(noData.length).fill('No'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(55, 128, 191, 0.7)',
            size: 10
        },
        name: 'No Afecta Rendimiento'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Afectación del Rendimiento Académico',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Afecta Rendimiento Académico'
        }
    };
    
    Plotly.newPlot('chart2', [trace1, trace2], layout);
}

// Chart 3: Avg_Daily_Usage_Hours vs Mental_Health_Score
function createChart3(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Mental_Health_Score)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(50, 171, 96, 0.7)',
            size: 8,
            line: {
                color: 'rgba(50, 171, 96, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Puntuación de Salud Mental',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Puntuación de Salud Mental'
        }
    };
    
    Plotly.newPlot('chart3', [trace], layout);
}

// Chart 4: Avg_Daily_Usage_Hours vs Relationship_Status
function createChart4(data) {
    const singleData = data.filter(d => d.Relationship_Status === 'Single');
    const relationshipData = data.filter(d => d.Relationship_Status === 'In Relationship');
    const complicatedData = data.filter(d => d.Relationship_Status === 'Complicated');
    
    const trace1 = {
        x: singleData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(singleData.length).fill('Soltero/a'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(128, 0, 128, 0.7)',
            size: 10
        },
        name: 'Soltero/a'
    };
    
    const trace2 = {
        x: relationshipData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(relationshipData.length).fill('En Relación'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(255, 127, 14, 0.7)',
            size: 10
        },
        name: 'En Relación'
    };
    
    const trace3 = {
        x: complicatedData.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val)),
        y: Array(complicatedData.length).fill('Complicado'),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(214, 39, 40, 0.7)',
            size: 10
        },
        name: 'Complicado'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Estado de Relación',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Estado de Relación'
        }
    };
    
    Plotly.newPlot('chart4', [trace1, trace2, trace3], layout);
}

// Chart 5: Avg_Daily_Usage_Hours vs Conflicts_Over_Social_Media
function createChart5(data) {
    const x = data.map(d => parseFloat(d.Avg_Daily_Usage_Hours)).filter(val => !isNaN(val));
    const y = data.map(d => parseFloat(d.Conflicts_Over_Social_Media)).filter(val => !isNaN(val));
    
    const trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'rgba(255, 65, 54, 0.7)',
            size: 8,
            line: {
                color: 'rgba(255, 65, 54, 1.0)',
                width: 1
            }
        },
        name: 'Datos'
    };
    
    const layout = {
        title: 'Horas de Uso Diario vs Conflictos por Redes Sociales',
        xaxis: {
            title: 'Horas de Uso Diario Promedio'
        },
        yaxis: {
            title: 'Conflictos por Redes Sociales'
        }
    };
    
    Plotly.newPlot('chart5', [trace], layout);
}

// Initialize all charts when the page loads
async function init() {
    const data = await loadCSVData();
    if (data.length > 0) {
        createChart1(data);
        createChart2(data);
        createChart3(data);
        createChart4(data);
        createChart5(data);
    } else {
        console.error('No data loaded');
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);