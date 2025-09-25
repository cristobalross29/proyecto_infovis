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

    // Crear la traza de fondo azul (cubre toda el área del gráfico)
    const traceBackground = createAreaTrace({
        x: [0, Math.max(...xVals)],
        y: [100, 100],
        fill: 'tozeroy',
        fillcolor: 'rgba(70, 130, 180, 0.6)', // Azul de fondo
        name: 'Fondo'
    });

    // Crear la traza del área roja (afectados)
    const traceAreaAfectados = createAreaTrace({
        x: xVals,
        y: yVals,
        fill: 'tozeroy',
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

    // Línea vertical fija en x=2.5 para marcar el punto de 0%
    const firstNonZeroX = 2.5;

    // Encontrar el punto donde el porcentaje llega al 100%
    const hundredPercentIndex = yVals.findIndex(y => y >= 100);
    const hundredPercentX = hundredPercentIndex !== -1 ? xVals[hundredPercentIndex] : null;

    // Línea vertical donde comienza el impacto (en x=2.5)
    const verticalLineStart = {
        x: [firstNonZeroX, firstNonZeroX],
        y: [0, 105],
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'white',
            width: 2,
            dash: 'dash'
        },
        name: 'Inicio del impacto',
        hoverinfo: 'skip'
    };

    // Línea vertical donde llega al 100%
    const verticalLineEnd = hundredPercentX ? {
        x: [hundredPercentX, hundredPercentX],
        y: [0, 105],
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'white',
            width: 2,
            dash: 'dash'
        },
        name: 'Impacto total',
        hoverinfo: 'skip'
    } : null;

    // Configuración del layout
    const layout = {
        title: {
            text: 'Impacto autoreportado del uso de redes sociales en el rendimiento académico',
            font: {
                size: 30,
                family: 'Arial, sans-serif',
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: {
                text: 'Horas de Uso Diario',
                font: {
                    size: 22,
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
                size: 17,
                family: 'Arial, sans-serif'
            }
        },
        yaxis: {
            title: {
                text: '% estudiantes afectados negativamente',
                font: {
                    size: 22,
                    family: 'Arial, sans-serif'
                }
            },
            range: [0, 105],
            dtick: 10,
            showgrid: false,
            showline: true,
            linewidth: 2,
            linecolor: 'black',
            ticklen: 8,
            tickfont: {
                size: 17,
                family: 'Arial, sans-serif'
            }
        },
        showlegend: false,
        autosize: true,
        margin: { l: 150, r: 80, t: 180, b: 120 },
        annotations: [
            // Mensaje para el punto donde nadie está afectado (antes de 2 horas)
            {
                x: 2.3,
                y: 80,
                text: "Nadie afectado <br> hasta 2.5hrs de uso",
                showarrow: true,
                arrowhead: 26,
                ax: -150,
                ay: -0,
                font: {
                    size: 15,
                    color: "black",
                    family: "Arial, sans-serif"
                }
            },
            // Mensaje para el punto donde todos están afectados (a las 5.5 horas)
            {
                x: 5.6,  // Ajustamos la posición a la línea
                y: 80,
                text: "Todos afectados <br> desde 5.5 hrs de uso",
                showarrow: true,
                arrowhead: 2,
                ax: 120,
                ay: 0,
                font: {
                    size: 15,
                    color: "black",
                    family: "Arial, sans-serif"
                }
            },
            // Etiqueta "No Afectados" en el área azul
            {
                x: 1.5,
                y: 50,
                text: "No Afectados",
                showarrow: false,
                font: {
                    size: 35,
                    color: "white",
                    family: "Arial, sans-serif"
                }
            },
            // Etiqueta "Afectados" en el área roja
            {
                x: 6.3,
                y: 50,
                text: "Afectados",
                showarrow: false,
                font: {
                    size: 35,
                    color: "white",
                    family: "Arial, sans-serif"
                }
            }
        ]
    };

    // Se actualiza el gráfico con las nuevas trazas (fondo azul, área roja de afectados, línea y líneas verticales)
    const traces = [traceBackground, traceAreaAfectados, traceLine];
    traces.push(verticalLineStart);
    if (verticalLineEnd) traces.push(verticalLineEnd);

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('chartPorcentajeImpacto', traces, layout, config);
}