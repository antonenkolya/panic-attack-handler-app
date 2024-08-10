import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const CardForm = () => {
  const navigate = useNavigate();
  const uselocation = useLocation();
  const { card } = uselocation.state ? uselocation.state : {};
  const { addStandart } = uselocation.state ? uselocation.state :false;
  const [content, setContent] = useState(card ? card.content : '');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus.isAuthenticated);
    };
    fetchAuthStatus();
  }, []);
  
  const handleSubmit = async () => {
    try {
      const newText = { content };
      const token = localStorage.getItem('token');
      if (!isAuthenticated){
        navigate('/login');
        return;
      }
      let headers;
      if (addStandart){
        headers = { Authorization: token, type: 0};
      }
      else{
        headers = { Authorization: token};
      }
      if (card) {
        await axios.put(`/card/put/${card.card_id}`, newText, { headers });        
        message.success("Содержимое карточки обновлено");
         
    } else {
        await axios.post('/card/add', newText, { headers });      
        message.success("Карточка добавлена");
    }
      navigate("/cards");
    } catch (error) {
      if (error.response.status === 401){
        message.success("Пожалуйста, повторите отправку");
        window.location.reload();
      }
      else{
        console.error('Ошибка:', error);
      }      
    }
  };
  

  return (
    <div>
      <h2>{card ? `Редактирование карточки с id: ${card.card_id}` : 'Добавление новой карточки'}</h2>
      <Form onFinish={handleSubmit}>
        <Form.Item
          label="Содержимое"
          name="content"
          initialValue={content}
          rules={[{ required: true, message: 'Пожалуйста, введите содержимое карточки!' }]}
        >
          <Input.TextArea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{card ? 'Сохранить' : 'Добавить'}</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CardForm;
