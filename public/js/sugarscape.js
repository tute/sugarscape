Sugarscape = {
  random: function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
  }
}

Sugarscape.Agent = function(grid, square) {
  this.currentSugar = 0;
  this.visionRange        = Sugarscape.random(1, 6);
  this.metabolizationRate = Sugarscape.random(1, 4);
  this.maxLifetime        = Sugarscape.random(20, 100);
  this.grid = grid;
  this.moveTo(square);
}
Sugarscape.Agent.prototype = {
  forage: function() {
    var sweetestSquare = this.sweetestVisibleSquare();
    this.moveTo(sweetestSquare);
    this.eatSugar();
    this.metabolizeSugar();
  },
  sweetestVisibleSquare: function() {
    var sweetestSquare = null;
    for (var x = 1; x <= this.visionRange && this.square.x + x < this.grid.width - 1; x++) {
      var square = this.grid.squareAt(this.square.x + x, this.square.y);
      if (sweetestSquare == null) { sweetestSquare = square }
      else if (square.currentSugar > sweetestSquare.currentSugar) { sweetestSquare = square }
    };
    for (var x = 1; x <= this.visionRange && this.square.x - x >= 0; x++) {
      var square = this.grid.squareAt(this.square.x - x, this.square.y);
      if (sweetestSquare == null) { sweetestSquare = square }
      else if (square.currentSugar > sweetestSquare.currentSugar) { sweetestSquare = square }
    };
    for (var y = 1; y <= this.visionRange && this.square.y + y < this.grid.height - 1; y++) {
      var square = this.grid.squareAt(this.square.x, this.square.y + y);
      if (sweetestSquare == null) { sweetestSquare = square }
      else if (square.currentSugar > sweetestSquare.currentSugar) { sweetestSquare = square }
    };
    for (var y = 1; y <= this.visionRange && this.square.y - y >= 0; y++) {
      var square = this.grid.squareAt(this.square.x, this.square.y - y);
      if (sweetestSquare == null) { sweetestSquare = square }
      else if (square.currentSugar > sweetestSquare.currentSugar) { sweetestSquare = square }
    };
    return sweetestSquare;
  },
  moveTo: function(square) {
    if (this.square != undefined) { this.square.removeAgent(); }
    this.square = square;
    this.square.addAgent(this);
  },
  eatSugar: function() {
    this.currentSugar += this.square.harvestSugar();
  },
  metabolizeSugar: function() {
    this.currentSugar -= this.metabolizationRate
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
      var agent = new Sugarscape.Agent(this, square);
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
    for (var x = 0; x < this.grid.squares.length; x++) {
      for (var y = 0; y < this.grid.squares[x].length; y++) {
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
  agentClass: function() {
    return this.square.isOccupied() ? 'occupied' : 'unoccupied';
  },
  classString: function() {
    return ['square', this.agentClass(), this.sugarClass()].join(' ');
  },
  titleString: function() {
    return [this.agentClass(), this.sugarClass()].join(', ');
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
