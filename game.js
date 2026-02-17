const CHARACTERS = [
  { id: "kwak", label: "곽대표" },
  { id: "lee", label: "이팀장" },
  { id: "jin", label: "진과장" },
  { id: "kim", label: "김동규" },
];

const TARGET_ID = "jin";
const TOTAL_TIME = 30;
const BOARD_SIZE = 9;
const BEST_SCORE_KEY = "jin-mole-best-score";

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeLeftEl = document.getElementById("time-left");
const stageEl = document.getElementById("stage");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const resultModal = document.getElementById("result-modal");
const finalScoreEl = document.getElementById("final-score");
const bestScoreEl = document.getElementById("best-score");
const playAgainBtn = document.getElementById("play-again-btn");

let score = 0;
let timeLeft = TOTAL_TIME;
let stage = 1;
let running = false;
let lastHoleIndex = -1;
let countdownTimer = null;
let spawnTimer = null;
const hideTimers = new Map();
let audioContext = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioContext = new Ctx();
  }
  return audioContext;
}

function playTone({ type = "sine", frequency = 440, duration = 0.08, volume = 0.2, sweepTo }) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (typeof sweepTo === "number") {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playHitSound() {
  playTone({ type: "triangle", frequency: 740, duration: 0.07, volume: 0.26, sweepTo: 1020 });
  setTimeout(() => {
    playTone({ type: "triangle", frequency: 960, duration: 0.08, volume: 0.22, sweepTo: 1320 });
  }, 35);
}

function playMissSound() {
  playTone({ type: "square", frequency: 210, duration: 0.12, volume: 0.16, sweepTo: 130 });
}

function playStartSound() {
  playTone({ type: "sine", frequency: 392, duration: 0.07, volume: 0.14 });
  setTimeout(() => playTone({ type: "sine", frequency: 523, duration: 0.09, volume: 0.16 }), 60);
}

function playEndSound() {
  playTone({ type: "sawtooth", frequency: 420, duration: 0.09, volume: 0.12, sweepTo: 280 });
  setTimeout(() => playTone({ type: "sawtooth", frequency: 320, duration: 0.13, volume: 0.11, sweepTo: 180 }), 70);
}

function readBestScore() {
  return Number(localStorage.getItem(BEST_SCORE_KEY) || "0");
}

function writeBestScore(next) {
  localStorage.setItem(BEST_SCORE_KEY, String(next));
}

function currentStageSettings() {
  const spawnDelay = Math.max(260, 860 - (stage - 1) * 170);
  const visibleMin = Math.max(220, 760 - (stage - 1) * 140);
  const visibleMax = Math.max(360, 1100 - (stage - 1) * 160);
  return { spawnDelay, visibleMin, visibleMax };
}

function updateHud() {
  scoreEl.textContent = String(score);
  timeLeftEl.textContent = String(timeLeft);
  stageEl.textContent = String(stage);
}

function updateStageByTime() {
  const elapsed = TOTAL_TIME - timeLeft;
  stage = 1 + Math.floor(elapsed / 10);
}

function clearHole(hole) {
  const mole = hole.querySelector(".mole");
  hole.classList.remove("up");
  mole.classList.remove("hit", "miss");
}

function pickRandomHole() {
  const holes = Array.from(board.querySelectorAll(".hole"));
  if (!holes.length) return null;

  let idx = randomInt(0, holes.length - 1);
  if (holes.length > 1 && idx === lastHoleIndex) {
    idx = (idx + 1) % holes.length;
  }
  lastHoleIndex = idx;
  return holes[idx];
}

function showRandomMole() {
  if (!running) return;
  const hole = pickRandomHole();
  if (!hole) return;

  const mole = hole.querySelector(".mole");
  const character = CHARACTERS[randomInt(0, CHARACTERS.length - 1)];
  hole.dataset.character = character.id;
  mole.textContent = character.label;
  mole.className = `mole ${character.id}`;
  hole.classList.add("up");

  if (hideTimers.has(hole)) {
    clearTimeout(hideTimers.get(hole));
  }

  const { visibleMin, visibleMax } = currentStageSettings();
  const hideTimer = setTimeout(() => {
    clearHole(hole);
    hideTimers.delete(hole);
  }, randomInt(visibleMin, visibleMax));
  hideTimers.set(hole, hideTimer);
}

function queueNextSpawn() {
  if (!running) return;
  showRandomMole();
  const { spawnDelay } = currentStageSettings();
  const jitter = randomInt(-90, 120);
  spawnTimer = setTimeout(queueNextSpawn, Math.max(180, spawnDelay + jitter));
}

function resetGameState() {
  score = 0;
  timeLeft = TOTAL_TIME;
  stage = 1;
  running = true;
  lastHoleIndex = -1;
  resultModal.classList.add("hidden");
  updateHud();
}

function stopAllTimers() {
  clearInterval(countdownTimer);
  clearTimeout(spawnTimer);
  hideTimers.forEach((timerId) => clearTimeout(timerId));
  hideTimers.clear();
}

function endGame() {
  running = false;
  stopAllTimers();
  playEndSound();

  board.querySelectorAll(".hole").forEach((hole) => clearHole(hole));

  const best = readBestScore();
  const nextBest = Math.max(best, score);
  if (nextBest !== best) {
    writeBestScore(nextBest);
  }

  finalScoreEl.textContent = String(score);
  bestScoreEl.textContent = String(nextBest);
  resultModal.classList.remove("hidden");
  startBtn.disabled = false;
  restartBtn.disabled = false;
}

function countdown() {
  timeLeft -= 1;
  if (timeLeft < 0) {
    endGame();
    return;
  }
  updateStageByTime();
  updateHud();
  if (timeLeft === 0) {
    endGame();
  }
}

function onHoleClick(event) {
  const hole = event.currentTarget;
  if (!running || !hole.classList.contains("up")) return;

  const mole = hole.querySelector(".mole");
  const characterId = hole.dataset.character;
  hole.classList.remove("up");

  if (characterId === TARGET_ID) {
    score += 1;
    mole.classList.add("hit");
    playHitSound();
  } else {
    mole.classList.add("miss");
    playMissSound();
  }
  updateHud();

  setTimeout(() => {
    mole.classList.remove("hit", "miss");
  }, 140);
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    const hole = document.createElement("button");
    hole.type = "button";
    hole.className = "hole";
    hole.setAttribute("aria-label", "두더지 구멍");
    const mole = document.createElement("span");
    mole.className = "mole";
    hole.appendChild(mole);
    hole.addEventListener("click", onHoleClick);
    board.appendChild(hole);
  }
}

function startGame() {
  stopAllTimers();
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
  playStartSound();
  resetGameState();
  startBtn.disabled = true;
  restartBtn.disabled = false;
  countdownTimer = setInterval(countdown, 1000);
  queueNextSpawn();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

createBoard();
bestScoreEl.textContent = String(readBestScore());
