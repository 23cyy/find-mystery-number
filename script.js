/*******************************************************
 * VARIABLES GLOBALES
 ******************************************************/
let minRange = 1;
let maxRange = 50; // Par défaut : "moyen"
let currentMode = 'aleatoire';
let operand1 = 0;
let operand2 = 0;
let operator = '';
let correctAnswer = null;

let totalQuestions = 5; // Nombre de questions par partie
let currentQuestionIndex = 0;
let correctAnswersCount = 0;

// Historique des parties (tableau d'objets)
let gameHistory = [];

/*******************************************************
 * RÉFÉRENCES DOM
 ******************************************************/
const difficultySelect = document.getElementById('difficultySelect');
const modeSelect = document.getElementById('modeSelect');
const startGameBtn = document.getElementById('startGameBtn');

const gameSection = document.querySelector('.game');
const operand1Span = document.getElementById('operand1');
const operand2Span = document.getElementById('operand2');
const operatorSpan = document.getElementById('operator');
const userAnswerInput = document.getElementById('userAnswer');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const feedbackParagraph = document.getElementById('feedback');

const resultsSection = document.querySelector('.results');
const scoreMessage = document.getElementById('scoreMessage');
const restartBtn = document.getElementById('restartBtn');

const historyList = document.getElementById('historyList');

/*******************************************************
 * INIT
 ******************************************************/
// Charger l’historique depuis le localStorage si disponible
window.addEventListener('load', () => {
  const savedHistory = localStorage.getItem('gameHistory');
  if (savedHistory) {
    gameHistory = JSON.parse(savedHistory);
    displayGameHistory();
  }
});

/*******************************************************
 * FONCTIONS DE LOGIQUE
 ******************************************************/
// Détermine la plage de nombres en fonction de la difficulté sélectionnée
function setDifficultyRange() {
  const difficulty = difficultySelect.value;
  switch (difficulty) {
    case 'facile':
      minRange = 1;
      maxRange = 10;
      break;
    case 'moyen':
      minRange = 1;
      maxRange = 50;
      break;
    case 'difficile':
      minRange = 1;
      maxRange = 100;
      break;
    default:
      minRange = 1;
      maxRange = 50;
  }
}

// Retourne un nombre aléatoire dans la fourchette [minRange, maxRange]
function getRandomNumber() {
  return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
}

// Sélectionne un opérateur aléatoire parmi +, -, x, ÷
function getRandomOperator() {
  const operators = ['+', '-', '×', '÷'];
  const randomIndex = Math.floor(Math.random() * operators.length);
  return operators[randomIndex];
}

// Génère la question en fonction du mode et calcule la bonne réponse
function generateQuestion() {
  operand1 = getRandomNumber();
  operand2 = getRandomNumber();

  if (currentMode === 'aleatoire') {
    operator = getRandomOperator();
  } else {
    switch (currentMode) {
      case 'addition':
        operator = '+';
        break;
      case 'soustraction':
        operator = '-';
        break;
      case 'multiplication':
        operator = '×';
        break;
      case 'division':
        operator = '÷';
        break;
      default:
        operator = '+';
    }
  }

  // Éviter la division par zéro
  if (operator === '÷' && operand2 === 0) {
    operand2 = getRandomNumber();
  }

  // Calcul de la bonne réponse
  switch (operator) {
    case '+':
      correctAnswer = operand1 + operand2;
      break;
    case '-':
      correctAnswer = operand1 - operand2;
      break;
    case '×':
      correctAnswer = operand1 * operand2;
      break;
    case '÷':
      // Résultat d’une division arrondi à l’entier (si on souhaite un entier)
      // Sinon on peut laisser en float en modifiant le parseInt/float
      correctAnswer = Math.floor(operand1 / operand2);
      break;
  }

  // Affichage des éléments sur la page
  operand1Span.textContent = operand1;
  operand2Span.textContent = operand2;
  operatorSpan.textContent = operator;
}

// Démarre une nouvelle partie
function startNewGame() {
  setDifficultyRange();
  currentMode = modeSelect.value;

  currentQuestionIndex = 0;
  correctAnswersCount = 0;

  // On masque la section "results" et on affiche la section "game"
  resultsSection.classList.add('hidden');
  gameSection.classList.remove('hidden');

  generateQuestion();
  userAnswerInput.value = '';
  feedbackParagraph.textContent = '';
  userAnswerInput.focus();
}

// Valider la réponse de l'utilisateur
function checkAnswer() {
  const userAnswer = parseInt(userAnswerInput.value);
  if (isNaN(userAnswer)) {
    feedbackParagraph.textContent = "Entrez une valeur numérique valide.";
    return;
  }

  if (userAnswer === correctAnswer) {
    feedbackParagraph.textContent = "Bravo ! C'est correct.";
    correctAnswersCount++;
  } else {
    feedbackParagraph.textContent = `Raté ! La bonne réponse était ${correctAnswer}.`;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < totalQuestions) {
    // Générer une nouvelle question
    setTimeout(() => {
      feedbackParagraph.textContent = '';
      generateQuestion();
      userAnswerInput.value = '';
      userAnswerInput.focus();
    }, 1500);
  } else {
    endGame();
  }
}

// Termine la partie et sauvegarde les résultats
function endGame() {
  gameSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');

  // Calcul du score
  const scorePercent = Math.round((correctAnswersCount / totalQuestions) * 100);
  scoreMessage.textContent = `Vous avez obtenu ${correctAnswersCount}/${totalQuestions} réponses correctes (${scorePercent}%).`;

  // Enregistrement de la partie dans l'historique
  const newGameRecord = {
    date: new Date().toLocaleString('fr-FR'),
    difficulty: difficultySelect.value,
    mode: modeSelect.value,
    score: `${correctAnswersCount}/${totalQuestions}`,
    percent: `${scorePercent}%`
  };
  gameHistory.push(newGameRecord);

  // Mettre à jour l'historique dans localStorage
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

  // Afficher l’historique actualisé
  displayGameHistory();
}

// Afficher l’historique dans la section prévue
function displayGameHistory() {
  historyList.innerHTML = '';
  gameHistory.forEach(game => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('historyEntry');
    entryDiv.innerHTML = `
      <strong>Date :</strong> ${game.date}<br/>
      <strong>Difficulté :</strong> ${game.difficulty}<br/>
      <strong>Mode :</strong> ${game.mode}<br/>
      <strong>Score :</strong> ${game.score} (${game.percent})
    `;
    historyList.prepend(entryDiv);
  });
}

/*******************************************************
 * ÉCOUTEURS D'ÉVÉNEMENTS
 ******************************************************/
startGameBtn.addEventListener('click', () => {
  startNewGame();
});

submitAnswerBtn.addEventListener('click', () => {
  checkAnswer();
});

userAnswerInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    checkAnswer();
  }
});

restartBtn.addEventListener('click', () => {
  // Rejouer une nouvelle partie
  startNewGame();
});

const resetHistoryBtn = document.getElementById('resetHistoryBtn');

resetHistoryBtn.addEventListener('click', () => {
  if (confirm("Êtes-vous sûr de vouloir réinitialiser l’historique ?")) {
    // Supprimer du localStorage
    localStorage.removeItem('gameHistory');
    // Vider le tableau en mémoire
    gameHistory = [];
    // Rafraîchir l’affichage
    displayGameHistory();
  }
});
