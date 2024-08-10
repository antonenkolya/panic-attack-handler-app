import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const EditTheoryChapter = () => {
  const navigate = useNavigate();
  const { chapter } = useLocation().state || {chapter: null};
  const [name, setName] = useState(chapter ? chapter.name : '');
  const [role, setRole] = useState(0);  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const fetchAuthStatusAndRole = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);

        if (authStatus.isAuthenticated) {
          const headers = { Authorization: localStorage.getItem('token') };
          const res = await axios.get('/role', { headers });
          setRole(res.data.role);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAuthStatusAndRole();
  }, []);
  
  const handleSubmit = async () => {
    try {
      if (!isAuthenticated){
        navigate('/login');
        return;
      }
      const newName = { name };
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      if (role != 100){
        message.error("У вас нет прав администратора");
        navigate('/login');
        return;
      }
      if (chapter) {
        // Если карточка существует, это редактирование - отправка PUT-запроса
        await axios.put(`/theory/put/${chapter.theory_chapter_id}`, newName, { headers });
        message.success("Название раздела обновлено");
         
    } else {
        // Если карточка не существует, это добавление - отправка POST-запроса
        await axios.post('/theory/add', newName, { headers });
        message.success("Теоретический раздел добавлен");
    }
      navigate("/theory");
    } catch (error) {
      if (error.response && error.response.status === 401){
        navigate("/login");
        message.info("Необходимо снова авторизироваться");
      }
      else{
        console.error('Ошибка:', error);
      }
    }
  };
  
  return (
    <div>
      <h2>{chapter ? `Редактирование теоретической части с id: ${chapter.theory_chapter_id}` : 'Добавление новго раздела'}</h2>
      <Form onFinish={handleSubmit}>
        <Form.Item
          label="Название"
          name="content"
          initialValue={name}
          rules={[{ required: true, message: 'Пожалуйста, введите название раздела теории!' }]}
        >
          <Input.TextArea rows={4} value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{chapter ? 'Сохранить' : 'Добавить'}</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTheoryChapter;
