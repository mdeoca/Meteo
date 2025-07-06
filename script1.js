document.addEventListener('DOMContentLoaded', function() {
    const csvFilePath = 'datos.csv'; // O 'datos.csv'

    // Definimos colores para el modo oscuro para reutilizar
    const textColor = 'rgba(224, 224, 224, 0.9)'; // Color de texto principal (claro)
    const gridColor = 'rgba(128, 128, 128, 0.3)'; // Color de la cuadrícula (gris tenue)
    const tickColor = 'rgba(224, 224, 224, 0.7)'; // Color de las etiquetas de los ejes (un poco más tenue que el texto principal)

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

            // --- CAMBIO AQUÍ: Formato de Fecha y Hora ---
            // Asumimos que la Fecha está en row[0] (AAAA-MM-DD) y la Hora en row[1] (HH:MM:SS)
            // Queremos YY-MM-DD HH-MM-SS
            const labels = data.map(row => {
                const dateParts = row[0].split('-'); // Divide AAAA-MM-DD
                const year = dateParts[0].substring(2); // Obtiene solo YY
                const month = dateParts[1];
                const day = dateParts[2];
                const time = row[1]; // HH:MM:SS ya está en el formato deseado

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

            // --- CAMBIO AQUÍ: Función auxiliar para opciones comunes de modo oscuro y rotación ---
            function getDarkChartOptions(yAxisTitle) {
                return {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor
                            }
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
                                maxRotation: 90,   // Permitir rotación máxima de 90 grados (vertical)
                                minRotation: 90    // Forzar rotación de 90 grados
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

            // Gráfico de Temperaturas
            new Chart(document.getElementById('tempChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperatura Sensor 76 (°C)',
                            data: temp76Data,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Temperatura Sensor 77 (°C)',
                            data: temp77Data,
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('Temperatura (°C)')
            });

            // Gráfico de Humedades
            new Chart(document.getElementById('humChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Humedad Sensor 76 (%)',
                            data: hum76Data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Humedad Sensor 77 (%)',
                            data: hum77Data,
                            borderColor: 'rgb(153, 102, 255)',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('Humedad (%)')
            });

            // Gráfico de Presiones
            new Chart(document.getElementById('presChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Presión Sensor 76 (hPa)',
                            data: pres76Data,
                            borderColor: 'rgb(255, 159, 64)',
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Presión Sensor 77 (hPa)',
                            data: pres77Data,
                            borderColor: 'rgb(201, 203, 207)',
                            backgroundColor: 'rgba(201, 203, 207, 0.2)',
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('Presión (hPa)')
            });
            
            // Gráfico: IAQ (Índice de Calidad del Aire)
            new Chart(document.getElementById('iaqChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'IAQ Sensor 76',
                            data: iaq76Data,
                            borderColor: 'rgb(0, 128, 0)',
                            backgroundColor: 'rgba(255, 205, 86, 0.2)',
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'IAQ Sensor 77',
                            data: iaq77Data,
                            borderColor: 'rgb(128, 0, 0)',
                            backgroundColor: 'rgba(75, 0, 130, 0.2)',
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('IAQ')
            });

            // Gráfico: Resistencia al Gas
            new Chart(document.getElementById('gasChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Gas Sensor 76 (Ohmios)',
                            data: gas76Data,
                            borderColor: 'rgb(255, 205, 86)',
                            backgroundColor: 'rgba(0, 128, 0, 0.2)',
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Gas Sensor 77 (Ohmios)',
                            data: gas77Data,
                            borderColor: 'rgb(75, 0, 130)',
                            backgroundColor: 'rgba(128, 0, 0, 0.2)',
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: getDarkChartOptions('Resistencia al Gas (Ohmios)')
            });

        } catch (error) {
            console.error('Error al cargar o procesar el CSV:', error);
            document.body.innerHTML = '<h1>Error al cargar los datos. Revisa la consola para más detalles.</h1>';
        }
    }

    loadAndDrawCharts();
});
