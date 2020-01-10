class Player {
  constructor(name, coin) {
    this.name = name;
    this.coin = coin;
    this.currentPosition = { row: 9, cell: -1, value: 0 };
    this.previousPosition = { row: 0, cell: 0, value: 100 };
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
    let { row, cell } = this.currentPosition;
    cell += randomValue;
    if (cell > 9) {
      row--;
      cell = 9 - (cell - 10);
    }
    this.currentPosition = { row, cell };
  }

  getValueForEvenRow(randomValue) {
    let { row, cell } = this.currentPosition;
    cell -= randomValue;
    if (cell < 0) {
      row--;
      cell = -1 - cell;
    }
    this.currentPosition = { row, cell };
  }

  checkForMatching = position => {
    let { row, cell } = this.currentPosition;
    if (position.row == row && position.cell == cell) {
      row = position.targetRow;
      cell = position.targetCell;
    }
    this.currentPosition = { row, cell };
  };

  changePreviousValue(gameZone) {
    let { row, cell, value } = this.previousPosition;
    const currentPosition = this.currentPosition;
    gameZone.rows[row].cells[cell].innerHTML = value;
    row = currentPosition.row;
    cell = currentPosition.cell;
    value =
      gameZone.rows[currentPosition.row].cells[currentPosition.cell].innerText;
    this.previousPosition = { row, cell, value };
  }

  changeCurrentValue(randomValue) {
    const getValue = { 0: this.getValueForEvenRow, 1: this.getValueForOddRow };
    const gameZone = document.getElementById('gameZone');
    getValue[this.currentPosition.row % 2].bind(this)(randomValue);
    this.ladderPositions.forEach(this.checkForMatching);
    this.snakePositions.forEach(this.checkForMatching);
    this.changePreviousValue(gameZone);
    const { row, cell } = this.currentPosition;
    let currentBox = gameZone.rows[row].cells[cell];
    const image = `<img src=${this.coin} width="20px" height="15px"/>`;
    currentBox.innerHTML = currentBox.innerHTML + image;
  }

  checkWinStatus() {
    const { row, cell } = this.currentPosition;
    console.log(this.name);
    console.log(this.currentPosition);
    if (row == 0 && cell == 0) {
      const div = document.getElementById('gameTools');
      div.removeChild(document.getElementById('dice'));
      document.getElementById('text').innerText = `${this.name} won the game`;
    }
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

const runGame = () => {
  if (playersList.length < 2) {
    alert('Create Atleast two players to play game');
    return;
  }
  const currentPlayer = playersList.shift();
  const { row, cell } = currentPlayer.currentPosition;
  const randomValue = Math.ceil(Math.random() * 6);
  document.getElementById('dice').src = `./assets/dice_${randomValue}.png`;
  if (!(row - 1 < 0 && cell - randomValue < 0)) {
    currentPlayer.changeCurrentValue(randomValue);
    currentPlayer.checkWinStatus();
  }
  playersList.push(currentPlayer);
  document.getElementById(
    'text'
  ).innerText = `${playersList[0].name} your turn`;
};
