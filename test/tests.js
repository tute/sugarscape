QUnit.test("Agent#isAlive()", function(assert) {
  var agent = new Sugarscape.Agent();
  agent.maxLifetime = 90;
  agent.age = 20;

  agent.currentSugar = 3;
  assert.ok(agent.isAlive(), "with sugar agent is alive");

  agent.currentSugar = 0;
  assert.notOk(agent.isAlive(), "no sugar should kill agent");
});

// TODO: forage
// TODO: sweetestVisibleSquare

QUnit.test("Agent#growOlder()", function(assert) {
  var agent = new Sugarscape.Agent();
  agent.age = 20;

  agent.growOlder();
  assert.equal(agent.age, 21, "growOlder makes a year pass by");
});

QUnit.test("Agent#moveTo()", function(assert) {
  var square = {
    agent: undefined,
    removeAgent: function() { this.agent = undefined },
    addAgent: function(agent) { this.agent = agent }
  }
  var square2 = {
    agent: undefined,
    removeAgent: function() { this.agent = undefined },
    addAgent: function(agent) { this.agent = agent }
  }
  var agent = new Sugarscape.Agent(undefined, undefined, square);
  square.addAgent(agent);

  assert.equal(agent.square, square, "agent starts in its square");
  assert.equal(square.agent, agent, "square holds agent");
  assert.equal(square2.agent, undefined, "square2 is empty");

  agent.moveTo(square2);
  assert.equal(agent.square, square2, "agent end in square2");
  assert.equal(square.agent, undefined, "square is empty");
  assert.equal(square2.agent, agent, "square2 holds agent");
});

QUnit.test("Agent#eatSugar()", function(assert) {
  var square = { harvestSugar: function() { return 3; } };
  var agent = new Sugarscape.Agent(undefined, undefined, square);
  agent.currentSugar = 10;

  agent.eatSugar();
  assert.equal(agent.currentSugar, 13, "eats the sugar in its square");
});

QUnit.test("Agent#metabolizeSugar()", function(assert) {
  var agent = new Sugarscape.Agent();
  agent.currentSugar = 10;
  agent.metabolizationRate = 5;

  agent.metabolizeSugar();
  assert.equal(agent.currentSugar, 5, "metabolizes sugar at its rate");
});
