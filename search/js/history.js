//********************************************************************************************
/**
 * @brief		対局履歴情報クラス
 * @author		@loftkun
 */
//********************************************************************************************
var History = (function() {
	
	// all history
	var _allHistory;
	
	// graph data
	var _plot = {
		arr : [],
		x   : [],
		y   : []
	};
	
	// CSV
	var _csv = "";

	// for debug
	var _dbg = "";

	//********************************************************************************************
	/**
	 * @brief		コンストラクタ
	 */
	//********************************************************************************************
	var History = function(data) {
		_allHistory = $.parseJSON(data);
	};

	var history = History.prototype;

	//********************************************************************************************
	/**
	 * @brief		全対局数
	 */
	//********************************************************************************************
	history.length = function() {
		return _allHistory.games.length;
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
			var userId = _allHistory.userId;
			//_dbg += userId + " " + _allHistory.gtype + " ";
			//_dbg += "<br>\n";
			
			//履歴
			var tr = "";
			var start,end;
			if(page.all==0){
				start = page.index;
				end   = page.index + page.range - 1;
			}
			//グラフ描画用データ
			_plot.arr = [];
			_plot.x = [];
			_plot.y = [];
			
			_csv = "";
			var games = _allHistory.games;
			$.each(games, function(i, game) {
				if(page.all==0){
					if( (i < start) || ( i > end ) ){
						return;
					}
				}
				gameInfo = parseGame(userId, game);
				_plot.arr.push({
					x : gameInfo.dateTime,
					y : gameInfo.oldR,
					size : 1.0
					//shape: (Math.random() > 0.95) ? shapes[j % 6] : "circle"  //Configure the shape of each scatter point.
				});
				_plot.x.push(gameInfo.dateTime.getTime());
				_plot.y.push(gameInfo.oldR);
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
		}else if(handicap=="HIKYO"){
			handicap = "飛香";
		}else if(handicap=="KYO"){
			handicap = "香";
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
		var url = makeURL(_allHistory.gtype, game.id);

		//棋譜
		var kifTime = dateTimetoKifTimeString(dateTime);
		var kifPath= userId + '/' + _allHistory.gtype + '/' + userId + '_' + _allHistory.gtype + '_' + kifTime + '.csa';
		var kifURL = "http://tk2-227-23463.vs.sakura.ne.jp/quest/" + kifPath;
		//var kifURL = "http://ec2-54-65-1-162.ap-northeast-1.compute.amazonaws.com/quest/" + kifPath;
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
			"<td style=\"text-align:center;\">" + piyoLink + "</td>" +
			"</tr>";
		
		$('#tblHistory-tbody').append(tr);
		
		//自分の情報
		var name;
		var oldR;
		if(isInitiative){
			name = players[0].name;
			oldR = players[0].oldR;
		}else{
			name = players[1].name;
			oldR = players[1].oldR;
		}
		
		//CSV文字列
		if(_csv==""){
			//ヘッダ
			_csv =	"対局日時" + ","
					+ name + "のR" + ","
					+ "勝敗" + ","
					+ "手合" + ","
					+ "要因" + ","
					+ "手数" + ","
					+ "先手名前" + ","
					+ "先手段級位" + ","
					+ "先手R" + ","
					+ "後手名前" + ","
					+ "後手段級位" + ","
					+ "後手R" + ","
					+ "url" + ","
					+ "csa"
					+ "\r\n";
		}
		
		if(handicap==""){
			handicap = "平手";
		}
		_csv +=   created			+ ","
				+ oldR				+ ","
				+ result			+ ","
				+ handicap			+ ","
				+ cause				+ ","
				+ length			+ ","
				+ players[0].name	+ ","
				+ rank_s			+ ","
				+ players[0].oldR	+ ","
				+ players[1].name	+ ","
				+ rank_g			+ ","
				+ players[1].oldR	+ ","
				+ "http://wars.fm/" + _allHistory.gtype + "/game/" + game.id + ","
				+ kifURL
				+ "\r\n";
		
		//グラフ用データを返す
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
	 * @brief		グラフ描画
	 */
	//********************************************************************************************
	history.drawGraph = function() {
		
		// plot by NVD3.js
		//new GraphNVD3().plot(_allHistory.userId, _plot.arr);
		
		// plot by BokehJS
		new GraphBokeh().plot(_allHistory.userId, _plot.x, _plot.y);
	}
	
	//********************************************************************************************
	/**
	 * @brief		CSVダウンロードリンク
	 */
	//********************************************************************************************
	history.csvLink = function() {
		
		var name = "shogi-quest.csv";
		var mimeType = 'text/csv';
		
		var a = document.createElement('a');
		a.download = name;
		a.target   = '_blank';

		
		// UTF-8 to SJIS
		var sjisArray = Encoding.convert(Encoding.stringToCode(_csv), {to: 'SJIS'});
		
		if (window.navigator.msSaveBlob) {
			// for IE
			var blob  = new Blob([new Uint8Array(sjisArray)], {type: 'text/csv'});//SJIS

			window.navigator.msSaveBlob(blob, name)
		}
		else if (window.URL && window.URL.createObjectURL) {
			// for Firefox
			var blob  = new Blob([new Uint8Array(sjisArray)], {type: 'text/csv'});//SJIS

			a.href = window.URL.createObjectURL(blob);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
		else if (window.webkitURL && window.webkitURL.createObject) {
			// for Chrome
			var blob  = new Blob([new Uint8Array(sjisArray)], {type: 'text/csv'});//SJIS

			a.href = window.webkitURL.createObjectURL(blob);
			a.click();
		}
		else {
			// for Safari
			var blob  = new Blob([_csv], {type: 'text/csv'});//Windows以外？とりあえずUTF-8で。

			window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
		}
	}
	
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
		return "<a href=\"" + url + "\" target=\"_blank\" onClick=\"onLinkClicked(this)\" title=\"本家で棋譜を見る\">" + "play</a>";
	};
	
	//********************************************************************************************
	/**
	 * @brief		棋譜ダウンロードリンク生成
	 */
	//********************************************************************************************
	function makeKifLink(url){
		return "<a href=\"" + url + "\" onClick=\"onLinkClicked(this)\" title=\"棋譜ファイルダウンロード\">" + "csa</a>";
	};

	//********************************************************************************************
	/**
	 * @brief		ぴよ将棋で開くリンク生成
	 */
	//********************************************************************************************
	function makePiyoLink(url){
		var piyo = "piyoshogi://?url=";
		var img  = '<img src="./img/piyo_link.png" width="60">';
		return "<a href=\"" + piyo + url + "\"  onClick=\"onLinkClicked(this)\" title=\"ぴよ将棋で開く\">" + img + "</a>";
	};
	
	return History;
})();
