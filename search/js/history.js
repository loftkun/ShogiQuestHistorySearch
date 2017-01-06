//********************************************************************************************
/**
 * @brief		対局履歴情報クラス
 * @author		@loftkun
 */
//********************************************************************************************
var History = (function() {
	
	//全対局履歴json
	var _objJSON;
	
	//対局種別
	var _gType = "";
	
	//グラフ描画用データ
	var _plotArray;
	
	//デバグ用
	var _dbg = "";

	//********************************************************************************************
	/**
	 * @brief		コンストラクタ
	 */
	//********************************************************************************************
	var History = function(data) {
		_objJSON = $.parseJSON(data);
	};

	var history = History.prototype;

	//********************************************************************************************
	/**
	 * @brief		全対局数
	 */
	//********************************************************************************************
	history.length = function() {
		return _objJSON.games.length;
	}
	
	//********************************************************************************************
	/**
	 * @brief		グラフ描画
	 */
	//********************************************************************************************
	history.drawGraph = function() {

		//NVD3.js
		nv.addGraph(function() {
		
			var data = [
				{
					values: _plotArray,
					key: _objJSON.userId,
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

			var timeFormat;//https://github.com/d3/d3-time-format
			if(_plotArray.length > 30){
				timeFormat = d3.timeFormat("%m/%d");
			}else{
				timeFormat = d3.timeFormat("%m/%d %H:%M");//TODO 厳密には1日以内なら%H:%Mにする方向で
			}
				
			
			chart.xAxis
				.axisLabel('Date')
				.tickFormat(timeFormat);
				//.tickFormat(d3.format('d'));

			chart.yAxis
				.axisLabel('Rate')
				.tickFormat(d3.format('d'));//https://github.com/d3/d3-format

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
	}
	
	//********************************************************************************************
	/**
	 * @brief		解析(履歴)
	 * @param[in]	data				
	 */
	//********************************************************************************************
	history.parse = function(page) {
		try{
			//ユーザID
			var userId = _objJSON.userId;
			
			//種別
			_gType = _objJSON.gtype;
			//_dbg += userId + " " + _gType + " ";
			//_dbg += "<br>\n";
			
			//履歴
			var tr = "";
			var start,end;
			if(page.all==0){
				start = page.index;
				end   = page.index + page.range - 1;
			}
			_plotArray = [];//グラフ描画用データ
			var games = _objJSON.games;
			$.each(games, function(i, game) {
				if(page.all==0){
					if( (i < start) || ( i > end ) ){
						return;
					}
				}
				gameInfo = parseGame(userId, game);
				_plotArray.push({
					x : gameInfo.dateTime,
					y : gameInfo.oldR,
					//size: Math.random(),
					size : 1.0
					//shape: (Math.random() > 0.95) ? shapes[j % 6] : "circle"  //Configure the shape of each scatter point.
				});
				_dbg += "<br>\n";
			});
	
			//デバグ用にはJSON.stringifyで文字列化したもので十分なはずだが
			//いまいち綺麗な文字列にならないのでボツ
			//var strDbg = JSON.stringify(data, null, "    ");

			//よって独自の_dbgを表示
			//$('#dbgBox').html(_dbg);
			//console.log(_dbg);
		}catch( e ){
		}
	};
	
	//********************************************************************************************
	/**
	 * @brief		解析(対局)
	 * @param[in]	game				
	 */
	//********************************************************************************************
	function parseGame(userId, game){
		var id = game.id;
		var created = game.created;
		_dbg += "<br>\n";
		_dbg += id + " " + created + " ";
		_dbg += "<br>\n";
		
		//日付解析
		//  createdはISO-8601 拡張フォーマット文字列
		//  9時間遅い値だがDataオブジェクト化することで解消する
		//    例) 2015-05-04T20:31:26.526Z
		//参照 http://so-zou.jp/web-app/tech/programming/javascript/grammar/object/date.htm
		var dateTime = new Date( created );
		created = dateTimetoPrintString(dateTime);

		var players = game.players;
		$.each(players, function(i, player) {
			parsePlayer(player);
		});
		
		//対局結果
		var finalStatus = game.finalStatus;
		
		//勝敗
		var win;
		if(finalStatus.lastIndexOf('WIN', 0) === 0){//StartsWith
			win = 0;//勝ち
		}else if(finalStatus.lastIndexOf('LOSE', 0) === 0){//StartsWith
			win = 1;//負け
		}else if(finalStatus.lastIndexOf('DRAW', 0) === 0){//StartsWith
			win = 2;//引き分け
		}else{
			win = 3;//不明
		}
		
		//投了
		var resign = false;
		if(finalStatus.indexOf("RESIGN") !== -1){//Contains
			resign = true;
		}
		
		//詰み
		var mate = false;
		if(finalStatus.indexOf("MATE") !== -1){//Contains
			mate = true;
		}
		
		//時間
		var timeup = false;
		if(finalStatus.indexOf("TIMEUP") !== -1){//Contains
			timeup = true;
		}

		//トライ
		var trywin = false;
		if(finalStatus.indexOf("TRY") !== -1){//Contains
			trywin = true;
		}
		
		//切断
		var disconnect = false;
		if(finalStatus.indexOf("DISCONNECT") !== -1){//Contains
			disconnect = true;
		}
		
		//千日手
		var repetition = false;
		if(finalStatus.indexOf("REPETITION") !== -1){//Contains
			repetition = true;
		}
		
		//反則
		var illegal = false;
		if(finalStatus.indexOf("ILLEGAL") !== -1){//Contains
			illegal = true;
		}
		

		//手数
		var length = parseInt(game.length);
		
		//手合い
		var handicap = game.handicap;
		if(handicap==null){
			//handicap = "平手";//わざわざ明示しなくても良い
			handicap = "";
		}else if(handicap=="HISHA"){
			handicap = "飛";
		}else if(handicap=="KAKU"){
			handicap = "角";
		}else if(handicap=="2MAI"){
			handicap = "二枚";
		}else{
			//他にもいろいろあるが今のところjson未入手なので分からない
			//しょうがないので生データをそのまま表示する
		}
		
		//finalStatusは先手の情報か？
		var finalStatusPlayerIsInitiative = false;
		if(length % 2 != 0){
			finalStatusPlayerIsInitiative = true;
		}
		
		//先手か？
		var isInitiative = false;
		if( userId == players[0].id){
			isInitiative = true;
		}
		
		//結果文字列
		var cause = "";
		if(resign){
			cause += "投了";
		}
		if(timeup){
			cause += "時間";
		}
		if(mate){
			cause += "詰み";
		}
		if(trywin){
			cause += "トライ";
		}
		if(disconnect){
			cause += "切断";
		}
		if(repetition){
			cause += "千日手";
		}
		if(illegal){
			cause += "反則";
		}
		
		var result = "引き分け";
		var trClass = "";
		if( finalStatusPlayerIsInitiative == isInitiative){
			switch(win){
				case 0:
					result = "○";
					trClass  = "info";//bootstrapの青
					break;
				case 1:
					result = "×";
					trClass  = "error";//bootstrapの赤
					break;
				case 2:
					result = "引分";
					break;
				case 3:
				default:
					result = "不明";
					break;
			}
		}else{
			switch(win){
				case 0:
					result = "×";
					trClass  = "error";//bootstrapの赤
					break;
				case 1:
					result = "○";
					trClass  = "info";//bootstrapの青
					break;
				case 2:
					result = "引分";
					break;
				case 3:
				default:
					result = "不明";
					break;
			}
		}
		
		_dbg += "<br>\n";
		_dbg += finalStatus + " " + length + " ";
		
		//段級位文字列
		var rank_s = getRank(players[0].oldD);
		var rank_g = getRank(players[1].oldD);
		
		//URL文字列
		var url = makeURL(_gType, game.id);

		//棋譜
		var kifTime = dateTimetoKifTimeString(dateTime);
		var kifPath= userId + '/' + _gType + '/' + userId + '_' + _gType + '_' + kifTime + '.csa';
		var kifURL = "http://tk2-227-23463.vs.sakura.ne.jp/quest/" + kifPath;
		//var kifURL = "http://160.16.103.217/quest/" + kifPath;
		
		//棋譜リンク
		var kifClip="";
		var kifLink="";
		//var piyoLink="<font style=\"font-size:11px\">お使い中…</font>";
		var piyoLink="";
		var csaExists = game.csaExists;
		if(csaExists){
			kifClip =  '<a href="javascript:void(0);" onClick="startDL(this)" data-kifpath="' + kifPath + '" title="棋譜ウィンドウを開く">clip</a>'
			kifLink =  makeKifLink(kifURL);
			piyoLink = makePiyoLink(kifURL);
		}
		
		//<tr>～</tr>作成
		var tr =
			"<tr class='" + trClass + "'>" + 
			"<td>" + created + "</td>" +
			"<td align='center'>" + result + "</td>" +
			"<td align='center'>" + handicap + "</td>" +
			"<td>" + cause + "</td>" +
			"<td>" + length + "</td>";
		
		//先手
		if(isInitiative){
			tr += "<td><b>" + players[0].name + "</b></td>";
		}else{
			tr += "<td>" + players[0].name + "</td>";
		}
		tr +=
			"<td>" + rank_s + "</td>" +
			"<td>" + players[0].oldR + "</td>";
		
		//後手
		if(isInitiative){
			tr += "<td>" + players[1].name + "</td>";
		}else{
			tr += "<td><b>" + players[1].name + "</b></td>";
		}
		
		tr +=
			"<td>" + rank_g + "</td>" +
			"<td>" + players[1].oldR + "</td>" +
			"<td>" + url + "　" + kifClip + "　" + kifLink + "</td>" +
			"<td>" + piyoLink + "</td>" +
			"</tr>";
		
		$('#tblHistory-tbody').append(tr);
		
		//グラフ用データを返す
		var oldR;
		if(isInitiative){
			oldR = players[0].oldR;
		}else{
			oldR = players[1].oldR;
		}
		var gameInfo = { dateTime : dateTime, oldR : oldR };
		return gameInfo;
	}

	//********************************************************************************************
	/**
	 * @brief		解析(対局者)
	 * @param[in]	player				
	 */
	//********************************************************************************************
	function parsePlayer(player){
		var oldD = player.oldD;
		var oldR = player.oldR;
		var name = player.name;
		var oldC = player.oldC;
		_dbg += "<br>\n";
		_dbg += oldD + " " + oldR + " " + name + " " + oldC;
	};
	
	//********************************************************************************************
	/**
	 * @brief		Dateオブジェクト文字列化
	 * @param[in]	dateTime				
	 */
	//********************************************************************************************
	function dateTimetoPrintString( dateTime ){
		var year= dateTime.getFullYear();
		var mon	= dateTime.getMonth() + 1;
		var date= dateTime.getDate();
		var hour= dateTime.getHours();
		var min	= dateTime.getMinutes();
		var sec	= dateTime.getSeconds();
		
		//%02d
		mon		= ( '0' + mon  ).slice( -2 );
		date	= ( '0' + date ).slice( -2 );
		hour	= ( '0' + hour ).slice( -2 );
		min		= ( '0' + min  ).slice( -2 );
		sec		= ( '0' + sec  ).slice( -2 );
		
		return year + "/" + mon + "/" + date + " " + hour + ":" + min + ":" + sec;
	};
	function dateTimetoKifTimeString( dateTime ){
		var year= dateTime.getFullYear();
		var mon	= dateTime.getMonth() + 1;
		var date= dateTime.getDate();
		var hour= dateTime.getHours();
		var min	= dateTime.getMinutes();
		var sec	= dateTime.getSeconds();
		
		//%02d
		mon		= ( '0' + mon  ).slice( -2 );
		date	= ( '0' + date ).slice( -2 );
		hour	= ( '0' + hour ).slice( -2 );
		min		= ( '0' + min  ).slice( -2 );
		sec		= ( '0' + sec  ).slice( -2 );
		
		return year + "" + mon + "" + date + "_" + hour + "" + min + "" + sec;
	};
	
	//********************************************************************************************
	/**
	 * @brief		段級位文字列生成
	 */
	//********************************************************************************************
	function getRank(val){
		if(val < 0){
			//負数は級位
			return (val * -1) + "級";
		}
		//以降0以上
		//val==0は初段、val==1は2段という関係
		val += 1;
		
		//段位
		if(val == 1){
			return "初段";
		}
		return val + "段";
	};

	//********************************************************************************************
	/**
	 * @brief		棋譜ページURL生成
	 */
	//********************************************************************************************
	function makeURL(gtype, gameID){
		//var url10 = "http://wars.fm/shogi10/game/"+ gameID;
		//var url5  = "http://wars.fm/shogi/game/"  + gameID;
		//var url2  = "http://wars.fm/shogi2/game/" + gameID;

		var url = "http://wars.fm/" + gtype + "/game/" + gameID;
		return "<a href=\"" + url + "\" target=\"_blank\" title=\"本家で棋譜を見る\">" + "play</a>";
	};
	
	//********************************************************************************************
	/**
	 * @brief		棋譜ダウンロードリンク生成
	 */
	//********************************************************************************************
	function makeKifLink(url){
		return "<a href=\"" + url + "\" title=\"棋譜ファイルダウンロード\">" + "csa</a>";
	};

	//********************************************************************************************
	/**
	 * @brief		ぴよ将棋で開くリンク生成
	 */
	//********************************************************************************************
	function makePiyoLink(url){
		var piyo = "piyoshogi://?url=";
		var img  = '<img src="./img/piyo_link.png" width="60">';
		return "<a href=\"" + piyo + url + "\" title=\"ぴよ将棋で開く\">" + img + "</a>";
	};
	
	return History;
})();
