import React, { useState, useEffect } from 'react';
import { Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import PanicAttackList from './PanicAttacksList';
import { checkAuth } from '../utils/authCheck';
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
    border: '1 px solid red',

  };

const PanickAttackDiary = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuth();
      if(!authStatus.isAuthenticated){
        navigate('/login')
        message.info("Необходимо снова авторизироваться");
      }
    };
    fetchAuthStatus();
  }, []);
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

  return (
    <div style={{}}>
      <Link to="/observations" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link> 
      <div>
      {isOnline ? (
        <>
          <Paragraph style={paragraphStyle}>Добавить запись о панической атаке:</Paragraph>
          <Link to='/panic-add'>
            <Button type="primary" style={buttonStyle}>Добавить</Button>
          </Link>
        </>
      ) : (
        <Paragraph style={paragraphStyle}>Добавление записи о панической атаке будет доступно при восстановлении подключения к сети.</Paragraph>
      )}
        <Paragraph style={paragraphStyle}>Посмотреть статистику:</Paragraph>
        <Link to='/panic-statistics'>
          <Button type="primary" style={buttonStyle}>Статистика</Button>
        </Link>
        <PanicAttackList/>
      </div>   
    </div>
  );
};

export default PanickAttackDiary;
