const scoreDisplay = document.getElementById('score');
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let score = 0;
let moleInterval;
const characters = ['kwak', 'lee', 'jin', 'kim'];
let lastHole; // Variable to store the last hole a character appeared in
let timeUp = false; // Flag to indicate if the game time is up

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

// Function to get a random time for character to stay up
function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Function to get a random hole, ensuring it's not the same as the last one
function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes); // Recursively call until a different hole is found
  }
  lastHole = hole;
  return hole;
}

function showCharacter() {
  const holes = document.querySelectorAll('.hole'); // Select all hole elements
  const hole = randomHole(Array.from(holes)); // Get a random unique hole
  const characterElement = hole.querySelector('.character'); // Get the character div inside the hole
  
  const randomChar = characters[Math.floor(Math.random() * characters.length)]; // Randomly pick a character
  characterElement.classList.add(randomChar); // Add character class
  characterElement.classList.add('up'); // Make character slide up

  const time = randomTime(500, 1000); // Character stays up for 0.5 to 1 second
  setTimeout(() => {
    characterElement.classList.remove('up'); // Make character hide
    characterElement.className = 'character'; // Reset character classes
    if (!timeUp) showCharacter(); // If game is not over, show another character
  }, time);
}

function startGame() {
  score = 0;
  scoreDisplay.textContent = score;
  timeUp = false; // Reset timeUp flag
  startButton.disabled = true;
  showCharacter(); // Start showing characters

  setTimeout(() => {
    timeUp = true; // Set timeUp flag to true after 10 seconds
    startButton.disabled = false;
    alert('Game Over! Your score is ' + score);
  }, 10000); // Game lasts for 10 seconds
}

gameBoard.addEventListener('click', e => {
  if (!e.target.classList.contains('character')) return; // Only proceed if a character div is clicked

  e.target.classList.remove('up'); // Hide character immediately
  e.target.classList.add('hit'); // Add hit feedback

  setTimeout(() => {
    e.target.classList.remove('hit'); // Remove hit feedback
    e.target.className = 'character'; // Reset character classes
  }, 200); // Short delay for hit animation

  if (e.target.classList.contains('jin')) { // Check if it was jin after removing other classes
    playSound('hit');
    score++;
    scoreDisplay.textContent = score;
  } else { // It's another character or a miss
    playSound('miss');
  }
});

createGameBoard();
startButton.addEventListener('click', startGame);
