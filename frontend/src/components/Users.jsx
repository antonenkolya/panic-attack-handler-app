import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Card, Typography, Col, Row, Button, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Meta } = Card;
const { Paragraph } = Typography;

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token};
        const res = await axios.get('/users', {headers});
        setUsers(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
            navigate("/login");
            message.info("Необходимо снова авторизироваться");
          } else {
            console.error('Ошибка:', err);
          }
      }
    };
  
    fetchUsers();
  }, []);

  const getRoleName = (role) => {
    switch (role){
        case 0:
            return 'обычный'
        case 100:
            return 'администратор'
    }   
    
  }
  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token};
      // Отправка запроса для удаления информации о пользователе
      await axios.delete(`/user/delete/${userId}`, { headers });
      message.success('Пользователь успешно удалён');
      const updatedUsers = users.filter(user => user.user_id !== userId);
        setUsers(updatedUsers);
    } catch (error) {
      if (error.response && error.response.status === 401){
        navigate("/login");
        message.info("Необходимо снова авторизироваться");
      }
      else {
        console.error('Ошибка при удалении карточки:', error);
      }
    }
  };  

  return (
    <div>
      <Link to="/" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link>

      <div style={{display:'flex', justifyContent: 'center'}}><Link to='/users/edit' ><Button size="small" icon={<PlusOutlined />}>Добавить пользователя</Button></Link></div>
      <Row justify="center" align='middle'>
        {users.map(user => (
          <Col key={user.userId} xs={24} lg={24}>
            <Card
              style={{ margin: '16px', border: '1px grey solid'  }} 
              title={<span style={{ color: 'grey' }}> Пользователь #{user.user_id}</span>}
              actions={[                
                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'flex-end'}}>  
                    <div><Button size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(user.user_id)}>Удалить</Button></div>
                    <div><Link to={`/users/edit/${user.user_id}`} state={{ user }}><Button size="small" icon={<EditOutlined />}>Изменить роль</Button></Link></div>
                  </div>]}
            >
              <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={(
                <>
                <span style={{ fontWeight: 'bold' }}>Email:</span> {user.email}
                <br />
                <span style={{ fontWeight: 'bold' }}>Роль:</span> {getRoleName(user.role)}
                </>
            )} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Users;
