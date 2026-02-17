const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('time-left');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-button');
const gameBoard = document.getElementById('game-board');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let score = 0;
const characters = ['kwak', 'lee', 'jin', 'kim'];
let lastHole;
let timeUp = false;
let timeLeft = 10;
let timerId;
let characterInterval;

function playSound(type) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'hit') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  } else {
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  }

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

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

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
}

function showCharacter() {
  const holes = document.querySelectorAll('.hole');
  const hole = randomHole(Array.from(holes));
  const characterElement = hole.querySelector('.character');
  
  const randomChar = characters[Math.floor(Math.random() * characters.length)];
  characterElement.classList.add(randomChar, 'up');

  const time = randomTime(500, 800); // Made it a bit faster
  setTimeout(() => {
    characterElement.className = 'character';
  }, time);
}

function countdown() {
  timeLeft--;
  timeLeftDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  // Reset everything
  score = 0;
  timeLeft = 10;
  timeUp = false;
  scoreDisplay.textContent = score;
  timeLeftDisplay.textContent = timeLeft;
  
  // Hide game over screen and start button
  gameOverScreen.classList.add('hidden');
  startButton.style.display = 'none';
  document.getElementById('instruction-text').style.display = 'block';


  // Start timers
  timerId = setInterval(countdown, 1000);
  characterInterval = setInterval(() => {
    if (!timeUp) showCharacter();
  }, 600); // New character appears every 600ms
}

function endGame() {
  timeUp = true;
  clearInterval(timerId);
  clearInterval(characterInterval);
  finalScoreDisplay.textContent = score;
  gameOverScreen.classList.remove('hidden');
  document.getElementById('instruction-text').style.display = 'none';

}

gameBoard.addEventListener('click', e => {
  if (timeUp || !e.target.classList.contains('up')) return;

  const isCorrect = e.target.classList.contains('jin');
  e.target.classList.remove('up');

  if (isCorrect) {
    playSound('hit');
    score++;
    scoreDisplay.textContent = score;
    e.target.classList.add('correct-hit');
  } else {
    playSound('miss');
    e.target.classList.add('wrong-hit');
  }

  setTimeout(() => {
    e.target.className = 'character';
  }, 300);
});

createGameBoard();
startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
