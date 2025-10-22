var board = [];
var rows = 8;
var columns = 8;

var minesCount = 10;
var minesLocation = [];

var tilesClicked = 0; //goal to click all non mine tiles
var flagEnabled = false;
var flagsPlaced = 0;

var gameOver = false;
var gameStarted = false;

function toggleDropdown() {
    document.getElementById("difficultyDropdown").classList.toggle("show");
}

window.onload = function() {
    // Start initial game with default tile size
    startGame(60, 30);

    document.getElementById("board").addEventListener("contextmenu", e => e.preventDefault());

    // Difficulty dropdown listeners
    document.querySelectorAll('#difficultyDropdown a').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();

            // Update game globals
            rows = parseInt(this.dataset.rows);
            columns = parseInt(this.dataset.cols);
            minesCount = parseInt(this.dataset.mines);

            let boardEl = document.getElementById("board");

            // Clear old board and reset variables
            boardEl.innerHTML = "";
            board = [];
            minesLocation = [];
            tilesClicked = 0;
            flagsPlaced = 0;
            gameOver = false;
            gameStarted = false;

            // Determine tile size and font based on difficulty
            let tileSize, fontSize, headerSize;
            if (this.textContent.includes("Easy")) {
                tileSize = 60;
                fontSize = 30;
            } else if (this.textContent.includes("Medium")) {
                tileSize = 40;
                fontSize = 25;
            } else if (this.textContent.includes("Hard")) {
                tileSize = 30;
                fontSize = 20;
            }

            // Build the new board with the correct sizes
            startGame(tileSize, fontSize);
        });
    });

    // Close dropdown if click outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        resetBoard();
    });

    document.getElementById("flag").addEventListener("click", setFlag);
    
}

function startGame(tileSize, fontSize) {
    document.getElementById("resetBtn").innerText = "🙂";
    let boardEl = document.getElementById("board");
    boardEl.style.width = (columns * tileSize) + "px";
    boardEl.style.height = (rows * tileSize) + "px";
    let headerStyle = document.getElementById("header");
    headerStyle.style.width = (columns * tileSize) + "px"

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.style.width = (tileSize) + "px";
            tile.style.height = (tileSize) + "px";
            tile.style.fontSize = (fontSize) + "px";
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", rightClickTile);
            boardEl.appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }

    document.getElementById("mines-count").innerText = minesCount;
}

// Reset button
function resetBoard() {
    let boardEl = document.getElementById("board");
    boardEl.innerHTML = "";
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    flagsPlaced = 0;
    gameOver = false;
    gameStarted = false;

    // Determine tile size based on current rows/columns
    let tileSize, fontSize;
    if (rows === 8) { tileSize = 60; fontSize = 30; }
    else if (rows === 16) { tileSize = 40; fontSize = 25; }
    else if (rows === 24) { tileSize = 30; fontSize = 20; }

    startGame(tileSize, fontSize);
}

function updateDifficulty(rows, cols, mines) {
    currentRows = rows;
    currentCols = cols;
    currentMines = mines;
    startGame();
}



function setMines(safeTile) {
    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let safeCoords = safeTile.split("-");
        let safeR = parseInt(safeCoords[0]);
        let safeC = parseInt(safeCoords[1]);

        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;

        if (minesLocation.includes(id)) continue;

        minesLocation.push(id);
        minesLeft -= 1;
    }
}



function setFlag() {
    if(flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag").style.backgroundColor = "#2E455D";
        document.getElementById("flag").style.borderColor = "#1B293F"
        }
        else {
            flagEnabled = true;
            document.getElementById("flag").style.backgroundColor = "#4d6a8a";
            document.getElementById("flag").style.borderColor = "#2a3d5b"
        }
}

function clickTile() {
    let tile = this;

    // Flag toggle always works
    if (flagEnabled) {
        toggleFlag(tile);
        return;
    }

    if (gameOver || tile.classList.contains("tile-clicked")){
        return;
    } 

    // Start the game on first left click
    if (!gameStarted) {
        setMines(tile.id);
        gameStarted = true;
    }

    if (minesLocation.includes(tile.id)) {
        gameOver = true;
        document.getElementById("resetBtn").innerText = "😮";
        revealMines();
        return;
    }

    let coords = tile.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r,c);
}

function revealMines() {
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💥";
                tile.style.backgroundColor = "red";
            }
        }
    }
}

function checkMine(r, c) {
    if( r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }

    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked++;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);
    minesFound += checkTile(r-1, c);
    minesFound += checkTile(r-1, c+1);

    //left and right
    minesFound += checkTile(r, c-1);
    minesFound += checkTile(r, c+1);
    
    //bottom 3
    minesFound += checkTile(r+1, c-1);
    minesFound += checkTile(r+1, c);
    minesFound += checkTile(r+1, c+1);

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        //top 3
        checkMine(r-1, c-1);
        checkMine(r-1, c);
        checkMine(r-1, c+1);

        //left and right
        checkMine(r, c-1);
        checkMine(r, c+1);

        //bottom 3
        checkMine(r+1, c-1);
        checkMine(r+1, c);
        checkMine(r+1, c+1);
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
        document.getElementById("resetBtn").innerText = "😆";
    }

}

function checkTile(r, c) {
    if( r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}

function toggleFlag(tile) {
    if (!gameStarted) return;

    if(tile.innerText === "") {
        tile.innerText = "🚩";
        flagsPlaced++;
    } else if (tile.innerText === "🚩") {
        tile.innerText = "";
        flagsPlaced--;
    }
    document.getElementById("mines-count").innerText = minesCount - flagsPlaced;
}

function rightClickTile(e) {
    e.preventDefault();

    if (gameOver || e.target.classList.contains("tile-clicked")) return;

    let tile = e.target;

    if (!flagEnabled) {
        toggleFlag(tile);
        return;
    }

    toggleFlag(tile);
}

