function createPie(width, height) {
  const pie = d3.select('#pie')
                  .attr('width', width)
                  .attr('height', height);

  pie.append('g')
        .attr('transform', 'translate(' + width / 2 + ', ' + (height / 2 + 10) + ')')
        .classed('chart', true);

  pie.append('text')
      .attr('x', width / 2)
      .attr('y', '1em')
      .attr('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .classed('pie-title', true);
}

function drawPie(data, currentYear) {
  const pie = d3.select('#pie');

  const arcs = d3.pie()
                  .sort((a, b) => {
                    if (a.contintent < b.contintent) return -1;
                    if (a.contintent > b.contintent) return 1;
                    return a.emissions - b.emissions;
                  })
                  .value(d => d.emissions);

  const path = d3.arc()
                    .outerRadius(+pie.attr('height') / 2 - 50 )
                    .innerRadius(0);

  const yearData = data.filter(d => d.year === currentYear);
  const contintents = [];
  for (let i = 0; i < yearData.length; i++) {
    const contintent = yearData[i].contintent;
    if (!contintents.includes(contintent)) {
      contintents.push(contintent);
    }
  }

  const colorScale = d3.scaleOrdinal()
                        .domain(contintents)
                        .range(['#ab47bc', "#7e57c2", "#26a69a", "#42a5f5", "#78909c"]);

  const update = pie
                  .select('.chart')
                  .selectAll('.arc')
                  .data(arcs(yearData));

         update
            .exit()
            .remove();

          update
            .enter()
              .append('path')
              .classed('arc', true)
              .attr('stroke', '#dff1ff')
              .attr('stroke-width', '0.25px')
            .merge(update)
              .attr('fill', d => colorScale(d.data.contintent))
              .attr('d', path);

    pie.select('.pie-title')
        .text('Total emissions by continent and region, ' + currentYear);
}
