import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button, Typography, Menu } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import {checkAuth} from '../utils/authCheck'
const { Paragraph, Title } = Typography;

const Diary = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchAuthStatus = async () => {
          const authStatus = await checkAuth();
          setIsAuthenticated(authStatus.isAuthenticated);
        };
    
        fetchAuthStatus();
      }, []);
    return (
        <div>
            <Link to="/" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
                <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
                <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
            </Link>
            {isAuthenticated ? (
                <>
                <Menu className="menu" mode="vertical">
                <Paragraph style={{fontFamily: 'Roboto, sans-serif', color: 'grey'}}>Здесь вы можете отслеживать своё состояние.</Paragraph>
      
      
            <Menu.Item className="menu-item" key={1}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Link to='/mood-diary' style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }}>Дневник настроения</Link>
                 </div>
            </Menu.Item>

            <Menu.Item className="menu-item" key={2}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Link to='/panic-diary' style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }}>Дневник панических атак</Link>
                 </div>
            </Menu.Item>
            </Menu>
                </>
            ) :(
                <div style={{ marginTop: '20px', display: 'flex', flexDirection:'column', alignItems: 'center', gap: '5px'}}>
          <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.05em', textAlign: 'center' }}>Для добавления записей о своём состоянии и отслеживания статистики необходимо авторизоваться.</Paragraph>
          <Link to="/login"><Button>Войти</Button></Link>
          
        </div>
            )}
            
     
    </div>
        
    );
}
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'rgb(223, 252, 252)',
        color: 'grey',
        margin: '10px',
        width: '90%',
        height: '10vh',
        minWidth: '250px',
        fontSize: '16px',
        borderRadius: '5px'
    },
};

export default Diary;
