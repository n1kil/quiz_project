import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function AllQuizzes() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/surveys/')
      .then(response => response.json())
      .then(data => {
        setSurveys(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка:', error);
        setError('Ошибка загрузки викторин');
        setLoading(false);
      });
  }, []);

  // Функция для проверки, прошел ли пользователь викторину
  const checkIfCompleted = async (surveyId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/quiz/survey/${surveyId}/results/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении результатов');
      }

      const data = await response.json();

      if (data.length > 0) {
        // Если результаты есть, перенаправляем на страницу с результатами
        navigate(`/quiz/survey/${surveyId}/results`);
      } else {
        // Если результатов нет, перенаправляем на страницу викторины
        navigate(`/quiz/${surveyId}`);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Ошибка при проверке прохождения викторины');
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Доступные викторины</h1>

        {loading ? (
          <p>Загрузка...</p>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : surveys.length === 0 ? (
          <div style={styles.empty}>
            <h3>Нет доступных викторин</h3>
            <p>Создайте первую викторину!</p>
          </div>
        ) : (
          <div style={styles.surveyGrid}>
            {surveys.map(survey => (
              <div key={survey.id} style={styles.card}>
                <h3>{survey.title}</h3>
                <p>{survey.description}</p>
                <div style={styles.meta}>
                  <span>Автор: {survey.author_name || 'Аноним'}</span>
                  <span>Вопросов: {survey.questions?.length || 0}</span>
                </div>
                <button
                  onClick={() => checkIfCompleted(survey.id)}
                  style={styles.button}
                >
                  {survey.is_completed ? 'Посмотреть результаты' : 'Пройти викторину'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
  },
  surveyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '15px 0',
    color: '#666',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
  },
};

export default AllQuizzes;
