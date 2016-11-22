/***********************************
* JavaScript Table Sorter Revolution v0.2.2
* とりさんのソフト屋さん
* http://soft.fpso.jp/
* 配布ページ
* http://soft.fpso.jp/
* 
* 改造元
* JavaScript Table Sorter
* http://www.leigeber.com/2008/11/javascript-table-sorter/
 ***********************************/

var table=function(){
	function sorter(id,asc,desc){
		this.nosort=new Array();
		this.id = id;
		this.table=document.getElementById(id);
		this.colnum; /* 列数 */
		this.rownum; /* 行数 */
		this.hrownum; /* ヘッダの行数 */
		this.thead; /* theadコレクション */
		this.hrows;
		this.head; /* cellsコレクション */
		this.tbody;
		this.brows;

		this.startrow;

		this.seq=[];
		this.a=[];
		
		this.moverrow; /* マウスの下にある行 */

		this.hCellsClone=[];

		this.bClickCellIndex = -1;
		
		/* 昇順の矢印 */
		this.aschtml;
		if (asc) {
			this.aschtml = asc;
		} else {
			this.aschtml = '&nbsp;<font size="2">&uarr;</font>';
		}
		/* 降順の矢印 */
		this.deschtml;
		if (desc) {
			this.deschtml = desc;
		} else {
			this.deschtml = '&nbsp;<font size="2">&darr;</font>';
		}
	}
	sorter.prototype.init=function(){
		var i;
		/* ソートしない列を連想配列に */ 
		for (var i = 0; i <= arguments.length - 1; i++) {
			this.nosort[arguments[i]] = 1;
		}

		/* テーブルの各要素のソフトコピー */
		this.thead = this.table.getElementsByTagName('tHead')[0]; /* theadを取得 */
		if (this.thead) {
			this.hrows=this.thead.rows; /* thead内の行 */
			this.hrownum = this.hrows.length; /* thead内の行数 */
			this.head=this.hrows[this.hrownum-1].cells; /* theadの最終行 */
			this.colnum=this.head.length; /* 列数を得る */
			this.startrow = 0;
		} else {
			this.thead = this.table.getElementsByTagName('tbody')[0]; /* tbodyを取得 */
			this.hrows=this.thead.rows; /* thead内の行 */
			this.hrownum = 1; /* thead内の行数 */
			this.head=this.hrows[0].cells; /* theadの最終行 */
			this.colnum=this.head.length; /* 列数を得る */
			this.startrow = 1;
		}

		/* ヘッダに関わる部分の初期設定 */
		for(i = 0; i < this.colnum; i++){
			this.hCellsClone[i] = this.head[i].cloneNode(true); /* ヘッダ最終行をハードコピー */
			this.replaceCell(i);
			this.seq[i] = 'asc';
		}

		this.tbody = this.table.getElementsByTagName('tbody')[0]; /* tbodyを取得 */
		this.brows=this.tbody.rows; /* tbody内の行 */
		this.rownum=this.brows.length; /* tbody内の行数 */

		/* tbody内の行の初期設定 */
		for(i = this.startrow; i < this.rownum; i++){
			this.setRowEvent(this.brows[i]);
			this.a[i-this.startrow]={};
		}
	}
	/* onClick動作 */
	sorter.prototype.work=function(col){
		var i;
		/* ヘッダのセルを元に戻す */
		if (this.bClickCellIndex>=0) {
			this.replaceCell(this.bClickCellIndex);
		}
		this.bClickCellIndex = col;
		/* 並び替える列の元インデックス番号と値を取得 */
		for(i = this.startrow; i < this.rownum; i++){
			var ind = i-this.startrow;
			this.a[ind].index=i; 
			this.a[ind].value = this.getCelContent(this.brows[i].cells[col]);
		}

		/* ソート実行 */
		if(this.seq[col]=='desc'){
			this.a.reverse(this.compare);
		}else{
			this.a.sort(this.compare);
		}

		/* ソート結果を反映 */
		var newbody=document.createElement('tbody');
		if (this.startrow > 0) {
			var row=this.hrows[0].cloneNode(true);
			newbody.appendChild(row);
		}
		for(i=this.startrow; i < this.rownum; i++){
			var row=this.brows[this.a[i-this.startrow].index].cloneNode(true);
			this.setRowEvent(row);
			newbody.appendChild(row);
		}
		this.table.replaceChild(newbody,this.tbody);
		this.tbody = newbody;
		this.brows = newbody.rows;

		/* theadが無いとき */
		if (this.startrow > 0) {
			this.thead = this.tbody; /* tbodyを取得 */
			this.hrows=this.thead.rows; /* thead内の行 */
			this.head=this.hrows[0].cells; /* theadの最終行 */
			for(i = 0; i < this.colnum; i++){
				this.replaceCell(i);
			}
		}
		this.showArrow(col);
	}
	/* 矢印表示 */
	sorter.prototype.showArrow=function(col)
	{
		var span=document.createElement('span');
		if(this.seq[col]=='desc'){
			this.seq[col]='asc';
			span.innerHTML = this.deschtml;
		}else{
			this.seq[col]='desc';
			span.innerHTML = this.aschtml;
		}
		this.head[col].appendChild(span); 
	}
	sorter.prototype.setRowEvent=function(row)
	{
		row.onmouseover = new Function(this.id + '.mover(this.rowIndex)');
		row.onmouseout = new Function(this.id + '.mout(this.rowIndex)');
	}
	sorter.prototype.replaceCell=function(col)
	{
		var cell = this.hCellsClone[col].cloneNode(true);
		cell.onmouseover=new Function(this.id + '.hmover(this.cellIndex)');
		cell.onmouseout=new Function(this.id + '.hmout(this.cellIndex)');
		if(this.nosort[col] != 1){
			cell.onclick=new Function(this.id + '.work(this.cellIndex)');
		}
		this.hrows[this.hrownum-1].replaceChild(cell,this.head[col]);
	}
	/* ソート関数 */
	sorter.prototype.compare=function(f,c){
		f=f.value,c=c.value;
		return (f>c ? 1: (f<c ? -1:0))
	}
	/* マウスオーバー時動作 */
	sorter.prototype.mover=function(row){
		if (this.startrow == 0) {
			row -= this.hrownum;
		}
		this.moverrow = this.brows[row].cloneNode(true);
		for(var i = 0; i < this.colnum; i++){
			var cell;
			cell = this.brows[row].cells[i];
			var rgb = this.getBgColor(cell);
			rgb.r = this.CalculateColor(rgb.r);
			rgb.g = this.CalculateColor(rgb.g);
			rgb.b = this.CalculateColor(rgb.b);
			cell.style.backgroundColor = '#'+rgb.r+rgb.g+rgb.b;
		}
	}
	/* マウスアウト時動作 */
	sorter.prototype.mout=function(row){
		if (this.startrow == 0) {
			row -= this.hrownum;
		}
		this.setRowEvent(this.moverrow);
		this.tbody.replaceChild(this.moverrow,this.brows[row]);
	}
	/* マウスオーバー時動作(ヘッダ) */
	sorter.prototype.hmover=function(col){
		var rgb = this.getBgColor(this.head[col]);
		rgb.r = this.CalculateColor2(rgb.r);
		rgb.g = this.CalculateColor2(rgb.g);
		rgb.b = this.CalculateColor2(rgb.b);
		this.head[col].style.backgroundColor = '#'+rgb.r+rgb.g+rgb.b;
	}
	/* マウスアウト時動作(ヘッダ) */
	sorter.prototype.hmout=function(col){
		this.replaceCell(col);
	}
	/* セルの背景色を取得 */
	sorter.prototype.getBgColor=function(cell)
	{
		var m;
		var ret={};
		var clr;
		/* 背景色を取得 */
		if(navigator.userAgent.indexOf("MSIE")!=-1){
			clr = cell.currentStyle.backgroundColor;
		} else {
			clr = document.defaultView.getComputedStyle(cell,null).getPropertyValue("background-color");
		}
		/* 取得した色を色要素ごとに切り分ける */
		if(navigator.userAgent.indexOf("MSIE")!=-1||navigator.userAgent.indexOf("Opera")!=-1){
			m=clr.match(/^#(\w{2})(\w{2})(\w{2})$/);
		} else {
			m=clr.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
		}
		if (!m) {
			/* 切り分け出来なかった場合、白に */
			ret.r = 255;
			ret.g = 255;
			ret.b = 255;
		} else {
			if(navigator.userAgent.indexOf("MSIE")!=-1||navigator.userAgent.indexOf("Opera")!=-1){
				/* IEとOperaは16進数の文字列 */
				ret.r = parseInt(m[1],16);
				ret.g = parseInt(m[2],16);
				ret.b = parseInt(m[3],16);
			} else {
				/* 他は10進 */
				ret.r = parseInt(m[1]);
				ret.g = parseInt(m[2]);
				ret.b = parseInt(m[3]);
			}
		}
		return ret;
	}
	/* 反転色(?)計算 */
	sorter.prototype.CalculateColor=function(clr)
	{
		var ret;
		var ho = 255 - clr;
		
		if (clr > 128) {
			ret = clr * 4 / 5;
		} else {
			ret = ho / 5;
		}
		return this.dec2hex(ret);
	}
	/* 反転色(?)計算2 */
	sorter.prototype.CalculateColor2=function(clr)
	{
		var ret;
		var ho = 255 - clr;
		
		if (clr > 128) {
			ret = clr * 3 / 5;
		} else {
			ret = ho * 2 / 5;
		}
		return this.dec2hex(ret);
	}
	sorter.prototype.dec2hex=function(dec){
		var ret = parseInt(dec);
		ret = ret.toString(16);
		ret = this.right('00' + ret,2);
		return ret;
	}
	sorter.prototype.right=function( str, n ) {
		var l,n;
		l = str.length;
		if (n>l) n=l;
		return( str.substring(l-n,l) );
	}
	/* セル内の値取得 */
	sorter.prototype.getCelContent=function(cell)
	{
		var v;
		if(navigator.userAgent.indexOf("MSIE")!=-1){
			v = cell.innerText;
		} else {
			v = cell.textContent ;
		}
		v = this.v2n(v);
		v = this.v2d(v);
		return v;
	}
	/* 日付データに変換を試みる */
	sorter.prototype.v2d=function(v)
	{
		var stdate;
		var ymd;		

		stdate = new String(v);
		var m = stdate.match(/^((\D{0,2})(\d{1,4})[\/|年|\.])?(\d{1,2})[\/|月|\.](\d{1,2})日?\s*$/);
		if (!m) {
			return v;
		}
		ymd = 0;
		if (m[3]&&!isNaN(m[3])) ymd = this.wa2sei(m[2],parseInt(m[3],10));
		if (m[4]&&!isNaN(m[4])) ymd = ymd*100+parseInt(m[4],10);
		if (m[5]&&!isNaN(m[5])) ymd = ymd*100+parseInt(m[5],10);
		return ymd;
	}
	/* 和暦を西暦に変換 */
	sorter.prototype.wa2sei=function(wa,y)
	{
		var gen=[];
		var nen=[];

		if (!wa) {
			return y;
		}
		gen[0] = "明治" ; nen[0] = 1869;
		gen[1] = "大正" ; nen[1] = 1912;
		gen[2] = "昭和" ; nen[2] = 1926;
		gen[3] = "平成" ; nen[3] = 1989;

		gen[4] = "M" ; nen[4] = 1869;
		gen[5] = "T" ; nen[5] = 1912;
		gen[6] = "S" ; nen[6] = 1926;
		gen[7] = "H" ; nen[7] = 1989;

		for (var i = 0; i < nen.length; i++) {
			if (wa.indexOf(gen[i]) == 0) {
				y += nen[i]-1;
				break;
			}
		}
		return y;
	}
	/* 数値に良く使われる書式文字を削除し、数値に変換できるならば変換 */
	sorter.prototype.v2n=function(v)
	{
		var n;
		n = v;
		n = n.replace(/(-?)[\¥|\$](\d)/g,'$1$2');
		n = n.replace(/^(\D{0,1})(\$|\\)/g,'$1');
		n = n.replace(/(\d),(\d)/g,'$1$2');
		n = n.replace(/(\d)%$/g,'$1');
		n = n.replace(/^(▲|△)\s{0,1}(\d*)/g,"-$2");
		n = n.replace(/^\((.*)\)$/g,"-$1");
		if (n.match(/^\s*-{0,1}\d*\s*$/g)) {
			n = parseFloat(n);
			if(!isNaN(n)) {
				v = n;
			}
		}
		return v;
	}
	return{sorter:sorter}
}();

