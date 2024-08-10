import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, Typography, Divider, message } from 'antd';
import axios from 'axios';
import { moodValues } from '../utils/moodValues';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const { Paragraph } = Typography;
const paragraphStyle = {
    fontFamily: 'Roboto, sans-serif',
    color: 'grey',
    fontSize: '1em',
    fontWeight: '200',
    marginTop: '15px',
    marginBottom: '5px'
  };

const MoodRecords = () => {
  const navigate = useNavigate();  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [moodRecords, setMoodRecords] = useState([]);
  useEffect(() => {
    const fetchAuthAndMoodRecords = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);
        if (!authStatus.isAuthenticated) {
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        const response = await axios.get('/user-mood', { headers });
        
        // Преобразование даты в нужный формат (день месяц год)
        const formattedRecords = response.data.map(record => {
          const date = new Date(record.date);
          const options = { day: 'numeric', month: 'long', year: 'numeric' };
          const formattedDate = date.toLocaleDateString('ru-RU', options);
          return { ...record, date: formattedDate };
        });

        setMoodRecords(formattedRecords);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate("/login");
          message.info("Необходимо снова авторизироваться");
        } else {
          console.error('Ошибка:', error);
        }
      }
    };

    fetchAuthAndMoodRecords();
  }, [navigate]);
  
  return (
    <div>
      <Paragraph style={paragraphStyle}>Ваши записи о настроении:</Paragraph>
      {moodRecords.map((record) => (
        <div style={{ marginBottom: '20px' }}>
          <Card title={record.date} style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', width: '300px' }}>
            <p><strong>Вам было:</strong> {moodValues(record.mood).label} {moodValues(record.mood).emoji}</p>
            {record.notes && (
              <>
                <Divider />
                <p><strong>Заметки:</strong> {record.notes}</p>
              </>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default MoodRecords;
