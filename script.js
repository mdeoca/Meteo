document.addEventListener('DOMContentLoaded', function() {
    const csvFilePath = 'datos.csv';

    const textColor = 'rgba(224, 224, 224, 0.9)';
    const gridColor = 'rgba(128, 128, 128, 0.3)';
    const tickColor = 'rgba(224, 224, 224, 0.7)';

    const iaq76Color = 'rgb(0, 128, 0)';
    const iaq77Color = 'rgb(128, 0, 0)';

    const gas76Color = 'rgb(255, 205, 86)';
    const gas77Color = 'rgb(75, 0, 130)';

    // Plugin para mostrar el último valor al final de la línea
    const lastValuePlugin = {
        id: 'lastValueLabel',
        afterDatasetsDraw(chart, args, options) {
            const { ctx } = chart;
            ctx.save();
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (!meta.hidden && meta.data.length > 0) {
                    const lastPoint = meta.data[meta.data.length - 1];
                    const value = dataset.data[dataset.data.length - 1];
                    ctx.font = '11px sans-serif';
                    ctx.fillStyle = dataset.borderColor;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(value.toFixed(1), lastPoint.x + 6, lastPoint.y);
                }
            });
            ctx.restore();
        }
    };

    Chart.register(ChartZoom, lastValuePlugin);

    const charts = [];

    async function loadAndDrawCharts() {
        try {
            const response = await fetch(csvFilePath);
            if (!response.ok) {
                console.error(`Error HTTP! status: ${response.status} - ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

            const labels = data.map(row => {
                const dateParts = row[0].split('-'); 
                const year = dateParts[0].substring(2); 
                const month = dateParts[1];
                const day = dateParts[2];
                const time = row[1]; 
                return `${year}-${month}-${day} ${time.substring(0, 5)}`; 
            });

            const temp76Data = data.map(row => parseFloat(row[2]));
            const temp77Data = data.map(row => parseFloat(row[7]));
            const hum76Data = data.map(row => parseFloat(row[3]));
            const hum77Data = data.map(row => parseFloat(row[8]));
            const pres76Data = data.map(row => parseFloat(row[4]));
            const pres77Data = data.map(row => parseFloat(row[9]));
            const gas76Data = data.map(row => parseFloat(row[5]));
            const gas77Data = data.map(row => parseFloat(row[10]));
            const iaq76Data = data.map(row => parseFloat(row[6]));
            const iaq77Data = data.map(row => parseFloat(row[11]));

            function getDarkChartOptions(yAxisTitle) {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 5,
                            bottom: 5,
                            left: 5,
                            right: 5
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: textColor,
                                padding: 8
                            }
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy',
                            },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                drag: { enabled: false },
                                mode: 'xy',
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Fecha y Hora',
                                color: textColor,
                            },
                            grid: { color: gridColor },
                            ticks: {
                                color: tickColor,
                                maxRotation: 90,
                                minRotation: 90
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: yAxisTitle,
                                color: textColor
                            },
                            grid: { color: gridColor },
                            ticks: { color: tickColor },
                            beginAtZero: false 
                        }
                    }
                };
            }

            function toggleFullscreen(chart, canvasElement) {
                const wrapperElement = canvasElement.parentElement;
                if (chart._isFullscreen) {
                    wrapperElement.classList.remove('chart-fullscreen-active');
                    chart._isFullscreen = false;
                } else {
                    wrapperElement.classList.add('chart-fullscreen-active');
                    chart._isFullscreen = true;
                }
                setTimeout(() => {
                    chart.resize(); 
                }, 50);
            }

            function createChart(canvasId, dataset1, dataset2, yAxisTitle, label1, label2, color1, color2) {
                const canvasElement = document.getElementById(canvasId);
                const chartInstance = new Chart(canvasElement, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { 
                                label: label1, 
                                data: dataset1, 
                                borderColor: color1, 
                                borderWidth: 1,
                                pointRadius: 0,
                                tension: 0.3, 
                                fill: false 
                            },
                            { 
                                label: label2, 
                                data: dataset2, 
                                borderColor: color2, 
                                borderWidth: 1,
                                pointRadius: 0,
                                tension: 0.3, 
                                fill: false 
                            }
                        ]
                    },
                    options: getDarkChartOptions(
