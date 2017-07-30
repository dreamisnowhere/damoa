function requestRank( contentsType, display, typeOfUrl, column ) {
	if(!column) column = 1;
	
	// 네이버 실시간 급상승 검색어 검색
	var nkey = "5d46b3688e9cf81c472fac8694e3cf09";
	var apiUrl = "http://openapi.naver.com/search?key="+nkey+"&query=" + contentsType + "&target=rank";
	var URL = "jsp/rankPro.jsp?xmlUrl=" + escape(apiUrl);
	var ajaxIndex = ajaxObjects.length;
	
	ajaxObjects[ajaxIndex] = new sack();
	ajaxObjects[ajaxIndex].requestFile = URL;
	ajaxObjects[ajaxIndex].onCompletion = function() {		
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");
		
		var titleArray = new Array();		// 검색결과를 저장할 배열
		
		// 검색된 실시간 급상승 검색어 파싱
		for (var i = 0; i < items.length; i++) {
			var item = items.item(i);
			var linkNode1 = item.getElementsByTagName("K").item(0);
			var linkNode2 = item.getElementsByTagName("K").item(1);
			var linkNode3 = item.getElementsByTagName("K").item(2);
			var linkNode4 = item.getElementsByTagName("K").item(3);
			var linkNode5 = item.getElementsByTagName("K").item(4);
			var linkNode6 = item.getElementsByTagName("K").item(5);
			var linkNode7 = item.getElementsByTagName("K").item(6);
			var linkNode8 = item.getElementsByTagName("K").item(7);
			var linkNode9 = item.getElementsByTagName("K").item(8);
			var linkNode10 = item.getElementsByTagName("K").item(9);
			
			var title1 = (linkNode1.firstChild) ? linkNode1.firstChild.nodeValue : "";
			var title2 = (linkNode2.firstChild) ? linkNode2.firstChild.nodeValue : "";
			var title3 = (linkNode3.firstChild) ? linkNode3.firstChild.nodeValue : "";
			var title4 = (linkNode4.firstChild) ? linkNode4.firstChild.nodeValue : "";
			var title5 = (linkNode5.firstChild) ? linkNode5.firstChild.nodeValue : "";
			var title6 = (linkNode6.firstChild) ? linkNode6.firstChild.nodeValue : "";
			var title7 = (linkNode7.firstChild) ? linkNode7.firstChild.nodeValue : "";
			var title8 = (linkNode8.firstChild) ? linkNode8.firstChild.nodeValue : "";
			var title9 = (linkNode9.firstChild) ? linkNode9.firstChild.nodeValue : "";
			var title10 = (linkNode10.firstChild) ? linkNode10.firstChild.nodeValue : "";
			
			// 실시간 급상승 검색어 10개를 배열에 순서대로 저장
			titleArray = [title1, title2, title3, title4, title5, title6, title7, title8, title9, title10];
		}
		
		// 랜덤 숫자 생성 (0∼9)
		var num = Math.floor( Math.random() * 10 ); 
		
		// 실시간 급상승 검색어 10개 중 랜덤 1개를 질의어로 하여 (=titleArray[randomNum])
		// contentsType(예 : blog, news, video 등등)에 해당하는 항목 검색
		createFeed(contentsType, display, typeOfUrl, titleArray[num], column);
	};	// Specify function that will be executed after file has been found
	ajaxObjects[ajaxIndex].runAJAX();		// Execute AJAX function
}