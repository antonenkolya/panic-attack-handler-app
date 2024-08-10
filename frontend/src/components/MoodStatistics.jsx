import React, { useState } from 'react';
import axios from 'axios';
import { Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import MoodChart from './MoodChart'; 
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const { Paragraph } = Typography;
const MoodStatistics = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState(null);
    const [chartPeriod, setChartPeriod] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchMoodData = async (period) => {
        try {
            const authStatus = await checkAuth();
            setIsAuthenticated(authStatus.isAuthenticated);
            if(authStatus.isAuthenticated){
                const token = localStorage.getItem('token');
                const headers = { Authorization: token };
                const response = await axios.get(`/mood/statistics/${period}`, { headers });
                
                if (response.status === 204) {
                    setChartData(null);
                    setChartPeriod(period)
                }
                else{
                    setChartData(response.data); 
                    setChartPeriod(period) 
                } 
            }

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
                message.info("Необходимо снова авторизироваться");
              } else {
                console.error('Ошибка:', error);
              }
        }
    };

    return (
        <div>
            <Link to="/mood-diary" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link> 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                <h2>Статистика настроения</h2> 
            </div>
            {!chartData && chartPeriod && <p>Пока нет данных для анализа</p>}
            { chartData && <MoodChart style={{ marginButton: '20px'}} moodData={chartData.moodData} />} {/* Передаем данные в MoodChart */}
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                <Button onClick={() => fetchMoodData('all')}>За всё время</Button>
                <Button onClick={() => fetchMoodData('current_month')}>За текущий месяц</Button>
                <Button onClick={() => fetchMoodData('current_week')}>За эту неделю</Button>
                
            </div>         
        </div>
    );
};

export default MoodStatistics;
