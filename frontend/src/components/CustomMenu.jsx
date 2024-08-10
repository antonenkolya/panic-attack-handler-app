import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Typography, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const { Title } = Typography;

const CustomMenu = ({ items }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthStatusAndRole = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);

        if (authStatus.isAuthenticated) {
          const headers = { Authorization: localStorage.getItem('token') };
          const res = await axios.get('/role', { headers });
          setRole(res.data.role);
        }
        } catch (err) {
        console.log(err);
      }
    };

    fetchAuthStatusAndRole();
  }, [navigate]);
  const handleLogout = () =>{
    axios.delete('/logout', { 
      headers: {
        'x-refresh-token': localStorage.getItem('refreshToken')
    }})
    .then(response => {
      message.success(response.data.message);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setTimeout(() => {
        window.location.reload(true);
    }, 1000); 
      
  }).catch(err => console.log(err));
  }
  return (
    <Menu className="menu" mode="vertical">
      <Title level={1}><Link to="/" style={{fontFamily: 'Roboto, sans-serif', color: 'grey'}}>Panic Attack Handler</Link></Title>
      
      {items.map((item) => (
        <Menu.Item className="menu-item" key={item.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Link to={item.url} style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }}>{item.name}</Link>
          </div>
        </Menu.Item>
      ))}
      
      <Menu.Item className="help-btn">
      
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexWrap: 'wrap' }}>
        <Link to='/help' >
          <Title style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1em', textAlign: 'center' }}>Мне плохо!</Title>
          </Link>
        </div>
      </Menu.Item>
      
      {isAuthenticated ? (
        <>
        <Button onClick={handleLogout}>Выйти</Button>
        {role == 100 ? (<Button icon={<PlusOutlined />} style={{marginTop:'10px'}} onClick={() => navigate('/users')}>Пользователи</Button>): (<></>)}</>
      ) : (
        <div style={{ display: 'flex', flexDirection:'column', alignItems: 'center', gap: '10px'}}>
          <Link to="/login"><Button>Войти</Button></Link>
          <Link to="/register"><Button>Регистрация</Button></Link>
        </div>
      )}
    </Menu>
  );
};

export default CustomMenu;
