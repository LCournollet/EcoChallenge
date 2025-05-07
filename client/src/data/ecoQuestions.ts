
export interface Question {
  question: string;
  image?: string;
  choices: string[];
  answer: string;
}

export const questionsByLevel: Record<"1" | "2" | "3", Question[]> = {
  "1": [
    {
      question: "Quel déchet met 450 ans à se dégrader ?",
      choices: ["Papier", "Verre", "Plastique", "Carton"],
      answer: "Plastique",
      image: "https://cdn.pixabay.com/photo/2020/03/11/13/45/plastic-4927277_960_720.jpg"
    },
    {
      question: "Quelle couleur correspond à la poubelle du tri en France ?",
      choices: ["Bleue", "Jaune", "Verte", "Rouge"],
      answer: "Jaune"
    },
    {
      question: "Quelle est une énergie renouvelable ?",
      choices: ["Charbon", "Gaz", "Éolien", "Pétrole"],
      answer: "Éolien"
    },
    {
      question: "Quelle action est la plus écologique ?",
      choices: ["Acheter neuf", "Réutiliser", "Jeter", "Incinerer"],
      answer: "Réutiliser"
    },
    {
      question: "Quel animal est menacé par la pollution plastique ?",
      choices: ["Chien", "Ours", "Tortue marine", "Pigeon"],
      answer: "Tortue marine"
    },
    {
      question: "Quelle ressource est précieuse et doit être économisée ?",
      choices: ["L'eau", "Le sable", "Le fer", "L'argent"],
      answer: "L'eau"
    },
    {
      question: "Quel est le bon geste pour économiser l'eau ?",
      choices: ["Laisser couler", "Prendre un bain", "Réparer les fuites", "Arroser à midi"],
      answer: "Réparer les fuites"
    },
    {
      question: "Que peut-on recycler ?",
      choices: ["Bouteille plastique", "Peau de banane", "Stylo usé", "Cendrier"],
      answer: "Bouteille plastique"
    },
    {
      question: "Quel est un produit compostable ?",
      choices: ["Boîte de conserve", "Épluchure de carotte", "Bouteille", "Pile"],
      answer: "Épluchure de carotte"
    },
    {
      question: "Quel est un bon moyen de transport écologique ?",
      choices: ["Avion", "Voiture diesel", "Vélo", "Scooter thermique"],
      answer: "Vélo"
    }
  ],
  "2": [
    {
      question: "Que signifie GES ?",
      choices: ["Gaz à effet de serre", "Gestion environnementale simplifiée", "Groupe écologique solidaire", "Gaz éolien simple"],
      answer: "Gaz à effet de serre"
    },
    {
      question: "Quel gaz est le plus impliqué dans l'effet de serre ?",
      choices: ["H2O", "CO2", "O2", "CH4"],
      answer: "CO2"
    },
    {
      question: "Combien de litres d'eau faut-il pour produire un jean ?",
      choices: ["100", "1 000", "7 000", "10 000"],
      answer: "7 000"
    },
    {
      question: "Quel est le principal composant des déchets ménagers ?",
      choices: ["Verre", "Organique", "Métal", "Textile"],
      answer: "Organique"
    },
    {
      question: "Quel label garantit un produit issu de l'agriculture biologique ?",
      choices: ["AB", "FSC", "CE", "NF"],
      answer: "AB"
    },
    {
      question: "Quel appareil consomme le plus d'électricité ?",
      choices: ["Télévision", "Ordinateur", "Réfrigérateur", "Chargeur de téléphone"],
      answer: "Réfrigérateur"
    },
    {
      question: "Quel continent est le plus touché par la déforestation ?",
      choices: ["Asie", "Europe", "Amérique du Sud", "Australie"],
      answer: "Amérique du Sud"
    },
    {
      question: "Qu’est-ce qu’une énergie fossile ?",
      choices: ["Renouvelable", "Solaire", "Non renouvelable", "Hydraulique"],
      answer: "Non renouvelable"
    },
    {
      question: "Quelle est la durée de vie moyenne d'une pile jetable ?",
      choices: ["Quelques heures", "Quelques jours", "Quelques semaines", "Quelques mois"],
      answer: "Quelques semaines"
    },
    {
      question: "Quelle action réduit les émissions de GES ?",
      choices: ["Manger local", "Prendre l'avion", "Utiliser la climatisation", "Acheter neuf"],
      answer: "Manger local"
    }
  ],
  "3": [
    {
      question: "Quel est le principal gaz agricole lié au réchauffement ?",
      choices: ["CO2", "CH4", "O2", "N2"],
      answer: "CH4"
    },
    {
      question: "Quelle certification garantit une gestion durable des forêts ?",
      choices: ["AB", "FSC", "BIO", "ECOCERT"],
      answer: "FSC"
    },
    {
      question: "Quel secteur émet le plus de GES en France ?",
      choices: ["Agriculture", "Transport", "Industrie", "Bâtiment"],
      answer: "Transport"
    },
    {
      question: "Quel est l’impact du méthane sur l’effet de serre comparé au CO2 ?",
      choices: ["Aucun", "x2", "x10", "x25"],
      answer: "x25"
    },
    {
      question: "Quel métal est le plus recyclé au monde ?",
      choices: ["Cuivre", "Fer", "Aluminium", "Or"],
      answer: "Fer"
    },
    {
      question: "Quel est un des effets de la surpêche ?",
      choices: ["Plus de poissons", "Moins de plastique", "Déséquilibre des écosystèmes", "Augmentation des algues"],
      answer: "Déséquilibre des écosystèmes"
    },
    {
      question: "Quelle source d’énergie a le plus faible impact carbone ?",
      choices: ["Nucléaire", "Gaz", "Charbon", "Solaire"],
      answer: "Solaire"
    },
    {
      question: "Que signifie le sigle IPCC ?",
      choices: ["Institut de Protection du Climat", "Groupe d’experts intergouvernemental sur l’évolution du climat", "Programme Climat ONU", "Intercontinental Panel for Climate Change"],
      answer: "Groupe d’experts intergouvernemental sur l’évolution du climat"
    },
    {
      question: "Quelle action domestique permet le plus d’économies d’énergie ?",
      choices: ["Éteindre les lumières", "Baisser le chauffage", "Prendre des douches froides", "Débrancher le grille-pain"],
      answer: "Baisser le chauffage"
    },
    {
      question: "Quel est le principal défi des énergies renouvelables ?",
      choices: ["Le coût", "L’intermittence", "La pollution", "La rareté"],
      answer: "L’intermittence"
    }
  ]
};
