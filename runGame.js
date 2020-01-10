class Player {
  constructor(name, coin) {
    this.name = name;
    this.coin = coin;
    this.currentRow = 9;
    this.currentCell = -1;
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

  changePreviousValue(gameZone) {
    const { row, cell, value } = this.previousPosition;
    gameZone.rows[row].cells[cell].innerHTML = value;
    this.previousPosition['row'] = this.currentRow;
    this.previousPosition['cell'] = this.currentCell;
    this.previousPosition['value'] =
      gameZone.rows[this.currentRow].cells[this.currentCell].innerText;
  }

  changeCurrentValue(randomValue) {
    const getValue = { 0: this.getValueForEvenRow, 1: this.getValueForOddRow };
    const gameZone = document.getElementById('gameZone');
    getValue[this.currentRow % 2].bind(this)(randomValue);
    this.ladderPositions.forEach(this.checkForMatching);
    this.snakePositions.forEach(this.checkForMatching);
    this.changePreviousValue(gameZone);
    let currentBox = gameZone.rows[this.currentRow].cells[this.currentCell];
    const image = `<img src=${this.coin} width="20px" height="15px"/>`;
    currentBox.innerHTML = currentBox.innerHTML + image;
  }

  checkWinStatus() {
    if (this.currentRow == 0 && this.currentCell == 0) {
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
  const { currentRow, currentCell } = currentPlayer;
  const randomValue = Math.ceil(Math.random() * 6);
  document.getElementById('dice').src = `./assets/dice_${randomValue}.png`;
  if (!(currentRow - 1 < 0 && currentCell - randomValue < 0)) {
    currentPlayer.changeCurrentValue(randomValue);
    currentPlayer.checkWinStatus();
  }
  playersList.push(currentPlayer);
  document.getElementById(
    'text'
  ).innerText = `${playersList[0].name} your turn`;
};
