import { getResponsiveFontSizes, updateChartResponsiveness } from '../../responsiveUtils.js';

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

    // Encontrar dinámicamente el punto donde comienza el impacto (primer porcentaje > 0)
    // La línea debe estar en el ÚLTIMO punto donde el porcentaje es 0
    let firstNonZeroX = null;
    let hasImpact = false;

    // Verificar si hay algún impacto
    const maxPercentage = Math.max(...percentageAffected);

    if (maxPercentage > 0) {
        hasImpact = true;
        for (let i = 0; i < percentageAffected.length; i++) {
            if (percentageAffected[i] > 0) {
                // Si encontramos el primer valor > 0, la línea va en el punto ANTERIOR
                if (i > 0) {
                    firstNonZeroX = sortedHours[i - 1];
                } else {
                    // Si el primer punto ya tiene valor > 0, la línea va en 0
                    firstNonZeroX = 0;
                }
                break;
            }
        }
    }

    console.log('hasImpact:', hasImpact, 'firstNonZeroX:', firstNonZeroX, 'maxPercentage:', maxPercentage);

    // Asegurarse de que comienza en 0
    const xVals = [0, ...sortedHours]; // Incluir 0 en las horas
    const yVals = [0, ...percentageAffected]; // Empezar en 0% para el gráfico

    // Crear la traza de fondo azul (cubre toda el área del gráfico)
    const traceBackground = createAreaTrace({
        x: [0, Math.max(...xVals)],
        y: [100, 100],
        fill: 'tozeroy',
        fillcolor: 'rgba(70, 130, 180, 0.6)', // Azul de fondo
        name: 'No Afectados'
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
        name: '% Afectado académicamente',
        showlegend: false
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
    function createLineTrace({ x, y, color, width, name, showlegend = true }) {
        return {
            x, y, name,
            mode: 'lines',
            type: 'scatter',
            line: { color, width },
            hovertemplate: '%{y:.1f}% afectados<extra></extra>',
            showlegend
        };
    }

    // Encontrar el punto donde el porcentaje llega al 100%
    const hundredPercentIndex = yVals.findIndex(y => y >= 100);
    const hundredPercentX = hundredPercentIndex !== -1 ? xVals[hundredPercentIndex] : null;

    // Línea vertical donde comienza el impacto (solo si hay impacto y firstNonZeroX > 0)
    const verticalLineStart = hasImpact && firstNonZeroX !== null && firstNonZeroX > 0 ? {
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
        hoverinfo: 'skip',
        showlegend: false
    } : null;

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
        hoverinfo: 'skip',
        showlegend: false
    } : null;

    // Get responsive font sizes
    const fontSizes = getResponsiveFontSizes('chartPorcentajeImpacto');

    // Configuración del layout
    const layout = {
        title: {
            text: 'Impacto autoreportado del uso de redes sociales en el rendimiento académico',
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
            range: [0, null],
            tickfont: {
                size: fontSizes.tick,
                family: 'Arial'
            }
        },
        yaxis: {
            title: {
                text: '% estudiantes afectados negativamente',
                font: {
                    size: fontSizes.axisTitle,
                    family: 'Arial'
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
                size: fontSizes.tick,
                family: 'Arial'
            }
        },
        showlegend: true,
        legend: {
            x: 0.02,
            y: 0.98,
            xanchor: 'left',
            yanchor: 'top',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: 'black',
            borderwidth: 1,
            font: {
                size: fontSizes.axisTitle,
                family: 'Arial'
            }
        },
        autosize: true,
        margin: { l: 150, r: 80, t: 180, b: 120 },
        annotations: [
            // Mensaje para el punto donde nadie está afectado (dinámico) - solo si hay impacto y firstNonZeroX > 0
            ...(hasImpact && firstNonZeroX !== null && firstNonZeroX > 0 ? [{
                x: firstNonZeroX - 0.2,
                y: 50,
                text: `Nadie afectado <br> hasta ${firstNonZeroX.toFixed(1)} hrs de uso`,
                showarrow: true,
                arrowhead: 2,
                ax: -120,
                ay: 0,
                font: {
                    size: fontSizes.annotation,
                    color: "black",
                    family: "Arial"
                },
                bgcolor: "rgba(255, 255, 255, 1)",
                bordercolor: "black",
                borderwidth: 1,
                borderpad: 4
            }] : []),
            // Mensaje para el punto donde todos están afectados (dinámico)
            ...(hundredPercentX ? [{
                x: hundredPercentX,
                y: 50,
                text: `Todos afectados <br> desde ${hundredPercentX.toFixed(1)} hrs de uso`,
                showarrow: true,
                arrowhead: 2,
                ax: 120,
                ay: 0,
                font: {
                    size: fontSizes.annotation,
                    color: "black",
                    family: "Arial"
                },
                bgcolor: "rgba(255, 255, 255, 1)",
                bordercolor: "black",
                borderwidth: 1,
                borderpad: 4
            }] : []),
            // Mensaje "Sin datos" si no hay datos
            ...(sortedHours.length === 0 ? [{
                x: 3.5,
                y: 50,
                text: "Sin datos",
                showarrow: false,
                font: {
                    size: fontSizes.annotationLarge,
                    color: "black",
                    family: "Arial"
                }
            }] : [])
        ]
    };

    // Se actualiza el gráfico con las nuevas trazas (fondo azul, área roja de afectados, línea y líneas verticales)
    const traces = [traceBackground, traceAreaAfectados, traceLine];
    if (verticalLineStart) traces.push(verticalLineStart);
    if (verticalLineEnd) traces.push(verticalLineEnd);

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('chartPorcentajeImpacto', traces, layout, config);

    // Setup responsive font updates
    updateChartResponsiveness('chartPorcentajeImpacto', document.getElementById('chartPorcentajeImpacto'));
}