import React, { useEffect, useState } from "react";
import Header from "../components/Header";

function Profile() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8000/api/quiz/my-results/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка загрузки результатов");
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  const username = results.length > 0 ? results[0].user_name : "Пользователь";

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = results.reduce(
    (sum, r) => sum + r.total_questions,
    0
  );

  const overallPercentage =
    totalQuestions > 0
      ? ((totalScore / totalQuestions) * 100).toFixed(2)
      : 0;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Личный кабинет</h1>

        <div style={styles.card}>
          <h2>{username}</h2>
          <p>Пройдено викторин: {results.length}</p>
          <p>
            Общий процент правильных ответов:{" "}
            <strong>{overallPercentage}%</strong>
          </p>
          <p>
            Всего правильных ответов: {totalScore} из {totalQuestions}
          </p>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
};

export default Profile;
