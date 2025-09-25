// Utility functions for responsive chart text sizing

export function getResponsiveFontSizes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return getDefaultFontSizes();

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Base font sizes for a reference container width of 800px
    const baseWidth = 800;
    const scaleFactor = Math.min(containerWidth / baseWidth, 1.5); // Cap max scaling

    return {
        title: Math.max(11, Math.round(21 * scaleFactor)),
        axisTitle: Math.max(8, Math.round(15.4 * scaleFactor)),
        tick: Math.max(7, Math.round(11.9 * scaleFactor)),
        annotation: Math.max(6, Math.round(10.5 * scaleFactor)),
        annotationLarge: Math.max(13, Math.round(24.5 * scaleFactor))
    };
}

function getDefaultFontSizes() {
    return {
        title: 21,
        axisTitle: 15.4,
        tick: 11.9,
        annotation: 10.5,
        annotationLarge: 24.5
    };
}

// Function to update chart layout with responsive fonts
export function updateChartResponsiveness(containerId, plotlyDiv) {
    const resizeObserver = new ResizeObserver(() => {
        if (plotlyDiv && plotlyDiv.data && plotlyDiv.layout) {
            const fontSizes = getResponsiveFontSizes(containerId);
            const updatedLayout = updateLayoutFontSizes(plotlyDiv.layout, fontSizes);
            Plotly.relayout(plotlyDiv, updatedLayout);
        }
    });

    const container = document.getElementById(containerId);
    if (container) {
        resizeObserver.observe(container);
    }

    return resizeObserver;
}

function updateLayoutFontSizes(layout, fontSizes) {
    return {
        'title.font.size': fontSizes.title,
        'xaxis.title.font.size': fontSizes.axisTitle,
        'xaxis.tickfont.size': fontSizes.tick,
        'yaxis.title.font.size': fontSizes.axisTitle,
        'yaxis.tickfont.size': fontSizes.tick,
        'annotations': layout.annotations ? layout.annotations.map(annotation => ({
            ...annotation,
            font: {
                ...annotation.font,
                size: annotation.font.size > 25 ? fontSizes.annotationLarge : fontSizes.annotation
            }
        })) : []
    };
}