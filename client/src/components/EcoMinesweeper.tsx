import React, { useState, useEffect } from "react";
import { FaLeaf, FaSeedling, FaFlag, FaQuestion, FaSmile, FaSadTear, FaSun, FaBomb } from "react-icons/fa";

// Types pour notre application
type Difficulty = "easy" | "medium" | "hard";
type CellStatus = "hidden" | "revealed" | "flagged" | "question";
type GameStatus = "waiting" | "playing" | "won" | "lost";

// Configuration des niveaux de difficulté
const DIFFICULTY_SETTINGS: Record<Difficulty, { size: number; mines: number }> = {
  easy: { size: 8, mines: 10 },
  medium: { size: 12, mines: 30 },
  hard: { size: 16, mines: 70 },
};

const EcoMinesweeper: React.FC = () => {
  // État du jeu
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [grid, setGrid] = useState<number[][]>([]);
  const [cellStatus, setCellStatus] = useState<CellStatus[][]>([]);
  const [minesLeft, setMinesLeft] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Configuration actuelle
  const { size, mines } = DIFFICULTY_SETTINGS[difficulty];

  // Initialisation du jeu
  const initializeGame = () => {
    // Arrêter le timer existant
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Réinitialiser les états
    setTimer(0);
    setGameStatus("waiting");
    setMinesLeft(DIFFICULTY_SETTINGS[difficulty].mines);

    // Créer un nouveau tableau de statuts des cellules
    const newCellStatus: CellStatus[][] = Array(size).fill(null)
      .map(() => Array(size).fill("hidden"));
    setCellStatus(newCellStatus);

    // Créer un nouveau tableau vide (sera rempli au premier clic)
    setGrid(Array(size).fill(null).map(() => Array(size).fill(0)));
  };

  // Générer le plateau avec les mines après le premier clic
  const generateGrid = (firstX: number, firstY: number) => {
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(0));
    let minesPlaced = 0;

    // Placer les mines aléatoirement (mais pas sur la première cellule cliquée)
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      // Ne pas placer de mine sur la première cellule cliquée ou sur une cellule ayant déjà une mine
      if ((x !== firstX || y !== firstY) && newGrid[y][x] !== -1) {
        newGrid[y][x] = -1; // -1 représente une mine
        minesPlaced++;

        // Incrémenter les compteurs pour les cellules adjacentes
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (
              ny >= 0 && ny < size && 
              nx >= 0 && nx < size && 
              newGrid[ny][nx] !== -1
            ) {
              newGrid[ny][nx]++;
            }
          }
        }
      }
    }

    return newGrid;
  };

  // Révéler une cellule
  const revealCell = (x: number, y: number) => {
    // Ignorer si le jeu est terminé ou si la cellule est déjà révélée/marquée
    if (gameStatus === "won" || gameStatus === "lost" || 
        cellStatus[y][x] === "revealed" || 
        cellStatus[y][x] === "flagged") {
      return;
    }

    // Premier clic - générer le plateau et démarrer le timer
    if (gameStatus === "waiting") {
      const newGrid = generateGrid(x, y);
      setGrid(newGrid); // met à jour l'état global du plateau
      setGameStatus("playing");
    
      // Démarre le timer
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    
      // Créer une copie du statut actuel
      const newCellStatus = [...cellStatus.map(row => [...row])];
      
      // Révéler la première cellule
      newCellStatus[y][x] = "revealed";
    
      // Révélation récursive si la cellule est vide
      if (newGrid[y][x] === 0) {
        revealEmptyCells(x, y, newGrid, newCellStatus);
      }
    
      // Appliquer tout d'un coup
      setCellStatus(newCellStatus);
      checkWinCondition(newCellStatus);
      return; // ⚠️ Très important : on stoppe ici, sinon on continue avec une grille non à jour
    }

    // Copier le statut actuel des cellules
    const newCellStatus = [...cellStatus.map(row => [...row])];
    
    // Révéler la cellule cliquée
    newCellStatus[y][x] = "revealed";
    
    // Si on clique sur une mine, fin de partie
    if (grid[y][x] === -1) {
      revealAllMines(newCellStatus);
      setGameStatus("lost");
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } 
    // Révéler les cellules vides adjacentes (récursif) seulement si c'est une cellule vide
    else if (grid[y][x] === 0) {
      revealEmptyCells(x, y, grid, newCellStatus);
    }

    setCellStatus(newCellStatus);
    checkWinCondition(newCellStatus);
  };

  // Révéler les cellules vides adjacentes (algorithme d'inondation)
  const revealEmptyCells = (
    x: number, 
    y: number, 
    currentGrid: number[][], 
    newCellStatus: CellStatus[][]
  ) => {
    // Vérifier les 8 cellules adjacentes
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        // Ignorer la cellule centrale (celle qu'on vient de révéler)
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // Vérifier si la cellule est dans les limites et n'est pas révélée
        if (
          nx >= 0 && nx < size && 
          ny >= 0 && ny < size && 
          newCellStatus[ny][nx] === "hidden"
        ) {
          // Révéler cette cellule
          newCellStatus[ny][nx] = "revealed";
          
          // Si la cellule est vide (0), continuer récursivement
          if (currentGrid[ny][nx] === 0) {
            revealEmptyCells(nx, ny, currentGrid, newCellStatus);
          }
        }
      }
    }
  };

  // Révéler toutes les mines en fin de partie
  const revealAllMines = (newCellStatus: CellStatus[][]) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] === -1) {
          newCellStatus[y][x] = "revealed";
        }
      }
    }
  };

  // Vérifier si le joueur a gagné
  const checkWinCondition = (currentCellStatus: CellStatus[][]) => {
    let hiddenCells = 0;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (currentCellStatus[y][x] !== "revealed" && grid[y][x] !== -1) {
          hiddenCells++;
        }
      }
    }
    
    // Si toutes les cellules non-mines sont révélées, le joueur a gagné
    if (hiddenCells === 0 && gameStatus === "playing") {
      setGameStatus("won");
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      // Marquer toutes les mines avec des drapeaux
      const newCellStatus = [...currentCellStatus.map(row => [...row])];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (grid[y][x] === -1) {
            newCellStatus[y][x] = "flagged";
          }
        }
      }
      setCellStatus(newCellStatus);
      setMinesLeft(0);
    }
  };

  // Gestion du clic droit (placer un drapeau)
  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    
    // Ignorer si le jeu est terminé ou si la cellule est déjà révélée
    if (gameStatus === "won" || gameStatus === "lost" || cellStatus[y][x] === "revealed") {
      return;
    }
    
    // Démarrer le jeu au premier clic droit aussi
    if (gameStatus === "waiting") {
      setGameStatus("playing");
      const newGrid = generateGrid(x, y);
      setGrid(newGrid);
      
      // Démarrer le timer
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
      setTimerInterval(interval);
    }
    
    const newCellStatus = [...cellStatus.map(row => [...row])];
    
    // Cycle des états : hidden -> flagged -> question -> hidden
    switch (newCellStatus[y][x]) {
      case "hidden":
        newCellStatus[y][x] = "flagged";
        setMinesLeft(prev => prev - 1);
        break;
      case "flagged":
        newCellStatus[y][x] = "question";
        setMinesLeft(prev => prev + 1);
        break;
      case "question":
        newCellStatus[y][x] = "hidden";
        break;
    }
    
    setCellStatus(newCellStatus);
  };

  // Rendu de l'icône d'une cellule en fonction de son état
  const renderCellContent = (x: number, y: number) => {
    const status = cellStatus[y][x];
    const value = grid[y][x];
    
    if (status === "hidden") {
      return null;
    } else if (status === "flagged") {
      return <FaFlag className="text-red-500" />;
    } else if (status === "question") {
      return <FaQuestion className="text-yellow-500" />;
    } else if (value === -1) {
      return <FaBomb className="text-black" />;
    } else if (value === 0) {
      return <FaSeedling className="text-green-700 opacity-30" />;
    }
    
    // Couleurs des chiffres
    const colorClasses = [
      "text-blue-600",    // 1
      "text-green-700",   // 2
      "text-red-600",     // 3
      "text-purple-700",  // 4
      "text-orange-700",  // 5
      "text-teal-700",    // 6
      "text-black",       // 7
      "text-gray-700"     // 8
    ];
    
    return (
      <span className={`font-bold ${colorClasses[value - 1]}`}>
        {value}
      </span>
    );
  };

  // Initialiser le jeu au changement de difficulté
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Couleur de fond des cellules
  const getCellBackgroundClass = (x: number, y: number) => {
    const status = cellStatus[y][x];
    
    if (status === "revealed") {
      // Mine explosée
      if (grid[y][x] === -1) {
        return "bg-red-500";
      }
      // Cellule normale révélée
      return "bg-green-100";
    }
    
    // Alternance de couleurs pour les cellules non révélées
    const isEven = (x + y) % 2 === 0;
    return isEven ? "bg-green-300" : "bg-green-400";
  };

  // Formatage du timer pour affichage
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-800 mb-4 text-center">
        Éco-Démineur
      </h1>
      
      {/* Panneau de contrôle */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-4 bg-green-100 p-4 rounded-lg shadow-md">
          {/* Sélection de la difficulté */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Difficulté:
            </label>
            <select
              className="p-2 border border-green-300 rounded bg-white"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              disabled={gameStatus === "playing"}
            >
              <option value="easy">Facile (8×8, 10 mines)</option>
              <option value="medium">Moyen (12×12, 30 mines)</option>
              <option value="hard">Difficile (16×16, 70 mines)</option>
            </select>
          </div>
          
          {/* Compteur de mines restantes */}
          <div className="text-center">
            <div className="text-sm font-medium text-green-700 mb-1">
              Déchets restants:
            </div>
            <div className="bg-black text-red-500 font-mono text-2xl p-2 rounded">
              {minesLeft.toString().padStart(3, '0')}
            </div>
          </div>
          
          {/* Bouton reset avec émoji */}
          <button 
            onClick={initializeGame}
            className="p-3 mx-2 rounded-full bg-yellow-200 hover:bg-yellow-300 focus:outline-none flex items-center justify-center"
          >
            {gameStatus === "won" ? (
              <FaSun className="text-2xl text-yellow-600" />
            ) : gameStatus === "lost" ? (
              <FaSadTear className="text-2xl text-blue-600" />
            ) : (
              <FaSmile className="text-2xl text-yellow-600" />
            )}
          </button>
          
          {/* Timer */}
          <div className="text-center">
            <div className="text-sm font-medium text-green-700 mb-1">
              Temps:
            </div>
            <div className="bg-black text-red-500 font-mono text-2xl p-2 rounded">
              {formatTime(timer)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Message pour le statut du jeu */}
      {gameStatus === "won" && (
        <div className="text-center mb-4 p-2 bg-green-100 text-green-800 rounded-lg">
          🎉 Bravo ! Vous avez nettoyé tous les déchets toxiques ! 🌱
        </div>
      )}
      {gameStatus === "lost" && (
        <div className="text-center mb-4 p-2 bg-red-100 text-red-800 rounded-lg">
          💥 Oups ! Une décharge toxique a explosé ! Réessayez !
        </div>
      )}
      
      {/* Grille de jeu */}
      <div className="flex justify-center">
        <div 
          className={`grid gap-1`}
          style={{ 
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: `${size * 40}px` 
          }}
        >
          {grid.map((row, y) =>
            row.map((_, x) => (
              <button
                key={`${x}-${y}`}
                className={`
                  w-10 h-10 flex items-center justify-center
                  ${getCellBackgroundClass(x, y)}
                  ${cellStatus[y][x] === "revealed" ? "" : "hover:bg-green-200"}
                  border-2 border-green-600
                  focus:outline-none
                  transition-colors
                `}
                onClick={() => revealCell(x, y)}
                onContextMenu={(e) => handleRightClick(e, x, y)}
                disabled={gameStatus === "won" || gameStatus === "lost"}
              >
                {renderCellContent(x, y)}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg text-green-800">
        <h3 className="font-bold mb-2">Comment jouer :</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Clic gauche pour dévoiler une case</li>
          <li>Clic droit pour marquer un déchet toxique (<FaFlag className="inline text-red-500" />) ou une incertitude (<FaQuestion className="inline text-yellow-500" />)</li>
          <li>Les chiffres indiquent le nombre de déchets toxiques adjacents</li>
          <li>Nettoyez toutes les cases sans toucher aux déchets toxiques !</li>
        </ul>
      </div>
    </div>
  );
};

export default EcoMinesweeper;