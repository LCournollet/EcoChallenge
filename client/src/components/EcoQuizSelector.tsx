// src/components/EcoQuizSelector.tsx
import React, { useState } from "react";
import EcoQuiz from "./EcoQuiz";

const EcoQuizSelector: React.FC = () => {
    const [level, setLevel] = useState<"1" | "2" | "3" | null>(null);
  
    if (level) {
      return <EcoQuiz level={level} onRestart={() => setLevel(null)} />;
    }
  
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Choisis ta difficulté 🌱</h2>
        <div className="flex justify-center gap-6">
          <button onClick={() => setLevel("1")} className="bg-green-500 text-white px-4 py-2 rounded">Facile</button>
          <button onClick={() => setLevel("2")} className="bg-yellow-500 text-white px-4 py-2 rounded">Intermédiaire</button>
          <button onClick={() => setLevel("3")} className="bg-red-500 text-white px-4 py-2 rounded">Difficile</button>
        </div>
      </div>
    );
  };
export default EcoQuizSelector;
