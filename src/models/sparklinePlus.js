
sucrose.models.sparklinePlus = function() {

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var sparkline = sucrose.models.sparkline();

  var margin = {top: 15, right: 100, bottom: 10, left: 50}
    , width = null
    , height = null
    , x
    , y
    , index = []
    , paused = false
    , xTickFormat = d3.format(',r')
    , yTickFormat = d3.format(',.2f')
    , showValue = true
    , alignValue = true
    , rightAlignValue = false
    , noData = "No Data Available."
    ;

  //============================================================


  function chart(selection) {
    selection.each(function(data) {
      var container = d3.select(this);

      var availableWidth = (width  || parseInt(container.style('width')) || 960)
                             - margin.left - margin.right,
          availableHeight = (height || parseInt(container.style('height')) || 400)
                             - margin.top - margin.bottom;

      var currentValue = sparkline.y()(data[data.length-1], data.length-1);

      chart.update = function() { chart(selection) };
      chart.container = this;


      //------------------------------------------------------------
      // Display No Data message if there's nothing to show.

      if (!data || !data.length) {
        var noDataText = container.selectAll('.sc-noData').data([noData]);

        noDataText.enter().append('text')
          .attr('class', 'sucrose sc-noData')
          .attr('dy', '-.7em')
          .style('text-anchor', 'middle');

        noDataText
          .attr('x', margin.left + availableWidth / 2)
          .attr('y', margin.top + availableHeight / 2)
          .text(function(d) { return d });

        return chart;
      } else {
        container.selectAll('.sc-noData').remove();
      }

      //------------------------------------------------------------



      //------------------------------------------------------------
      // Setup Scales

      x = sparkline.xScale();
      y = sparkline.yScale();

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Setup containers and skeleton of chart

      var wrap = container.selectAll('g.sc-wrap.sc-sparklineplus').data([data]);
      var wrapEnter = wrap.enter().append('g').attr('class', 'sucrose sc-wrap sc-sparklineplus');
      var gEnter = wrapEnter.append('g');
      var g = wrap.select('g');

      gEnter.append('g').attr('class', 'sc-sparklineWrap');
      gEnter.append('g').attr('class', 'sc-valueWrap');
      gEnter.append('g').attr('class', 'sc-hoverArea');

      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Main Chart Component(s)

      var sparklineWrap = g.select('.sc-sparklineWrap');

      sparkline
        .width(availableWidth)
        .height(availableHeight);

      sparklineWrap
          .call(sparkline);

      //------------------------------------------------------------


      var valueWrap = g.select('.sc-valueWrap');

      var value = valueWrap.selectAll('.sc-currentValue')
          .data([currentValue]);

      value.enter().append('text').attr('class', 'sc-currentValue')
          .attr('dx', rightAlignValue ? -8 : 8)
          .attr('dy', '.9em')
          .style('text-anchor', rightAlignValue ? 'end' : 'start');

      value
          .attr('x', availableWidth + (rightAlignValue ? margin.right : 0))
          .attr('y', alignValue ? function(d) { return y(d) } : 0)
          .style('fill', sparkline.color()(data[data.length-1], data.length-1))
          .text(yTickFormat(currentValue));



      gEnter.select('.sc-hoverArea').append('rect')
          .on('mousemove', sparklineHover)
          .on('click', function() { paused = !paused })
          .on('mouseout', function() { index = []; updateValueLine(); });
          //.on('mouseout', function() { index = null; updateValueLine(); });

      g.select('.sc-hoverArea rect')
          .attr('transform', function(d) { return 'translate(' + -margin.left + ',' + -margin.top + ')' })
          .attr('width', availableWidth + margin.left + margin.right)
          .attr('height', availableHeight + margin.top);



      function updateValueLine() { //index is currently global (within the chart), may or may not keep it that way
        if (paused) return;

        var hoverValue = g.selectAll('.sc-hoverValue').data(index)

        var hoverEnter = hoverValue.enter()
          .append('g').attr('class', 'sc-hoverValue')
            .style('stroke-opacity', 0)
            .style('fill-opacity', 0);

        hoverValue.exit()
          .transition().duration(250)
            .style('stroke-opacity', 0)
            .style('fill-opacity', 0)
            .remove();

        hoverValue
            .attr('transform', function(d) { return 'translate(' + x(sparkline.x()(data[d],d)) + ',0)' })
          .transition().duration(250)
            .style('stroke-opacity', 1)
            .style('fill-opacity', 1);

        if (!index.length) return;

        hoverEnter.append('line')
            .attr('x1', 0)
            .attr('y1', -margin.top)
            .attr('x2', 0)
            .attr('y2', availableHeight);


        hoverEnter.append('text').attr('class', 'sc-xValue')
            .attr('x', -6)
            .attr('y', -margin.top)
            .attr('text-anchor', 'end')
            .attr('dy', '.9em')


        g.select('.sc-hoverValue .sc-xValue')
            .text(xTickFormat(sparkline.x()(data[index[0]], index[0])));

        hoverEnter.append('text').attr('class', 'sc-yValue')
            .attr('x', 6)
            .attr('y', -margin.top)
            .attr('text-anchor', 'start')
            .attr('dy', '.9em')

        g.select('.sc-hoverValue .sc-yValue')
            .text(yTickFormat(sparkline.y()(data[index[0]], index[0])));

      }


      function sparklineHover() {
        if (paused) return;

        var pos = d3.mouse(this)[0] - margin.left;

        function getClosestIndex(data, x) {
          var distance = Math.abs(sparkline.x()(data[0], 0) - x);
          var closestIndex = 0;
          for (var i = 0; i < data.length; i++){
            if (Math.abs(sparkline.x()(data[i], i) - x) < distance) {
              distance = Math.abs(sparkline.x()(data[i], i) - x);
              closestIndex = i;
            }
          }
          return closestIndex;
        }

        index = [getClosestIndex(data, Math.round(x.invert(pos)))];

        updateValueLine();
      }

    });

    return chart;
  }


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  // expose chart's sub-components
  chart.sparkline = sparkline;

  fc.rebind(chart, sparkline, 'x', 'y', 'xScale', 'yScale', 'color');

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
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

  chart.xTickFormat = function(_) {
    if (!arguments.length) return xTickFormat;
    xTickFormat = _;
    return chart;
  };

  chart.yTickFormat = function(_) {
    if (!arguments.length) return yTickFormat;
    yTickFormat = _;
    return chart;
  };

  chart.showValue = function(_) {
    if (!arguments.length) return showValue;
    showValue = _;
    return chart;
  };

  chart.alignValue = function(_) {
    if (!arguments.length) return alignValue;
    alignValue = _;
    return chart;
  };

  chart.rightAlignValue = function(_) {
    if (!arguments.length) return rightAlignValue;
    rightAlignValue = _;
    return chart;
  };

  chart.noData = function(_) {
    if (!arguments.length) return noData;
    noData = _;
    return chart;
  };

  //============================================================


  return chart;
}
