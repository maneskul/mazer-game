let lastClickedType = null;
let gameTimer = 0;
const TIME = 45
const container = document.getElementById('game-container');

let disappears = [];
let cells = [];
let progress = 0, MAX_PROGRESS = 24;
let gameStoped = false;

function setupGameVersion() {
    const gameVersion = document.getElementById('gameVersion').value;
    window.types = { 1: ['banana', 'wolf', 'tree'], 2: ['paw', 'monkey', 'bear'] }[gameVersion];
    MAX_PROGRESS = { 1: 24, 2: 28 }[gameVersion];
}

function resetGame() {
    gameStoped = false;
    disappears = [];
    progress = 0;
    gameTimer = 0;
    cells = [];
    container.innerHTML = '';

    setupGameVersion();
    initializeGame();
}

function initializeGame() {
    // Resetar variáveis do jogo
    progress = 0;
    updateProgressDisplay();
    initializeGrid();
}

function updateProgressDisplay() {
    const progressDisplay = document.getElementById('progress');
    progressDisplay.textContent = progress + '/' + MAX_PROGRESS;
}

function initializeGrid() {
    for (let i = 0; i < 36; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        new Cell(type, false);
    }
}

function showMessage(message, timeout = 0) {
    const overlay = document.getElementById('overlay');
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    overlay.style.display = 'block';
    if (timeout > 0) {
        setTimeout(() => { overlay.style.display = 'none'; }, timeout);
    }
}

function gameFailed (type) {
    showMessage('Game Over! ' + (type === 0 ? 'Time out!' : 'No more moves left!'));
    gameStoped = true;
    gameTimer = 0;
}

function gameWon() {
    showMessage('Congratulations! You won!');
    gameStoped = true;
}

class Cell {
    constructor(type, clicked) {
        this.type = type;
        this.clicked = clicked;
        this.button = document.createElement('button');
        this.button.className = `cell ${type}`;
        this.button.onclick = () => this.click();
        this.clickable = true;
        container.appendChild(this.button);

        // this.button.appendChild(document.createTextNode(type));
        this.img = document.createElement('img');
        this.img.src = `images/${type}.png`;
        this.button.appendChild(this.img);

        this.gone = false;

        cells.push(this);
    }

    disappear() {
        disappears.push(this.type);
        this.button.classList.add('disappear');
        this.gone = true;

        if (progress >= 24) {
            gameWon()
        }
    }

    checkExtraPoints() {
        let lasts = disappears.slice(-3);
        if (new Set(lasts).size === 3) {
            progress += 1;
            showMessage('Triple Data Link +1', 1000);
        }
        if (lasts[0] === lasts[1] && lasts[1] === lasts[2]) {
            progress += 2;
            showMessage('CRC PASSED +2', 1000);
        }
    }

    click() {
        if (!this.clickable) {
            return;
        }

        if (gameStoped) {
            return;
        }

        cells.forEach(cell => {
            cell.clickable = false;
            cell.button.classList.remove('clickable');
        });

        this.button.style.backgroundColor = 'rgb(82, 84, 86)';
        lastClickedType = this.type;

        if (this.clicked) {
            this.disappear();
            progress += 1;
            this.checkExtraPoints();
            document.getElementById('progress').textContent = `${progress}/24`;
        }

        if (this.type === 'banana' || this.type == 'paw') {
            // Find all cells next to this cell and set it to clickable
            const index = cells.indexOf(this);
            const row = Math.floor(index / 6);
            const col = index % 6;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) {
                        continue;
                    }

                    const newRow = row + i;
                    const newCol = col + j;

                    if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                        const cell = cells[newRow * 6 + newCol];
                        cell.clickable = true;
                        cell.button.classList.add('clickable');
                    }
                }
            }
        } else if (this.type === 'tree' || this.type == 'bear') {
            // Find all cells 3 squares away from this cell and set it to clickable
            // It should be 3 squares away, DIRECTLY UP, DOWN, LEFT, RIGHT
            // For example
            // O 1 O O 1 O
            // O O O O O O
            // O O O O O O
            // O X O O 1 O
            // O O O O O O
            // In a square like pattern, X is the current cell, 1s are the clickable cells.
            // It should form a triangle of the clickable cells.
            // In a 6x6, theres only three possible clickable cells for a bird.
            const index = cells.indexOf(this);
            const row = Math.floor(index / 6);
            const col = index % 6;

            // bad way of doingthis? prolly a math formula to do this
            const possibleCells = [
                [row - 3, col],
                [row + 3, col],
                [row, col - 3],
                [row, col + 3],
                // Diagonals
                [row - 3, col - 3],
                [row - 3, col + 3],
                [row + 3, col - 3],
                [row + 3, col + 3],

            ];

            possibleCells.forEach(([newRow, newCol]) => {
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                    const cell = cells[newRow * 6 + newCol];
                    cell.clickable = true;
                    cell.button.classList.add('clickable');
                }
            });

        } else if (this.type === 'wolf' || this.type == 'monkey') {
            const index = cells.indexOf(this);
            const row = Math.floor(index / 6);
            const col = index % 6;

            const possibleCells = [
                [row - 2, col],
                [row + 2, col],
                [row, col - 2],
                [row, col + 2],
                // Diagonals
                [row - 2, col - 2],
                [row - 2, col + 2],
                [row + 2, col - 2],
                [row + 2, col + 2],

            ];

            possibleCells.forEach(([newRow, newCol]) => {
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                    const cell = cells[newRow * 6 + newCol];
                    cell.clickable = true;
                    cell.button.classList.add('clickable');
                }
            });
        }

        let nClickables = 0;
        cells.forEach(cell => {
            if (cell.clickable && !cell.gone) {
                nClickables += 1;
            }
        });

        if (nClickables === 0) {
            gameFailed(1);
        }

        if (!this.clicked) {
            // Randomly change the type of the clicked cell
            // Is this correct? Is there a pattern or is it random?
            this.type = types[Math.floor(Math.random() * types.length)];
            this.button.className = `cell ${this.type}`;
            this.img.src = `images/${this.type}.png`;
        }
        this.clicked = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupGameVersion(); // This will setup the game version immediately on load

    let first = true;

    initializeGrid();

    setInterval(() => {
        gameTimer += 1 / 100;
        // Decrease the time progress bar
        document.getElementById('bar').style.width = `${(TIME - gameTimer) / TIME * 100}%`;

        if (gameTimer >= TIME) {
            gameFailed(0);
        }

    }, 10);

});