import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Title } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const onFinish = () => {
    const formValues = form.getFieldsValue();
    const values = {
        email: formValues.email,
        password: formValues.password
    }

    axios.post('/register', values)
    .then(response => {
        if(response.status === 200){
            message.success('Вы успешно зарегистрированы');
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        }
    })
    .catch(error => {
        if (error.response && error.response.data && error.response.data.message) {
            message.error(error.response.data.message);
        } else {
            message.error('Произошла ошибка при регистрации');
        }
    });

};
return (
    <div style={{ width: '300px', margin: 'auto' }}>
      <Title level={2}>Регистрация</Title>
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
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
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
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

export default Register;
