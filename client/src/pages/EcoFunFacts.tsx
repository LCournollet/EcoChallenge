// src/pages/EcoFunFacts.tsx
import React from "react";

const facts = [
  {
    title: "Le saviez-vous ?",
    content: "Un arbre adulte peut absorber jusqu'à 150 kg de CO₂ par an !",
  },
  {
    title: "Fait amusant",
    content: "Les vers de terre sont de véritables alliés pour le sol, ils peuvent consommer leur poids en terre chaque jour.",
  },
  {
    title: "Impact plastique",
    content: "Chaque minute, l’équivalent d’un camion-poubelle de plastique est déversé dans l’océan.",
  },
  {
    title: "Eau virtuelle",
    content: "Il faut environ 15 000 litres d'eau pour produire 1 kg de bœuf.",
  },
  {
    title: "Papier recyclé",
    content: "Recycler une tonne de papier permet d’économiser 17 arbres et plus de 26 000 litres d’eau.",
  },
  {
    title: "Réchauffement climatique",
    content: "Les 8 dernières années ont été les plus chaudes jamais enregistrées sur Terre.",
  },
];

const EcoFunFacts: React.FC = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        🌿 Anecdotes & Fun Facts Écolos
      </h1>
      <ul className="space-y-6">
        {facts.map((fact, index) => (
          <li key={index} className="bg-white border-l-4 border-green-600 p-4 rounded shadow-sm">
            <h3 className="text-xl font-semibold text-eco-primary mb-1">{fact.title}</h3>
            <p className="text-gray-700">{fact.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EcoFunFacts;
