import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto'; 
import 'chartjs-adapter-date-fns';
import { moodValues } from '../utils/moodValues';

const MoodChart = ({ moodData }) => {
  const [avgMoodLabel, setAvgMoodLabel] = useState('');
  const [avgMoodEmoji, setAvgMoodEmoji] = useState('');
  
  useEffect(() => {
    if (moodData) {
      // Извлечение даты и настроение из данных
      const dates = moodData.map(entry => entry.date.split('T')[0]);
      const moods = moodData.map(entry => entry.mood);
      const moodCounts = {};

      // Поиск наиболее часто встречающегося настроения
      moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      let mostCommonMood;
      let maxCount = 0;

      for (const mood in moodCounts) {
        if (moodCounts[mood] >= maxCount) {
          maxCount = moodCounts[mood];
          mostCommonMood = mood;
        }
      }

      setAvgMoodLabel(moodValues(parseInt(mostCommonMood)).label);
      setAvgMoodEmoji(moodValues(parseInt(mostCommonMood)).emoji);

      // Обработка данных
      const data = {
        labels: dates, // Даты - метки оси ОХ
        datasets: [{
          label: 'Настроение',
          data: moods, // Полученные через пропс данные о настроении (ось ОУ)
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };

      // Конфигурация графика
      const config = {
        type: 'line',
        data,
        options: {
          scales: {
            x: {
                type: 'time',
                time:{
                    unit: 'day'
                }
            },
            y: {
              beginAtZero: true,
              min: 1,
              ticks: {
                stepSize: 1,
                precision: 0,
                callback: function(value) {
                  return moodValues(value).label;
                }
              }
            }
          }
        }
      };

      // Инициализация графика
      const myChart = new Chart(
        document.getElementById('myChart'),
        config
      );
      return () => {
        myChart.destroy();
      };
    }
  }, [moodData]);

  return (
    <>
      <div className="chartMenu">
        <p></p>
      </div>
      <div className="chartCard">
        <div className="chartBox">
          <canvas id="myChart"></canvas>
        </div>

        <p style={{marginTop: '20px'}}>Ваше среднее настроение: {avgMoodLabel} {avgMoodEmoji}</p>
      </div>
    </>
  );
};

export default MoodChart;
