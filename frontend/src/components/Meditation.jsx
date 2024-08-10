import React, { useState, useEffect } from 'react';
import { Typography, Modal } from 'antd';
import { Link } from 'react-router-dom'; 
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const Meditation = () => {
  const [phrases, setPhrases] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [modalVisible, setModalVisible] = useState(true); 
  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        const res = await axios.get('/meditation');
        setPhrases(res.data);
      } catch (err) {
        console.log("Ошибка", err);
      }
    };    
    fetchPhrases();
  }, []);

  useEffect(() => {
    // Медитация начинается только после закрытия модального окна с инстуркциями
    if (!modalVisible) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      }, 5000); // Задержка между сменой фраз для медитации

      return () => clearInterval(interval);
    }
  }, [modalVisible, phrases]);

  useEffect(() => {
    if (!modalVisible) {
      setTimeout(() => {
        setBreathScale(2.5);
      }, 0); 

      const breathInterval = setInterval(() => {
        setBreathScale((prevScale) => (prevScale === 1 ? 2.5 : 1));
      }, 5000); // Задержка между изменением масштаба (имитация вдоха-выдоха)

      return () => clearInterval(breathInterval);
    }
  }, [modalVisible]);

  // Функция озвучивания
  const playPhrase = (phrase) => {
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'ru-RU'; 
    utterance.rate = 0.7; 
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!modalVisible) {
      playPhrase(phrases[currentPhraseIndex]?.phrase);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentPhraseIndex, phrases, modalVisible]);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <Link to="/" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}> 
        <LeftOutlined style={{ marginBottom: '20px', color: 'grey' }}/> 
        <Paragraph style={{ fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.2em', fontWeight: '200' }}>Вернуться</Paragraph>
      </Link>
      <Modal
        title="Инструкции к медитации"
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Paragraph>Отлично, вы решили помедитировать! <br />
        Займите удобное пололжение и расслабьтесь.  <br />
        На экране будут появляться инструкции - следуйте им. Также инструкции дублируются в аудиоформате, так что можете закрыть глаза. <br />
        Наблюдайте за голубым шариком и дышите  «вместе с ним»: делайте вдох, когда шарик увеличивается, и выдыхайте, когда он уменьшается. Дыхание - ключ к расслаблению.
        <br />Приятной вам медитации!
        </Paragraph>
      </Modal>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} >
        <div className="meditation-title" style={{ height: '10vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Title level={3} className="phrases" style={{textAlign: 'center', fontFamily: 'Roboto, sans-serif', color: 'grey', fontSize: '1.4em', fontWeight: '300' }}>{phrases[currentPhraseIndex]?.phrase}</Title>
        </div>
            
        <div className="breath-circle" 
          style={{ backgroundColor: 'rgb(223, 252, 252)', 
            borderRadius: '50%', 
            width: '20vw',
            height: '20vw',
            marginTop: '120px',
            maxWidth: '100px',
            maxHeight: '100px',
            transform: `scale(${breathScale})`,
            transition: 'transform 5s ease-in-out',
            boxShadow: '0 0 10px 5px rgba(171, 223, 255, 0.8)'}}>
        </div>
      </div>
    </div>
  );
};

export default Meditation;
 