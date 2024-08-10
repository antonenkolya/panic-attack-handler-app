import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Title } = Typography;
const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  
  axios.defaults.withCredentials = true;
  const onFinish = () => {
    const formValues = form.getFieldsValue();
    const values = {
        email: formValues.email,
        password: formValues.password
    }
    axios.post('/login', values)
    .then(response => {
      
        if(response.status === 200){
          message.success('Вы успешно авторизированы');
          const token = response.data.token;
          const refreshToken = response.data.refreshToken;
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', refreshToken)
          
          // Задержка перед перенаправлением на главную страницу
            setTimeout(() => {
              if(localStorage.getItem('panicAttackData')){
                navigate("/panic-add")
              }
              else{
                navigate("/");
              }
            }, 1000); 
        }
    })
    .catch(error => {
        if (error.response && error.response.statusText) {
            message.error(error.response.statusText);
        } else if (error.message) {
          message.error(error.message);
      }else {
          message.error("Ошибка");
        }
    });

};

  return (
    <div style={{ width: '300px', margin: 'auto' }}>
      <Title level={2}>Вход</Title>
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              type: 'email',
              message: 'Введите корректный email!',
            },
            {
              required: true,
              message: 'Пожалуйста, введите ваш email!',
            },
          ]}
          
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            {
              required: true,
              message: 'Пожалуйста, введите ваш пароль!',
            },
          ]}
          hasFeedback
          
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Войти
          </Button>
        </Form.Item>
      </Form>
      <Link to="/register"><Button>Регистрация</Button></Link>
      {/* Медиа-запрос для адаптивности */}
      <style jsx>{`
        @media (max-width: 576px) {
          .ant-input {
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
