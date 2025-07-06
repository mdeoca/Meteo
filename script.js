document.addEventListener('DOMContentLoaded', function() {
    const csvFilePath = 'datos.csv';

    const textColor = 'rgba(224, 224, 224, 0.9)';
    const gridColor = 'rgba(128, 128, 128, 0.3)';
    const tickColor = 'rgba(224, 224, 224, 0.7)';

    const iaq76Color = 'rgb(0, 128, 0)';
    const iaq77Color = 'rgb(128, 0, 0)';

    const gas76Color = 'rgb(255, 205, 86)';
    const gas77Color = 'rgb(75, 0, 130)';

    Chart.register(ChartZoom);

    const charts = []; // Array para almacenar las instancias de los gráficos

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
                return `${year}-${month}-${day} ${time}`;
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
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor
                            }
                        },
                        zoom: {
                            pan: {
                                enabled: true, // Pan habilitado
                                mode: 'xy',   // Permite arrastrar en ambos ejes
                                // El modifierKey se omite, ya que funciona sin él
                                // modifierKey: 'alt', // Puedes descomentar si prefieres tenerlo para el pan
                            },
                            zoom: {
                                wheel: {
                                    enabled: true, // Zoom con rueda habilitado
                                },
                                pinch: {
                                    enabled: true // Zoom con pellizco táctil habilitado
                                },
                                drag: { 
                                    enabled: false, // Arrastre para zoom deshabilitado (ya que prefieres pan directo)
                                },
                                mode: 'xy', // Permite zoom en ambos ejes (x e y)
                            },
                            // *** ELIMINAMOS onDoubleClick DE AQUÍ ***
                            // onDoubleClick: function({chart}) {
                            //     console.log('Doble clic detectado en el gráfico, restableciendo zoom.');
                            //     chart.resetZoom();
                            // }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Fecha y Hora',
                                color: textColor
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

            // --- Dibujar Gráficos Combinados ---
            // Los gráficos se crean de la misma manera

            const tempChart = new Chart(document.getElementById('tempChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Temperatura Sensor 76 (°C)', data: temp76Data, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.3, fill: false },
                        { label: 'Temperatura Sensor 77 (°C)', data: temp77Data, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.3, fill: false }
                    ]
                },
                options: getDarkChartOptions('Temperatura (°C)')
            });
            charts.push(tempChart); // Asegúrate de agregarlo al array

            // *** Añadir el event listener de doble clic directamente al canvas ***
            document.getElementById('tempChart').addEventListener('dblclick', function() {
                console.log('¡Doble clic directo en tempChart detectado! Restableciendo zoom.');
                tempChart.resetZoom();
            });


            const humChart = new Chart(document.getElementById('humChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Humedad Sensor 76 (%)', data: hum76Data, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.3, fill: false },
                        { label: 'Humedad Sensor 77 (%)', data: hum77Data, borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.2)', tension: 0.3, fill: false }
                    ]
                },
                options: getDarkChartOptions('Humedad (%)')
            });
            charts.push(humChart);
            document.getElementById('humChart').addEventListener('dblclick', function() {
                console.log('¡Doble clic directo en humChart detectado! Restableciendo zoom.');
                humChart.resetZoom();
            });


            const presChart = new Chart(document.getElementById('presChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Presión Sensor 76 (hPa)', data: pres76Data, borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.2)', tension: 0.3, fill: false },
                        { label: 'Presión Sensor 77 (hPa)', data: pres77Data, borderColor: 'rgb(201, 203, 207)', backgroundColor: 'rgba(201, 203, 207, 0.2)', tension: 0.3, fill: false }
                    ]
                },
                options: getDarkChartOptions('Presión (hPa)')
            });
            charts.push(presChart);
            document.getElementById('presChart').addEventListener('dblclick', function() {
                console.log('¡Doble clic directo en presChart detectado! Restableciendo zoom.');
                presChart.resetZoom();
            });
            
            const iaqChart = new Chart(document.getElementById('iaqChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'IAQ Sensor 76',
                            data: iaq76Data,
                            borderColor: iaq76Color,
                            backgroundColor: iaq76Color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'IAQ Sensor 77',
                            data: iaq77Data,
                            borderColor: iaq77Color,
                            backgroundColor: iaq77Color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('IAQ')
            });
            charts.push(iaqChart);
            document.getElementById('iaqChart').addEventListener('dblclick', function() {
                console.log('¡Doble clic directo en iaqChart detectado! Restableciendo zoom.');
                iaqChart.resetZoom();
            });

            const gasChart = new Chart(document.getElementById('gasChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Gas Sensor 76 (Ohmios)',
                            data: gas76Data,
                            borderColor: gas76Color,
                            backgroundColor: gas76Color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Gas Sensor 77 (Ohmios)',
                            data: gas77Data,
                            borderColor: gas77Color,
                            backgroundColor: gas77Color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('Resistencia al Gas (Ohmios)')
            });
            charts.push(gasChart);
            document.getElementById('gasChart').addEventListener('dblclick', function() {
                console.log('¡Doble clic directo en gasChart detectado! Restableciendo zoom.');
                gasChart.resetZoom();
            });
            
            // ELIMINAMOS EL EVENT LISTENER DEL BOTÓN
            // document.getElementById('resetAllCharts').addEventListener('click', function() {
            //     charts.forEach(chart => {
            //         chart.resetZoom();
            //     });
            // });

        } catch (error) {
            console.error('Error al cargar o procesar el CSV:', error);
            document.body.innerHTML = '<h1>Error al cargar los datos. Revisa la consola para más detalles.</h1>';
        }
    }

    loadAndDrawCharts();
});