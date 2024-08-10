import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const EditTheoryContent = () => {
  const navigate = useNavigate();
  const { theory_chapter_id } = useLocation().state || {theory_chapter_id: null};
  const { contentItem } = useLocation().state || {contentItem: null};
  const [title, setTitle] = useState(contentItem ? contentItem.title : '');
  const [content, setContent] = useState(contentItem ? contentItem.content : '');
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      if (role != 100){
        message.error("У вас нет прав администратора");
        navigate('/login');
        return;
      }
      if (contentItem) {
        const newContent = { title: title, content: content };
        await axios.put(`/theory-content/put/${contentItem.theory_content_id}`, newContent, { headers });
        message.success("Контент обновлён");
         
    } else {
        const newContent = { title: title, content: content, chapterID: theory_chapter_id };
        await axios.post('/theory-content/add', newContent, { headers });
        message.success("Контент добавлен");
    }
      navigate(`/theory/${theory_chapter_id}`);
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
      <h2>{contentItem ? `Редактирование теоретического контента с id: ${contentItem.theory_content_id}` : 'Добавление новго контента'}</h2>
      <Form onFinish={handleSubmit} style={{marginTop: '20px'}}>
        <Form.Item
          label="Заголовок"
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Пожалуйста, введите заголовок!' }]}
        >
          <Input.TextArea rows={4} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="Текст"
          name="content"
          initialValue={content}
          rules={[{ required: true, message: 'Пожалуйста, добавьте текст!' }]}
        >
          <Input.TextArea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{contentItem ? 'Сохранить' : 'Добавить'}</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTheoryContent;
