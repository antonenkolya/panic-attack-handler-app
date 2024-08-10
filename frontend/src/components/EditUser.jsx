import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message, Select } from "antd";
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;

const EditUser = () => {
  const navigate = useNavigate();
  const uselocation = useLocation();
  const { user } = uselocation.state ? uselocation.state : {user: null};
  const [userRole, setUserRole] = useState(user ? user.role : '');
  const [userEmail, setUserEmail] = useState('');
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
      if (!isAuthenticated){
        navigate('/login');
        return;
      }
      const newRole = { userRole };
      const token = localStorage.getItem('token');
      if (user) {
        const headers = { Authorization: token}; 
        await axios.put(`/user/put/${user.user_id}`, newRole, { headers });
        message.success("Роль пользователя изменена");
         
    } else {
        const headers = { Authorization: token};
        const newUser = {email: userEmail, password: '000', role: userRole}; 
        await axios.post('/user/add', newUser, { headers });      
        message.success("Пользователь добавлен");
    }
      navigate("/users");
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
      <h2>{user ? `Изменить роль пользователя с id: ${user.user_id}` : 'Добавление нового пользователя'}</h2>
      <Form onFinish={handleSubmit} style = {{marginTop: '20px'}}>
      {!user && <Form.Item
          label="Email:"
          name="email"
          initialValue={''}
          rules={[{ required: true, message: 'Пожалуйста, укажите email пользователя!' }]}
        >
           <Input.TextArea rows={4} value={userEmail} onChange={(e) => setUserEmail(e.target.value)}/>
          </Form.Item>}
          <Form.Item
          label="Роль:"
          name="role"
          initialValue={userRole}
          rules={[{ required: true, message: 'Пожалуйста, укажите роль пользователя!' }]}
        >
          <Select defaultValue={userRole} onChange={(value) => setUserRole(value)}>
            <Option value={0}>обычный</Option>
            <Option value={100}>администратор</Option>
          </Select>
          
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{user ? 'Сохранить' : 'Добавить'}</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditUser;
