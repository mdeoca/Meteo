document.addEventListener('DOMContentLoaded', function() {
    const csvFilePath = '/home/mdeoca/TEMPE/bme688/Meteo/datos.csv';

    const textColor = 'rgba(224, 224, 224, 0.9)';
    const gridColor = 'rgba(128, 128, 128, 0.3)';
    const tickColor = 'rgba(224, 224, 224, 0.7)';

    const iaq76Color = 'rgb(0, 128, 0)';
    const iaq77Color = 'rgb(128, 0, 0)';

    const gas76Color = 'rgb(255, 205, 86)';
    const gas77Color = 'rgb(75, 0, 130)';

    Chart.register(ChartZoom);

    const charts = []; // Array para almacenar instancias de gráficos

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
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                drag: { 
                                    enabled: false,
                                },
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
                            grid: {
                                color: gridColor
                            },
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
                            grid: {
                                color: gridColor
                            },
                            ticks: {
                                color: tickColor
                            },
                            beginAtZero: false 
                        }
                    }
                };
            }

            // Función para alternar pantalla completa
            function toggleFullscreen(chart, canvasElement) {
                const wrapperElement = canvasElement.parentElement;
                
                if (wrapperElement.classList.contains('chart-fullscreen-active')) {
                    wrapperElement.classList.remove('chart-fullscreen-active');
                    chart._isFullscreen = false;
                    console.log('Saliendo de pantalla completa:', chart.id);
                } else {
                    wrapperElement.classList.add('chart-fullscreen-active');
                    chart._isFullscreen = true;
                    console.log('Entrando en pantalla completa:', chart.id);
                }

                setTimeout(() => {
                    chart.resize();
                }, 50);
            }

            // Función para crear gráficos
            function createChart(canvasId, dataset1, dataset2, yAxisTitle, label1, label2, color1, color2) {
                const canvasElement = document.getElementById(canvasId);
                const chartInstance = new Chart(canvasElement, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: label1, data: dataset1, borderColor: color1, backgroundColor: color1.replace('rgb', 'rgba').replace(')', ', 0.2)'), tension: 0.3, fill: false },
                            { label: label2, data: dataset2, borderColor: color2, backgroundColor: color2.replace('rgb', 'rgba').replace(')', ', 0.2)'), tension: 0.3, fill: false }
                        ]
                    },
                    options: getDarkChartOptions(yAxisTitle)
                });
                chartInstance._isFullscreen = false;

                // Doble clic para resetear zoom
                canvasElement.addEventListener('dblclick', function() {
                    chartInstance.resetZoom();
                });

                // Detección de doble clic en la rueda del mouse
                let middleClickCount = 0;
                let middleClickTimeout;

                canvasElement.addEventListener('mousedown', function(event) {
                    if (event.button === 1) { // Botón central (rueda)
                        event.preventDefault();
                        middleClickCount++;
                        
                        if (middleClickCount === 1) {
                            middleClickTimeout = setTimeout(() => {
                                middleClickCount = 0;
                            }, 300); // Tiempo para considerar doble clic
                        } else if (middleClickCount === 2) {
                            clearTimeout(middleClickTimeout);
                            middleClickCount = 0;
                            toggleFullscreen(chartInstance, canvasElement);
                        }
                    }
                });

                return chartInstance;
            }

            // Crear todos los gráficos
            charts.push(createChart('tempChart', temp76Data, temp77Data, 'Temperatura (°C)', 'Temperatura Sensor 76 (°C)', 'Temperatura Sensor 77 (°C)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)'));
            charts.push(createChart('humChart', hum76Data, hum77Data, 'Humedad (%)', 'Humedad Sensor 76 (%)', 'Humedad Sensor 77 (%)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)'));
            charts.push(createChart('presChart', pres76Data, pres77Data, 'Presión (hPa)', 'Presión Sensor 76 (hPa)', 'Presión Sensor 77 (hPa)', 'rgb(255, 159, 64)', 'rgb(201, 203, 207)'));
            charts.push(createChart('iaqChart', iaq76Data, iaq77Data, 'IAQ', 'IAQ Sensor 76', 'IAQ Sensor 77', iaq76Color, iaq77Color));
            charts.push(createChart('gasChart', gas76Data, gas77Data, 'Resistencia al Gas (Ohmios)', 'Gas Sensor 76 (Ohmios)', 'Gas Sensor 77 (Ohmios)', gas76Color, gas77Color));
            
        } catch (error) {
            console.error('Error al cargar o procesar el CSV:', error);
            document.body.innerHTML = '<h1>Error al cargar los datos. Revisa la consola para más detalles.</h1>';
        }
    }

    loadAndDrawCharts();
});
