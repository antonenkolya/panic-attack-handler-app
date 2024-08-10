import React, { useState, useEffect } from 'react';
import { Button, List, Typography, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import { LeftOutlined } from '@ant-design/icons';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { checkAuth } from '../utils/authCheck';
const { Title, Paragraph } = Typography;

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
const Theory = () => {
    const navigate = useNavigate();
    const [theoryChapters, setTheoryChapters] = useState([]);
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
        const fetchAllChapters = async () => {
            try {
                const res = await axios.get("/theoryChapters");
                setTheoryChapters(res.data);
            } catch (err) {
                console.log("Ошибка", err);
            }
        }
        fetchAllChapters();
    }, []);

    const handleDelete = async (chapterId) => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: token };
    
          await axios.delete(`/theory/delete/${chapterId}`, { headers });
          message.success('Раздел успешно удалён');
          const updatedTheoryChapters = theoryChapters.filter(chapter => chapter.theory_chapter_id !== chapterId);
          setTheoryChapters(updatedTheoryChapters);
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
            <Link to="/" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
                <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
                <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
            </Link>
            <Title level={2} style={{fontFamily: 'Roboto, sans-serif', color: 'grey'}}>Знай врага в лицо...</Title>
            
            <List
                dataSource={theoryChapters}
                renderItem={chapter => (
                    <List.Item style={{display: 'flex', flexDirection: 'column', alignItems:'flex-start'}}>
                         <Link to={`/theory/${chapter.theory_chapter_id}`}>
                            <Title className="chapter-name" level={3} style={{fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em', fontWeight: '300' }}>
                                {chapter.theory_chapter_id}. {chapter.name}
                            </Title>
                        </Link>
                       {/* Элементы интерфейса, доступные только администратору  */}
                        {role == 100 ? (<div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <div><Button size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(chapter.theory_chapter_id)}>Удалить</Button></div>
  
                        <div> <Link to={ `/theory-chapter/edit/${chapter.theory_chapter_id}`} state={{chapter}}>
                        <Button size="small" icon={<EditOutlined />}>Редактировать</Button>
                        </Link> </div></div>) : (<></>)}                       
                    </List.Item>
                )}
            />
            {role == 100 ? (<Link to="/theory-chapter/add"><Button icon={<PlusOutlined />} style={{marginTop:'10px'}}>Добавить часть</Button></Link>): (<></>)}
        </div>
    );
}

export default Theory;