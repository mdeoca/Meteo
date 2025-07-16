document.addEventListener('DOMContentLoaded', function() {
    // La ruta a tu archivo 'datos.csv' es la carpeta superior, confirmado por ti.
    const csvFilePath = 'datos.csv';

    const textColor = 'rgba(224, 224, 224, 0.9)';
    const gridColor = 'rgba(128, 128, 128, 0.3)';
    const tickColor = 'rgba(224, 224, 224, 0.7)';

    const iaq76Color = 'rgb(0, 128, 0)';
    const iaq77Color = 'rgb(128, 0, 0)';

    const gas76Color = 'rgb(255, 205, 86)';
    const gas77Color = 'rgb(75, 0, 130)';

    // **Estas dos líneas son CRUCIALES para que los plugins funcionen**
    // Asegúrate de que los scripts de estos plugins estén cargados en index.html ANTES de script.js
    Chart.register(ChartZoom);
    Chart.register(ChartDataLabels);

    const charts = []; // Array para almacenar las instancias de los gráficos

    async function loadAndDrawCharts() {
        try {
            const response = await fetch(csvFilePath);
            if (!response.ok) {
                console.error(`Error HTTP al cargar el CSV! status: ${response.status} - ${response.statusText}`);
                document.body.innerHTML = `<h1>Error: No se pudo cargar el archivo CSV. Estado: ${response.status} ${response.statusText}</h1><p>Asegúrate de que 'datos.csv' esté en la ubicación correcta (${csvFilePath}).</p>`;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            console.log("CSV Data fetched successfully. First 200 chars:", csvData.substring(0, 200) + "...");

            const lines = csvData.trim().split('\n');
            const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

            if (data.length === 0 || data.every(row => row.length === 0 || row.every(cell => cell === ''))) {
                console.error("CSV parsing resulted in no data rows after removing header or all rows are empty. Check CSV format.");
                document.body.innerHTML = '<h1>Error: No se encontraron filas de datos válidas en el archivo CSV.</h1><p>Verifica el contenido y formato del archivo.</p>';
                return;
            }

            const labels = data.map(row => {
                // Asegúrate de que las filas tengan suficientes elementos antes de acceder a ellos
                if (!row || row.length < 2) {
                    console.warn("Fila de CSV incompleta o vacía, saltando:", row);
                    return 'N/A'; // O un valor adecuado para filas inválidas
                }
                const dateParts = row[0].split('-');
                const year = dateParts[0].substring(2);
                const month = dateParts[1];
                const day = dateParts[2];
                const time = row[1];
                return `${year}-${month}-${day} ${time.substring(0, 5)}`;
            });

            // Extracción de datos para cada sensor, con manejo de valores nulos/vacíos
            const temp76Data = data.map(row => parseFloat(row[2] || '0'));
            const temp77Data = data.map(row => parseFloat(row[7] || '0'));
            const hum76Data = data.map(row => parseFloat(row[3] || '0'));
            const hum77Data = data.map(row => parseFloat(row[8] || '0'));
            const pres76Data = data.map(row => parseFloat(row[4] || '0'));
            const pres77Data = data.map(row => parseFloat(row[9] || '0'));
            const gas76Data = data.map(row => parseFloat(row[5] || '0'));
            const gas77Data = data.map(row => parseFloat(row[10] || '0'));
            const iaq76Data = data.map(row => parseFloat(row[6] || '0'));
            const iaq77Data = data.map(row => parseFloat(row[11] || '0'));

            function getDarkChartOptions(yAxisTitle) {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 1, // **Aumentado a 60px para dar más espacio arriba**
                            bottom: 1,
                            left: 10,
                            right: 1 // **Aumentado a 50px para dar más espacio a la derecha y que las etiquetas no se corten**
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'chartArea',
                            labels: {
                                color: textColor,
                                padding: 5 // **Reducido el padding de la leyenda a 5px para acercarla al título**
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
                        },
                        datalabels: {
                            display: function(context) {
                                return context.dataIndex === context.dataset.data.length - 90;
                            },
                            // **CRÍTICO: Combinación de align y offset para forzar separación y elevar**
                            align: function(context) {
                                // Para el primer dataset (Sensor 76), la etiqueta irá hacia arriba.
                                // Para el segundo dataset (Sensor 77), la etiqueta irá hacia abajo.
                                return context.datasetIndex === 0 ? 'end' : 'start';
                            },
                            anchor: 'end', // Ancla la etiqueta en el extremo del punto (arriba)

                            offset: function(context) {
                                if (context.datasetIndex === 0) { // Primer dataset (e.g., Sensor 76)
                                    return -60; // **Mover 20px hacia arriba desde el punto**
                                } else { // Segundo dataset (e.g., Sensor 77)
                                    return 60; // **Mover 20px hacia abajo desde el punto**
                                }
                            },

                            clamp: false,   // Asegura que la etiqueta no se salga del área del gráfico

                            formatter: function(value, context) {
                                return parseFloat(value).toFixed(2);
                            },
                            color: 'white',
                            font: {
                                weight: 'bold',
                                size: 12
                            },
                            padding: { 
                                top: 1,
                                bottom: 1,
                                left: 3,
                                right: 5
                            },
                            borderRadius: 4,
                            backgroundColor: function(context) {
                                return context.dataset.borderColor;
                            },
                            clip: true // Permite que la etiqueta se dibuje fuera del área de datos si es necesario
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
                const wrapperElement = canvasElement.closest('.chart-container'); // Buscar el contenedor padre

                if (chart._isFullscreen) {
                    wrapperElement.classList.remove('chart-fullscreen-active');
                    chart._isFullscreen = false;
                    console.log('Saliendo de pantalla completa para:', chart.id);
                } else {
                    wrapperElement.classList.add('chart-fullscreen-active');
                    chart._isFullscreen = true;
                    console.log('Entrando a pantalla completa para:', chart.id);
                }

                // Pequeño retardo para asegurar que el DOM se actualice antes de redimensionar
                setTimeout(() => {
                    if (chart) chart.resize(); 
                }, 50);
            }


            // --- Helper para crear y configurar gráficos ---
            function createChart(canvasId, dataset1, dataset2, yAxisTitle, label1, label2, color1, color2) {
                const canvasElement = document.getElementById(canvasId);
                if (!canvasElement) {
                    console.error(`Elemento canvas con ID '${canvasId}' no encontrado. No se puede crear el gráfico.`);
                    return null;
                }

                // Destruir el gráfico existente si lo hay para evitar duplicados en recargas
                const existingChart = Chart.getChart(canvasId);
                if (existingChart) {
                    existingChart.destroy();
                }

                const chartInstance = new Chart(canvasElement, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { 
                                label: label1, 
                                data: dataset1, 
                                borderColor: color1, 
                                backgroundColor: color1.replace('rgb', 'rgba').replace(')', ', 0.2)'), 
                                tension: 0.3, 
                                fill: false,
                                borderWidth: 1, 
                                pointRadius: 0 
                            },
                            { 
                                label: label2, 
                                data: dataset2, 
                                borderColor: color2, 
                                backgroundColor: color2.replace('rgb', 'rgba').replace(')', ', 0.2)'), 
                                tension: 0.3, 
                                fill: false,
                                borderWidth: 1, 
                                pointRadius: 0 
                            }
                        ]
                    },
                    options: getDarkChartOptions(yAxisTitle)
                });
                chartInstance._isFullscreen = false;

                // Evento doble clic para resetear el zoom
                canvasElement.addEventListener('dblclick', function() {
                    console.log(`Doble clic detectado en ${canvasId}! Restableciendo zoom.`);
                    if (chartInstance) chartInstance.resetZoom();
                });

                // Evento clic central (rueda) para pantalla completa
                canvasElement.addEventListener('mousedown', function(event) {
                    if (event.button === 1) { // 1 es el botón central (rueda)
                        event.preventDefault(); // Evita el desplazamiento con el botón central
                        toggleFullscreen(chartInstance, canvasElement);
                    }
                });
                return chartInstance;
            }

            // --- Creación de todos los gráficos usando la función helper ---
            const tempChart = createChart('tempChart', temp76Data, temp77Data, 'Temperatura (°C)', 'Temperatura Sensor 76 (°C)', 'Temperatura Sensor 77 (°C)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)');
            if (tempChart) charts.push(tempChart);

            const humChart = createChart('humChart', hum76Data, hum77Data, 'Humedad (%)', 'Humedad Sensor 76 (%)', 'Humedad Sensor 77 (%)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)');
            if (humChart) charts.push(humChart);

            const presChart = createChart('presChart', pres76Data, pres77Data, 'Presión (hPa)', 'Presión Sensor 76 (hPa)', 'Presión Sensor 77 (hPa)', 'rgb(255, 159, 64)', 'rgb(201, 203, 207)');
            if (presChart) charts.push(presChart);

            const iaqChart = createChart('iaqChart', iaq76Data, iaq77Data, 'IAQ', 'IAQ Sensor 76', 'IAQ Sensor 77', iaq76Color, iaq77Color);
            if (iaqChart) charts.push(iaqChart);

            const gasChart = createChart('gasChart', gas76Data, gas77Data, 'Resistencia al Gas (Ohmios)', 'Gas Sensor 76 (Ohmios)', 'Gas Sensor 77 (Ohmios)', gas76Color, gas77Color);
            if (gasChart) charts.push(gasChart);

            console.log("Charts initialized:", charts.length);

        } catch (error) {
            console.error('Error general en loadAndDrawCharts:', error);
            if (!document.body.innerHTML.includes('Error: No se pudo cargar el archivo CSV')) {
                document.body.innerHTML = '<h1>Error al cargar los gráficos. Por favor, revisa la consola para más detalles.</h1>';
            }
        }
    }

    loadAndDrawCharts();
});
