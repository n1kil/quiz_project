import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  
useEffect(() => {
  const loadQuiz = async () => {
    try {
      const token = localStorage.getItem('token');

      // 1️⃣ Сначала проверяем — проходил ли пользователь
      const resultResponse = await fetch(
        `http://localhost:8000/api/quiz/survey/${id}/results/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (resultResponse.ok) {
        const resultData = await resultResponse.json();

        if (resultData.length > 0) {
          // 🔥 Уже проходил — сразу редиректим
          navigate(`/quiz/survey/${resultData[0].id}/results/`);
          return;
        }
      }

      // 2️⃣ Если НЕ проходил — загружаем викторину
      const quizResponse = await fetch(
        `http://localhost:8000/api/surveys/${id}/`
      );

      if (!quizResponse.ok) {
        throw new Error("Ошибка загрузки викторины");
      }

      const quizData = await quizResponse.json();
      setQuiz(quizData);

      const initialAnswers = {};
      quizData.questions?.forEach(q => {
        initialAnswers[q.id] = null;
      });

      setAnswers(initialAnswers);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  loadQuiz();
}, [id, navigate]);

  
  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  
  const allQuestionsAnswered = () => {
    if (!quiz || !quiz.questions) return false;
    return quiz.questions.every(question => answers[question.id] !== null);
  };

  
  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!allQuestionsAnswered()) {
    setSubmitError('Пожалуйста, ответьте на все вопросы');
    return;
  }

  setSubmitting(true);
  setSubmitError('');

  try {
    
    const answersData = quiz.questions.map(question => ({
      question_id: question.id,
      answer_id: answers[question.id]
    }));

    const requestData = {
      survey_id: parseInt(id),
      answers: answersData
    };

    console.log('Отправляемые данные:', JSON.stringify(requestData, null, 2));

    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      setSubmitError('Требуется авторизация! Пожалуйста, войдите в систему.');
      setSubmitting(false);
      return;
    }

    console.log('Auth Token:', authToken ? 'Есть' : 'Нет');

   
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    console.log('Заголовки запроса:', headers);

    
    const response = await fetch('http://localhost:8000/api/quiz/submit/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });

    console.log('Статус ответа:', response.status, response.statusText);

    
    const responseText = await response.text();
    console.log('Текст ответа:', responseText.substring(0, 500));

    if (!response.ok) {
      
      if (response.status === 401) {
        
        localStorage.removeItem('user');
        setSubmitError('Сессия истекла. Пожалуйста, войдите снова.');
        
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    // Парсим JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Ошибка парсинга:', parseError);
      throw new Error('Неверный ответ от сервера');
    }

    console.log('Успешный ответ:', responseData);
    
    // Обработка успешного ответа
    if (responseData.result && responseData.result.id) {
  // Исправленный путь
  navigate(`/quiz/survey/${responseData.result.survey}/results/`);
} else {
      setSubmitError(`✅ Викторина завершена! Результат: ${responseData.score || 0} из ${quiz.questions.length}`);
      setTimeout(() => navigate('/'), 3000); // Перенаправление на главную страницу
    }

  } catch (err) {
    console.error('Ошибка при отправке:', err);
    setSubmitError(err.message || 'Ошибка подключения к серверу');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Загрузка викторины...</h2>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '20px' }}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <Header />
        <div style={{ padding: '20px' }}>
          <h2>Викторина не найдена</h2>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
          <div>
            <small>Автор: {quiz.author_name || 'Аноним'}</small>
            <small style={{ marginLeft: '20px' }}>
              Вопросов: {quiz.questions?.length || 0}
            </small>
          </div>
        </div>

        {submitError && (
          <div style={{ 
            backgroundColor: submitError.includes('✅') ? '#e8f5e9' : '#ffebee', 
            color: submitError.includes('✅') ? '#2e7d32' : '#c62828', 
            padding: '15px', 
            marginBottom: '20px',
            borderRadius: '4px',
            border: `1px solid ${submitError.includes('✅') ? '#c8e6c9' : '#ffcdd2'}`
          }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {quiz.questions?.map((question, index) => (
            <div key={question.id} style={{ 
              marginBottom: '30px',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0 }}>
                Вопрос {index + 1}: {question.question_text}
              </h3>
              
              <div>
                {question.answers?.map(answer => (
                  <div key={answer.id} style={{ marginBottom: '10px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '4px',
                      backgroundColor: answers[question.id] === answer.id ? '#e3f2fd' : 'white',
                      border: `1px solid ${answers[question.id] === answer.id ? '#2196f3' : '#ddd'}`
                    }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={answer.id}
                        checked={answers[question.id] === answer.id}
                        onChange={() => handleAnswerSelect(question.id, answer.id)}
                        disabled={submitting}
                        style={{ marginRight: '10px' }}
                      />
                      {answer.answer_text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={submitting || !allQuestionsAnswered()}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: submitting || !allQuestionsAnswered() ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting || !allQuestionsAnswered() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {submitting ? 'Отправка...' : 'Отправить ответы'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/')}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: submitting ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              Отмена
            </button>
          </div>

          <div style={{ marginTop: '20px', color: '#666' }}>
            Отвечено: {Object.values(answers).filter(a => a !== null).length} из {quiz.questions?.length || 0} вопросов
            {!allQuestionsAnswered() && (
              <div style={{ color: '#f44336', marginTop: '5px' }}>
                ❌ Ответьте на все вопросы для отправки
              </div>
            )}
          </div>
        </form>

        {(!quiz.questions || quiz.questions.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>В этой викторине пока нет вопросов.</p>
            <button onClick={() => navigate('/')}>На главную</button>
          </div>
        )}
      </div>
    </>
  );
}

export default TakeQuiz;