
sucrose.models.globeChart = function() {

  // http://cldr.unicode.org/
  // http://www.geonames.org/countries/
  // http://www.naturalearthdata.com/downloads/
  // http://geojson.org/geojson-spec.html
  // http://bl.ocks.org/mbostock/4183330
  // http://bost.ocks.org/mike/map/
  // https://github.com/mbostock/topojson
  // https://github.com/mbostock/topojson/wiki/Command-Line-Reference
  // https://github.com/mbostock/us-atlas
  // https://github.com/mbostock/world-atlas
  // https://github.com/papandreou/node-cldr
  // https://github.com/melalj/topojson-map-generator

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var id = Math.floor(Math.random() * 10000), //Create semi-unique ID in case user doesn't select one,
      margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = null,
      height = null,
      showTitle = false,
      showControls = false,
      showLegend = true,
      direction = 'ltr',
      tooltip = null,
      tooltips = true,
      x,
      y,
      state = {},
      strings = {
        legend: {close: 'Hide legend', open: 'Show legend'},
        controls: {close: 'Hide controls', open: 'Show controls'},
        noData: 'No Data Available.'
      },
      showLabels = true,
      autoSpin = false,
      dispatch = d3.dispatch('chartClick', 'elementClick', 'tooltipShow', 'tooltipHide', 'tooltipMove', 'stateChange', 'changeState', 'elementDblClick', 'elementMouseover', 'elementMouseout');


  //============================================================
  // Private Variables
  //------------------------------------------------------------

  var projection = d3.geo.orthographic()
        .clipAngle(90)
        .precision(0.1);

  var path = d3.geo.path();

  var graticule = d3.geo.graticule();


  function tooltipContent(d) {
    return '<p><b>' + d.name + '</b></p>' +
           '<p><b>Amount:</b> $' + d3.format(',.0f')(d.amount) + '</p>';
  }

  function showTooltip(eo, offsetElement) {
    var content = tooltipContent(eo);
    tooltip = sucrose.tooltip.show(eo.e, content, null, null, offsetElement);
  };


  var seriesClick = function(data, e, chart) {
    return;
  };

  //============================================================

  function chart(selection) {

    selection.each(function(chartData) {

      var that = this,
          container = d3.select(this);
      var properties = chartData ? chartData.properties : {},
          data = chartData ? chartData.data : null;

      chart.container = this;

      chart.update = function() {
        container.transition().call(chart);
      };

      var fillGradient = function(d, i) {
            return sucrose.utils.colorRadialGradient(d, i, 0, 0, '35%', '35%', color(d, i), wrap.select('defs'));
          };
          // Calculate the maximum balue so that we can generate a colour scale.
          // color = function (d, i) { return sucrose.utils.defaultColor()(d, i); },
          // fill = function(d, i) { return color(d,i); },
          // gradient = function(d, i) { return color(d,i); },


      //------------------------------------------------------------
      // Private method for displaying no data message.

      function displayNoData(d) {
        if (d && d.length) {
          container.selectAll('.sc-noData').remove();
          return false;
        }

        container.select('.sucrose.sc-wrap').remove();

        var w = width || parseInt(container.style('width'), 10) || 960,
            h = height || parseInt(container.style('height'), 10) || 400,
            noDataText = container.selectAll('.sc-noData').data([chart.strings().noData]);

        noDataText.enter().append('text')
          .attr('class', 'sucrose sc-noData')
          .attr('dy', '-.7em')
          .style('text-anchor', 'middle');

        noDataText
          .attr('x', margin.left + w / 2)
          .attr('y', margin.top + h / 2)
          .text(function(d) {
            return d;
          });

        return true;
      }

      // Check to see if there's nothing to show.
      if (displayNoData(data)) {
        return chart;
      }


      //------------------------------------------------------------
      // Process data
      var results = data[0];


      //------------------------------------------------------------
      // Main chart draw

      // chart.render = function() {

        // Chart layout variables
        var renderWidth = width || parseInt(container.style('width'), 10) || 960,
            renderHeight = height || parseInt(container.style('height'), 10) || 400,
            availableWidth = renderWidth - margin.left - margin.right,
            availableHeight = renderHeight - margin.top - margin.bottom;

        // Header variables
        var maxControlsWidth = 0,
            maxLegendWidth = 0,
            widthRatio = 0,
            headerHeight = 0,
            titleBBox = {width: 0, height: 0},
            controlsHeight = 0,
            legendHeight = 0,
            trans = '';

        var colorRange = function (r) {
              var max = d3.max(d3.values(r));
              return d3.scale.linear().domain([0, max]).range(['#99CCFF', '#336699']);
            },
            color = colorRange([0]),
            fill = function (d) {
              var r = amount(d);
              return r ? color(r) : '';
            };

        // Globe variables
        var m0,
            o0,
            t0,
            countries,
            active_country = false,
            world_map = [],
            country_map = {},
            country_label = {},
            world_view = {rotate: [100, -10], scale: 1, zoom: 1},
            country_view = {rotate: [null, null], scale: null, zoom: null},
            node = d3.select('#' + id + ' svg').node(),
            iRotation;

        projection
          .scale(Math.min(availableWidth, availableHeight) * 1 / 2)
          .translate([availableWidth / 2 + margin.left, availableHeight / 2 + margin.top])
          .rotate(world_view.rotate);

        path.projection(projection);


        //------------------------------------------------------------
        // Setup svgs and skeleton of chart

        var availableSize = { // the size of the svg container minus padding
              'width': availableWidth,
              'height': availableHeight
            };

        var wrap = container.selectAll('.sucrose.sc-wrap').data([1]);
        var wrapEnter = wrap.enter().append('g')
              .attr('class', 'sucrose sc-wrap sc-globeChart')
              .attr('id', 'sc-chart-' + id);

        wrapEnter.append('defs');
        var defs = wrap.select('defs');

        wrapEnter.append('svg:rect')
          .attr('class', 'sc-chartBackground')
          .attr('width', availableSize.width)
          .attr('height', availableSize.height)
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .style('fill', 'transparent');
        var backg = wrap.select('.sc-chartBackground');

        var gEnter = wrapEnter.append('g')
              .attr('class', 'sc-chartWrap');
        var globeWrapper = wrap.select('.sc-chartWrap');

        var globeEnter = gEnter.append('g')
              .attr('class', 'sc-globe');
        var globeChart = wrap.select('.sc-globe');

        globeEnter.append('path')
          .datum({type: 'Sphere'})
          .attr('class', 'sphere')
          .attr('d', path);
        var sphere = d3.select('.sphere');

        // zoom and pan
        var zoom = d3.behavior.zoom()
              .on('zoom', function () {
                projection.scale((Math.min(availableHeight, availableWidth) * Math.min(Math.max(d3.event.scale, 0.75), 3)) / 2);
                refresh();
              });
        globeChart.call(zoom);

        globeChart
          .on('mousedown', mousedown);

        wrap
          .on('mousemove', mousemove)
          .on('mouseup', mouseup);

        sphere
          .on('click', function () {
            unLoadCountry();
          });

        queue()
          .defer(d3.json, 'data/geo/world-countries-topo-110.json')
          .defer(d3.json, 'data/geo/usa-states-topo-110.json')
          .defer(d3.json, 'data/geo/cldr_en.json')
          .await(function (error, world, country, labels) {
            if (error) {
              return;
            }

            world_map = topojson.feature(world, world.objects.countries).features;
            country_map['USA'] = topojson.feature(country, country.objects.states).features;
            country_label = labels;

            loadChart(world_map, 'countries');
            if (autoSpin) {
                iRotation = setInterval(spin, 10);
            }
          });


        //------------------------------------------------------------
        // Internal functions

        function loadChart(data, classes) {

          countries = globeEnter.append('g')
              .attr('class', classes)
            .selectAll('path')
              .data(data)
            .enter().append('path')
              .attr('d', clip)
              .style('fill', fill);

          countries.on('click', function (d) {
              if (active_country == d3.select(this)) {
                return;
              }

              unLoadCountry();

              // If we have country-specific geographic features.
              if (!country_map[d.id]) {
                return;
              }

              if (tooltips) {
                sucrose.tooltip.cleanup();
              }

              world_view = {
                rotate: projection.rotate(),
                scale: projection.scale(),
                zoom: zoom.scale()
              };

              var centroid = d3.geo.centroid(d);
              projection.rotate([-centroid[0], -centroid[1]]);

              var bounds = path.bounds(d);
              var hscale = availableWidth  / (bounds[1][0] - bounds[0][0]);
              var vscale = availableHeight / (bounds[1][1] - bounds[0][1]);

              if (availableWidth * hscale < availableHeight * vscale) {
                projection.scale(availableWidth * hscale / 2);
                zoom.scale(hscale);
              } else {
                projection.scale(availableHeight * vscale / 2);
                zoom.scale(vscale);
              }

              country_view = {
                rotate: projection.rotate(),
                scale: projection.scale(),
                zoom: zoom.scale()
              };

              // Flatten the results and include the state-level
              // results so that we don't need complex tooltip logic.
              var obj = region_results(d);
              obj.parent = results;
              results = obj;

              color = colorRange(results);

              active_country = d3.select(this);

              loadChart(country_map[d.id], 'states');

              active_country.style('display', 'none');

              refresh();
            })
            .on('mouseover', function (d, i, j) {
              var eo = buildEventObject(d3.event, d, i, j);
              dispatch.tooltipShow(eo);
            })
            .on('mouseout', function () {
              dispatch.tooltipHide();
            })
            .on('mousemove', function(d, i, j) {
              dispatch.tooltipMove(d3.event);
            });
        }

        function buildEventObject(e, d, i, j) {
          var eo = {
              point: d,
              e: e,
              name: (country_label[d.properties.iso_a2] || d.properties.name),
              amount: amount(d)
          };
          return eo;
        }

        function unLoadCountry() {
          if (!active_country) {
            return;
          }
          results = results.parent;
          active_country.style('display', 'inline');
          color = colorRange(results);
          d3.select('.states').remove();
          active_country = false;
          country_view = {rotate: [null, null], scale: null, zoom: null};
          projection.rotate(world_view.rotate);
          projection.scale(world_view.scale);
          zoom.scale(world_view.zoom);
          refresh();
        }

        function region_results(d) {
          if (results[d.id]) {
            return results[d.id];
          } else if (results[d.properties.name]) {
            return results[d.properties.name];
          }
        }

        function amount(d) {
          var result = region_results(d);
          if (result) {
            return result._total;
          }
          return 0;
        }

        function refresh(duration) {
          globeChart.selectAll('path')
            .attr('d', clip);
        }

        function clip(d) {
          return path(d) || 'M0,0Z';
        }

        function spin() {
          var o0 = projection.rotate(),
              m1 = [10, 0],
              o1 = [o0[0] + m1[0] / 8, -10];
          rotate(o1);
        }

        function rotate(o) {
          projection.rotate(o);
          refresh();
        }
      // };

      //============================================================

      // chart.render();

      //============================================================
      // Event Handling/Dispatching (in chart's scope)
      //------------------------------------------------------------

      chart.resize = function () {
        renderWidth = width || parseInt(container.style('width'), 10) || 960;
        renderHeight = height || parseInt(container.style('height'), 10) || 400;
        availableWidth = renderWidth - margin.left - margin.right;
        availableHeight = renderHeight - margin.top - margin.bottom;

        projection
          .scale((Math.min(availableWidth, availableHeight) * Math.min(Math.max(zoom.scale(), 0.75), 3)) / 2)
          .translate([availableWidth / 2 + margin.left, availableHeight / 2 + margin.top]);

        refresh();
      }

      function mousedown() {
        m0 = [d3.event.pageX, d3.event.pageY];
        o0 = projection.rotate();
        d3.event.preventDefault();

        if (tooltips) {
          sucrose.tooltip.cleanup();
        }
        if (autoSpin) {
          clearInterval(iRotation);
        }
      }

      function mousemove() {
        if (!m0) {
          return;
        }
        var m1 = [d3.event.pageX, d3.event.pageY],
            //o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] - (m0[1] - m1[1]) / 4];
            o1 = [o0[0] - (m0[0] - m1[0]) / 4, (country_view.rotate[1] || world_view.rotate[1])];
        rotate(o1);
      }

      function mouseup() {
        if (m0) {
          // mousemove();
          m0 = null;
        }
      }

      dispatch.on('tooltipShow', function(eo) {
          if (tooltips) {
            showTooltip(eo, that.parentNode);
          }
        });

      dispatch.on('tooltipMove', function(e) {
          if (tooltip) {
            sucrose.tooltip.position(that.parentNode, tooltip, e, 's');
          }
        });

      dispatch.on('tooltipHide', function() {
          if (tooltips) {
            sucrose.tooltip.cleanup();
          }
        });

      // Update chart from a state object passed to event handler
      dispatch.on('changeState', function(eo) {
          if (typeof eo.disabled !== 'undefined') {
            data.forEach(function(series, i) {
              series.disabled = eo.disabled[i];
            });
            state.disabled = eo.disabled;
          }

          if (typeof eo.stacked !== 'undefined') {
            multibar.stacked(eo.stacked);
            state.stacked = eo.stacked;
          }

          container.transition().call(chart);
        });

      dispatch.on('chartClick', function() {
          if (controls.enabled()) {
            controls.dispatch.closeMenu();
          }
          if (legend.enabled()) {
            legend.dispatch.closeMenu();
          }
        });

    });

    return chart;
  }

  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.dispatch = dispatch;
  chart.projection = projection;
  chart.path = path;
  chart.graticule = graticule;


  chart.colorData = function(_) {
    var type = arguments[0],
        params = arguments[1] || {};
    var color = function(d, i) {
          return sucrose.utils.defaultColor()(d, d.series);
        };
    var classes = function(d, i) {
          return 'sc-group sc-series-' + d.series;
        };

    switch (type) {
      case 'graduated':
        color = function(d, i) {
          return d3.interpolateHsl(d3.rgb(params.c1), d3.rgb(params.c2))(d.series / params.l);
        };
        break;
      case 'class':
        color = function() {
          return 'inherit';
        };
        classes = function(d, i) {
          var iClass = (d.series * (params.step || 1)) % 14;
          iClass = (iClass > 9 ? '' : '0') + iClass;
          return 'sc-group sc-series-' + d.series + ' sc-fill' + iClass;
        };
        break;
      case 'data':
        color = function(d, i) {
          return d.classes ? 'inherit' : d.color || sucrose.utils.defaultColor()(d, d.series);
        };
        classes = function(d, i) {
          return 'sc-group sc-series-' + d.series + (d.classes ? ' ' + d.classes : '');
        };
        break;
    }

    var fill = (!params.gradient) ? color : function(d, i) {
      var p = {orientation: params.orientation || (vertical ? 'vertical' : 'horizontal'), position: params.position || 'middle'};
      return multibar.gradient(d, d.series, p);
    };

    // multibar.color(color);
    // multibar.fill(fill);
    // multibar.classes(classes);

    // legend.color(color);
    // legend.classes(classes);

    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) {
      return margin;
    }
    for (var prop in _) {
      if (_.hasOwnProperty(prop)) {
        margin[prop] = _[prop];
      }
    }
    return chart;
  };

  chart.tooltip = function(_) {
    if (!arguments.length) {
      return tooltip;
    }
    tooltip = _;
    return chart;
  };

  chart.tooltips = function(_) {
    if (!arguments.length) {
      return tooltips;
    }
    tooltips = _;
    return chart;
  };

  chart.tooltipContent = function(_) {
    if (!arguments.length) {
      return tooltipContent;
    }
    tooltipContent = _;
    return chart;
  };

  chart.state = function(_) {
    if (!arguments.length) {
      return state;
    }
    state = _;
    return chart;
  };

  chart.strings = function(_) {
    if (!arguments.length) {
      return strings;
    }
    for (var prop in _) {
      if (_.hasOwnProperty(prop)) {
        strings[prop] = _[prop];
      }
    }
    return chart;
  };

  chart.values = function(_) {
    if (!arguments.length) return getValues;
    getValues = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return getX;
    getX = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return getY;
    getY = d3.functor(_);
    return chart;
  };

  chart.showLabels = function(_) {
    if (!arguments.length) return showLabels;
    showLabels = _;
    return chart;
  };

  chart.autoSpin = function(_) {
    if (!arguments.length) return autoSpin;
    autoSpin = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return chart;
  };

  chart.valueFormat = function(_) {
    if (!arguments.length) return valueFormat;
    valueFormat = _;
    return chart;
  };

  chart.showTitle = function(_) {
    if (!arguments.length) {
      return showTitle;
    }
    showTitle = _;
    return chart;
  };

  //============================================================

  return chart;
};