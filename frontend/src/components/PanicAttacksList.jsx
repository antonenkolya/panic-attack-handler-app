import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, message } from 'antd';
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const { Title } = Typography;

const container = {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column'
}

const panicAttackStyle = {
    marginTop: '20px',
    padding: '7px',
    border: '1px solid transparent',
    borderRadius: '10px'
}

const link = {
    color: 'grey',
    textDecoration: 'none'
}

const PanicAttackList = () => {
  const navigate = useNavigate();  
  const [panicAttacks, setPanicAttacks] = useState([]);
  useEffect(() => {
    const fetchAuthStatusAndPanicAttacks = async () => {
      try {
        const authStatus = await checkAuth();
        if (!authStatus.isAuthenticated) {
          navigate('/login');
          message.info("Необходимо снова авторизироваться");
          return;
        }        
        // Загрузка данных о панических атаках
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        const res = await axios.get('/panic-attacks', { headers });

        const formattedPA = res.data.map(pa => {
          const date = pa.date.toString();
          const [dateStr, timeStr] = date.split('T');
          const [year, month, day] = dateStr.split('-');
          const [hours, minutes, secondsZ] = timeStr.split(':');
          const seconds = secondsZ.slice(0, 2);

          const formattedDate = `${day}.${month}.${year}`;
          const formattedTime = `${hours}:${minutes}:${seconds}`;

          return { ...pa, date: formattedDate, time: formattedTime };
        });

        setPanicAttacks(formattedPA);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
          message.info("Необходимо снова авторизироваться");
        } else {
          console.error('Ошибка:', error);
        }
      }
    };
    fetchAuthStatusAndPanicAttacks();
  }, []);
 

  return (
    <div style={container}>
      <p>Ваши записи о панических атаках:</p>
      {panicAttacks.map((panicAttack) => (
        <Link to={ `/pa/info/${panicAttack.panic_attack_id}`} state={{panicAttack}} style={link}>
        <div className='panicAttack' key={panicAttack.panic_attack_id} style={panicAttackStyle}>
          <div><strong>Дата:</strong> {panicAttack.date}</div>
          <div><strong>Время:</strong> {panicAttack.time}</div>
          <div><strong>Длительность:</strong> {panicAttack.duration}</div>
          <div><strong>Тяжесть:</strong> {panicAttack.severity}</div>
        </div></Link>
      ))}
    </div>
  );
};

export default PanicAttackList;
