import { useEffect, useState } from 'react';

const translations = {
  "en": { from: "From:", to: "To:", first: "Multiplier:", seriously: "No questions from {0} to {1}.", next: "Next 👉", answer: "Answer 👆" },
  "ru": { from: "От:", to: "До:", first: "Множитель:", seriously: "Не нашёл примеры от {0} и до {1}.", next: "Дальше 👉", answer: "Ответь 👆" },
};

function Calculator({ initialLang, defaultStart, defaultEnd, defaultMultipliers }) {
  const [start, setStart] = useState(defaultStart ?? 1);
  const [end, setEnd] = useState(defaultEnd ?? 10);
  const [question, setQuestion] = useState();
  const [showNext, setShowNext] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState();
  const [correctAnswer, setCorrectAnswer] = useState();
  const [multipliers, setMultipliers] = useState(defaultMultipliers ?? []);

  const multipliersText = multipliers.join(',');

  const t = (key) => {
    return translations[initialLang][key] || key;
  };
  

  useEffect(() => {
    generateTest();
  }, [start, end, multipliers]);

  const optionsSize = 8;

  const generateTest = () => {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end) {
      setQuestion({
        message: t('seriously').replace('{0}', `${start}`).replace('{1}', `${end}`)
      });
      return;
    }

    const a = multipliers.length === 0 ? Math.floor(Math.random() * (end - start + 1)) + start : multipliers[Math.floor(Math.random() * multipliers.length)];
    const b = Math.floor(Math.random() * (end - start + 1)) + start;
    const answer = a * b;
    const options = new Set([answer]);

    const greatestMultiplier = multipliers.length !== 0 ? Math.max(...multipliers) : end;
    const minOptionValue = Math.max(1, Math.min(start * start, answer));
    const maxOptionValue = Math.max(minOptionValue, end * greatestMultiplier, answer);

    let attempts = 0;
    while (options.size < optionsSize && attempts < 100) {
      const option = Math.floor(Math.random() * (maxOptionValue - minOptionValue + 1)) + minOptionValue;
      options.add(option);
      attempts += 1;
    }

    let offset = 1;
    while (options.size < optionsSize) {
      options.add(answer + offset);
      offset += 1;
    }

    const shuffledOptions = [...options]
      .map(option => ({ option, order: Math.random() }))
      .sort((left, right) => left.order - right.order)
      .map(({ option }) => option);

    setQuestion({ a, b, options: shuffledOptions });
    setCorrectAnswer(answer);
    setSelectedAnswer(undefined);
    setShowNext(false);
  };

  const checkAnswer = (chosen) => {
    setSelectedAnswer(chosen);
    setShowNext(true);
  };

  const changeMultipliers = (text) => {
    const multipliers = text.split(/[,;\s]+/).map(value => Number.parseInt(value, 10)).filter(Number.isFinite);
    const hasInvalid = multipliers.some(i => i <= 0);
    if (hasInvalid) {
      setQuestion({
        message: "Поправьте настройки теста"
      });
    } else {
      setMultipliers(multipliers);
    }
  };

  const selectZeroValue = (event) => {
    if (Number(event.currentTarget.value) === 0) {
      event.currentTarget.select();
    }
  };

  const replaceZeroValue = (event, setter) => {
    if (Number(event.currentTarget.value) === 0 && /^\d$/.test(event.key)) {
      event.preventDefault();
      setter(Number(event.key));
    }
  };

  return (
    <div className="flexquize">
      <div id="flexquizetop">
        <label htmlFor="start">{t('from')}</label>
        <input
          type="number"
          inputMode="numeric"
          id="start"
          min="1"
          step="1"
          value={start}
          onChange={event => setStart(Number(event.target.value))}
          onKeyDown={event => replaceZeroValue(event, setStart)}
          onFocus={selectZeroValue}
          onClick={selectZeroValue}
        />
        <label htmlFor="end">{t('to')}</label>
        <input
          type="number"
          inputMode="numeric"
          id="end"
          min="1"
          step="1"
          value={end}
          onChange={event => setEnd(Number(event.target.value))}
          onKeyDown={event => replaceZeroValue(event, setEnd)}
          onFocus={selectZeroValue}
          onClick={selectZeroValue}
        />
        <label htmlFor="multiplier">{t('first')}</label>
        <input
          id="multiplier"
          type="text"
          inputMode="numeric"
          defaultValue={multipliersText}
          onChange={event => changeMultipliers(event.target.value)}
        />
      </div>

      <div className="flexquizetest">
        {question?.message ? (
          <div className='alertmultinfo'>{question.message}</div>
        ) : (
          <div className='primer'>
            <div className='primertitle' aria-live="polite">{question?.a} × {question?.b} = </div>
            <div className='primeroptions'>
              {question?.options && question.options.map(option => {
                let className = 'primeroption';
                if (selectedAnswer !== undefined) {
                  if (option === correctAnswer) {
                    className += ' correct';
                  } else if (option === selectedAnswer) {
                    className += ' incorrect';
                  }
                }
                return (
                  <button
                    type="button"
                    className={className}
                    onClick={() => checkAnswer(option)}
                    disabled={selectedAnswer !== undefined}
                    key={option}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {showNext ?
        <button type="button" className="ifoflex" id="nextone" onClick={generateTest}>{t('next')}</button>
        : <div className="ifoflex" id="chooseone" aria-live="polite">{t('answer')}</div>
      }
    </div>
  );
}

export default Calculator;
