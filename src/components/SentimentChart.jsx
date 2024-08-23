import React from 'react';
import { Bar, Pie, Scatter, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const SentimentChart = ({ sentimentResults }) => {
    // Calculate sentiment counts
    const sentimentCounts = sentimentResults.reduce((acc, message) => {
        acc[message.sentiment] = (acc[message.sentiment] || 0) + 1;
        return acc;
    }, {});

    // Data for the Bar chart
    const barData = {
        labels: Object.keys(sentimentCounts),
        datasets: [
            {
                label: 'Sentiment Distribution',
                data: Object.values(sentimentCounts),
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Data for the Pie chart
    const pieData = {
        labels: Object.keys(sentimentCounts),
        datasets: [
            {
                label: 'Sentiment Distribution',
                data: Object.values(sentimentCounts),
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Data for the Scatter plot
    const scatterData = {
        datasets: [
            {
                label: 'Sentiment Scatter',
                data: sentimentResults.map((message, index) => ({
                    x: index,
                    y: message.sentiment === 'Positive' ? 1 : message.sentiment === 'Negative' ? -1 : 0,
                })),
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 5,
            },
        ],
    };

    // Data for the Floating Bar chart
    const floatingBarData = {
        labels: Object.keys(sentimentCounts),
        datasets: [
            {
                label: 'Sentiment Distribution',
                data: Object.values(sentimentCounts),
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
                barPercentage: 0.5,
            },
        ],
    };

    // Data for the Line chart
    const lineData = {
        labels: sentimentResults.map((_, index) => index + 1),
        datasets: [
            {
                label: 'Sentiment Over Time',
                data: sentimentResults.map((message) =>
                    message.sentiment === 'Positive' ? 1 : message.sentiment === 'Negative' ? -1 : 0
                ),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Options for the charts
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sentiment Analysis',
            },
        },
    };

    return (
        <div className="chartContainer">
            <h3>Bar Chart</h3>
            <Bar data={barData} options={options} />

            <h3>Pie Chart</h3>
            <Pie data={pieData} options={options} />

            <h3>Scatter Plot</h3>
            <Scatter data={scatterData} options={options} />

            <h3>Floating Bar Chart</h3>
            <Bar data={floatingBarData} options={options} />

            <h3>Line Chart</h3>
            <Line data={lineData} options={options} />
        </div>
    );
};

export default SentimentChart;
