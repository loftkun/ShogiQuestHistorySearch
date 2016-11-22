<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>将棋クエスト履歴検索β</title>
	<link rel="shortcut icon" href="./favicon.ico" />

	<link type="text/css" href="http://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css" rel="stylesheet" />
	<link type="text/css" href="./css/main.css?20160917" rel="stylesheet">

	<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
	<script src="./js/ui/jquery.ui.touch-punch.js"></script>
	<script src="./js/balloon/jquery.balloon.min.js"></script>
	<script src="./js/js-cookie-master/js.cookie.js"></script>
	<script src="./js/sorter.js"></script>
	<script src="./js/http.js?20160217"></script>
	<script src="./js/history.js?20160918_02"></script>
	<script src="./js/quest.js?20160217"></script>
	<script src="./js/main.js?20160918"></script>
</head>
<body>
<br>
<div style="font-size:25px">将棋クエスト履歴検索β</div>
<br>
<input type="text" id="userId" placeholder="ユーザID" />
<label><input type="radio" id="rd0" name="rdGType" value="shogi10" checked/>10分</label>
<label><input type="radio" id="rd1" name="rdGType" value="shogi" />5分</label>
<label><input type="radio" id="rd2" name="rdGType" value="shogi2" />2分</label>
<input type="image" id="btnGet" src="./img/btn_search3_1.gif" alt="検索" />
　<span id="tweet-area"></span>
<div id="msgBox"></div>
<!--div id="dbgBox"></div-->

<div class="contents">
	<div class="sample_area sample_area01">
		<table id="tblHistory" class="clsTblHistory">
			<thead>
				<tr>
					<th width="140">対局日時</th>
					<th width="40">勝敗</th>
					<th width="40">手合</th>
					<th width="40">要因</th>
					<th width="40">手数</th>
					<th width="140">先手</th>
					<th width="60">段級位</th>
					<th width="40">R</th>
					<th width="140">後手</th>
					<th width="60">段級位</th>
					<th width="40">R</th>
					<th width="120" class="clsKif">棋譜</th>
					<th width="40" title="ぴよ将棋で開く">ぴよ<br>将棋</th>
				</tr>
			</thead>
			<tbody id="tblHistory-tbody">
			</tbody>
		</table>
	</div>
	
	このサイトについて<br><br>
	<div class="clsInfo">
		・将棋クエストの対局履歴の検索と棋譜のダウンロードができます。<br>
		・<b>棋譜のキャッシュが完了しDL可能になるとリンク(clip、csa、ぴよ将棋)が表示されるようになります。</b><br>
		・clipをクリックすると棋譜ウィンドウが出現しクリップボードにコピーできます。<br>
		・<img src="./img/piyo_link.png" width="60" title="ぴよ将棋">をタップすると<a href="http://www.studiok-i.net/android/">ぴよ将棋</a>で開けます(解析が便利！)。インストールはこちら(<a href="https://play.google.com/store/apps/details?id=net.studiok_i.shogi&hl=ja" title="Android版">Android</a>/<a href="https://itunes.apple.com/jp/app/gao-ji-nengde-ben-ge-pai-piyo/id1104881942"  title="iOS版">iOS</a>)から。<br>
		・本家の仕様変更等に伴い、予告なく運用を停止することがあります。<br>
		・連絡先：<a href="https://twitter.com/loftkun">@loftkun</a>　<a href="http://c-loft.com/shogi/">その他将棋関連制作物</a><br>
	</div>
	<br><br>
	開発履歴<br><br>
	<div class="clsInfo">
		2015/05/05 公開<br>
		2016/02/15 検索結果URLのTwitterつぶやき対応<br>
		2016/02/16 勝敗、要因、手数表示<br>
		2016/06/10 手合い表示(平手, 角落ち以外はデータ未確認(その場合生データを表示)。確認次第対応します)<br>
		2016/09/15 対局履歴のキャッシュを開始<br>
		2016/09/17 棋譜のキャッシュを開始。棋譜ダウンロードに対応<br>
		2016/09/18 棋譜ウィンドウを追加(棋譜テキストの表示、クリップボードにコピー)<br>
		2016/09/18 ぴよ将棋で開くリンクを追加<br>
	</div>
	<br>
	<a href="https://twitter.com/share" class="twitter-share-button-template" data-url="http://c-loft.com/shogi/quest/" data-hashtags="将棋 #shogi #ShogiQuest #将棋クエスト" style="display:none;">Tweet</a>
	
	<div id="kifDialog" title="棋譜ウィンドウ" style="display:none">
		<textarea id="kifBox" rows="10" cols="20">棋譜コピー用</textarea><br>
		<div class="mini"
			<ul>
				<li>棋譜の形式はCSA形式です。</li>
				<li>PCの方は<button id="btnKifCopy">copy</button>ボタンでコピーできます。</li>
				<li>Android・iOSの方は全選択してコピーして下さい。<br>
			</ul>
		</div>

	</div>
</div>
</body>
</html>
