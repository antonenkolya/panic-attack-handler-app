import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shuffle } from 'lodash';
import {message, Button } from "antd";
import { RightOutlined } from '@ant-design/icons';
import axios from 'axios'
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const container ={
    marginTop: '40px',
    padding: '5px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '80px',
    fontSize: '1.5em',
    textAlign: 'center'
}
const cardContainer ={
  height: '200px',
  marginTop: '40px',
  padding: '5px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '80px',
  fontSize: '1em',
  textAlign: 'center'
}
const buttonStyle ={
    width: '100px',
    border: '1px solid grey',
    marginTop: '20px',
    marginRight: '10px'
}
const HelpBtn = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [userCards, setUserCards] = useState([]);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [cardIndex, setCardIndex] = useState(0);
    const [done, setDone] = useState(false);
    const [duration, setDuration] = useState();
    const [timer, setTimer] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const token = localStorage.getItem('token');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
  
    useEffect(() => {
      const fetchAuthAndCards = async () => {
        try {
          const authStatus = await checkAuth();
          setIsAuthenticated(authStatus.isAuthenticated);
          if (authStatus.isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
              const headers = { Authorization: token };
              const res = await axios.get('/cards/personal', { headers });
              setUserCards(res.data);
            }
          } 
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      };
      fetchAuthAndCards();
    }, []);
  
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get('/cards');
        setCards(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
  };    
        fetchCards();
  }, []);

   useEffect(() => {
    if (token && cards.length > 0 ){
      const cardsStandart = cards.map(card => card.content)
      const cardsUser = userCards.map(card => card.content)
      const shuffledCards = shuffle([...cardsStandart, ...cardsUser]);
      setShuffledCards(shuffledCards);
    }else if (!token) {
      const cardsStandart = cards.map(card => card.content)
      const shuffledCards = shuffle([...cardsStandart]);
      setShuffledCards(shuffledCards);
    }
  }, [cards, userCards]);

  useEffect(() => {
    // Таймер на 20 секунд
    const timer = setInterval(() => {
        setTimer(true);
    }, 20000);

    return () => {
        clearInterval(timer)
}}, []);
  // Обработчик переключения на следующую карточку
  const handleNextCard = () => {
    setCardIndex((prevIndex) => (prevIndex + 1) % shuffledCards.length);
  };

  // Обработчик ответа на вопрос о прекращении паники
  const handlePanicStopped = (stopped) => {
    setTimer(stopped);
    setDone(stopped);
    const endTime = new Date();
        const durationNew = parseInt((endTime - startTime) / 1000/60);
        setDuration(durationNew);
    if (stopped && isOnline){
        const formattedTime = startTime.toUTCString(); 
        navigate("/panic-add", { state: { durationOut: duration || 0 , startTime: formattedTime } });
    } 
  };

  return (
    <div style={container}>
        
            {done ? (<div>
              <p>   
      {/* При подключении к сети данное сообщение не будет отображено, 
      так как осуществится переход на EditPanicAttack.jsx*/}
            Поздравляем, вы снова справились! Не забудьте при восстановлении подключения к сети внести данные о панической атаке в дневник.
            <br /><br />
            <strong>Длительность (мин):</strong> {duration}
            <br />
            <strong>Начало:</strong> {startTime.toLocaleString()}           
            </p> 
            <Link to='/'><Button style={buttonStyle} >На главную</Button></Link> 
            </div>):(timer ? (
                <div>
                <p>Отступила ли паника?</p>
                <Button style={buttonStyle} onClick={() => handlePanicStopped(true)}>Да</Button>
                
                <Button style={buttonStyle} onClick={() => handlePanicStopped(false)}>Нет</Button>
              </div>) : (
                  <div style={container}>
                    <div style={cardContainer}><p>{shuffledCards[cardIndex]}</p></div>
                
                <Button style={buttonStyle} onClick={handleNextCard}>
                <RightOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
                </Button></div>
              ))}
    </div>
  );
};

export default HelpBtn;
