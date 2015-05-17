Sugarscape.Charts = {
  aliveAndDead: null,
  histogram: null,

  initAliveAndDead: function() {
    this.aliveAndDead = new Highcharts.Chart({
      chart: { renderTo: "chart" },
      title: false,
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          center: ["50%", "75%"]
        }
      },
      series: [{
        type: "pie",
        name: "Agents",
        innerSize: "50%",
        data: [ ["Alive", 250], ["Dead", 0], { name: "Others" } ]
      }]
    });
  },

  updateAliveAndDead: function(agents) {
    var aliveAgents = agents.filter(function(agent) {
      return agent.isAlive();
    });

    if (this.aliveAndDead.series) {
      deadNum = agents.length - aliveAgents.length;
      this.aliveAndDead.series[0].setData(
        [
          ["" + aliveAgents.length + " alive", aliveAgents.length],
          ["" + deadNum + " dead", deadNum]
        ],
        true
      );
    }
  },

  initHistogram: function() {
    this.histogram = new Highcharts.Chart({
      chart: {
        type: "column",
        renderTo: "wealth"
      },
      legend: { enabled: false },
      title: { text: "Wealth Distribution" },
      xAxis: {
        categories: [],
        title: { text: "Wealth bracket" }
      },
      yAxis: {
        min: 0,
        title: { text: "# Agents" }
      },
      tooltip: {
        headerFormat: 'Wealth bracket: {point.key}',
        pointFormat: '<br>{point.y} {series.name}',
        useHTML: true
      },
      series: [{ name: "agents", data: [] }]
    });
  },

  updateHistogram: function(agents) {
    if (this.histogram.series) {
      var maxSugar = Math.max.apply(
        null,
        agents.map(function(agent) { return agent.currentSugar; })
      )

      var interval = parseInt(maxSugar / 10) + 1;

      var categories = [];
      var init = 0;
      for (var i=0; i < 10; i+=1) {
        categories.push(init += interval)
      }
      this.histogram.xAxis[0].setCategories(categories);

      var values = []
      for (var i=1; i < 10; i+=1) {
        var agentsInCategory = agents.filter(function(agent) {
          return categories[i-1] <= agent.currentSugar &&
            agent.currentSugar <= categories[i];
        });
        values.push(agentsInCategory.length)
      }
      this.histogram.series[0].setData(values, true);
    }
  },
};
