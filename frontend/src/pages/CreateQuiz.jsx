import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [
      {
        question_text: '',
        answers: [
          { answer_text: '', correct: true },
          { answer_text: '', correct: false },
          { answer_text: '', correct: false },
          { answer_text: '', correct: false }
        ]
      }
    ]
  });

 
  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleQuestionChange = (questionIndex, e) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].question_text = e.target.value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAnswerChange = (questionIndex, answerIndex, e) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].answers[answerIndex].answer_text = e.target.value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const newQuestions = [...formData.questions];
    
    newQuestions[questionIndex].answers.forEach(answer => {
      answer.correct = false;
    });
    
    newQuestions[questionIndex].answers[answerIndex].correct = true;
    setFormData({ ...formData, questions: newQuestions });
  };

 
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question_text: '',
          answers: [
            { answer_text: '', correct: true },
            { answer_text: '', correct: false },
            { answer_text: '', correct: false },
            { answer_text: '', correct: false }
          ]
        }
      ]
    });
  };

  const removeQuestion = (questionIndex) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, index) => index !== questionIndex);
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const addAnswer = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].answers.push({ answer_text: '', correct: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[questionIndex].answers.length > 2) {
      newQuestions[questionIndex].answers.splice(answerIndex, 1);
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Введите название викторины');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Введите описание викторины');
      setLoading(false);
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.question_text.trim()) {
        setError(`Введите текст вопроса ${i + 1}`);
        setLoading(false);
        return;
      }

      let hasCorrectAnswer = false;
      let hasEmptyAnswer = false;
      
      for (let j = 0; j < question.answers.length; j++) {
        const answer = question.answers[j];
        if (!answer.answer_text.trim()) {
          hasEmptyAnswer = true;
        }
        if (answer.correct) {
          hasCorrectAnswer = true;
        }
      }

      if (hasEmptyAnswer) {
        setError(`Заполните все ответы для вопроса ${i + 1}`);
        setLoading(false);
        return;
      }

      if (!hasCorrectAnswer) {
        setError(`Выберите правильный ответ для вопроса ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const authToken = localStorage.getItem('token');

      if (!authToken) {
        setError('Требуется авторизация для создания викторины');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/surveys/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Ошибка парсинга:', parseError);
        throw new Error('Сервер вернул невалидный ответ');
      }

      if (response.ok) {
        setSuccess('Викторина успешно создана!');
        setFormData({
          title: '',
          description: '',
          questions: [
            {
              question_text: '',
              answers: [
                { answer_text: '', correct: true },
                { answer_text: '', correct: false },
                { answer_text: '', correct: false },
                { answer_text: '', correct: false }
              ]
            }
          ]
        });

        setTimeout(() => {
          navigate('/quizzes');
        }, 2000);
      } else {
        setError(responseData.error || responseData.detail || 'Ошибка при создании викторины');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Создать новую викторину</h1>

        {error && (
          <div style={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={styles.successMessage}>
            ✅ {success}
            <p>Перенаправление на страницу викторин...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Название викторины *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              style={styles.input}
              placeholder="Введите название викторины"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Описание викторины *
            </label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              style={styles.textarea}
              placeholder="Введите описание викторины"
              rows="3"
              disabled={loading}
            />
          </div>
          <div style={styles.questionsSection}>
            <h3>Вопросы</h3>
            <p style={styles.hint}>* Отметьте правильный ответ кликом по кружку</p>

            {formData.questions.map((question, questionIndex) => (
              <div key={questionIndex} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <h4>Вопрос {questionIndex + 1}</h4>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      style={styles.removeButton}
                      disabled={loading}
                    >
                      ✕ Удалить вопрос
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => handleQuestionChange(questionIndex, e)}
                  style={styles.input}
                  placeholder="Введите текст вопроса"
                  disabled={loading}
                />

                <div style={styles.answersSection}>
                  <h5>Ответы:</h5>
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} style={styles.answerRow}>
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={answer.correct}
                        onChange={() => handleCorrectAnswerChange(questionIndex, answerIndex)}
                        style={styles.radio}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={answer.answer_text}
                        onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e)}
                        style={styles.answerInput}
                        placeholder={`Вариант ответа ${answerIndex + 1}`}
                        disabled={loading}
                      />
                      {question.answers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeAnswer(questionIndex, answerIndex)}
                          style={styles.smallRemoveButton}
                          disabled={loading}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {question.answers.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addAnswer(questionIndex)}
                    style={styles.addAnswerButton}
                    disabled={loading}
                  >
                    + Добавить вариант ответа
                  </button>
                )}

                <div style={styles.questionDivider} />
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              style={styles.addQuestionButton}
              disabled={loading}
            >
              + Добавить еще один вопрос
            </button>
          </div>

          <div style={styles.submitButtons}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                backgroundColor: loading ? '#ccc' : '#2ecc71'
              }}
            >
              {loading ? 'Создание...' : 'Создать викторину'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/quizzes')}
              style={styles.cancelButton}
              disabled={loading}
            >
              Отмена
            </button>
          </div>

          <div style={styles.instructions}>
            <h4>Инструкция:</h4>
            <ul>
              <li>Все поля, отмеченные *, обязательны для заполнения</li>
              <li>Минимум 1 вопрос с минимум 2 вариантами ответов</li>
              <li>Для каждого вопроса выберите один правильный ответ</li>
              <li>Максимум 6 вариантов ответов на вопрос</li>
            </ul>
          </div>
        </form>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  form: {
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  questionsSection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  hint: {
    color: '#666',
    fontSize: '14px',
    marginTop: '-10px',
    marginBottom: '20px',
  },
  questionCard: {
    marginBottom: '30px',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  answersSection: {
    marginTop: '15px',
  },
  answerRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '10px',
  },
  radio: {
    marginRight: '5px',
  },
  answerInput: {
    flex: 1,
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  smallRemoveButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAnswerButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
  addQuestionButton: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
    width: '100%',
  },
  questionDivider: {
    height: '1px',
    backgroundColor: '#ddd',
    margin: '20px 0',
  },
  submitButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  instructions: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#e8f4fc',
    borderRadius: '6px',
    fontSize: '14px',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#e74c3c',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#e8f6ef',
    color: '#27ae60',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default CreateQuiz;