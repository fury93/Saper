var Saper = (function () {
  var Game = function start(cols, rows, bombs) {
    this.cols = Number(cols) || 10;
    this.rows = Number(rows) || 10;
    this.bombs = Number(bombs) || 10;
    this.cellsNumber = cols * rows;

    this.icons = ['U+20E3', '\uD83D\uDCA3', 'x', '\u0023'];
    this.map = document.getElementById('map');
    this.bombsNumber = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
    this.map.innerHTML = '';
    this.move(true);

    var that = this;

    this.bombArray().forEach(function (a, i) {
      var mine = that.mine(a);
      var xCoord = Math.floor((i + 1) % that.cols) || that.cols;
      var yCoord = Math.ceil((i + 1) / that.cols);
      mine.classList.add('x' + xCoord, 'y' + yCoord);
      mine.neighbors = [
        ('.x' + xCoord + '.y' + (yCoord + 1)),
        ('.x' + xCoord + '.y' + (yCoord - 1)),
        ('.x' + (xCoord + 1) + '.y' + (yCoord + 1)),
        ('.x' + (xCoord + 1) + '.y' + (yCoord - 1)),
        ('.x' + (xCoord + 1) + '.y' + yCoord),
        ('.x' + (xCoord - 1) + '.y' + (yCoord + 1)),
        ('.x' + (xCoord - 1) + '.y' + (yCoord - 1)),
        ('.x' + (xCoord - 1) + '.y' + yCoord)
      ];

      that.map.appendChild(mine);
      if (xCoord === that.cols) {
        that.map.appendChild(document.createElement('br'));
      }
    });

    var cells = document.querySelectorAll('.cell');
    for (var i = 0; i < cells.length; i++) {
      var obj = cells[i];
      if (obj.isBomb) continue;
      var count = 0;
      Array.prototype.forEach.call(document.querySelectorAll(obj.neighbors), function (n) {
        if (n.isBomb) count++
      });
      if (count === 0) {
        obj.isSpace = true;
      }
      obj.mine_count = count
    }

    this.resetData();
    this.addEvents();
    this.updateBombs();
  };

  Game.prototype.resetData = function () {
    document.getElementById('timer').textContent = '0.00';
  };

  Game.prototype.addEvents = function () {
    var that = this;
    var cells = document.getElementsByClassName('cell');

    Array.prototype.forEach.call(cells, function (target) {
      target.addEventListener('click', function (evt) {
        if (!target.isMasked || target.isFlagged) {
          return;
        }
        if (document.getElementsByClassName('unmasked').length === 0) {
          that.startTimer();

          if (target.isBomb) {
            that.restart();
            var targetClasses = target.className.replace('unmasked', '');
            document.getElementsByClassName(targetClasses)[0].click();

            return;
          }
        }
        if (evt.view) {
          that.move();
        }

        target.reveal();

        if (target.isSpace) {
          var neighbors = Array.prototype.filter.call(
              document.querySelectorAll(target.neighbors),
              function (neighbor) {
                return neighbor.isMasked;
              }
          );

          Array.prototype.forEach.call(
              neighbors,
              function triggerfriends (n) {
                setTimeout(function () {
                  n.dispatchEvent(new MouseEvent('click'))
                }, 5)
              }
          );
        }
        that.game()
      });

      target.addEventListener('contextmenu', function (evt) {
        evt.preventDefault();
        if (!target.isMasked) { return }
        if (target.isFlagged) {
          target.innerHTML = that.icons[3];
          target.isFlagged = false
        } else {
          target.innerHTML = that.icons[2];
          target.isFlagged = true
        }
        that.updateBombs()
      })
    })
  };

  Game.prototype.updateBombs = function () {
    var flag = Array.prototype.filter.call(
        document.getElementsByClassName('cell'),
        function (target) {
          return target.isFlagged;
        }
    );
    document.getElementById('bombs-left').textContent = this.bombs - flag.length;
  };

  Game.prototype.game = function () {
    if (this.result) {
      return;
    }

    var cells = document.getElementsByClassName('cell');

    var masked = Array.prototype.filter.call(cells, function (cell) {
      return cell.isMasked
    });

    var bombs = Array.prototype.filter.call(cells, function (cell) {
      return cell.isBomb && !cell.isMasked
    });

    if (bombs.length > 0) {
      Array.prototype.forEach.call(masked, function (cell) { cell.reveal() });
      this.result = 'lost';
      this.showMessage();
    } else if (masked.length === this.bombs) {
      Array.prototype.forEach.call(masked, function (cell) { cell.reveal(true) });
      this.result = 'won';
      this.showMessage();
    }
  };

  Game.prototype.restart = function () {
    clearInterval(this.timer);
    this.result = false;
    this.timer = false;
    Game.start();
  };

  Game.prototype.startTimer = function () {
    if (this.timer) {
      return;
    }

    this.startTime = new Date();
    this.timer = setInterval(function () {
      document.getElementById('timer').textContent = ((new Date() - game.startTime) / 1000).toFixed(2)
    }, 100)
  };

  Game.prototype.move = function (zero) {
    zero ? this.moves = 0 : this.moves++;
    document.getElementById('moves').textContent = this.moves;
  };

  Game.prototype.showMessage = function () {
    clearInterval(this.timer);
    var seconds = ((new Date() - this.startTime) / 1000).toFixed(2);
    var winner = this.result === 'won';
    document.querySelector('.wrapper').classList.add(this.result);
    document.getElementById('timer').textContent = seconds;
  };

  Game.prototype.mine = function (bomb) {
    var that = this;
    var base = document.createElement('span');
    base.className = 'cell';
    base.innerHTML = this.icons[3];
    base.isMasked = true;

    if (bomb) {
      base.isBomb = true;
    }

    base.reveal = function (won) {
      var newIcon = won ? that.icons[2] : that.icons[1];
      var icon = this.isBomb ? newIcon : that.bombsNumber[this.mine_count];
      this.innerHTML = icon;
      this.isMasked = false;
      this.classList.add('unmasked')
    };
    return base
  };

  Game.prototype.bombArray = function () {
    var arr = [];
    for (var i = 0; i < this.bombs; i++) {
      arr.push(true)
    }
    for (var n = 0; n < (this.cellsNumber - this.bombs); n++) {
      arr.push(false)
    }

    var currentIndex = arr.length,
        temporaryValue,
        randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }

    return arr;
  };

  return {
    restartGame: function () {
      new Game(10, 10, 10);
    }
  };
})();

