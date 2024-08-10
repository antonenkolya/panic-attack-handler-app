import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Card, Typography, Col, Row, Button, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { LeftOutlined } from '@ant-design/icons';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Meta } = Card;
const { Paragraph } = Typography;

const Cards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUserId(authStatus.userId);
    };
    fetchAuthStatus();
  }, []);
  
  useEffect(() => {
    const readRole = async () => {
      if (isAuthenticated) {
        try {
          const headers = { Authorization: token };
          const res = await axios.get("/role", { headers });
          setRole(res.data.role);
        } catch (err) {
          console.error(err);
        }
      }
    };
    readRole();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      const fetchUserCards = async () => {
        try {
          const headers = { Authorization: token };
          const res = await axios.get('/cards/personal', { headers });
          setUserCards(res.data);
        } catch (err) {
          console.log("Ошибка", err);
        }
      };
      fetchUserCards();
    }
  }, [userId]);

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

  // Проверка подключения к сети
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

  const handleDelete = async (cardId, type) => {
    try {
      const token = localStorage.getItem('token');
      let headers;
      if (type === 0) {
        headers = { Authorization: token, type: 0 };
      } else {
        headers = { Authorization: token };
      }

      await axios.delete(`/card/delete/${cardId}`, { headers });
      message.success('Карта успешно удалена');
      if (type !== 0) {
        const updatedUserCards = userCards.filter(card => card.card_id !== cardId);
        setUserCards(updatedUserCards);
      } else {
        const updatedCards = cards.filter(card => card.card_id !== cardId);
        setCards(updatedCards);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
        message.info("Необходимо снова авторизироваться");
      } else {
        console.error('Ошибка при удалении карточки:', error);
      }
    }
  };

  return (
    <div>
      <Link to="/" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }} />
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link>

      <Row justify="center" align='middle'>
        {cards.map(card => (
          <Col key={card.card_id} xs={24} lg={24}>
            <Card
              style={{ margin: '16px', border: '1px grey solid' }}
              title={<span style={{ color: 'grey' }}> {card.type === 0 ? "Стандартная" : "Пользовательская"} карточка </span>}
              actions={[
                 // Проверка наличия подключения к сети
                  role === 100 && ( isOnline ? (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <div><Button size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(card.card_id, card.type)}>Удалить</Button></div>
                      <div><Link to={`/standart-card/edit/${card.card_id}`} state={{ card }}>
                        <Button size="small" icon={<EditOutlined />}>Редактировать</Button>
                      </Link></div>
                    </div>
                  )
                 : (
                  <span>Редактирование и удаление карточки будут доступны при восстановлении подключения к сети Интернет</span>
                ))
              ]}
            >
              <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={card.content} />
            </Card>
          </Col>
        ))}
      </Row>

      {isAuthenticated ? (
        <Row justify="center" align='middle'>
          {userCards.map(card => (
            <Col key={card.card_id} xs={24} lg={24}>
              <Card
                style={{ margin: '16px', border: '1px grey solid' }}
                title={<span style={{ color: 'grey' }}> {card.type === 0 ? "Стандартная" : "Пользовательская"} карточка</span>}
                actions={[
                  isOnline ? ( 
                   (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <p>{isOnline}</p>
                      <Button size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(card.card_id, card.type)}>Удалить</Button>,
                  <Link to={`/cards/edit/${card.card_id}`} state={{ card }}>
                    <Button size="small" icon={<EditOutlined />}>Редактировать</Button>
                  </Link>
                    </div>
                  )
                ) : (
                  <span>Редактирование и удаление карточки будут доступны при восстановлении подключения к сети Интернет</span>
                )
                  
                ]}
              >
                <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={card.content} />
              </Card>
            </Col>
          ))}
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isOnline ? (<>{role == 100 ? (<Button icon={<PlusOutlined />} style={{ marginTop: '10px' }} onClick={() => navigate('/cards/add', { state: { addStandart: true } })}>Добавить стандартную карточку</Button>) : (<></>)}
            <Button size="small" icon={<PlusOutlined />} onClick={() => navigate('/cards/add')}>Добавить</Button></>) : (<></>)}
          </div>
        </Row>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.05em', textAlign: 'center' }}>Для добавления и редактирования карточек необходимо авторизоваться.</Paragraph>
          <Link to="/login"><Button>Войти</Button></Link>
        </div>
      )}
    </div>
  );
};

export default Cards;
