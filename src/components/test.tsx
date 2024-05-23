'use client';
import React, { useEffect, useState } from 'react';

type Question = {
  que: string;
  com: string;
  rig: string;
  wro: string[];
};

type TestProps = {
  questions: Question[];
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const TestComponent: React.FC<TestProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  const question = questions[currentQuestionIndex];
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [question.rig, ...question.wro]
    shuffleArray(shuffled)
    setAnswers(shuffled)
  }, [question])

  const handleAnswerClick = (answer: string) => {
    const correct = answer === question.rig;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsTestCompleted(true);
    }
  };

  const handleRestartTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCorrectAnswersCount(0);
    setIsTestCompleted(false);
  };

  return (
    <div className='flexquize'>
      {!isTestCompleted ? (
        <>
          <div className='flexquizequest'>{question.que}</div>
          <div>
            {answers.map((answer, index) => (
              <button
                className='flexquizanswer'
                key={index}
                style={{
                  backgroundColor: selectedAnswer === answer ? (isCorrect ? 'green' : 'red') : '',
                }}
                onClick={() => handleAnswerClick(answer)}
                disabled={selectedAnswer !== null}
              >
                {answer}
              </button>
            ))}
          </div>
          {selectedAnswer && (
            <>
              <div className='flexquizecomment'>
                <b>{isCorrect ? 'Верно!' : `Неверно. Правильный ответ: ${question.rig}`}</b>. {question.com}
              </div>
              <div className="ifoflex" id="nextone" onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Дальше 👉' : 'Показать результат'}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flexquizecomment">
          Вы ответили верно на {correctAnswersCount} вопросов из {questions.length}.
          <div className="ifoflex" id="restartTest" onClick={handleRestartTest}>
            Пройти заново
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;
