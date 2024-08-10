import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import axios from 'axios';
import { moodValues } from '../utils/moodValues';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { TextArea } = Input;

const EditMood = () => {
    const navigate = useNavigate();
    const [mood, setMood] = useState(parseInt(localStorage.getItem('mood')) || 1);
    const [notes, setNotes] = useState(localStorage.getItem('notes') ||'');
    const [today, setToday] = useState(localStorage.getItem('today') || false);
    const [reload, setReload] = useState(localStorage.getItem('reload') || false);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
      const initialize = async () => {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);
        if (authStatus.isAuthenticated) {
          await fetchMoodValues(); 
          navigate("/login");
          message.info("Необходимо снова авторизироваться");
        }
      };
      initialize();
    }, []);
  
    const fetchMoodValues = async () => {
      try {
        if(!reload){
        const token = localStorage.getItem('token');
        const headers = { Authorization: `${token}` }; 
        const response = await axios.get('/mood/check-today-entry', { headers });
      
        if (response.data.exists){
          setMood(response.data.mood);
          setNotes(response.data.notes);
          setToday(true);
        }}
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.name === 'TokenExpiredError'){
          alert('Ошибка:', error);
          window.location.reload();
          message.success("Пожалуйста, повторите отправку");
        }
        else{
          alert('Ошибка:', error);
        }
      }
    };

    const handleMoodChange = (e) => {
    setMood(parseInt(e.target.value));
  };
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  const handleSubmit = async () => {
    try {
      if (isAuthenticated){
        const data = {
          mood: mood,
          notes: notes
        };
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        
        if (today){
          await axios.put('/mood/edit', data, { headers });
          message.success("Запись о настроении изменена");
        }
        else{
          await axios.post('/mood/add', data, { headers });
          message.success("Запись о настроении добавлена");
        }
        navigate("/mood-diary");
        localStorage.removeItem('mood');
        localStorage.removeItem('notes');
        localStorage.removeItem('reload');
        localStorage.removeItem('today');
      }
      else{
        navigate("/login");
        message.info("Необходимо снова авторизироваться");
      }
      
    } catch (error) {
      if (error.response.status === 401){
        message.success("Пожалуйста, повторите отправку");
        localStorage.setItem('mood', mood);
        localStorage.setItem('notes', notes);
        localStorage.setItem('reload', true);
        localStorage.setItem('today', true)
        window.location.reload();
       
      }
      else{
        console.error('Ошибка:', error);
      }
    }
  };
  
  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <h2 >Как вы себя чувствуете сегодня?</h2>
      <input
        type="range"
        min="1"
        max="6"
        value={mood}
        onChange={handleMoodChange}
        style={{
          width: '80%',
          margin: '30px auto',
          display: 'block',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          height: '20px',
          borderRadius: '40px',
          background: `linear-gradient(to right, ${moodValues(mood).color} ${(mood) * 20}%, lightgray ${(mood - 1) * 20}%, lightgray 100%)`,
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2rem' }}>
        {moodValues(mood).emoji}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {moodValues(mood).label}
      </div>
      
      <TextArea
        rows={4}
        placeholder="Ваши мысли о дне..."
        value={notes}
        onChange={handleNotesChange}
        style={{ width: '100%', margin: '10px auto' }}
      />
    <Button type='primary' onClick={handleSubmit} style={{ width: '100px' }}>
        Отправить
      </Button>
    </div>
  );
};

export default EditMood;
