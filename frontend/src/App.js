import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './style/App.css';
import Register from './components/Register';
import Login from './components/Login';
import CustomMenu from './components/CustomMenu';
import TheoryChapter from './components/TheoryChapters';
import Theory from './components/Theory';
import EditTheoryChapter from './components/EditTheoryChapter';
import EditTheoryContent from './components/EditTheoryContent';
import Cards from './components/Cards';
import EditCard from './components/EditCard';
import Diary from './components/Diary';
import MoodDiary from './components/MoodDiary';
import EditMood from './components/EditMood';
import MoodStatistics from './components/MoodStatistics';
import PanicAttackDiary from './components/PanicAttackDiary'
import EditPanicAttack from './components/EditPanicAttack'
import PanicAttackStatistics from './components/PanicAttackStatistics';
import PanicAttackInfo from './components/PanicAttackInfo';
import Meditation from './components/Meditation';
import HelpBtn from './components/HelpBtn';
import Users from './components/Users';
import EditUser from './components/EditUser';

function App() {
   
  const blocks = [
    {id: 1, name: 'Теория', url: '/theory'},
    {id: 2, name: 'Мои наблюдения', url: '/observations'},
    {id: 3, name: 'Карточки', url: '/cards'},
    {id: 4, name: 'Медитация', url: '/meditation'},
  ];

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomMenu items={blocks}/>}/>
          <Route path="/theory" element={<TheoryChapter/>}/>
          <Route path="/theory/:theoryId" element={<Theory />} />
          <Route path="/cards" element={<Cards/>}/>
          <Route path="cards/edit/:card_id" element={<EditCard/>}/>
          <Route path="cards/add" element={<EditCard/>}/>
          <Route path="/observations" element={<Diary/>}/>
          <Route path="/mood-diary" element={<MoodDiary/>}/>
          <Route path="/mood-add" element={<EditMood/>}/>
          <Route path="/mood-statistics" element={<MoodStatistics/>}/>
          <Route path="/panic-diary" element={<PanicAttackDiary/>}/>
          <Route path="/panic-add" element={<EditPanicAttack/>}/>
          <Route path="/panic-statistics" element={<PanicAttackStatistics/>}/>
          <Route path="/pa/info/:pa_id" element={<PanicAttackInfo/>}/>
          <Route path="/meditation" element={<Meditation/>}/>
          <Route path="/help" element={<HelpBtn/>}/>

          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>

          <Route path="/theory-chapter/edit/:chapter_id" element={<EditTheoryChapter/>}/>
          <Route path="/theory-chapter/add" element={<EditTheoryChapter/>}/>
          <Route path="/theory-content/edit/:theory_content_id" element={<EditTheoryContent/>}/>
          <Route path="/theory-content/add" element={<EditTheoryContent/>}/>
          <Route path="/standart-card/edit/:card_id" element={<EditCard/>}/>
          <Route path="/standart-card/add" element={<EditCard/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/users/edit" element={<EditUser/>}/>
          <Route path="/users/edit/:user_id" element={<EditUser/>}/>
  
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;