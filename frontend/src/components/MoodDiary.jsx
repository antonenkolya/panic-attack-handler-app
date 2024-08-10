import React, { useState, useEffect } from 'react';

import { Button, Typography, message, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import MoodRecords from './MoodRecords';
import { checkAuth } from '../utils/authCheck';
import axios from 'axios';
import { LeftOutlined } from '@ant-design/icons';
const { Paragraph } = Typography;

const paragraphStyle = {
  fontFamily: 'Roboto, sans-serif',
  color: 'grey',
  fontSize: '1em',
  fontWeight: '200',
  marginTop: '15px',
  marginBottom: '0px'
};

const buttonStyle = {
    marginTop: '5px',
};

const MoodDiary = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [userId, setUserId] = useState(null);

    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
  
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
  
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);
    // Проверка аутентификации и просмотра разрешения на уведомления
    useEffect(() => {
      const fetchAuthStatus = async () => {
        try {
          const authStatus = await checkAuth();
          setIsAuthenticated(authStatus.isAuthenticated);
          setUserId(authStatus.userId);
  
          if (authStatus.isAuthenticated) {
            // Проверка просмотра модального окна пользователем
            try {
              const userResponse = await axios.get(`/seen/${authStatus.userId}`);
              if (!userResponse.data.seen) {
                setIsFirstTime(true);           
              }
              
            } catch (userError) {
              if (userError.response && userError.response.status === 404) {
                console.error('Ошибка 404');
              } else {
                console.error('Ошибка при получении данных пользователя:', userError);
              }
            }
          } else {
            navigate('/login');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.error('Ошибка 404');
            message.error("Сервис проверки авторизации временно недоступен.");
            navigate('/login');
          } else {
            console.error('Ошибка проверки авторизации:', error);
          }
        }
      };
      fetchAuthStatus();
    }, [navigate]);

    const handleReminderApproval = async () => {
      setIsFirstTime(false)
      await axios.put('/update-reminder-status', {userId});
      const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // Подписка на уведомления
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'BL-URrhm81GjTo8D91-qqRnTnEJ5DFIhcM9R5cjOUTqmtdPEbygsYZlmq2zk8wZK08pzOaTWDRskAzwmiEPe9a4', // Замените на ваш публичный VAPID ключ
            });           
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            await axios.post('/save-subscription', {subscription, timezone});
            
    }}
    const handleCancel = async () => {
      try {
        await axios.put('/update-reminder-status', { userId });
        setIsFirstTime(false);
      } catch (error) {
        console.error("Error updating reminder status:", error);
      }
    };

  return (
    <div style={{}}>
      <Link to="/observations" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link> 
      <Modal
        title="Отслеживайте настроение"
        visible={isFirstTime}
        onOk={handleReminderApproval}
        onCancel={handleCancel}
      >
        <p>Разрешите напоминать вам о необходимости заполнять дневник настроения?</p>
      </Modal>
      <div>
      {isOnline ? (
        <>
          <Paragraph style={paragraphStyle}>Добавить (или изменить) запись о сегодняшнем дне:</Paragraph>
          <Link to='/mood-add'>
            <Button type="primary" style={buttonStyle}>Сегодня</Button>
          </Link>
        </>
      ) : (
        <Paragraph style={paragraphStyle}>Добавление (редактирование) записи о сегодняшнем настроении будет доступно при восстановлении подключения к сети.</Paragraph>
      )}
        <Paragraph style={paragraphStyle}>Посмотреть статистику:</Paragraph>
        <Link to='/mood-statistics'>
          <Button type="primary" style={buttonStyle}>Статистика</Button>
        </Link>

        <MoodRecords/>
      </div>
    </div>
  );
};

export default MoodDiary;
