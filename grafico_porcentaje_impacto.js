export function createPorcentajeImpactoChart(data) {
    const MAX_HOURS = 7;
    const MINUTES_INTERVAL = 0.5;

    const groupedData = {};

    data.forEach(entry => {
        const usageHours = parseFloat(entry.Avg_Daily_Usage_Hours);
        const affectsAcademic = entry.Affects_Academic_Performance;

        if (isValidEntry(usageHours, affectsAcademic)) {
            const roundedHours = Math.round(usageHours * 2) / 2;

            if (!groupedData[roundedHours]) {
                groupedData[roundedHours] = { Yes: 0, No: 0 };
            }
            groupedData[roundedHours][affectsAcademic]++;
        }
    });

    function isValidEntry(hours, affects) {
        return !isNaN(hours) && (affects === 'Yes' || affects === 'No');
    }

    const sortedHours = Object.keys(groupedData)
        .map(h => parseFloat(h))
        .filter(h => h <= MAX_HOURS)
        .sort((a, b) => a - b);

    const percentageAffected = sortedHours.map(hour => {
        const total = groupedData[hour].Yes + groupedData[hour].No;
        return total > 0 ? (groupedData[hour].Yes / total) * 100 : 0;
    });

    // Asegurarse de que comienza en 0
    const xVals = [0, ...sortedHours]; // Incluir 0 en las horas
    const yVals = [percentageAffected[0], ...percentageAffected]; // Añadir el primer valor de percentageAffected

    // Crear la traza del área azul (para el lado izquierdo de la línea)
    const traceAreaIzquierda = createAreaTrace({
        x: xVals,
        y: yVals,
        fill: 'tozeroy',
        fillcolor: 'rgba(70, 130, 180, 0.6)', // Azul
        name: 'No afectados'
    });

    // Crear la traza del área roja (para el lado derecho de la línea)
    const traceAreaDerecha = createAreaTrace({
        x: xVals,
        y: yVals,
        fill: 'tonexty',
        fillcolor: 'rgba(220, 20, 60, 0.6)', // Rojo
        name: 'Afectados'
    });

    // Línea negra
    const traceLine = createLineTrace({
        x: xVals,
        y: yVals,
        color: 'black',
        width: 3,
        name: '% Afectado académicamente'
    });

    // Función para crear las trazas de área
    function createAreaTrace({ x, y, fill, fillcolor, name }) {
        return {
            x, y, fill, fillcolor, name,
            type: 'scatter',
            mode: 'none',
            hoverinfo: 'skip'
        };
    }

    // Función para crear la traza de línea
    function createLineTrace({ x, y, color, width, name }) {
        return {
            x, y, name,
            mode: 'lines',
            type: 'scatter',
            line: { color, width },
            hovertemplate: '%{y:.1f}% afectados<extra></extra>'
        };
    }

    // Configuración del layout
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
        },
        annotations: [
            // Mensaje para el punto donde nadie está afectado (antes de 2 horas)
            {
                x: 2.5,
                y: 0,
                text: "Nadie afectado antes de 2.5 horas",
                showarrow: true,
                arrowhead: 2,
                ax: 10,
                ay: -40,
                font: { size: 16,
                    color: "black",
                    family: "Arial"
                }
            },
            // Mensaje para el punto donde todos están afectados (a las 5.5 horas)
            {
                x: 5.5,  // Ajustamos la posición a la línea
                y: 100,
                text: "Todos afectados después de 5.5 horas",
                showarrow: true,
                arrowhead: 2,
                ax: 10,
                ay: -40,
                font: {
                    size: 16,
                    color: "black",
                    family: "Arial"
                }
            },
            // Mensaje sobre el crecimiento lineal entre esos valores
            {
                x: 4.3,  // Colocamos este mensaje entre 2.5 y 5.5 horas, más cerca de la línea
                y: 50,
                text: "Crecimiento lineal entre 2.5 y 5.5 horas",
                showarrow: true,
                arrowhead: 2,
                ax: 10,
                ay: -40,
                font: {
                    size: 16,
                    color: "black",
                    family: "Arial"
                }
            }
        ]
    };

    // Se actualiza el gráfico con las nuevas trazas (asegúrate de que se dibuja primero el lado izquierdo azul y luego el rojo)
    Plotly.newPlot('chartPorcentajeImpacto', [traceAreaIzquierda, traceAreaDerecha, traceLine], layout);
}