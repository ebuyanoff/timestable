'use client'
import React, { useState, useEffect } from 'react';

const translations = {
  "en": { from: "From:", to: "To:", first: "Multiplier:", seriously: "No questions from {0} to {1}.", next: "Next 👉", answer: "Answer 👆" },
  "ru": { from: "От:", to: "До:", first: "Множитель:", seriously: "Не нашёл примеры от {0} и до {1}.", next: "Дальше 👉", answer: "Ответь 👆" },
};

type language = keyof typeof translations
type key  = keyof typeof translations['en'] 

type Question = {message?: string, a?: number, b?: number, options?: number[]}

function Calculator({ initialLang, defaultStart, defaultEnd, defaultMultipliers }: { defaultStart?: number, defaultEnd?: number, defaultMultipliers?: number[] , initialLang: language }) {
  const [start, setStart] = useState(defaultStart ?? 1);
  const [end, setEnd] = useState(defaultEnd ?? 10);
  const [question, setQuestion] = useState<Question>();
  const [showNext, setShowNext] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number>();
  const [correctAnswer, setCorrectAnswer] = useState<number>();
  const [multipliers, setMultipliers] = useState(defaultMultipliers ?? []);

  const multipliersText = multipliers.join(',')

  const t = (key: key) => {
    return translations[initialLang][key] || key;
  }

  useEffect(() => {
    generateTest();
  }, [start, end, multipliers]);

  const optionsSize = 8;

  const generateTest = () => {
    if (start >= end) {
      setQuestion({
        message: t('seriously').replace('{0}', `${start}`).replace('{1}', `${end}`)
      });
      return;
    }

    const a = multipliers.length === 0 ? Math.floor(Math.random() * (end - start + 1)) + start : multipliers[Math.floor(Math.random()*multipliers.length)];
    const b = Math.floor(Math.random() * (end - start + 1)) + start;
    const answer = a * b;
    const options = [answer];

    // определение максимального значения для option
    const greatestMultiplier = multipliers.length !== 0 ? Math.max.apply(Math, multipliers) : end
    const maxOptionValue = end * greatestMultiplier;

    while (options.length < optionsSize) {
      const option = Math.floor(Math.random() * (maxOptionValue - start * start + 1)) + start * start;
      if (!options.includes(option) && option !== answer) {
        options.push(option);
      }
    }
    options.sort(() => Math.random() - 0.5);
    setQuestion({ a, b, options });
    setCorrectAnswer(answer);
    setSelectedAnswer(undefined);
    setShowNext(false);
  };


  const checkAnswer = (chosen: number) => {
    setSelectedAnswer(chosen);
    setShowNext(true);
  };

  const changeMutipliers = (text: string) => {
    const multipliers = text.split(',').map((t)=> parseInt(t)).filter((i) => !isNaN(i))
    const hasInvalid = multipliers.some((i) => i <= 0)
    if (hasInvalid) {
       setQuestion({
        message: "Поправьте настройти теста"
      })
    } else {
      setMultipliers(multipliers)
    }
  }

  return (
    <div className="flexquize">
      <div id="flexquizetop">
        <label htmlFor="start">{t('from')}</label>
        <input type="number" id="start" value={start} onChange={e => setStart(Number(e.target.value))} />
        <label htmlFor="end">{t('to')}</label>
        <input type="number" id="end" value={end} onChange={e => setEnd(Number(e.target.value))} />
        <label htmlFor="end">{t('first')}</label>
        <input id='mutiplier' type='text' defaultValue={multipliersText} onChange={(e) => changeMutipliers(e.target.value)}/>
      </div>

      <div id="test">
        {question?.message ? (
          <div className='alertmultinfo'>{question.message}</div>
        ) : (
          <div className='primer'>
            <div className='primertitle'>{question?.a} × {question?.b} = </div>
            <div className='primeroptions'>
              {
                question?.options && question?.options.map(option => {
                let className = 'primeroption';

                if (selectedAnswer) {
                  if (option === correctAnswer) {
                    className += ' correct';
                  } else if (option === selectedAnswer) {
                    className += ' incorrect';
                  }
                }

                return (
                  <div
                    className={className}
                    onClick={() => checkAnswer(option)}
                    key={option}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {showNext ?
        <div className="ifoflex" id="nextone" onClick={generateTest}>{t('next')}</div>
        : <div className="ifoflex" id="chooseone">{t('answer')}</div>
      }
    </div>
  );
}

export default Calculator;
