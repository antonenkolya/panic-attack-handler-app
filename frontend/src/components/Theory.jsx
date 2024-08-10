import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import { Card, Typography, Button, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'; 
import { LeftOutlined } from '@ant-design/icons';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const { Title, Paragraph } = Typography;

const Theory = () => {
  const navigate = useNavigate();
  const { theoryId } = useParams();
  const [theoryContent, setTheoryContent] = useState({ name: "", theoryContent: [] });
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
        } 
      } catch (err) {
        console.log(err);
      }
    };
    fetchAuthStatusAndRole();
  }, []);
  useEffect(() => {
    const fetchTheoryContent = async () => {
      try {
        const res = await axios.get(`/theory/${theoryId}`); 
        setTheoryContent(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
    };

    fetchTheoryContent();
  }, [theoryId]);

  const handleDelete = async (theoryContentID) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };

      await axios.delete(`/theory-content/delete/${theoryContentID}`, { headers });
      message.success('Блок контента успешно удалён');
      const updatedTheoryContent = theoryContent.theoryContent.filter(content => content.theory_content_id !== theoryContentID);
      setTheoryContent(prevState => ({
        ...prevState,
        theoryContent: updatedTheoryContent
      }));
    } catch (error) {
      if (error.response && error.response.status === 401){
        navigate("/login");
        message.info("Необходимо снова авторизироваться");
      }
      else {
        console.error('Ошибка при удалении раздела:', error);
      }
    }
  };

  return (
    <div>
      <Link to="/theory" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link> 
      <Card>
        <Title level={2} style={{ fontFamily: 'Roboto, sans-serif', color: 'grey' }}>{theoryContent.name}</Title>
        {theoryContent.theoryContent.map((contentItem) => (
          <div key={contentItem.theory_content_id}>
            <Title level={4} style={{ fontFamily: 'Roboto, sans-serif', color: 'grey' }}>{contentItem.title}</Title>
            <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.3em', fontWeight: '200' }}>{contentItem.content}</Paragraph>

            {role == 100 ? (<div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <div><Button size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(contentItem.theory_content_id)}>Удалить</Button></div>
                        {/* Переход на компонент EditTheoryContent.jsx для администратора */}
                        <div> <Link to={ `/theory-content/edit/${contentItem.theory_content_id}`} state={{contentItem: contentItem, theory_chapter_id: theoryId}}>
                        <Button size="small" icon={<EditOutlined />}>Редактировать</Button>
                        </Link> </div></div>) : (<></>)}
          </div>
        ))}
      </Card>
      {role == 100 ? (<Link to={"/theory-content/add"} state={{theory_chapter_id: theoryId}}><Button icon={<PlusOutlined />} style={{marginTop:'10px'}}>Добавить блок контента</Button></Link>): (<></>)}
    </div>
  );
};

export default Theory;