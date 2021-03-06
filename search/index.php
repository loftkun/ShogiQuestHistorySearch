<!DOCTYPE html>
<html lang="ja">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>将棋クエスト履歴検索β</title>
	<link rel="shortcut icon" href="./favicon.ico" />

	<link href="css/main.css?20170118" rel="stylesheet">

	<!-- Bootstrap -->
	<link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
	<script src="./js/bootstrap/bootstrap.min.js"></script>

	<!-- JQuery -->
	<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<link type="text/css" href="http://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css" rel="stylesheet" />
	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
	<script src="./js/ui/jquery.ui.touch-punch.js"></script>
	<script src="./js/balloon/jquery.balloon.min.js"></script>
	
	<!-- cookie -->
	<script src="./js/js-cookie-master/js.cookie.js"></script>
	<!--script src="./js/sorter.js"></script-->

	<!-- d3 -->
	<link href="http://nvd3.org/assets/css/nv.d3.css" rel="stylesheet" type="text/css">
	<script src="http://nvd3.org/assets/lib/d3.v3.js"></script>
	<script src="http://nvd3.org/assets/js/nv.d3.js"></script>
	<script src="https://d3js.org/d3-time-format.v2.min.js"></script>

	<!-- BokehJS -->
	<!--link href="http://cdn.pydata.org/bokeh/release/bokeh-0.12.15.min.css" rel="stylesheet"-->
	<link href="./css/bokehjs/bokeh-0.12.15.min.css?20180511_03" rel="stylesheet">
	<link href="http://cdn.pydata.org/bokeh/release/bokeh-widgets-0.12.15.min.css" rel="stylesheet">
	<link href="http://cdn.pydata.org/bokeh/release/bokeh-tables-0.12.15.min.css" rel="stylesheet">
	<script src="http://cdn.pydata.org/bokeh/release/bokeh-0.12.15.min.js"></script>
	<script src="http://cdn.pydata.org/bokeh/release/bokeh-widgets-0.12.15.min.js"></script>
	<script src="http://cdn.pydata.org/bokeh/release/bokeh-tables-0.12.15.min.js"></script>
	<script src="http://cdn.pydata.org/bokeh/release/bokeh-api-0.12.15.min.js"></script>
	
	<!-- encodinfg -->
	<script src="./js/encoding/encoding.min.js"></script>

	<!-- ShogiQuestHistorySearch -->	
	<script src="./js/http.js?20160217"></script>
	<script src="./js/graph-nvd3.js"></script>
	<script src="./js/graph-bokeh.js?20180511_01"></script>
	<script src="./js/history.js?20180511_04"></script>
	<script src="./js/quest.js?20160217"></script>
	<script src="./js/main.js?20171115_01"></script>
</head>
<body>
<br>
<div class="container">
	<!--form class="form-inline"-->
		<span style="font-size:2.0em">将棋クエスト履歴検索β</span>　
		<input type="text" id="userId" placeholder="ユーザID" class="form-control" style="height:40px;font-size:1.8em"/>　

		<label class="radio inline" style="font-size:1.8em"><input type="radio" id="rd0" name="rdGType" value="shogi10" checked/>10分</label>
		<label class="radio inline" style="font-size:1.8em"><input type="radio" id="rd1" name="rdGType" value="shogi" />5分</label>
		<label class="radio inline" style="font-size:1.8em"><input type="radio" id="rd2" name="rdGType" value="shogi2" />2分</label>　
		<button type="button" class="btn btn-primary" id="btnGet" style="width:140px;height:40px;font-size:1.8em;margin-left: auto;">検索</button>
		<div style="clear:both;margin :0 auto 6px">
			<span id="msgBox"></span>
			<span id="navArea" style="display:none">
				<button type="button" class="btn btn-primary" id="btnRecent" style="width:70px;height:30px;font-size:0.9em;margin-left: auto;" disabled="disabled">最近30</button>
				<button type="button" class="btn btn-primary" id="btnAll" style="width:70px;height:30px;font-size:0.9em;margin-left: auto;">すべて</button>
				<button type="button" class="btn btn-success" id="btnGraph" style="width:70px;height:30px;font-size:0.9em;margin-left: auto;">グラフ</button>
				<button type="button" class="btn btn-success" id="btnCSV" style="width:70px;height:30px;font-size:0.9em;margin-left: auto;">CSV</button>
			</span>
			<span id="tweet-area"></span>
		</div>
		<!--div id="dbgBox"></div-->
		<span id="ad"></span>
	<!--/form-->
</div>

<div class="container">
	<div class="container">
		<table id="tblHistory" class="table table-bordered table-hover table-condensed">
			<thead>
				<tr>
					<th>対局日時</th>
					<th>勝敗</th>
					<th>手合</th>
					<th>要因</th>
					<th>手数</th>
					<th>先手</th>
					<th>段級位</th>
					<th>R</th>
					<th>後手</th>
					<th>段級位</th>
					<th>R</th>
					<th class="clsKif">棋譜</th>
					<th title="ぴよ将棋で開く">ぴよ<br>将棋</th>
				</tr>
			</thead>
			<tbody id="tblHistory-tbody">
			</tbody>
		</table>
	</div>
	
	このサイトについて<br><br>
	<div>
		・将棋クエストの対局履歴の検索と棋譜のダウンロードができます。<br>
		・<b>棋譜のキャッシュが完了しDL可能になるとリンク(clip、csa、ぴよ将棋)が表示されるようになります。</b><br>
		・キャッシュが完了したかはお手数ですが検索ボタンを何度か押して確認して下さい(そのうち自動で表示するよう改良したい)。<br>
		・clipをクリックすると棋譜ウィンドウが出現しクリップボードにコピーできます。<br>
		・<img src="./img/piyo_link.png" width="60" title="ぴよ将棋">をタップすると<a href="http://www.studiok-i.net/android/">ぴよ将棋</a>で開けます(解析が便利！)。インストールはこちら(<a href="https://play.google.com/store/apps/details?id=net.studiok_i.shogi&hl=ja" title="Android版">Android</a>/<a href="https://itunes.apple.com/jp/app/gao-ji-nengde-ben-ge-pai-piyo/id1104881942"  title="iOS版">iOS</a>)から。<br>
		・本家の仕様変更等に伴い、予告なく運用を停止することがあります。<br>
		・連絡先：<a href="https://twitter.com/loftkun">@loftkun</a>　<a href="http://c-loft.com/soft/">その他制作物</a>　<a href="http://c-loft.com/igo/quest/">囲碁クエスト履歴検索β</a>、<a href="http://c-loft.com/renju/quest/">五目クエスト履歴検索β</a>、<a href="http://c-loft.com/reversi/wars/">リバーシ大戦履歴検索β</a>もあるよ。<br>
	</div>
	<br><br>
	開発履歴<br><br>
	<div>
		2015/05/05 公開<br>
		2016/02/15 検索結果URLのTwitterつぶやき対応<br>
		2016/02/16 勝敗、要因、手数表示<br>
		2016/06/10 手合い表示(平手, 角落ち以外はデータ未確認(その場合生データを表示)。確認次第対応します)<br>
		2016/09/15 対局履歴のキャッシュに対応<br>
		2016/09/17 棋譜ダウンロードに対応<br>
		2016/09/18 棋譜ウィンドウを追加(棋譜テキストの表示、クリップボードにコピー)<br>
		2016/09/18 ぴよ将棋で開くリンクを追加<br>
		2016/11/21 デザイン変更(スマホ向けに入力項目をやや大きくした)、勝敗で色分け対応<br>
		2016/11/21 defaultで最近30件を表示するようにした(表示処理高速化のため)。表示切り替え(30件 or すべて)ボタンを設置した。<br>
		2016/11/26 要因に"反則"を追加(王手放置等)<br>
		2017/01/07 グラフ(レート推移)追加<br>
		2017/01/18 クリックしたリンク(play/clip/csa/ぴよ将棋)には目印(点線囲み)を表示<br>
		2017/02/14 CSVダウンロード機能追加(PC推奨)<br>
	</div>
	<br>
	<a href="https://twitter.com/share" class="twitter-share-button-template" data-url="http://c-loft.com/shogi/quest/" data-hashtags="将棋 #shogi #ShogiQuest #将棋クエスト" style="display:none;">Tweet</a>
	
	<div id="kifDialog" title="棋譜ウィンドウ" style="display:none">
		<textarea id="kifBox" rows="10" cols="20">棋譜コピー用</textarea><br>
		<div class="mini">
			<ul>
				<li>棋譜の形式はCSA形式です。</li>
				<li>PCの方は<button id="btnKifCopy">copy</button>ボタンでコピーできます。</li>
				<li>Android・iOSの方は全選択してコピーして下さい。<br>
			</ul>
		</div>

	</div>
	
	<div id="graphDialog" title="グラフ" style="display:none">
		<div id="chart1">
			<div id="plot"></div>
			<svg id="svg_chart1"></svg>
		</div>
	</div>
</div>
</body>
</html>
