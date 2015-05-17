var chart = new Highcharts.Chart({
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
    data: [
      ["Alive", 250],
      ["Dead", 0],
      { name: "Others" }
    ]
  }]
});
