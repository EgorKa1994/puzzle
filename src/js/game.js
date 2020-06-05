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

    //для таймера
    this.startDate;
    this.clocktimer;
    this.switch = false;

    this._init();
  }

  _init() {
    // клик на игровом поле
    this.gameArea.addEventListener(
      'click',
      this._listenClickonGameArea.bind(this)
    );
    // клик при победе в игре
    this.btn.addEventListener('click', this._listenClickonGameWin.bind(this));
    // клик на рестарт
    this.restartGame.addEventListener(
      'click',
      this._listenClickonRestart.bind(this)
    );
  }

  //СОБЫТИЯ******************************

  _listenClickonGameArea(e) {
    this.restartGame.classList.remove('invisible');
    let idOfCell = e.target.getAttribute('id');
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
      this._findTIME();
    }
  }

  _listenClickonGameWin() {
    this._showWinMessage();
    this.restart([1, 2, 3, 4, 5, 6, 7, 8]);
  }

  _listenClickonRestart() {
    this.restart([1, 2, 3, 4, 5, 6, 7, 8]);
  }

  //КОНЕЦ СОБЫТИЙ*****************************************************

  // получение начального расположения ячеек + разметка
  _getInitialGamePosition(primaryArray) {
    // Перемешивание данных в начальном массиве
    for (let i = primaryArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [primaryArray[i], primaryArray[j]] = [primaryArray[j], primaryArray[i]];
    }
    // Нахождение кол-ва неверно расположенных ячеек
    // Только при четном кол-ве таких расположений пазл может быть сложен!
    let sumOfWrongCases = this._getSumOfWrongСellPosition(primaryArray);

    if (!(sumOfWrongCases % 2)) {
      primaryArray.push(' ');
      for (let i = 0; i < this.elements.length; i++) {
        this.gameData.push({
          id: i,
          content: primaryArray[i],
        });
      }
      this._currentPositionMarkUp(this.gameData);
    } else {
      return this._getInitialGamePosition([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  }

  // получение кол-ва "неправильно расположенных ячеек в игровом поле" для проверки возможности решения пазла
  _getSumOfWrongСellPosition(mixedArray, sum = 0, a = 0) {
    let arrLength = mixedArray.length;

    if (a < arrLength - 1) {
      for (let i = a; i < arrLength; i++) {
        if (mixedArray[a] > mixedArray[i + 1]) {
          sum += 1;
        }
      }
      return this._getSumOfWrongСellPosition(mixedArray, sum, ++a);
    } else {
      return sum;
    }
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
    let sampleData = '12345678 ';
    let currentData = currentGameData.map((item) => {
      return item.content;
    });
    if (sampleData == currentData.join('')) {
      let timeFinalResult = this.gameTimer.innerHTML;

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
    clearTimeout(this.clocktimer);
    this.switch = false;
    this.gameTimer.innerHTML = `00. 00. 00`;
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

  _findTIME() {
    this.startDate = new Date(); // начальная точка отсчета
    this._startTIME();
  }

  _startTIME() {
    let thisDate = new Date(); // текущее время
    let t = thisDate.getTime() - this.startDate.getTime();
    let ms = t % 1000;
    t -= ms;
    ms = Math.floor(ms / 10);
    t = Math.floor(t / 1000);
    let s = t % 60;
    t -= s;
    t = Math.floor(t / 60);
    let m = t % 60;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    if (ms < 10) ms = '0' + ms;
    this.gameTimer.innerHTML = `${m}. ${s}. ${ms}`;
    this.clocktimer = setTimeout(this._startTIME.bind(this), 10);
  }
}
