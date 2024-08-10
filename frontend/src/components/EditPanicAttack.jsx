import React, { useState, useEffect } from 'react';
import { Button, DatePicker, TimePicker, Input, Select, Card, Col, message, Checkbox, Typography } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'
import { LeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import moment from 'moment'
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
dayjs.extend(customParseFormat)
const { TextArea } = Input;
const { Meta } = Card;
const { Paragraph } = Typography;

const container = {
    marginTop: '20px',
}

const text = {
    fontSize: '1.2em',
    marginBottom: '10px',
}
const containerFlex = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
}

const buttonStyle = {
    marginTop: '5px',
    width: '30%',
    maxWidth: '80px'
};
const cardStyle = {
    width: '300px', margin: '16px', border: '1px grey solid'  
}
const EditPanicAttack = () => {
  const uselocation = useLocation();
  const navigate = useNavigate();
  // Парсинг данных о панической атаке из локального хранилища
  const pa = JSON.parse(localStorage.getItem('panicAttackData'))
  const [formLocations, setFormLocations] = useState([])
  const [formVegSymps, setFormVegSymps] = useState([])
  const [formPsySymps, setFormPsySymps] = useState([])
  const [step, setStep] = useState(pa ? pa.step :1);
  const [paDate, setpaDate] = useState( moment(new Date()));
  const [paTime, setpaTime] = useState( pa ? moment(pa.time) : (uselocation.state ? moment(uselocation.state.startTime) : null)); 
  const [duration, setDuration] = useState(pa ? pa.duration : (uselocation.state ? uselocation.state.durationOut : 0));
  const [severity, setSeverity] = useState(pa ? pa.severity : 1);
  const [location, setLocation] = useState(pa ? pa.location :'');
  const [locationError, setLocationError] = useState(false);
  const [locationDetails, setLocationDetails] = useState(pa ? pa.locationDetails : '');
  const [vegetativeSymptoms, setVegetativeSymptoms] = useState(pa ? pa.vegetativeSymptoms :[]);
  const [psychoSymptoms, setPsychoSymptoms] = useState(pa ? pa.psychoSymptoms : []);
  const [triggeringThoughts, setTriggeringThoughts] = useState(pa ? pa.triggers : '');
  const [userCards, setUserCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [copingCards, setCopingCards] = useState(pa ? pa.copingCards : []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const fetchAuthAndCards = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);
        // Загрука карточек при условии авторизации
        if (authStatus.isAuthenticated) {
          const token = localStorage.getItem('token');
          if (token) {
            const headers = { Authorization: token };
            const res = await axios.get('/cards/personal', { headers });
            setUserCards(res.data);
          }
        } 
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchAuthAndCards();
  }, []);
  // Получение данных для наполнения формы из базы данных
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get('/cards');
        setCards(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchCards();
}, []);

useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/locations');
        setFormLocations(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchLocations();
}, []);

useEffect(() => {
    const fetchVegSymps = async () => {
      try {
        const res = await axios.get('/veg-symps');
        setFormVegSymps(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchVegSymps();
}, []);
useEffect(() => {
    const fetchPsySymps = async () => {
      try {
        const res = await axios.get('/psy-symps');
        setFormPsySymps(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
  }
  fetchPsySymps();
}, []);

  const handleNextStep = () => {
    if(step===3 && !location){
      setLocationError(true);
    }
    else{
      setLocationError(false)
      setStep(step + 1);
    }
   
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  const handleSaveDate = (value) => {
    setpaDate(value);
  };

  const handleSaveTime = (value) => {
    setpaTime(value);
  };
  const handleSaveDuration = (value) => {
    setDuration(value);
  };

  const handleSaveSeverity = (value) => {
    setSeverity(value);
  };

  const handleSaveLocation = (value) => {
    setLocation(value);
  };
  const handleSaveLocationDetails = (value) => {
    setLocationDetails(value);
  };

  const handleSaveVegetativeSymptoms = (value) => {
    setVegetativeSymptoms(value);
  };

  const handleSavePsychoSymptoms = (value) => {
    setPsychoSymptoms(value);
  };

  const handleSaveTriggeringThoughts = (e) => {
    setTriggeringThoughts(e.target.value);
  };

  const handleCheckboxChange = (e, index) => {
    const isChecked = e.target.checked;
    if (isChecked) {
        // Если чекбокс выбран, индекс карточки добавляется в массив copingCards
        setCopingCards(prevState => [...prevState, index]);
    } else {
        // Если чекбокс снят, индекс карточки удаляется из массива copingCards
        setCopingCards(prevState => prevState.filter(item => item !== index));
    }
  };
  
  const handleSavePanicAttack = async () => {
    try {
        if(!isAuthenticated){
          savePanicAttackToLocalStorage();           
          navigate("/login")
        }
        else{
            const date = new Date(paDate);
            const time = new Date(paTime);
            const timezoneOffset = time.getTimezoneOffset();
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            date.setSeconds(time.getSeconds());
            date.setMilliseconds(time.getMilliseconds());

            // Получение локального времени путём вычитания разницы временной зоны
            date.setMinutes(date.getMinutes() - timezoneOffset);
            setDuration(duration || 0)
            const data = {
                date: date,
                time: paTime,
                duration: new Date(duration * 60 * 1000).toISOString().substr(11, 8),
                severity: severity,
                location: location, 
                location_details: locationDetails,
                triggers: triggeringThoughts,

                vegetative: vegetativeSymptoms,
                psycho: psychoSymptoms,
                cards: copingCards
              };
                
            if (localStorage.getItem('panicAttackData')){
              localStorage.removeItem('panicAttackData')
            }            
            const token = localStorage.getItem('token');
            const headers = { Authorization: token };
            const res = await axios.post('/pa-save', data, {headers});
            navigate("/panic-diary");}
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
                message.info("Необходимо снова авторизироваться");
              } else {
                console.error('Ошибка:', error);
              }
        }
  };

  const savePanicAttackToLocalStorage = () => {
    
    const data = {
      time: paTime,
      duration: duration || 0,
      severity: severity,
      location: location,
      locationDetails: locationDetails,
      triggers: triggeringThoughts,
      vegetativeSymptoms: vegetativeSymptoms,
      psychoSymptoms: psychoSymptoms,
      copingCards: copingCards,
      step: 6
    };
    // Сохранение записи в локальном хранилище на вермя авторизации
    localStorage.setItem('panicAttackData', JSON.stringify(data));
  };

  return (
    <div>
        <Link to="/panic-diary" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link> 
      
    <div className="container">
      <h2 style={{textAlign: 'center'}}>Добавление новой записи о панической атаке</h2>
      <div style={container}>
      {step === 1 && (
        <div style={containerFlex}>

            <label style={text}> Дата панической атаки:</label>
            <DatePicker
                format = {'DD.MM.YYYY'}
                placeholder="Укажите дату"
                value={paDate}
                onChange={(dateString)=>handleSaveDate(dateString)}
                style={{ width: '100%' }}
            />
            <label style={text}> Время панической атаки:</label>
            <TimePicker
                showTime = {{format: 'HH:mm'}}
                placeholder="Укажите время"
                value={paTime}
                onChange={(timeString)=>handleSaveTime(timeString)}
                style={{ width: '100%' }}
            />
            
            <label style={text}> Длительность панической атаки (в минутах):</label>
            <Input type="number" min={1} value={duration} onChange={(e) => handleSaveDuration(e.target.value)} placeholder='5...'/>
            <Button onClick={handleNextStep} style={buttonStyle}>Далее</Button>
            <Link to='/panic-diary'>
                <Button type="primary">Выйти</Button>
            </Link>
        </div>
      )}
      {step === 2 && (
        <div style={containerFlex}>
          <label style={text}>Тяжесть панической атаки по шкале от 1 до 10 (ваша субъективаня оценка):</label>
          <Select
              value={severity}
              onChange={handleSaveSeverity}
              style={{ width: '100%' }}
            >
              <Select.Option selected value="1">1</Select.Option>
              <Select.Option value="2">2</Select.Option>
              <Select.Option value="3">3</Select.Option>
              <Select.Option value="4">4</Select.Option>
              <Select.Option value="5">5</Select.Option>
              <Select.Option value="6">6</Select.Option>
              <Select.Option value="7">7</Select.Option>
              <Select.Option value="8">8</Select.Option>
              <Select.Option value="9">9</Select.Option>
              <Select.Option value="10">10</Select.Option>
            </Select>      
            <Button onClick={handleNextStep}>Далее</Button>
            <Button onClick={handlePreviousStep}>Назад</Button>
        </div>
      )}
      {step === 3 && (
        <div style={containerFlex}>
            <label style={text}>Место, где произошёл приступ:</label>
            <Select            
              value={location}
              onChange={handleSaveLocation}
              style={{ width: '100%' }}
            >
              {formLocations.map(location => (
                <Select.Option key={location.location_id} value={location.location_id}>{location.name}</Select.Option>
              ))}
            </Select>
            {locationError && <span style={{ color: 'red' }}>Пожалуйста, выберите место</span>} 
            <label style={text}>При необходимости уточните детали:</label>
            <TextArea style={{height: '100px'}} value={locationDetails} onChange={(event)=>handleSaveLocationDetails(event.target.value)} placeholder='Например, количество людей на улице или в магазине, вид общественного транспорта, какое-то необычное событие' />
            <Button onClick={handleNextStep}>Далее</Button>
            <Button onClick={handlePreviousStep}>Назад</Button>
        </div>
      )}
      {step === 4 && (
        <div style={containerFlex}>
          <label style={text}>Симптомы, которые вам пришлось испытать:</label>
          <p>Вегетативные симптомы</p>
          <Select
              mode='multiple'
              value={vegetativeSymptoms}
              onChange={handleSaveVegetativeSymptoms}
              style={{ width: '100%' }}
            >
              {formVegSymps.map(vegSymptom => (
                <Select.Option key={vegSymptom.vegetative_symptom_id} value={vegSymptom.vegetative_symptom_id}>{vegSymptom.description}</Select.Option>
              ))}
            </Select>
        
            <p>Психоповеденческие симптомы</p>
            <Select
              mode='multiple'
              value={psychoSymptoms}
              onChange={handleSavePsychoSymptoms}
              style={{ width: '100%' }}
            >
              {formPsySymps.map(psySymptom => (
                <Select.Option key={psySymptom.psycho_symptom_id} value={psySymptom.psy_symptom_id}>{psySymptom.description}</Select.Option>
              ))}
            </Select>
            
            <Button onClick={handleNextStep}>Далее</Button>
            <Button onClick={handlePreviousStep}>Назад</Button>
          
        </div>
      )}
      {step === 5 && (
        <div style={containerFlex}>
          <label style={text}>Мысли, которые вызвали паническую атаку:</label>
            <TextArea value={triggeringThoughts} onChange={handleSaveTriggeringThoughts} />
          
          <Button onClick={handleNextStep}>Далее</Button>
            <Button onClick={handlePreviousStep}>Назад</Button>
        </div>
      )}
      {step === 6 && (
        <div style={containerFlex}>
          <label style={text}>Выберите подходящие совладающие карточки для мыслей, вызвавших паническую атаку:</label>
            <p>{triggeringThoughts}</p>
            {cards.map(card => (
                <Col key={card.card_id} xs={24} lg={24}>
                <Card
                    style={cardStyle} 
                    title={<span style={{ color: 'grey' }}> Карточка #{card.card_id} ({card.type === 0 ? "cтандартная" : "пользовательская"}) </span>}
                    actions={[
                        <Checkbox onChange={(e) => handleCheckboxChange(e, card.card_id)} checked={copingCards.includes(card.card_id)}></Checkbox> // Добавляем чекбокс для выбора карточки
                    ]}
                >
                    <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={card.content} />
                </Card>
                </Col>
            ))}
            {userCards.map(card => (
                <Col key={card.card_id} xs={24} lg={24}>
                    <Card
                    style={cardStyle} 
                    title={<span style={{ color: 'grey' }}> Карточка #{card.card_id} ({card.type === 0 ? "cтандартная" : "пользовательская"}) </span>}
                    actions={[
                        <Checkbox onChange={(e) => handleCheckboxChange(e, card.card_id)} checked={copingCards.includes(card.card_id)}></Checkbox> // Добавляем чекбокс для выбора карточки
                    ]}
                    >
                    <Meta style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.5em' }} description={card.content} />
                    </Card>
                </Col>
            ))}
          <Button onClick={handleSavePanicAttack}>Сохранить запись</Button>
          <Button onClick={handlePreviousStep}>Назад</Button>
        </div>
      )}
      </div>
    </div>
    </div>
  );
};

export default EditPanicAttack;
