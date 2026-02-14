import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function QuizResult() {
  const { surveyId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/quiz/survey/${surveyId}/results/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("RESULT DATA:", data);
        if (data.length > 0) {
          setResult(data[0]);
        }
      })
      .catch(err => console.error(err));
  }, [surveyId]);

  if (!result) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <p>Правильных ответов: {result.score}</p>
      <p>Всего вопросов: {result.total_questions}</p>
      <p>Процент: {result.percentage}%</p>
    </div>
  );
}

export default QuizResult;
