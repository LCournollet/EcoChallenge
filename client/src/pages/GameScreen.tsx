// src/pages/GameScreen.tsx
import React from "react";
import EcoMinesweeper from "@/components/EcoMinesweeper";
import EcoQuizSelector from "@/components/EcoQuizSelector";

const GameScreen: React.FC = () => {
  return (
    <section className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        🎮 EcoTeam Challenge
      </h1>

      <div>
        <h2 className="text-2xl font-semibold mb-3 text-eco-primary">🌱 Démineur éco-responsable</h2>
        <EcoMinesweeper />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3 text-eco-primary">🌍 Quiz écologique</h2>
        <EcoQuizSelector />
      </div>
    </section>
  );
};

export default GameScreen;
