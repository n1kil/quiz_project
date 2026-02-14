// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AllQuizzes from './pages/AllQuizzes';
import Login from './pages/Login';
import Register from './pages/Register';
import TakeQuiz from './pages/TakeQuiz';
import CreateQuiz from './pages/CreateQuiz';
import QuizResult from './pages/QuizResult';  
import Profile from './pages/Profile';

function HomePage() {
  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quizzes" element={<AllQuizzes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz/:id" element={<TakeQuiz />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/survey/:surveyId/results" element={<QuizResult />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;