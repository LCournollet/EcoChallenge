import { Question } from '@/types';

// 20 environmental quiz questions in French
export const questions: Question[] = [
  {
    id: "q1",
    text: "Quelle est la principale source d'émission de gaz à effet de serre en France ?",
    imageUrl: "https://images.unsplash.com/photo-1532939624-3af1308db9a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "L'agriculture" },
      { text: "Les transports", correct: true, explanation: "En France, le secteur des transports est responsable d'environ 30% des émissions de gaz à effet de serre, principalement à cause de l'utilisation des véhicules personnels et du transport routier de marchandises." },
      { text: "L'industrie" },
      { text: "Le chauffage résidentiel" }
    ]
  },
  {
    id: "q2",
    text: "Quel pourcentage des émissions de CO2 mondiales est absorbé par les océans?",
    imageUrl: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 10%" },
      { text: "Environ 30%", correct: true, explanation: "Les océans absorbent environ 30% du CO2 émis par les activités humaines, ce qui contribue à l'acidification des océans et met en danger de nombreux écosystèmes marins." },
      { text: "Environ 50%" },
      { text: "Environ 70%" }
    ]
  },
  {
    id: "q3",
    text: "Combien de litres d'eau sont nécessaires pour produire un kilo de boeuf ?",
    imageUrl: "https://images.unsplash.com/photo-1551649063-2a7005acb4f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 500 litres" },
      { text: "Environ 1 500 litres" },
      { text: "Environ 5 000 litres" },
      { text: "Environ 15 000 litres", correct: true, explanation: "La production d'un kilo de bœuf nécessite environ 15 000 litres d'eau, ce qui en fait l'un des aliments avec la plus grande empreinte hydrique." }
    ]
  },
  {
    id: "q4",
    text: "Quelle est la durée de décomposition d'un sac plastique dans la nature ?",
    imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 5 ans" },
      { text: "Environ 20 ans" },
      { text: "Environ 100 ans" },
      { text: "Environ 400 ans", correct: true, explanation: "Un sac plastique peut mettre entre 400 et 1000 ans pour se dégrader complètement dans la nature, se fragmentant en microplastiques qui persistent dans l'environnement." }
    ]
  },
  {
    id: "q5",
    text: "Qu'est-ce que l'économie circulaire ?",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Un système économique sans monnaie physique" },
      { text: "Un système économique visant à limiter la consommation de ressources", correct: true, explanation: "L'économie circulaire est un modèle économique qui vise à produire des biens et services de manière durable, en limitant la consommation et le gaspillage de ressources ainsi que la production de déchets." },
      { text: "Un système économique basé sur les crypto-monnaies" },
      { text: "Un système économique favorisant les échanges locaux" }
    ]
  },
  {
    id: "q6",
    text: "Quel pourcentage de la surface terrestre est couvert par des forêts ?",
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 15%" },
      { text: "Environ 30%", correct: true, explanation: "Les forêts couvrent environ 30% de la surface terrestre, soit environ 4 milliards d'hectares, mais ce chiffre diminue en raison de la déforestation." },
      { text: "Environ 45%" },
      { text: "Environ 60%" }
    ]
  },
  {
    id: "q7",
    text: "Quelle est la principale cause de la déforestation en Amazonie ?",
    imageUrl: "https://images.unsplash.com/photo-1517260846501-481185d11ed0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "L'exploitation minière" },
      { text: "La construction de barrages hydroélectriques" },
      { text: "L'élevage de bétail", correct: true, explanation: "L'élevage de bétail est la principale cause de déforestation en Amazonie, avec environ 80% des terres déboisées converties en pâturages." },
      { text: "L'exploitation forestière" }
    ]
  },
  {
    id: "q8",
    text: "Quel est l'animal le plus menacé d'extinction selon la liste rouge de l'UICN ?",
    imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Le rhinocéros de Java", correct: true, explanation: "Le rhinocéros de Java est l'un des mammifères les plus menacés au monde avec moins de 70 individus à l'état sauvage." },
      { text: "Le panda géant" },
      { text: "Le tigre du Bengale" },
      { text: "L'éléphant d'Asie" }
    ]
  },
  {
    id: "q9",
    text: "Quel pays est le premier producteur mondial d'énergie solaire ?",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "États-Unis" },
      { text: "Allemagne" },
      { text: "Chine", correct: true, explanation: "La Chine est le premier producteur mondial d'énergie solaire, avec une capacité installée de plus de 250 GW, soit environ un tiers de la capacité mondiale." },
      { text: "Japon" }
    ]
  },
  {
    id: "q10",
    text: "Quelle est la durée de vie moyenne d'une éolienne ?",
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "10 ans" },
      { text: "20-25 ans", correct: true, explanation: "La durée de vie moyenne d'une éolienne est de 20 à 25 ans, après quoi elle peut être démantelée ou ses composants peuvent être remplacés pour prolonger sa durée de vie." },
      { text: "35-40 ans" },
      { text: "50 ans ou plus" }
    ]
  },
  {
    id: "q11",
    text: "Quel pays a été le premier à interdire les sacs plastiques à usage unique ?",
    imageUrl: "https://images.unsplash.com/photo-1621106093707-ded6a0cb4ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Kenya" },
      { text: "France" },
      { text: "Bangladesh", correct: true, explanation: "Le Bangladesh a été le premier pays à interdire les sacs plastiques à usage unique en 2002, suite à de graves inondations causées en partie par le blocage des systèmes de drainage par ces sacs." },
      { text: "Suède" }
    ]
  },
  {
    id: "q12",
    text: "Quelle quantité de déchets plastiques est déversée dans les océans chaque année ?",
    imageUrl: "https://images.unsplash.com/photo-1626328409885-744dc1e8fc61?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 1 million de tonnes" },
      { text: "Environ 8 millions de tonnes", correct: true, explanation: "Environ 8 millions de tonnes de déchets plastiques sont déversées dans les océans chaque année, soit l'équivalent d'un camion-poubelle déversé en mer chaque minute." },
      { text: "Environ 20 millions de tonnes" },
      { text: "Environ 50 millions de tonnes" }
    ]
  },
  {
    id: "q13",
    text: "Quel gaz a le potentiel de réchauffement global le plus élevé ?",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450e7620370d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Dioxyde de carbone (CO2)" },
      { text: "Méthane (CH4)" },
      { text: "Protoxyde d'azote (N2O)" },
      { text: "Hexafluorure de soufre (SF6)", correct: true, explanation: "L'hexafluorure de soufre (SF6) a un potentiel de réchauffement global environ 23 500 fois supérieur à celui du CO2 sur une période de 100 ans." }
    ]
  },
  {
    id: "q14",
    text: "Quelle est la principale source d'émission de méthane liée aux activités humaines ?",
    imageUrl: "https://images.unsplash.com/photo-1516467717591-282893ba67d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "L'agriculture et l'élevage", correct: true, explanation: "L'agriculture et l'élevage sont la principale source d'émission de méthane liée aux activités humaines, notamment via la fermentation entérique des ruminants et la culture du riz." },
      { text: "L'industrie pétrolière et gazière" },
      { text: "Les décharges" },
      { text: "Les stations d'épuration" }
    ]
  },
  {
    id: "q15",
    text: "Quelle proportion de l'eau douce mondiale est utilisée pour l'agriculture ?",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 30%" },
      { text: "Environ 50%" },
      { text: "Environ 70%", correct: true, explanation: "L'agriculture utilise environ 70% de l'eau douce mondiale, principalement pour l'irrigation des cultures." },
      { text: "Environ 90%" }
    ]
  },
  {
    id: "q16",
    text: "Quel est le temps de décomposition d'une bouteille en verre dans la nature ?",
    imageUrl: "https://images.unsplash.com/photo-1572965733194-784e4b4efa45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Environ 100 ans" },
      { text: "Environ 500 ans" },
      { text: "Environ 1 000 ans" },
      { text: "Environ 4 000 ans ou plus", correct: true, explanation: "Une bouteille en verre peut mettre 4 000 ans ou plus pour se décomposer dans la nature, voire un temps indéfini dans certaines conditions." }
    ]
  },
  {
    id: "q17",
    text: "Quelle est la principale cause de la pollution de l'air dans les grandes villes ?",
    imageUrl: "https://images.unsplash.com/photo-1573532843621-a0bff916149a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Les transports", correct: true, explanation: "Les transports, notamment les véhicules à moteur, sont la principale cause de pollution de l'air dans les grandes villes, émettant des particules fines, des oxydes d'azote et d'autres polluants." },
      { text: "Les usines" },
      { text: "Le chauffage des bâtiments" },
      { text: "L'incinération des déchets" }
    ]
  },
  {
    id: "q18",
    text: "Quel est le pays avec la plus grande part d'énergies renouvelables dans sa production électrique ?",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Danemark" },
      { text: "Allemagne" },
      { text: "Islande", correct: true, explanation: "L'Islande produit quasiment 100% de son électricité à partir de sources renouvelables, principalement l'hydroélectricité et la géothermie." },
      { text: "Suède" }
    ]
  },
  {
    id: "q19",
    text: "Quelle est la principale cause de la disparition des abeilles ?",
    imageUrl: "https://images.unsplash.com/photo-1628356652784-a7323e2beda7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Les pesticides", correct: true, explanation: "Les pesticides, notamment les néonicotinoïdes, sont considérés comme la principale cause de la disparition des abeilles, bien que d'autres facteurs comme les parasites et le changement climatique jouent également un rôle." },
      { text: "Le changement climatique" },
      { text: "Les ondes électromagnétiques" },
      { text: "Les prédateurs naturels" }
    ]
  },
  {
    id: "q20",
    text: "Qu'est-ce que la biocapacité d'un territoire ?",
    imageUrl: "https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
    answers: [
      { text: "Sa capacité à accueillir une diversité d'espèces" },
      { text: "Sa capacité à produire des ressources renouvelables et à absorber les déchets", correct: true, explanation: "La biocapacité d'un territoire est sa capacité à produire des ressources renouvelables (cultures, pâturages, forêts, zones de pêche) et à absorber les déchets, notamment le CO2." },
      { text: "Sa capacité à résister aux catastrophes naturelles" },
      { text: "Sa capacité à maintenir un équilibre entre espèces végétales et animales" }
    ]
  }
];
