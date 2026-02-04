import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const isAuthenticated = !!localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Пользователь';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        
        <Link to="/" style={styles.logo}>
          <h1 style={styles.logoText}>QuizPlatform</h1>
        </Link>

        
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>
            На главную
          </Link>
          
          <Link to="/quizzes" style={styles.navLink}>
            Все викторины
          </Link>
          
          {isAuthenticated && (
            <Link to="/create-quiz" style={styles.navLink}>
              Создать викторину
            </Link>
          )}
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.navLink}>
                Авторизация
              </Link>
              
              <Link to="/register" style={styles.registerLink}>
                Регистрация
              </Link>
            </>
          ) : (
            <div style={styles.profile}>
              <span style={styles.username}>👤 {username}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Выйти
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    padding: '15px 0',
    width: '100%',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  registerLink: {
    backgroundColor: '#3498db',
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  username: {
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Header;