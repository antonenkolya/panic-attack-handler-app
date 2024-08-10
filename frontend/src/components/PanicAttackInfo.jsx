import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Typography, Card, Row, Col, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const container = {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '1.2em'
}

const list = {
  listStyle: 'inside disc',
  lineHeight: '30px'
}

const PanicAttackInfo = () => {
  const navigate = useNavigate()
  const { panicAttack } = useLocation().state || {panicAttack: null};
  const [locations, setLocations] = useState([])
  const [vegSymps, setVegSymps] = useState([])
  const [psySymps, setPsySymps] = useState([])
  const [cards, setCards] = useState([])
  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuth();
      if(!authStatus.isAuthenticated){
        navigate('/login')
        message.info("Необходимо снова авторизироваться");
      }
    };
    fetchAuthStatus();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/locations');
        setLocations(res.data);

      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchLocations();
}, []);

useEffect(() => {
    const fetchVegSymps = async () => {
      try {
        const pa_id = panicAttack.panic_attack_id;
        const headers = { pa_id: pa_id };
        const res = await axios.get('/pa/veg-symps', {headers});
        setVegSymps(res.data);

      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchVegSymps();
}, []);

useEffect(() => {
    const fetchPsySymps = async () => {
      try {
        const pa_id = panicAttack.panic_attack_id;
        const headers = { pa_id: pa_id };
        const res = await axios.get('/pa/psy-symps', {headers});
        setPsySymps(res.data);

      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchPsySymps();
}, []);

useEffect(() => {
    const fetchCards = async () => {
      try {
            const pa_id = panicAttack.panic_attack_id;
            const headers = { pa_id: pa_id };
            const res = await axios.get('/pa/cards', {headers});
            setCards(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
    };

    fetchCards();
  }, []);


  return (
    <div>
        <Link to="/panic-diary" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link>
      <h2 level={2}>Информация о панической атаке</h2>
      <div style={container}>
        <p><strong>Дата:</strong> {panicAttack.date}</p>
        <p><strong>Время:</strong> {panicAttack.time === '00:00:00' ? 'не указано' : panicAttack.time}</p>
        <p><strong>Длительность:</strong> {panicAttack.duration}</p>
        <p><strong>Тяжесть:</strong> {panicAttack.severity}</p>
        <p><strong>Место:</strong> {locations.find(location => location.location_id === panicAttack.location)?.name}</p>
        <p><strong>Детали:</strong> {panicAttack.location_details}</p>
        <p><strong>Вегетативные симптомы:</strong> </p>
            <ul style={list}>
                {vegSymps.map((symptom) => (
                    <li key={symptom.vegetative_symptom_id}>{symptom.description}</li>
                ))}
            </ul>

        <p><strong>Психоповеденческие симптомы:</strong> </p>
            <ul style={list}>
                {psySymps.map((symptom) => (
                    <li key={symptom.psycho_symptom_id}>{symptom.description}</li>
                ))}
            </ul>    
        <p><strong>Мысли:</strong> {panicAttack.triggers}</p>

        <p><strong>Карточки:</strong></p>
        <Row justify="center" align='middle'>
        {cards.map(card => (
          <Col key={card.card_id} xs={24} lg={24}>
            <Card
              style={{ margin: '16px', border: '1px grey solid'  }} 
              title={<span style={{ color: 'grey' }}> Карточка #{card.card_id} ({card.type === 0 ? "cтандартная" : "пользовательская"}) </span>}
            >
              <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={card.content} />
            </Card>
          </Col>
        ))}
      </Row>
      </div>
    </div>
  );
};

export default PanicAttackInfo;
