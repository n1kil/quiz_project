import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Ответ от API:', data); 

      if (response.ok) {
        
        let token = null;
        
        if (data.token) {
          
          token = data.token;
        } else if (data.access) {
         
          token = data.access;
        } else if (data.key) {
          
          token = data.key;
        } else {
         
          token = Object.values(data).find(val => typeof val === 'string' && val.length > 50);
        }
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('username', formData.username);
          
          console.log('Токен сохранен в localStorage:', {
            token: token.substring(0, 20) + '...',
            username: formData.username
          });
          
          
          setTimeout(() => {
            console.log('Проверка localStorage:', {
              token: localStorage.getItem('token'),
              username: localStorage.getItem('username')
            });
          }, 100);
          
          
          navigate('/');
        } else {
          setError('Токен не найден в ответе сервера');
        }
      } else {
        setError(data.detail || data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение к серверу.');
      console.error('Ошибка входа:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Вход в систему</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div style={styles.links}>
            <p>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
            <p>
              <Link to="/">← На главную</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  error: {
    color: 'red',
    backgroundColor: '#ffeaea',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    margin: '20px 0',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  links: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

export default Login;