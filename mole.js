const scoreDisplay = document.getElementById('score');
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let score = 0;
let moleInterval;
const characters = ['kwak', 'lee', 'jin', 'kim'];

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
    playSound('hit');
    score++;
    scoreDisplay.textContent = score;
    e.target.className = 'character';
  } else if (e.target.classList.length > 1) {
    playSound('miss');
    e.target.className = 'character';
  }
});

createGameBoard();
startButton.addEventListener('click', startGame);
