//********************************************************************************************
/**
 * @file		将棋クエスト履歴検索β メイン処理
 * @author		@loftkun
 */
//********************************************************************************************

//********************************************************************************************
/**
 * @brief		初期化
 */
//********************************************************************************************
$(document).ready(function(){
	//ハンドラ
	$("#userId").keyup(onKeyUp);
	$("#btnGet").click(onButtonClick);
	$("#btnRecent").click(pageRecent);
	$("#btnAll").click(pageAll);
	$("#btnKifCopy").click(onButtonClickKifCopy);
	
	//検索
	trySearch();
	
	//クッキー読み込み
	readCookie();
	
	initBalloon();
});

var _history;
var _page = {
	cnt   : 0,
	index : 0,
	range : 30,
	all   : 0,
};

//********************************************************************************************
/**
 * @brief		クッキー読み込み
 * @author		loft
 *
 * @return		function	
 */
//********************************************************************************************
function readCookie(){
	var userId = Cookies.get('shogiQuest_userId');
	$('#userId').val(userId);
	var gtype = Cookies.get('shogiQuest_gtype');
	if(gtype != undefined){
		$("input[name='rdGType']").val([gtype]);
	}
	setTweet(userId, gtype);
}

//********************************************************************************************
/**
 * @brief		URLパラメタがあれば検索する
 * @author		loft
 */
//********************************************************************************************
function trySearch(){
	
	//パラメタ取得
	var param = getParam();
	if(!checkParam(param)){
		return false;//なし
	}
	
	//検索
	search(param['u'], param['g']);
	return true;
}

//********************************************************************************************
/**
 * @brief		URLパラメタ取得
 * @author		loft
 */
//********************************************************************************************
function getParam(){
	var param = new Object;
	var pair=location.search.substring(1).split('&');
	for(var i=0;pair[i];i++) {
		var kv = pair[i].split('=');
		param[kv[0]]=kv[1];
		console.log(kv[0] + "=" + kv[1]);
	}
	return param;
}

//********************************************************************************************
/**
 * @brief		URLパラメタチェック
 * @author		loft
 * @param[in]	param
 */
//********************************************************************************************
function checkParam(param){
	if(param['u'] != null){
		//console.log('u exists : ' + param['u']);
		if(param['g'] != null){
			//console.log('g exists : ' + param['g']);
			return true;
		}
	}
	return false;
}

//********************************************************************************************
/**
 * @brief		keyupハンドラ
 */
//********************************************************************************************
function onKeyUp(e){
	if ( 13 == e.which ){
		startSearch();
	}
}

//********************************************************************************************
/**
 * @brief		clickハンドラ
 */
//********************************************************************************************
function onButtonClick(){
	startSearch();
}

//********************************************************************************************
/**
 * @brief		履歴検索
 */
//********************************************************************************************
function startSearch(){
	//ユーザID
	var userId = $('#userId').val();
	if(!isValidUserId(userId)){
		return;
	}
	
	//種別
	var gtype = $("input[name='rdGType']:checked").val();

	search(userId, gtype);
}

//********************************************************************************************
/**
 * @brief		search関数
 * @author		loft
 *
 * @param[in]	userId
 * @param[in]	gtype
 */
//********************************************************************************************
function search(userId, gtype){
	//Cookieに保存(90日)
	Cookies.set('shogiQuest_userId', userId, { expires: 90 });
	Cookies.set('shogiQuest_gtype', gtype, { expires: 90 });
	
	//大文字→小文字(の必要があると推測)
	userId = userId.toLowerCase();
	
	//GUI無効化
	disableGUI();
	
	//表示クリア
	$('#msgBox').html('');
	$('#navArea').hide();
	$('#dbgBox').html('');
	$('#tblHistory').find("tr:gt(0)").remove();
	
	//履歴検索リクエスト
	_page.cnt   = 0;
	_page.index = 0;
	new Quest().getHistory(success, error, userId, gtype);
}

//********************************************************************************************
/**
 * @brief		履歴検索レスポンス 正常
 */
//********************************************************************************************
function success(data){

	_history = new History(data);
	
	//表示
	_page.all = 0;
	var cnt = _history.parse(_page);
	if(cnt < 0){
		$('#msgBox').html("取得に失敗しました\(´・ω・｀\)");
	}else{
		$('#msgBox').html(cnt + "件HITしました。");
		$('#navArea').show();
		$('#btnRecent').prop("disabled", true);
		$('#btnAll').prop("disabled", false);
		_page.cnt = cnt;
	}

	//tableの見出しクリックによるソート
	//var tblHistory=new table.sorter("tblHistory");
	//tblHistory.init();
	
	//GUI有効化
	enableGUI();
	//initBalloon();
}

//********************************************************************************************
/**
 * @brief		履歴検索レスポンス 異常
 */
//********************************************************************************************
function error(){
	$('#msgBox').html("通信エラーっぽい\(´・ω・｀\)");

	//GUI有効化
	enableGUI();
}

//********************************************************************************************
/**
 * @brief		ページネーション
 */
//********************************************************************************************
function pageHead(){
	_page.index = 0;
	_page.all   = 0;
	paging();
}
function pagePrev(){
	_page.index -= _page.range;
	if(_page.index < 0){
		_page.index = 0;
		return;
	}
	_page.all = 0;
	paging();
}
function pageNext(){
	if(_page.index + _page.range >= _page.cnt){
		return;
	}
	_page.index += _page.range;
	_page.all = 0;
	paging();
}
function pageTail(){
	var lastNum = _page.cnt % _page.range;
	if(lastNum==0){
		_page.index = _page.cnt - _page.range;
	}else{
		_page.index = _page.cnt - lastNum;
	}
	_page.all = 0;
	paging();
}
function pageRecent(){
	pageHead();
	$('#btnRecent').prop("disabled", true);
	$('#btnAll').prop("disabled", false);
}
function pageAll(){
	_page.all = 1;
	paging();
	$('#btnRecent').prop("disabled", false);
	$('#btnAll').prop("disabled", true);
}
function paging(){
	$('#tblHistory').find("tr:gt(0)").remove();
	_history.parse(_page);
}

//********************************************************************************************
/**
 * @brief		balloon初期化
 */
//********************************************************************************************
function initBalloon(){
	//jquery.balloon.min.js
	//$('a').balloon({
	$('th').balloon({
		
		//position: 'bottom right',
		//offsetX:  10,
		//offsetY: -10,
		
		tipSize: 16,
		css: {
			border: 'solid 4px #5baec0',
			padding: '10px',
			//fontSize: '150%',
			fontWeight: 'bold',
			lineHeight: '3',
			backgroundColor: '#666',
			color: '#fff'
		}
	});
	
	$('.clsKif').balloon({
		html: true,
		contents: '<table style="color:#fff">' + 
				  '<tr><td>play</td><td>本家で棋譜再生</td><tr>' + 
				  '<tr><td>clip</td><td>棋譜ウィンドウを開く</td><tr>' + 
				  '<tr><td>csa</td><td>棋譜ファイルダウンロード</td><tr>' + 
				  '</table>',
		
		tipSize: 16,
		css: {
			border: 'solid 4px #5baec0',
			padding: '10px',
			//fontSize: '150%',
			fontWeight: 'bold',
			lineHeight: '3',
			backgroundColor: '#666',
			color: '#fff'
		}
	});
}
//********************************************************************************************
/**
 * @brief		GUI無効化
 */
//********************************************************************************************
function disableGUI(){
	$('#userId').attr("disabled","true");
	$("input[name='rdGType']").attr("disabled","true");
	$('#btnGet').attr("disabled","true");
}

//********************************************************************************************
/**
 * @brief		GUI有効化
 */
//********************************************************************************************
function enableGUI(){
	readCookie();
	$('#userId').removeAttr("disabled");
	$("input[name='rdGType']").removeAttr("disabled");
	$('#btnGet').removeAttr("disabled");
}

//********************************************************************************************
/**
 * @brief	ユーザIDフォーマットチェック
 *			新規アカウント作成時に表示される以下条件に則ることとする
 *			  名前の長さは3~15文字です。
 *			  使える文字は半角アルファベット、数字、_です。 
 *			ただしbotを許容するため:を含んでもよいとする
 */
//********************************************************************************************
function isValidUserId(userId){
	if(userId==""){
		return false;
	}
	if((userId.length<3)||(userId.length>15)){
		alert('ユーザIDは3文字以上15文字以下です。');
		return false;
	}
	if(userId.match(/[^0-9A-Za-z_:]+/) != null){
		alert('ユーザIDは半角英数字と一部の記号(_:)のみ使えます。');
		return false;
	}
	return true;
}

//********************************************************************************************
/**
 * @brief		つぶやきボタン文言設定
 * @author		loft
 *
 * @param[in]	userId		
 * @param[in]	gtype		
 *
 * @return		function	
 */
//********************************************************************************************
function setTweet(userId, gtype){
	var url = 'http://c-loft.com/shogi/quest';
	if(userId != null){
		url += '?u=' + userId;
		if(gtype != null){
			url += '&g=' + gtype;
		}
	}
	
	var text = '将棋クエスト履歴検索β';
	if(userId != null){
		text += ' ' + userId + 'の棋譜';
	}
	
	// remove any previous clone
	$('#tweet-area').empty()

	// create a clone of the twitter share button template
	var clone = $('.twitter-share-button-template').clone()

	// fix up our clone
	clone.removeAttr('style'); // unhide the clone
	//clone.attr('data-url', location.href);
	clone.attr('data-url', url);
	clone.attr('data-text', text);
	clone.attr('class', 'twitter-share-button'); 

	// copy cloned button into div that we can clear later
	$('#tweet-area').append(clone);

	// reload twitter scripts to force them to run, converting a to iframe
	$.getScript('http://platform.twitter.com/widgets.js');
}

function startDL(thisObj){
	var http = new Http();
	var url = "http://tk2-227-23463.vs.sakura.ne.jp/quest/" + thisObj.dataset.kifpath;
	var param = {	
		url: url,
	};
	http.get('./download/', param, onDLsuccess, onDLError);
}

function onDLsuccess(data){
	//ダイアログとして表示
	var position;
	if($('#kifDialog').is(':hidden')){
		position = {
			of : '#btnGet',
			at: 'center bottom',
			my: 'center top'
		};
		
		$("#kifDialog").dialog({
			modal: false,
			position: position,
		});
	}
	
	//棋譜文字列を表示
	$('#kifBox').val(data);
}

function onDLError(){
	//棋譜ダイアログを表示しないことで失敗を明示
}

//********************************************************************************************
/**
 * @brief		clickハンドラ
 */
//********************************************************************************************
function onButtonClickKifCopy(){
	//棋譜文字列を選択
	$('#kifBox').select();//select()はスマフォ不可(だけどクリップボードコピーもできないので問題ない)
	
	//クリップボードにコピー
	document.execCommand("copy");
}
