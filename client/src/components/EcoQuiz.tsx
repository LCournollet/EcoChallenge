// src/components/EcoQuiz.tsx
import React, { useState } from "react";
import { questionsByLevel, Question } from "@/data/ecoQuestions";

const EcoQuiz: React.FC<{ level: "1" | "2" | "3"; onRestart?: () => void }> = ({ level, onRestart }) => {
  const questions: Question[] = questionsByLevel[level];
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (choice: string) => {
    if (choice === questions[current].answer) {
      setScore(score + 1);
    }
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      {!finished ? (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Question {current + 1} / {questions.length}</h3>
          <h2 className="text-xl font-bold mb-3">{questions[current].question}</h2>
          {questions[current].image && (
            <img
              src={questions[current].image}
              alt="illustration"
              className="mb-4 mx-auto rounded max-h-60 object-cover"
            />
          )}
          <div className="grid gap-3">
            {questions[current].choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                className="px-4 py-2 bg-eco-primary text-white rounded hover:bg-green-700"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-2xl font-bold text-green-800 mb-4">🎉 Score final</h3>
          <p className="text-lg">Tu as eu <strong>{score}</strong> / {questions.length}</p>

          {onRestart && (
            <button
              onClick={onRestart}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔁 Rejouer le quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EcoQuiz;
