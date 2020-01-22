class Player {
  constructor(name, coin) {
    this.name = name;
    this.coin = coin;
    this.currentRow = 9;
    this.currentCell = -1;
    this.previousRow = 0;
    this.previousCell = 0;
    this.previousValue = 100;
    this.ladderPositions = [
      { row: 9, cell: 8, targetRow: 6, targetCell: 6 },
      { row: 6, cell: 0, targetRow: 3, targetCell: 3 },
      { row: 2, cell: 6, targetRow: 0, targetCell: 3 }
    ];
    this.snakePositions = [
      { row: 4, cell: 6, targetRow: 8, targetCell: 1 },
      { row: 0, cell: 1, targetRow: 2, targetCell: 3 },
      { row: 1, cell: 6, targetRow: 5, targetCell: 9 }
    ];
  }
  getValueForOddRow(randomValue) {
    this.currentCell += randomValue;
    if (this.currentCell > 9) {
      this.currentRow--;
      this.currentCell = 9 - (this.currentCell - 10);
    }
  }

  getValueForEvenRow(randomValue) {
    this.currentCell -= randomValue;
    if (this.currentCell < 0) {
      this.currentRow--;
      this.currentCell = -1 - this.currentCell;
    }
  }

  checkForMatching = position => {
    const { row, cell, targetRow, targetCell } = position;
    if (row == this.currentRow && cell == this.currentCell) {
      this.currentRow = targetRow;
      this.currentCell = targetCell;
    }
  };

  updatePreviousValue(gameZone) {
    this.previousRow = this.currentRow;
    this.previousCell = this.currentCell;
    this.previousValue =
      gameZone.rows[this.currentRow].cells[this.currentCell].innerText;
  }

  updateCurrentValue(randomValue) {
    const getValue = { 0: this.getValueForEvenRow, 1: this.getValueForOddRow };
    getValue[this.currentRow % 2].bind(this)(randomValue);
    this.ladderPositions.forEach(this.checkForMatching);
    this.snakePositions.forEach(this.checkForMatching);
    this.updatePreviousValue(gameZone);
  }

  get checkWinStatus() {
    return this.currentRow == 0 && this.currentCell == 0;
  }
}

let playersList = [];
let playerCoins = [
  './assets/ball1.png',
  './assets/ball2.png',
  './assets/ball3.png'
];

const createPlayer = () => {
  let playerName = prompt('Enter player Name') || playersList.length;
  const coin = playerCoins.shift();
  playerName = new Player(playerName, coin);
  playersList.push(playerName);
  if (playersList.length > 2) {
    document.getElementById('newPlayer').setAttribute('disabled', true);
  }
};

const updateTable = (currentPlayer, gameZone, randomValue) => {
  gameZone.rows[currentPlayer.previousRow].cells[
    currentPlayer.previousCell
  ].innerHTML = currentPlayer.previousValue;
  currentPlayer.updateCurrentValue(randomValue);
  let currentBox =
    gameZone.rows[currentPlayer.currentRow].cells[currentPlayer.currentCell];
  const image = `<img src=${currentPlayer.coin} width="20px" height="15px"/>`;
  currentBox.innerHTML = currentBox.innerHTML + image;
};

const declareWinner = name => {
  const div = document.getElementById('gameTools');
  div.removeChild(document.getElementById('dice'));
  document.getElementById('text').innerText = `${name} won the game`;
};

const runGame = () => {
  if (playersList.length < 2) {
    alert('Create Atleast two players to play game');
    return;
  }
  const currentPlayer = playersList.shift();
  const randomValue = Math.ceil(Math.random() * 6);
  const { currentRow, currentCell } = currentPlayer;
  document.getElementById('dice').src = `./assets/dice_${randomValue}.png`;
  const gameZone = document.getElementById('gameZone');
  if (!(currentRow - 1 < 0 && currentCell - randomValue < 0)) {
    updateTable(currentPlayer, gameZone, randomValue);
  }
  console.log(currentPlayer.name);
  console.log(currentPlayer.currentRow, currentPlayer.currentCell);
  if (currentPlayer.checkWinStatus) {
    declareWinner(currentPlayer.name);
    return;
  }
  playersList.push(currentPlayer);
  document.getElementById(
    'text'
  ).innerText = `${playersList[0].name} your turn`;
};
