import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { checkAuth } from '../utils/authCheck';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

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
const { Paragraph } = Typography;
const PanicAttackStatistics = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('');
    const [paData, setPAData] = useState([]);
    const [show, setShow] = useState(false);
    const [locations, setLocations] = useState([])
    const [vegSymps, setVegSymps] = useState([])
    const [psySymps, setPsySymps] = useState([])
    
    const fetchPanicAttackData = async (period) => {
        try {
            const authStatus = await checkAuth();
            if (!authStatus.isAuthenticated) {
              navigate('/login');
              message.info("Необходимо снова авторизироваться");
              return;
            }
            const token = localStorage.getItem('token');
            const headers = { Authorization: token };
            const response = await axios.get(`/pa/statistics/${period}`, { headers });
            if (response.status === 204) {
                setPAData([]);   
            }
            else{
                setPAData(response.data);   
            }         
            setPeriod(period)
            setShow(true)
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
                message.info("Необходимо снова авторизироваться");
              } else {
                console.error('Ошибка:', error);
              }
        }
    };

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
            const res = await axios.get('/veg-symps');
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
            const res = await axios.get('/psy-symps');
            setPsySymps(res.data);
    
          } catch (err) {
            console.log("Ошибка", err);
          }
      }
      fetchPsySymps();
    }, []);

    const getPeriodName = (period) =>{
        switch (period) {
            case 'all':
                return 'всё время';
            case 'current_week':
                return 'текущая неделя';
            case 'current_month':
                return 'текущий месяц';

    }}

    return (
        <div>
            <Link to="/panic-diary" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
                <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
                <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
            </Link> 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                <h2>Статистика панических атак</h2>
            </div>
            
            {show ? (
                <div style={container}>
                    {paData.length === 0 ? (
                    <p>Пока нет данных для анализа</p>
                ) : (
                    <>
                <p><strong>Период:</strong> {getPeriodName(period)}</p>    
                <p><strong>Общее количество атак:</strong> {paData.total_attacks}</p>
                <p><strong>Средняя продолжительность:</strong> {paData.avgDuration}</p>
                <p><strong>Средняя тяжесть:</strong> {paData.avgSeverity}</p>
                <p><strong>Место, где панические атаки случались чаще всего:</strong> {locations.find(location => location.location_id === paData.mostCommonLocation.location)?.name}</p>
                
                <p><strong>Наиболее частые вегетативные симптомы:</strong> </p>
                    <ul style={list}>
                        {paData.mostCommonVegSymptoms.map((symptom) => (
                            <li key={symptom.vegetative_symptom_id}>{vegSymps.find(symp => symp.vegetative_symptom_id === symptom.vegetative_symptom_id)?.description} ({symptom.count})</li>
                        ))}
                    </ul>
        
                <p><strong>Наиболее частые психоповеденческие симптомы:</strong> </p>
                    <ul style={list}>
                        {paData.mostCommonPsySymptoms.map((symptom) => (
                            <li key={symptom.psycho_symptom_id}>{psySymps.find(symp => symp.psycho_symptom_id === symptom.psycho_symptom_id)?.description} ({symptom.count})</li>
                        ))}
                    </ul> </>)}   
                </div>
            ) : (<></>)}

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                <Button onClick={() => fetchPanicAttackData('all')}>За всё время</Button>
                <Button onClick={() => fetchPanicAttackData('current_month')}>За текущий месяц</Button>
                <Button onClick={() => fetchPanicAttackData('current_week')}>За эту неделю</Button>
                
            </div>
            
        </div>
    );
};

export default PanicAttackStatistics;
