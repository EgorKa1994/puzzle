export default class Game {
  constructor() {
    this.gameArea = document.querySelector('.fifteen-wrap');
    this.container = document.querySelector('.container');
    this.elements = this.gameArea.querySelectorAll('div');
    this.winMessage = document.querySelector('.message');
    this.finalResult = document.querySelector('.message__result');
    this.btn = document.querySelector('.approve');
    this.restartGame = document.querySelector('#res');
    this.gameTimer = document.querySelector('#timer');
    this.currentCounter = document.querySelector('.result__quantity_value');
    this.bestTime = document.querySelector('#besttime');
    this.bestQuantity = document.querySelector('#bestquantity');

    this.counter = 0; // счетчик ходов

    this.gameData = []; // массив объектов (исходные данные)

    // для таймера
    this.primaryDate;
    this.timer;
    this.switch = false;

    this._init();
  }

  _init() {
    // клик на игровом поле
    this.gameArea.addEventListener(
      'click',
      this._handleClickOnGameArea.bind(this)
    );
    // клик при победе в игре
    this.btn.addEventListener('click', this._handleClickOnGameWin.bind(this));
    // клик на рестарт
    this.restartGame.addEventListener(
      'click',
      this._handleClickOnRestart.bind(this)
    );
  }

  // события----------------------------------------

  _handleClickOnGameArea(e) {
    this.restartGame.classList.remove('invisible');
    const idOfCell = e.target.getAttribute('id');
    let idOfEmptyCell;
    this.gameData.forEach((item) => {
      if (item.content == ' ') {
        idOfEmptyCell = item.id;
      }
    });
    if (
      (idOfEmptyCell - idOfCell == 1 &&
        idOfEmptyCell !== 6 &&
        idOfEmptyCell !== 3) ||
      (idOfCell - idOfEmptyCell == 1 &&
        idOfEmptyCell !== 2 &&
        idOfEmptyCell !== 5) ||
      idOfEmptyCell - idOfCell == 3 ||
      idOfCell - idOfEmptyCell == 3
    ) {
      this.gameData[idOfEmptyCell].content = this.gameData[idOfCell].content;
      this.gameData[idOfCell].content = ' ';
      ++this.counter;

      this._currentPositionMarkUp(this.gameData);
      this._checkCurrentGamePosition(this.gameData);
    }

    if (!this.switch) {
      this.switch = true;
      this._getPrimaryTime();
    }
  }

  _handleClickOnGameWin() {
    this._showWinMessage();
    this.restart([1, 2, 3, 4, 5, 6, 7, 8]);
  }

  _handleClickOnRestart() {
    this.restart([1, 2, 3, 4, 5, 6, 7, 8]);
  }

  // конец событий-------------------------------------

  // получение начального расположения ячеек + разметка
  _getInitialGamePosition(primaryArray) {
    // перемешивание данных в начальном массиве
    primaryArray.forEach((item, index) => {
      const j = Math.floor(Math.random() * (index + 1));
      [primaryArray[index], primaryArray[j]] = [
        primaryArray[j],
        primaryArray[index],
      ];
    });

    // нахождение кол-ва неверно расположенных ячеек
    // только при четном кол-ве таких расположений пазл может быть сложен!
    const sumOfWrongCases = this._getSumOfWrongСellPosition(primaryArray);

    if (!(sumOfWrongCases % 2)) {
      primaryArray.push(' ');
      this.elements.forEach((item, index) => {
        this.gameData.push({
          id: index,
          content: primaryArray[index],
        });
      });
      this._currentPositionMarkUp(this.gameData);
    } else {
      return this._getInitialGamePosition([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  }

  // получение кол-ва "неправильно расположенных ячеек в игровом поле" для проверки возможности решения пазла
  _getSumOfWrongСellPosition(mixedArray, sum = 0, a = 0) {
    const arrLength = mixedArray.length;

    if (a < arrLength - 1) {
      for (let i = a; i < arrLength; i++) {
        if (mixedArray[a] > mixedArray[i + 1]) {
          sum += 1;
        }
      }
      return this._getSumOfWrongСellPosition(mixedArray, sum, ++a);
    }
    return sum;
  }

  // Разметка текущей игровой позиции
  _currentPositionMarkUp(gameData) {
    gameData.forEach((item, index) => {
      this.elements[index].setAttribute('id', item.id);
      this.elements[index].innerHTML = item.content;
    });
    this.currentCounter.innerHTML = `Кол-во ходов: ${this.counter}`;
  }

  // проверка на завершение игры
  _checkCurrentGamePosition(currentGameData) {
    const sampleData = '12345678 ';
    const currentData = currentGameData.map((item) => item.content);
    if (sampleData == currentData.join('')) {
      const timeFinalResult = this.gameTimer.innerHTML;

      this.finalResult.innerHTML = `Ваш результат: ${this.counter} хода(-ов), время - ${timeFinalResult}`;

      this._checkFinalResult(); // является ли результат наилучшим
      this._showWinMessage();
    }
  }

  // сообщение с результатом игры
  _showWinMessage() {
    this.winMessage.classList.toggle('invisible');
    this.container.classList.toggle('invisible');
  }

  // рестарт игры
  restart(primaryArray) {
    this.restartGame.classList.add('invisible');
    this.gameData = [];
    this.counter = 0;
    clearTimeout(this.timer);
    this.switch = false;
    this.gameTimer.innerHTML = '00. 00. 00';
    this._markUpBestSavedResult();
    this._getInitialGamePosition(primaryArray);
  }

  // Разметка лучшего результата
  _markUpBestSavedResult() {
    this.bestTime.innerHTML = localStorage.getItem('time') || '';
    this.bestQuantity.innerHTML = localStorage.getItem('quantity') || '';
  }

  // Проверка, является ли финальный результат лучшим
  _checkFinalResult() {
    if (this.bestTime.innerHTML == '') {
      localStorage.setItem('time', this.gameTimer.innerHTML);
      localStorage.setItem('quantity', this.counter);
    } else {
      if (this.gameTimer.innerHTML < localStorage.getItem('time')) {
        localStorage.time = this.gameTimer.innerHTML;
      }
      if (this.counter < localStorage.getItem('quantity')) {
        localStorage.quantity = this.counter;
      }
    }
  }

  // таймер

  _getPrimaryTime() {
    this.primaryDate = new Date(); // начальная точка отсчета
    this._getCurrentTime();
  }

  _getCurrentTime() {
    const currentDate = new Date(); // текущее время
    let deltaTime = currentDate.getTime() - this.primaryDate.getTime();
    let milliseconds = deltaTime % 1000;
    deltaTime -= milliseconds;
    milliseconds = Math.floor(milliseconds / 10);
    deltaTime = Math.floor(deltaTime / 1000);
    let seconds = deltaTime % 60;
    deltaTime -= seconds;
    deltaTime = Math.floor(deltaTime / 60);
    let minutes = deltaTime % 60;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;
    if (milliseconds < 10) milliseconds = `0${milliseconds}`;
    this.gameTimer.innerHTML = `${minutes}. ${seconds}. ${milliseconds}`;
    this.timer = setTimeout(this._getCurrentTime.bind(this), 10);
  }
}
