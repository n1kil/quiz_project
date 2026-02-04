import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Это главная страница</h1>
        <h2>Скоро здесь будут виден топ результатов прохождения викторин</h2>
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    marginTop: '30px',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '20px 0',
  },
  info: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
  },
  list: {
    lineHeight: '1.8',
  },
};

export default Home;