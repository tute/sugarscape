Sugarscape = {
  random: function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
  }
}

Sugarscape.Agent = function(id, grid, square) {
  this.id = id;
  this.currentSugar = 1;
  this.visionRange        = Sugarscape.random(1, 6);
  this.metabolizationRate = Sugarscape.random(1, 4);
  this.maxLifetime        = Sugarscape.random(20, 100);
  this.grid = grid;
  this.moveTo(square);
}
Sugarscape.Agent.prototype = {
  isAlive: function() {
    return this.currentSugar > 0;
  },
  forage: function() {
    if (this.isAlive()) {
      var sweetestSquare = this.sweetestVisibleSquare();
      this.moveTo(sweetestSquare);
      this.eatSugar();
      this.metabolizeSugar();
    }
  },
  sweetestVisibleSquare: function() {
    var minX = Math.max.apply(null, [this.square.x - this.visionRange, 0]);
    var maxX = Math.min.apply(null, [this.square.x + this.visionRange, this.grid.width - 1]);
    var minY = Math.max.apply(null, [this.square.y - this.visionRange, 0]);
    var maxY = Math.min.apply(null, [this.square.y + this.visionRange, this.grid.height - 1]);

    var maxSugarThusFar = 0;
    var sweetestSquares = [];
    var testedSquares = [];
    for (var x = minX; x <= maxX; x++) {
      for (var y = minY; y <= maxY; y++) {
        var square = this.grid.squareAt(x, y);
        testedSquares.push(square);
        if (!square.isOccupied()) {
          if (square.currentSugar == maxSugarThusFar) {
            // if (this.id == 1) { console.log('id:', this.id, 'candidate:', square); }
            sweetestSquares.push(square);
          } else if (square.currentSugar > maxSugarThusFar) {
            // if (this.id == 1) { console.log('id:', this.id, 'candidate:', square); }
            maxSugarThusFar = square.currentSugar;
            sweetestSquares.length = 0;
            sweetestSquares.push(square);
          }
        }
      }
    };
    var sweetest = sweetestSquares[Sugarscape.random(0, sweetestSquares.length - 1)];
    // if (sweetest == undefined) {
    //   console.log('id:', this.id, 'agent:', this);
    //   console.log('id:', this.id, 'square:', this.square);
    //   console.log('id:', this.id, 'testedSquares:', testedSquares);
    //   console.log('id:', this.id, 'sweetestSquares:', sweetestSquares);
    //   console.log('id:', this.id, '[minX, minY]:', [minX, minY]);
    //   console.log('id:', this.id, '[maxX, maxY]:', [maxX, maxY]);
    // }
    // if (this.id == 1) {
    //   console.log('id:', this.id, 'square:', this.square);
    //   console.log('id:', this.id, 'sweetestSquares:', sweetestSquares);
    // }
    // console.log(
    //   this,
    //   this.square,
    //   [minX, minY],
    //   [maxX, maxY],
    //   sweetest
    // );
    return sweetest;
  },
  moveTo: function(square) {
    if (this.square != undefined) { this.square.removeAgent(); }
    this.square = square;
    if (this.square != undefined) { this.square.addAgent(this); }
  },
  eatSugar: function() {
    // if (this.id < 3) {
    //   console.log('id:', this.id, 'metabolizationRate: ', this.metabolizationRate);
    //   console.log('id:', this.id, 'squareSugar: ', this.square.currentSugar);
    //   console.log('id:', this.id, 'sugarBeforeEating: ', this.currentSugar);
    // }
    this.currentSugar += this.square.harvestSugar();
    // if (this.id < 3) { console.log('id:', this.id, 'sugarAfterEating: ', this.currentSugar); }
  },
  metabolizeSugar: function() {
    // if (this.id < 3) { console.log('id:', this.id, 'sugarBeforeMetabolizing: ', this.currentSugar); }
    this.currentSugar -= this.metabolizationRate
    // if (this.id < 3) { console.log('id:', this.id, 'sugarAfterMetabolizing: ', this.currentSugar); }
  }
}

Sugarscape.Grid = function() {
  this.width = 50;
  this.height = 50;
  this.numAgents = 250;
  this.initPeaks();
  this.initSquares();
  this.initAgents();
}
Sugarscape.Grid.prototype = {
  initPeaks: function() {
    // this.peaks = this.randomPeaks();
    this.peaks = this.canonicalPeaks();
  },
  initSquares: function() {
    this.squares = [];
    for (var x = 0; x < this.width; x++) {
      this.squares[x] = [];
      for (var y = 0; y < this.height; y++) {
        this.squares[x][y] = this.createSquare(x,y);
      }
    };
  },
  initAgents: function() {
    this.agents = [];
    for (var i = 0; i < this.numAgents; i++) {
      var square = this.randomSquare();
      while(square.isOccupied()) { square = this.randomSquare(); }
      var agent = new Sugarscape.Agent(i, this, square);
      this.agents[i] = agent;
    };
  },
  randomCoords: function() {
    return [
      Sugarscape.random(0, this.width - 1),
      Sugarscape.random(0, this.height - 1)
    ];
  },
  randomSquare: function() {
    return this.squareAt.apply(this, this.randomCoords());
  },
  randomPeaks: function() {
    return [this.randomCoords(), this.randomCoords()];
  },
  canonicalPeaks: function() {
    return [[this.width - 1, 0], [0, this.height - 1]];
  },
  distanceToNearestPeak: function(x, y) {
    var distances = [];
    for (var i = 0; i < this.peaks.length; i++) {
      var peak = this.peaks[i];
      var d = Math.sqrt(Math.pow(peak[0] - x, 2) + Math.pow(peak[1] - y, 2));
      distances.push(d);
    }
    return Math.min.apply(null, distances);
  },
  weightedMaxSugar: function(x, y) {
    var minDistance = this.distanceToNearestPeak(x, y);
    if      (minDistance < 10) { return Sugarscape.random(3, 4); }
    else if (minDistance < 20) { return Sugarscape.random(2, 3); }
    else if (minDistance < 30) { return Sugarscape.random(1, 2); }
    else if (minDistance < 40) { return Sugarscape.random(0, 2); }
    else                       { return Sugarscape.random(0, 1); }
  },
  randomMaxSugar: function() {
    return Sugarscape.random(0, 4);
  },
  createSquare: function(x, y) {
    // var maxSugar = this.randomMaxSugar();
    var maxSugar = this.weightedMaxSugar(x, y);
    return new Sugarscape.Square(x, y, maxSugar);
  },
  squareAt: function(x, y) {
    return this.squares[x][y];
  },
  eachSquare: function(callback) {
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        callback.apply(this, [this.squareAt(x, y)]);
      }
    }
  },
  eachAgent: function(callback) {
    for (var i = 0; i < this.agents.length; i++) {
      callback.apply(this, [this.agents[i]]);
    }
  },
  wakeAgents: function() {
    this.eachAgent(function(agent) {
      agent.forage();
    });
  },
  harvestAllSugar: function() {
    this.eachSquare(function(square) {
      square.harvestSugar();
    });
  },
  growSugar: function() {
    this.eachSquare(function(square) {
      square.growSugar();
    });
  }
}

Sugarscape.Square = function(x, y, maxSugar) {
  this.x = x;
  this.y = y;
  this.growthRate = 1;
  this.agent = null;
  this.maxSugar = maxSugar;
  this.currentSugar = this.maxSugar;
}
Sugarscape.Square.prototype = {
  addAgent: function(agent) {
    this.agent = agent;
  },
  removeAgent: function() {
    this.agent = null;
  },
  isOccupied: function() {
    return this.agent != null;
  },
  harvestSugar: function() {
    var prevSugar = this.currentSugar;
    this.currentSugar = 0;
    return prevSugar;
  },
  growSugar: function() {
    this.currentSugar += this.growthRate;
    this.currentSugar = Math.min.apply(null, [this.maxSugar, this.currentSugar]);
    return this.currentSugar;
  }
}

Sugarscape.GridView = function(grid) {
  this.grid = grid;
  this.squareViews = [];
}
Sugarscape.GridView.prototype = {
  render: function() {
    if (this.el == null) {
      this.el = document.createElement('div');
      this.el.setAttribute('class', 'grid');
      document.body.appendChild(this.el);
      for (var x = 0; x < this.grid.squares.length; x++) {
        this.squareViews[x] = [];
        var row = this.grid.squares[x];
        for (var y = 0; y < row.length; y++) {
          var square = row[y];
          this.squareViews[x][y] = new Sugarscape.SquareView(this, square);
        };
      };
    }
    for (var y = 0; y < this.grid.squares.length; y++) {
      for (var x = 0; x < this.grid.squares[y].length; x++) {
        this.squareViews[x][y].render();
      };
    };
  }
}

Sugarscape.SquareView = function(gridView, square) {
  this.gridView = gridView;
  this.square = square;
  this.el = null;
}
Sugarscape.SquareView.prototype = {
  sugarClass: function() {
    return 'sugar-' + this.square.currentSugar;
  },
  sugarTitle: function() {
    return 'sugar: ' + this.square.currentSugar;
  },
  agentClass: function() {
    if (this.square.isOccupied() && this.square.agent.isAlive()) {
      return 'occupied agent-' + this.square.agent.id;
    } else {
      return 'unoccupied';
    }
  },
  agentTitle: function() {
    if (this.square.isOccupied()) {
      return 'agent: ' + this.square.agent.id + ', agent-sugar: ' + this.square.agent.currentSugar;
    } else {
      return 'agent: none';
    }
  },
  squareTitle: function() {
    return 'position: (' + this.square.x + ',' + this.square.y + ')';
  },
  classString: function() {
    return ['square', this.agentClass(), this.sugarClass()].join(' ');
  },
  titleString: function() {
    return [this.squareTitle(), this.sugarTitle(), this.agentTitle()].join(', ');
  },
  render: function() {
    if (this.el == null) {
      this.el = document.createElement('div');
      this.gridView.el.appendChild(this.el);
    }
    this.el.setAttribute('class', this.classString());
    this.el.setAttribute('title', this.titleString());
  }
}
