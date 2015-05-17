Sugarscape = {
  random: function(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
  }
}

Sugarscape.Agent = function(id, grid, square) {
  this.id = id;
  this.currentSugar       = Sugarscape.random(1, 10);
  this.visionRange        = Sugarscape.random(1, 6);
  this.metabolizationRate = Sugarscape.random(1, 4);
  this.maxLifetime        = Sugarscape.random(60, 100);
  this.age                = Sugarscape.random(0, this.maxLifetime);
  this.grid               = grid;
  this.square             = square;
}

Sugarscape.Agent.prototype = {
  isAlive: function() {
    var alive = this.currentSugar > 0 && this.age <= this.maxLifetime;
    if (!alive && this.square.agent == this) {
      this.square.agent = null;
      this.grid.removeAgent(this);
    }
    return alive;
  },
  forage: function() {
    if (this.isAlive()) {
      this.growOlder();
      this.moveTo(this.sweetestVisibleSquare());
      this.eatSugar();
      this.metabolizeSugar();
    }
  },
  growOlder: function() {
    this.age += 1;
  },
  moveTo: function(square) {
    this.square.removeAgent();
    this.square = square;
    this.square.addAgent(this);
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
            sweetestSquares.push(square);
          } else if (square.currentSugar > maxSugarThusFar) {
            maxSugarThusFar = square.currentSugar;
            sweetestSquares.length = 0;
            sweetestSquares.push(square);
          }
        }
      }
    };
    // FIXME: Should be the closest
    var sweetest = sweetestSquares[Sugarscape.random(0, sweetestSquares.length - 1)];
    // if (sweetest == undefined) {
    //   console.log('id:', this.id, 'agent:', this);
    //   console.log('id:', this.id, 'square:', this.square);
    //   console.log('id:', this.id, 'testedSquares:', testedSquares);
    //   console.log('id:', this.id, 'sweetestSquares:', sweetestSquares);
    //   console.log('id:', this.id, '[minX, minY]:', [minX, minY]);
    //   console.log('id:', this.id, '[maxX, maxY]:', [maxX, maxY]);
    //   console.log(
    //     this,
    //     this.square,
    //     [minX, minY],
    //     [maxX, maxY],
    //     sweetest
    //   );
    // }
    return sweetest;
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
  this.initialAgentsNum = 250;
  this.growthDelay = 9;
  this.lastAgentId = 1;

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
    for (var i = 0; i < this.initialAgentsNum; i++) {
      this.createNewAgent();
    };
  },
  removeAgent: function(agent) {
    index = this.agents.indexOf(agent);
    if (index > -1) {
      this.agents = this.agents.
        slice(0, index).
        concat(this.agents.slice(index + 1));

      this.createNewAgent();
    }
  },
  createNewAgent: function() {
    var square = this.randomSquare();
    while(square.isOccupied()) { square = this.randomSquare(); }
    var agent = new Sugarscape.Agent(this.lastAgentId += 1, this, square);
    agent.age = 0;
    this.agents.push(agent);
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
  this.harvestedNPeriodsAgo = 0;
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
    this.harvestedNPeriodsAgo = 0;
    return prevSugar;
  },
  growSugar: function() {
    if (this.harvestedNPeriodsAgo < grid.growthDelay) {
      this.harvestedNPeriodsAgo += 1;
    } else {
      this.currentSugar += this.growthRate;
      this.currentSugar = Math.min.apply(null, [this.maxSugar, this.currentSugar]);
      return this.currentSugar;
    }
  }
}

Sugarscape.GridView = function(grid) {
  this.grid = grid;
  this.squareViews = [];
}
Sugarscape.GridView.prototype = {
  render: function() {
    if (this.el == null) {
      this.el = document.getElementById('sugarscape');
      this.el.setAttribute('class', 'grid');
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

      var self = this;
      this.el.addEventListener("click", function(event) {
        if (self.square.agent) {
          var agent = self.square.agent;
          document.getElementById("inspect-agent").innerHTML = "" +
            "id: " + agent.id +
            " in (" + self.square.x + ", " + self.square.y + ")<br>" +
            "Sugar: " + agent.currentSugar + "<br>" +
            "Vision Range: " + agent.visionRange + "<br>" +
            "Metabol. Rate: " + agent.metabolizationRate + ".";
        }
      }, false);
    }
    this.el.setAttribute('class', this.classString());
    this.el.setAttribute('title', this.titleString());
  }
}
