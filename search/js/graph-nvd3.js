//********************************************************************************************
/**
 * @brief		グラフ描画(NVD3)
 * @author		@loftkun
 */
//********************************************************************************************
var GraphNVD3 = (function() {
	
	//********************************************************************************************
	/**
	 * @brief		コンストラクタ
	*/
	//********************************************************************************************
	var graphNVD3 = function() {
	};

	var proto = graphNVD3.prototype;

	//********************************************************************************************
	/**
	 * @brief		GET
	 * @param[in]	userId
	 * @param[in]	arr
	 */
	//********************************************************************************************
	proto.plot = function(userId, arr) {
		nv.addGraph(function() {
		
			var data = [
				{
					values: arr,
					key: userId,
					color: '#2ca02c'
				}
			];
		
			var chart = nv.models.lineChart()
			//var chart = nv.models.lineWithFocusChart()
				//.margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
				//.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
				.transitionDuration(0)  //how fast do you want the lines to transition?
				.showLegend(true)       //Show the legend, allowing users to turn on/off line series.
				.showYAxis(true)        //Show the y-axis
				.showXAxis(true)        //Show the x-axis
			
			
			
			//var chart = nv.models.scatterChart()
				//.showDistX(true)	//showDist, when true, will display those little distribution lines on the axis.
				//.showDistY(true)
				//.transitionDuration(350)
				//.color(d3.scale.category10().range());
			//;

			//X軸の単位を決定
			var timeDiff = ( arr[0].x.getTime() - arr[arr.length-1].x.getTime() ) / 1000;
			//console.log("[0]=" + arr[0].x.getTime() + " [last]=" + arr[arr.length-1].x.getTime());

			var timeFormat;//https://github.com/d3/d3-time-format
			//if(arr.length > 30){
			if(timeDiff > 60 * 60 * 24 * 3){
				timeFormat = d3.timeFormat("%m/%d");//日付表示
			}else{
				timeFormat = d3.timeFormat("%H:%M");//時刻表示
			}
			
			chart.xAxis
				.axisLabel('Date')
				.tickFormat(timeFormat);
				//.tickFormat(d3.format('d'));

			chart.yAxis
				.axisLabel('Rate')
				.tickFormat(d3.format('d'));//https://github.com/d3/d3-format

			chart.tooltipContent( function(key, x, y){ 
				return x + ' ' + y;
			});
			
			d3.select('#chart1 svg')
				.datum(data)
				.transition().duration(1000)
				.call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		},
		//参考) http://stackoverflow.com/questions/13732971/is-an-nvd3-line-plot-with-markers-possible
		function() {
			// this function is called after the chart is added to document
			d3.selectAll('#chart1 .nv-lineChart .nv-point').style("stroke-width","5px").style("fill-opacity", ".95").style("stroke-opacity", ".95");
		}
		
		);
	};
	
	return graphNVD3;
})();
