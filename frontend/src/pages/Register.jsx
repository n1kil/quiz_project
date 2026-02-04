import React, { useState } from 'react';
import Header from '../components/Header';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Регистрация успешна! Теперь вы можете войти.');
        
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        if (data.username) {
          setError(`Имя пользователя: ${data.username[0]}`);
        } else if (data.email) {
          setError(`Email: ${data.email[0]}`);
        } else if (data.password) {
          setError(`Пароль: ${data.password[0]}`);
        } else {
          setError(data.error || 'Ошибка регистрации');
        }
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение к серверу.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Регистрация</h2>
          
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div style={styles.success}>
              ✅ {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="username" style={styles.label}>
                Имя пользователя *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="Введите имя пользователя"
                required
                disabled={loading}
                minLength="3"
              />
              <small style={styles.helpText}>
                От 3 до 30 символов, только буквы, цифры и @/./+/-/_
              </small>
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email адрес *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="example@mail.com"
                required
                disabled={loading}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Пароль *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Минимум 6 символов"
                required
                disabled={loading}
                minLength="6"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Подтвердите пароль *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Повторите пароль"
                required
                disabled={loading}
                minLength="6"
              />
            </div>
            
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                backgroundColor: loading ? '#95a5a6' : '#2ecc71'
              }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div style={styles.links}>
            <p style={styles.linkText}>
              Уже есть аккаунт?{' '}
              <a 
                href="/login" 
                style={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}
              >
                Войти
              </a>
            </p>
            <p style={styles.linkText}>
              <a 
                href="/" 
                style={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
              >
                ← Вернуться на главную
              </a>
            </p>
          </div>
          
          <div style={styles.terms}>
            <small style={styles.termsText}>
              Нажимая "Зарегистрироваться", вы соглашаетесь с нашими условиями использования и политикой конфиденциальности.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '25px',
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#ffeaea',
    color: '#e74c3c',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #e74c3c',
  },
  success: {
    backgroundColor: '#e8f6ef',
    color: '#27ae60',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #27ae60',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#34495e',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    transition: 'all 0.3s',
    backgroundColor: '#fcfcfc',
  },
  helpText: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px',
  },
  submitButton: {
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s',
  },
  links: {
    marginTop: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  linkText: {
    fontSize: '15px',
    color: '#7f8c8d',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s',
  },
  terms: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  termsText: {
    fontSize: '12px',
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input:focus {
      border-color: #3498db;
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      background-color: white;
    }
    
    input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    
    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
    }
    
    .link:hover {
      color: #2980b9;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

export default Register;