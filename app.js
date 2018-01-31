//Gather Data

d3.queue()
  .defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
  .defer(d3.csv, './data/all_data.csv', function(row) {
    return {
      contintent: row.Continent,
      country: row.Country,
      countryCode: row['Country Code'],
      emissions: +row['Emissions'],
      emissionsPerCapita: +row['Emissions Per Capita'],
      region: +row.Region,
      year: +row.Year
    }
  })
    .await(function(error, mapData, data) {
      if (error) throw error;

      let extremeYears = d3.extent(data, d => d.year);
      let currentYear = extremeYears[0];
      let currentDataType = d3.select('input[name="data-type"]:checked')
                                .attr('value');
      let geoData = topojson.feature(mapData, mapData.objects.countries).features;

      //SVG Spacing

      const width = +d3.select('.chart-container')
                        .node().offsetWidth;

      const height = 300;

      createMap(width, width * 4 / 5);
      createPie(width, height)
      createBar(width, height)
      drawMap(geoData, data, currentYear, currentDataType);
      drawPie(data, currentYear);
      drawBar(data, currentDataType, '');

        d3.select('#year')
            .property('min', currentYear)
            .property('max', extremeYears[1])
            .property('value', currentYear)
            .on('input', () => {
              currentYear = +d3.event.target.value;
              drawMap(geoData, data, currentYear, currentDataType);
              drawPie(data, currentYear);
              highlightBars(currentYear);
            })

        d3.selectAll('input[name="data-type"]')
            .on('change', () => {
              let active = d3.select('.active').data()[0]
              let country = active ? active.properties.country : '';
              currentDataType = d3.event.target.value;
              drawMap(geoData, data, currentYear, currentDataType);
              drawBar(data, currentDataType, country);
            });

        d3.selectAll('svg')
            .on('mousemove touchmove', updateTooltip);

        function updateTooltip() {
          const tooltip = d3.select('.tooltip');
          const tgt = d3.select(d3.event.target);
          const isCountry = tgt.classed('country');
          const isBar = tgt.classed('bar');
          const isArc = tgt.classed('arc');
          const dataType = d3.select('input:checked')
                              .property('value');
          const units = dataType === 'emissions' ? 'thousand metrics tons' : 'metric tons per capita';
          let data;
          let percentage = '';
          if (isCountry) data = tgt.data()[0].properties;
          if (isArc) {
            data = tgt.data()[0].data;
            percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;
          }
          if (isBar) data = tgt.data()[0];
          tooltip
              .style("opacity", +(isCountry || isArc || isBar))
              .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
              .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
          if (data) {
            var dataValue = data[dataType] ?
              data[dataType].toLocaleString() + " " + units :
              "Data Not Available";
            tooltip
                .html(`
                  <p>Country: ${data.country}</p>
                  <p>${formatDataType(dataType)}: ${dataValue}</p>
                  <p>Year: ${data.year || d3.select("#year").property("value")}</p>
                  ${percentage}
                `)
          }
        }
});

function formatDataType(key) {
  return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
}

function getPercentage(d) {
  var angle = d.endAngle - d.startAngle;
  var fraction = 100 * angle / (Math.PI * 2);
  return fraction.toFixed(2) + "%";
}
