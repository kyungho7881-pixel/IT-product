const scoreDisplay = document.getElementById('score');
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');

let score = 0;
let moleInterval;
const characters = ['kwak', 'lee', 'jin', 'kim'];

function createGameBoard() {
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.classList.add('hole');
    const character = document.createElement('div');
    character.classList.add('character');
    hole.appendChild(character);
    gameBoard.appendChild(hole);
  }
}

function randomCharacter() {
  const holes = document.querySelectorAll('.hole .character');
  holes.forEach(hole => hole.className = 'character');
  const randomHole = holes[Math.floor(Math.random() * 9)];
  const randomChar = characters[Math.floor(Math.random() * characters.length)];
  randomHole.classList.add(randomChar);
}

function startGame() {
  score = 0;
  scoreDisplay.textContent = score;
  moleInterval = setInterval(randomCharacter, 800);
  startButton.disabled = true;

  setTimeout(() => {
    clearInterval(moleInterval);
    startButton.disabled = false;
    alert('Game Over! Your score is ' + score);
  }, 10000);
}

gameBoard.addEventListener('click', e => {
  if (e.target.classList.contains('jin')) {
    score++;
    scoreDisplay.textContent = score;
    e.target.className = 'character';
  }
});

createGameBoard();
startButton.addEventListener('click', startGame);
