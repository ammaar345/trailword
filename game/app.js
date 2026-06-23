const GUMROAD_HINT_PACK_URL = "https://gumroad.com/";
const CARBON_AD_TAG = "";
const STORAGE_KEY = "trailword:v1";

const board = document.querySelector("#board");
const keyboard = document.querySelector(".keyboard");
const message = document.querySelector("#message");
const categoryText = document.querySelector("#categoryText");
const hintText = document.querySelector("#hintText");
const dateLine = document.querySelector("#dateLine");
const helpButton = document.querySelector("#helpButton");
const statsButton = document.querySelector("#statsButton");
const helpDialog = document.querySelector("#helpDialog");
const statsDialog = document.querySelector("#statsDialog");
const closeHelpButton = document.querySelector("#closeHelpButton");
const closeStatsButton = document.querySelector("#closeStatsButton");
const hintButton = document.querySelector("#hintButton");
const buyHintButton = document.querySelector("#buyHintButton");
const shareButton = document.querySelector("#shareButton");
const statsSummary = document.querySelector("#statsSummary");
const distribution = document.querySelector("#distribution");
const resetStatsButton = document.querySelector("#resetStatsButton");

const rows = 6;
const cols = 5;
let currentGuess = "";
let solved = false;
let gameOver = false;
let freeHintUsed = false;
let daily = getDailyPuzzle();
let stats = loadStats();

init();

function init() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  renderBoard();
  renderKeyboard();
  renderStats();
  setDateLine();
  setDailyContent();
  loadCarbonAd();

  if (stats.played === 0) {
    helpDialog.showModal();
  }

  document.addEventListener("keydown", handlePhysicalKeyboard);
  hintButton.addEventListener("click", showFreeHint);
  buyHintButton.addEventListener("click", () => {
    window.location.href = GUMROAD_HINT_PACK_URL;
  });
  shareButton.addEventListener("click", shareResult);
  helpButton.addEventListener("click", () => helpDialog.showModal());
  statsButton.addEventListener("click", () => {
    renderStats();
    statsDialog.showModal();
  });
  closeHelpButton.addEventListener("click", () => helpDialog.close());
  closeStatsButton.addEventListener("click", () => statsDialog.close());
  resetStatsButton.addEventListener("click", () => {
    if (window.confirm("Reset local TrailWord stats?")) {
      stats = defaultStats();
      saveStats();
      renderStats();
    }
  });
}

function getDailyPuzzle() {
  const start = Date.UTC(2026, 0, 1);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const index = Math.floor((today - start) / 86_400_000);
  const word = WORDS[Math.abs(index) % WORDS.length];
  return {
    ...word,
    answer: word.answer.toLowerCase(),
    day: String(today),
    dayIndex: Math.abs(index)
  };
}

function setDateLine() {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  dateLine.textContent = formatter.format(new Date());
}

function setDailyContent() {
  categoryText.textContent = `Category: ${daily.category}`;
  hintText.textContent = daily.hint;
}

function renderBoard() {
  board.innerHTML = "";
  for (let row = 0; row < rows; row += 1) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    for (let col = 0; col < cols; col += 1) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = row;
      tile.dataset.col = col;
      rowEl.appendChild(tile);
    }
    board.appendChild(rowEl);
  }
}

function renderKeyboard() {
  const layout = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];

  keyboard.innerHTML = "";
  layout.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "key-row";

    if (index === 2) {
      const enter = createKey("ENTER", true);
      row.appendChild(enter);
    }

    [...line].forEach(letter => row.appendChild(createKey(letter, false)));

    if (index === 2) {
      const back = createKey("⌫", true);
      back.dataset.key = "Backspace";
      row.appendChild(back);
    }

    keyboard.appendChild(row);
  });

  keyboard.addEventListener("click", event => {
    const key = event.target.closest("button");
    if (!key) return;
    const value = key.dataset.key;
    if (value === "ENTER") submitGuess();
    else if (value === "Backspace") removeLetter();
    else addLetter(value);
  });
}

function createKey(label, wide) {
  const key = document.createElement("button");
  key.className = `key ${wide ? "wide" : ""}`;
  key.textContent = label;
  key.dataset.key = label;
  key.setAttribute("aria-label", label);
  return key;
}

function addLetter(letter) {
  if (gameOver || currentGuess.length >= cols) return;
  currentGuess += letter;
  updateCurrentRow();
}

function removeLetter() {
  if (gameOver || currentGuess.length === 0) return;
  currentGuess = currentGuess.slice(0, -1);
  updateCurrentRow();
}

function updateCurrentRow() {
  const row = getCurrentRow();
  [...row.children].forEach((tile, index) => {
    tile.textContent = currentGuess[index] || "";
    tile.classList.toggle("filled", Boolean(currentGuess[index]));
  });
}

function getCurrentRow() {
  const guessCount = [...board.querySelectorAll(".row")].filter(row => row.dataset.filled === "true").length;
  return board.querySelector(`.row:nth-child(${guessCount + 1})`);
}

function submitGuess() {
  if (gameOver) return;

  if (currentGuess.length !== cols) {
    showMessage("Not enough letters");
    return;
  }

  if (!WORD_LIST.has(currentGuess)) {
    showMessage("Not in word list");
    shakeRow(getCurrentRow());
    return;
  }

  const guess = currentGuess;
  const answer = daily.answer;
  const result = scoreGuess(guess, answer);
  const row = getCurrentRow();
  row.dataset.filled = "true";

  result.forEach((status, index) => {
    const tile = row.children[index];
    const letter = guess[index];
    window.setTimeout(() => {
      tile.textContent = letter;
      tile.classList.remove("filled");
      tile.classList.add(status);
      updateKeyboard(letter, status);
    }, index * 220);
  });

  window.setTimeout(() => {
    if (guess === answer) {
      solved = true;
      gameOver = true;
      showMessage(`Solved in ${guessCount()}/6. Share your trail!`);
      recordWin(guessCount());
    } else if (guessCount() === rows) {
      gameOver = true;
      showMessage(`Today's word was ${answer.toUpperCase()}. Better luck tomorrow.`);
      recordLoss();
    } else {
      currentGuess = '';
    }
  }, cols * 220 + 80);
}

function guessCount() {
  return [...board.querySelectorAll('.row')].filter(row => row.dataset.filled === 'true').length;
}

function scoreGuess(guess, answer) {
  const result = Array(cols).fill('absent');
  const remaining = answer.split('');

  guess.split('').forEach((letter, index) => {
    if (letter === answer[index]) {
      result[index] = 'correct';
      remaining[index] = null;
    }
  });

  guess.split('').forEach((letter, index) => {
    if (result[index] !== 'correct') {
      const found = remaining.indexOf(letter);
      if (found !== -1) {
        result[index] = 'present';
        remaining[found] = null;
      }
    }
  });

  return result;
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add('show');
  window.clearTimeout(showMessage.timeout);
  showMessage.timeout = window.setTimeout(() => {
    message.classList.remove('show');
  }, 2200);
}

function shakeRow(row) {
  row.classList.add('shake');
  window.setTimeout(() => row.classList.remove('shake'), 450);
}

function updateKeyboard(letter, status) {
  const key = keyboard.querySelector('[data-key=' + letter + ']');
  if (!key) return;
  const rank = statusRank(status);
  const oldRank = statusRank(key.dataset.status);
  if (rank > oldRank) {
    key.dataset.status = status;
    key.classList.add(status);
  }
}

function statusRank(status) {
  if (status === 'correct') return 3;
  if (status === 'present') return 2;
  if (status === 'absent') return 1;
  return 0;
}

function handlePhysicalKeyboard(event) {
  if (helpDialog.open || statsDialog.open) return;

  if (event.key === 'Enter') {
    submitGuess();
    return;
  }

  if (event.key === 'Backspace') {
    removeLetter();
    return;
  }

  if (/^[a-z]$/i.test(event.key)) {
    addLetter(event.key.toUpperCase());
  }
}

function showFreeHint() {
  if (gameOver) return;
  if (freeHintUsed) {
    window.location.href = GUMROAD_HINT_PACK_URL;
    return;
  }

  const nextLetter = daily.answer[currentGuess.length] || daily.answer[0];
  showMessage('Hint: position ' + (currentGuess.length + 1) + ' is ' + nextLetter);
  hintText.textContent = 'Free hint used: position ' + (currentGuess.length + 1) + ' is ' + nextLetter;
  freeHintUsed = true;
  hintButton.textContent = 'Buy more hints';
}

function shareResult() {
  const title = 'TrailWord ' + daily.dayIndex;
  const count = solved ? guessCount() : 'X';
  const line = getShareGrid();
  const text = title + ' ' + count + '/6\n' + line + '\n' + daily.category + '\nPlay free: ' + window.location.href;

  if (navigator.share) {
    navigator.share({ title: 'Play TrailWord', text }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(text).then(() => showMessage('Result copied')).catch(() => showMessage(text));
}

function getShareGrid() {
  const filledRows = [...board.querySelectorAll('.row')].filter(row => row.dataset.filled === 'true');
  const rowsToShare = solved || gameOver ? filledRows : filledRows.slice(0, -1);
  return rowsToShare.map(row => [...row.children].map(tile => {
    if (tile.classList.contains('correct')) return '🟩';
    if (tile.classList.contains('present')) return '🟨';
    if (tile.classList.contains('absent')) return '⬛';
    return '⬜';
  }).join('')).join('\n');
}

function loadStats() {
  try {
    return { ...defaultStats(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return defaultStats();
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function defaultStats() {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPlayed: ''
  };
}

function recordWin(guesses) {
  stats.played += 1;
  stats.wins += 1;
  stats.streak += 1;
  stats.maxStreak = Math.max(stats.streak, stats.maxStreak);
  stats.distribution[guesses - 1] += 1;
  stats.lastPlayed = daily.day;
  saveStats();
}

function recordLoss() {
  stats.played += 1;
  stats.losses += 1;
  stats.streak = 0;
  stats.lastPlayed = daily.day;
  saveStats();
}

function renderStats() {
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  statsSummary.innerHTML = '<div class="stat"><strong>' + stats.wins + '</strong><span>Solved</span></div>' +
    '<div class="stat"><strong>' + stats.maxStreak + '</strong><span>Best streak</span></div>' +
    '<div class="stat"><strong>' + stats.played + '</strong><span>Played</span></div>' +
    '<div class="stat"><strong>' + winRate + '%</strong><span>Win rate</span></div>';

  distribution.innerHTML = '';
  const max = Math.max(...stats.distribution, 1);

  stats.distribution.forEach((count, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'stat-row';

    const label = document.createElement('span');
    label.textContent = index + 1;

    const bar = document.createElement('div');
    bar.className = 'bar';

    const fill = document.createElement('span');
    fill.style.width = Math.max(4, (count / max) * 100) + '%';
    bar.appendChild(fill);

    const value = document.createElement('span');
    value.textContent = count;

    rowEl.append(label, bar, value);
    distribution.appendChild(rowEl);
  });
}

function loadCarbonAd() {
  if (!CARBON_AD_TAG) return;

  const adSlot = document.querySelector('#carbonads');
  const script = document.createElement('script');
  script.id = '_carbonads_js';
  script.src = 'https://cdn.carbonads.com/carbon.js?serve=' + encodeURIComponent(CARBON_AD_TAG) + '&placement=' + encodeURIComponent(window.location.hostname);
  script.async = true;
  adSlot.innerHTML = '';
  adSlot.appendChild(script);
}
