const boardContainer = document.getElementById("board-container");
const board = document.getElementById("board");
const startScreen = document.getElementById("start-screen");
const difficultyButtons = document.querySelectorAll("#start-screen button");

let boardSize;
let mineCount;
let cells;
let gameOver = false;

// initialise
function startGame(selectedDifficulty) {
  // difficulty level
  if (selectedDifficulty === "easy") {
    boardSize = 15;
    mineCount = 30;
  } else if (selectedDifficulty === "medium") {
    boardSize = 30;
    mineCount = 120;
  } else if (selectedDifficulty === "hard") {
    boardSize = 50;
    mineCount = 300;
  }

  // hide start screen
  startScreen.style.display = "none";
  boardContainer.style.display = "block";

  // Reset
  gameOver = false;
  board.innerHTML = "";
  cells = Array(boardSize * boardSize).fill().map((_, index) => ({
    id: index,
    mine: false,
    revealed: false,
    adjacentMines: 0,
  }));

  placeMines();
  calculateAdjacentMines();
  createBoard();
}

// mines
function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    if (!cells[randomIndex].mine) {
      cells[randomIndex].mine = true;
      minesPlaced++;
    }
  }
}

function calculateAdjacentMines() {
  for (let i = 0; i < cells.length; i++) {
    const { x, y } = getXY(i);
    if (!cells[i].mine) {
      let mineCounter = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize) {
            const neighborIndex = getIndex(nx, ny);
            if (cells[neighborIndex].mine) mineCounter++;
          }
        }
      }
      cells[i].adjacentMines = mineCounter;
    }
  }
}

function getIndex(x, y) {
  return y * boardSize + x;
}

function getXY(index) {
  return { x: index % boardSize, y: Math.floor(index / boardSize) };
}

function revealCell(cell, event = null) {
    // click
    if (event && event.ctrlKey) {
      toggleFlag(cell);
      return;
    }
  
    if (gameOver || cell.revealed || cell.flagged) return;
    cell.revealed = true;
    const cellElement = document.getElementById(`cell-${cell.id}`);
    cellElement.classList.add("revealed");
  
    if (cell.mine) {
      cellElement.classList.add("mine");
      cellElement.textContent = "💣";
      gameOver = true;
      alert("Game Over! You hit a mine.");
      return;
    }
  
    if (cell.adjacentMines > 0) {
      cellElement.textContent = cell.adjacentMines;
    } else {
      const { x, y } = getXY(cell.id);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize) {
            revealCell(cells[getIndex(nx, ny)]);
          }
        }
      }
    }
  }
  
  // mine flag
  function toggleFlag(cell) {
    if (cell.revealed) return;
  
    cell.flagged = !cell.flagged;
    const cellElement = document.getElementById(`cell-${cell.id}`);
    if (cell.flagged) {
      cellElement.textContent = "🚩";
      cellElement.classList.add("flagged");
    } else {
      cellElement.textContent = "";
      cellElement.classList.remove("flagged");
    }
  }
  
  // board
  function createBoard() {
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    cells.forEach((cell) => {
      const cellElement = document.createElement("div");
      cellElement.id = `cell-${cell.id}`;
      cellElement.className = "cell";
      cellElement.addEventListener("click", (event) => revealCell(cell, event));
      board.appendChild(cellElement);
    });
  }
  

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const difficulty = button.id;
    startGame(difficulty);
  });
});
