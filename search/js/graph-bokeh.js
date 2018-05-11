//********************************************************************************************
/**
 * @brief		グラフ描画(BokehJS)
 * @author		@loftkun
 */
//********************************************************************************************
var GraphBokeh = (function() {
	
	//********************************************************************************************
	/**
	 * @brief		コンストラクタ
	*/
	//********************************************************************************************
	var graphBokeh = function() {
	};

	var proto = graphBokeh.prototype;

	//********************************************************************************************
	/**
	 * @brief		GET
	 * @param[in]	userId
	 * @param[in]	arrX
	 * @param[in]	arrY
	 */
	//********************************************************************************************
	proto.plot = function(userId, arrX, arrY) {
		// size
		var width = $(document).width() * 0.75;
		var height = width * 0.75;
		if(height > document.documentElement.clientHeight * 0.75){
			height = document.documentElement.clientHeight * 0.75;
		}
		// make the plot and add some tools
		var p = Bokeh.Plotting.figure({
			title       : userId,
			tools       : "pan,crosshair,wheel_zoom,reset,save",//box_zoom,	// https://bokeh.pydata.org/en/latest/_modules/bokeh/plotting/figure.html#figure
			x_axis_type : "datetime",	//https://www.monotalk.xyz/blog/google-analytics-%E3%81%AE-%E6%99%82%E7%B3%BB%E5%88%97%E3%83%86%E3%83%BC%E3%82%BF%E3%82%92-bokeh-%E3%81%A6%E5%8F%AF%E8%A6%96%E5%8C%96%E3%81%99%E3%82%8B/
			plot_width  : width,		//https://bokeh.pydata.org/en/latest/docs/user_guide/bokehjs.html
			plot_height : height
		});

		// source
		var source = new Bokeh.ColumnDataSource({
			data: {	x : arrX,
					y : arrY }
		});
		
		
		// line
		p.line(
			{ field: "x" },
			{ field: "y" }, {
			source: source,
		});
		
		// circle
		p.circle(
			{ field: "x" },
			{ field: "y" },
			{source: source});
		
		// formatter
		//   sample
		//    https://qiita.com/yoku_001/items/0effd2c1cf59daccd80b
		//    https://anaconda.org/dhirschfeld/bokeh-timeseries-example/notebook
		//    https://qiita.com/yoku_001/items/0effd2c1cf59daccd80b
		//    https://qiita.com/yoku_001/items/0effd2c1cf59daccd80b
		//    http://www.hirotsuru.com/entry/2017/11/11/160012
		if(false){ // trial code
			var format = ["%m/%d %H:%M:%S"];
			p.xaxis.formatter.microseconds=format;
			p.xaxis.formatter.milliseconds=format;
			p.xaxis.formatter.seconds=format;
			p.xaxis.formatter.minsec=format;
			p.xaxis.formatter.minutes=format;
			p.xaxis.formatter.hourmin=format;
			p.xaxis.formatter.hours=format;
			p.xaxis.formatter.days=format;
			p.xaxis.formatter.months=format;
			p.xaxis.formatter.years=format;
		}
		
		// show
		$("#plot").empty();
		Bokeh.Plotting.show(p, document.getElementById("plot"))

		initTools();
	};
	
	function initTools(){

		//wheel-zoomは有効状態としスワイプできるようにする
		$(".bk-tool-icon-wheel-zoom").click();
		
		// Bokehへのリンクアイコン非表示
		// .bk-logo-small を display:none にて非表示とした
		
		// アイコンクリックの目印のtoggle
		var clsLinkClicked = 'linkClicked';
		for(let cls of ['.bk-tool-icon-pan',
						'.bk-tool-icon-wheel-zoom',
						'.bk-tool-icon-crosshair'
		]){
			$(cls).addClass(clsLinkClicked);
			$(cls).click(function(){
				$(this).toggleClass(clsLinkClicked);
			});
		}
	}
	
	return graphBokeh;
})();
