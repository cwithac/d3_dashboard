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
      drawMap(geoData, data, currentYear, currentDataType);
      drawPie(data, currentYear);

        d3.select('#year')
            .property('min', currentYear)
            .property('max', extremeYears[1])
            .property('value', currentYear)
            .on('input', () => {
              currentYear = +d3.event.target.value;
              drawMap(geoData, data, currentYear, currentDataType);
              drawPie(data, currentYear);
            })

        d3.selectAll('input[name="data-type"]')
            .on('change', () => {
              currentDataType = d3.event.target.value;
              drawMap(geoData, data, currentYear, currentDataType)
            });
    });
