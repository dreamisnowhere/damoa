	/* USER VARIABLES */
	
	var numberOfColumns = 3;	// Number of columns for dragable boxes
	var columnParentBoxId = 'floatingBoxParentContainer';	// Id of box that is
															// parent of all
															// your dragable
															// boxes
	var src_rightImage = 'images/arrow_right.gif';
	var src_downImage = 'images/arrow_down.gif';
	var src_refreshSource = 'images/refresh.gif';
	var src_smallRightArrow = 'images/small_arrow.gif';
	var src_smallDownArrow = 'images/small_arrow_down.gif';
	var src_naver = 'images/naver.png';
	var src_google = 'images/google.png';
	var src_daum = 'images/daum.gif';
	var src_flickr = 'images/flickr.gif';
	var src_youtube = 'images/youtube.gif';
	var naverMapSpot = 'images/naver_map_spot.png';
	var src_prevBtn = 'images/prev_btn.gif';
	var src_nextBtn = 'images/next_btn.gif';
	var src_rss = 'images/rss.gif';
	
	var transparencyWhenDragging = false;
	var txt_editLink = '<img src=images/cog.gif alt=수정>';
	var txt_editLink_stop = '<img src=images/cogover.gif alt=수정완료>';
	var autoScrollSpeed = 4;	// Autoscroll speed - Higher = faster
	var dragObjectBorderWidth = 1;	// Border size of your RSS boxes - used to
									// determine width of dotted rectangle
	
	var useCookiesToRememberRSSSources = true;
	
	var nameOfCookie = 'dragable_rss_boxes';	// Name of cookie
	
	/* END USER VARIABLES */
	
	var columnParentBox;
	var dragableBoxesObj;
	
	var ajaxObjects = new Array();
	
	var boxIndex = 0;	
	var autoScrollActive = false;
	var dragableBoxesArray = new Array();
	
	var dragDropCounter = -1;
	var dragObject = false;
	var dragObjectNextSibling = false;
	var dragObjectParent = false;
	var destinationObj = false;
	
	var mouse_x;
	var mouse_y;
	
	var el_x;
	var el_y;	
	
	var rectangleDiv;
	var okToMove = true;

	var documentHeight = false;
	var documentScrollHeight = false;
	var dragableAreaWidth = false;
		
	var opera = navigator.userAgent.toLowerCase().indexOf('opera')>=0?true:false;
	var cookieCounter=0;
	var cookieRSSSources = new Array();
	
	var staticObjectArray = new Array();
	
	/*
	 * These cookie functions are downloaded from
	 * http://www.mach5.com/support/analyzer/manual/html/General/CookiesJavaScript.htm
	 */	
	 
	// 저장된 Cookie가 있는지 검사하고, 가져오는 함수
	function Get_Cookie(name) { 
	   var start = document.cookie.indexOf(name+"="); 
	   var len = start+name.length+1; 
	   if ((!start) && (name != document.cookie.substring(0,name.length))) return null; 
	   if (start == -1) return null; 
	   var end = document.cookie.indexOf(";",len); 
	   if (end == -1) end = document.cookie.length; 
	   return unescape(document.cookie.substring(len,end)); 
	} 
	
	// This function has been slightly modified
	// Cookie 수정을 위한 설정 함수
	function Set_Cookie(name,value,expires,path,domain,secure) { 
		expires = expires * 60*60*24*1000;
		var today = new Date();
		var expires_date = new Date( today.getTime() + (expires) );
	    var cookieString = name + "=" +escape(value) + 
	       ( (expires) ? ";expires=" + expires_date.toGMTString() : "") + 
	       ( (path) ? ";path=" + path : "") + 
	       ( (domain) ? ";domain=" + domain : "") + 
	       ( (secure) ? ";secure" : ""); 
	    document.cookie = cookieString; 
	} 

	// Height의 크기가 일정수준 이상이 되면 스크롤바를 생성하는 함수
	function autoScroll(direction,yPos)
	{
		if(document.documentElement.scrollHeight>documentScrollHeight && direction>0)return;
		if(opera)return;
		window.scrollBy(0,direction);
		if(!dragObject)return;
		
		if(direction<0){
			if(document.documentElement.scrollTop>0){
				dragObject.style.top = (el_y - mouse_y + yPos + document.documentElement.scrollTop) + 'px';		
			}else{
				autoScrollActive = false;
			}
		}else{
			if(yPos>(documentHeight-50)){	
				dragObject.style.top = (el_y - mouse_y + yPos + document.documentElement.scrollTop) + 'px';			
			}else{
				autoScrollActive = false;
			}
		}
		if(autoScrollActive)setTimeout('autoScroll('+direction+',' + yPos + ')',5);
	}
	
	// 컨텐츠 창 생성을 위한 생성자 함수	
	function initDragDropBox(e)
	{
		dragDropCounter = 1;
		if(document.all)e = event;
		
		if (e.target) source = e.target;
			else if (e.srcElement) source = e.srcElement;
			if (source.nodeType == 3) // defeat Safari bug
				source = source.parentNode;
		
		if(source.tagName.toLowerCase()=='img' || source.tagName.toLowerCase()=='a' || source.tagName.toLowerCase()=='input' || source.tagName.toLowerCase()=='td' || source.tagName.toLowerCase()=='tr' || source.tagName.toLowerCase()=='table')return;
		
	
		mouse_x = e.clientX;
		mouse_y = e.clientY;	
		var numericId = this.id.replace(/[^0-9]/g,'');
		el_x = getLeftPos(this.parentNode.parentNode)/1;
		el_y = getTopPos(this.parentNode.parentNode)/1 - document.documentElement.scrollTop;
			
		dragObject = this.parentNode.parentNode;
		
		documentScrollHeight = document.documentElement.scrollHeight + 100 + dragObject.offsetHeight;
		
		
		if(dragObject.nextSibling){
			dragObjectNextSibling = dragObject.nextSibling;
			if(dragObjectNextSibling.tagName!='DIV')dragObjectNextSibling = dragObjectNextSibling.nextSibling;
		}
		dragObjectParent = dragableBoxesArray[numericId]['parentObj'];
			
		dragDropCounter = 0;
		initDragDropBoxTimer();	
		
		return false;
	}
	
	// reload time의 초기값 설정을 위한 생성자 함수.
	function initDragDropBoxTimer()
	{
		if(dragDropCounter>=0 && dragDropCounter<10){
			dragDropCounter++;
			setTimeout('initDragDropBoxTimer()',10);
			return;
		}
		if(dragDropCounter==10){
			mouseoutBoxHeader(false,dragObject);
		}
		
	}

	// Drag 요소 설정을 위한 함수.
	function moveDragableElement(e){
		if(document.all)e = event;
		if(dragDropCounter<10)return;
		
		if(document.all && e.button!=1 && !opera){
			stop_dragDropElement();
			return;
		}
		
		if(document.body!=dragObject.parentNode){
			dragObject.style.width = (dragObject.offsetWidth - (dragObjectBorderWidth*2)) + 'px';
			dragObject.style.position = 'absolute';	
			dragObject.style.textAlign = 'left';
			if(transparencyWhenDragging){	
				dragObject.style.filter = 'alpha(opacity=70)';
				dragObject.style.opacity = '0.7';
			}	
			dragObject.parentNode.insertBefore(rectangleDiv,dragObject);
			rectangleDiv.style.display='block';
			document.body.appendChild(dragObject);

			rectangleDiv.style.width = dragObject.style.width;
			rectangleDiv.style.height = (dragObject.offsetHeight - (dragObjectBorderWidth*2)) + 'px'; 
			
		}
		
		if(e.clientY<50 || e.clientY>(documentHeight-50)){
			if(e.clientY<50 && !autoScrollActive){
				autoScrollActive = true;
				autoScroll((autoScrollSpeed*-1),e.clientY);
			}
			
			if(e.clientY>(documentHeight-50) && document.documentElement.scrollHeight<=documentScrollHeight && !autoScrollActive){
				autoScrollActive = true;
				autoScroll(autoScrollSpeed,e.clientY);
			}
		}else{
			autoScrollActive = false;
		}		

		
		var leftPos = e.clientX;
		var topPos = e.clientY + document.documentElement.scrollTop;
		
		dragObject.style.left = (e.clientX - mouse_x + el_x) + 'px';
		dragObject.style.top = (el_y - mouse_y + e.clientY + document.documentElement.scrollTop) + 'px';
								

		
		if(!okToMove)return;
		okToMove = false;

		destinationObj = false;	
		rectangleDiv.style.display = 'none'; 
		
		var objFound = false;
		var tmpParentArray = new Array();
		
		if(!objFound){
			for(var no=1;no<dragableBoxesArray.length;no++){
				if(dragableBoxesArray[no]['obj']==dragObject)continue;
				tmpParentArray[dragableBoxesArray[no]['obj'].parentNode.id] = true;
				if(!objFound){
					var tmpX = getLeftPos(dragableBoxesArray[no]['obj']);
					var tmpY = getTopPos(dragableBoxesArray[no]['obj']);

					if(leftPos>tmpX && leftPos<(tmpX + dragableBoxesArray[no]['obj'].offsetWidth) && topPos>(tmpY-20) && topPos<(tmpY + (dragableBoxesArray[no]['obj'].offsetHeight/2))){
						destinationObj = dragableBoxesArray[no]['obj'];
						destinationObj.parentNode.insertBefore(rectangleDiv,dragableBoxesArray[no]['obj']);
						rectangleDiv.style.display = 'block';
						objFound = true;
						break;
						
					}
					
					if(leftPos>tmpX && leftPos<(tmpX + dragableBoxesArray[no]['obj'].offsetWidth) && topPos>=(tmpY + (dragableBoxesArray[no]['obj'].offsetHeight/2)) && topPos<(tmpY + dragableBoxesArray[no]['obj'].offsetHeight)){
						objFound = true;
						if(dragableBoxesArray[no]['obj'].nextSibling){
							
							destinationObj = dragableBoxesArray[no]['obj'].nextSibling;
							if(!destinationObj.tagName)destinationObj = destinationObj.nextSibling;
							if(destinationObj!=rectangleDiv)destinationObj.parentNode.insertBefore(rectangleDiv,destinationObj);
						}else{
							destinationObj = dragableBoxesArray[no]['obj'].parentNode;
							dragableBoxesArray[no]['obj'].parentNode.appendChild(rectangleDiv);
						}
						rectangleDiv.style.display = 'block';
						break;					
					}
					
					
					if(!dragableBoxesArray[no]['obj'].nextSibling && leftPos>tmpX && leftPos<(tmpX + dragableBoxesArray[no]['obj'].offsetWidth)
					&& topPos>topPos>(tmpY + (dragableBoxesArray[no]['obj'].offsetHeight))){
						destinationObj = dragableBoxesArray[no]['obj'].parentNode;
						dragableBoxesArray[no]['obj'].parentNode.appendChild(rectangleDiv);	
						rectangleDiv.style.display = 'block';	
						objFound = true;				
						
					}
				}
				
			}
		
		}
		
		if(!objFound){
			
			for(var no=1;no<=numberOfColumns;no++){
				if(!objFound){
					var obj = document.getElementById('dragableBoxesColumn' + no);			
					var left = getLeftPos(obj)/1;						
					var width = obj.offsetWidth;
					
					if(leftPos>left && leftPos<(left+width)){
						destinationObj = obj;
						obj.appendChild(rectangleDiv);
						rectangleDiv.style.display='block';
						objFound=true;		
					}
				}
			}
		}

		setTimeout('okToMove=true',5);
	}
	
	// Drop 요소 설정을 위한 함수.
	function stop_dragDropElement()
	{
		if(dragDropCounter<10){
			dragDropCounter = -1
			return;
		}
		dragDropCounter = -1;
		if(transparencyWhenDragging){
			dragObject.style.filter = null;
			dragObject.style.opacity = null;
		}		
		dragObject.style.position = 'static';
		dragObject.style.width = null;
		var numericId = dragObject.id.replace(/[^0-9]/g,'');
		if(destinationObj && destinationObj.id!=dragObject.id){
			
			if(destinationObj.id.indexOf('dragableBoxesColumn')>=0){
				destinationObj.appendChild(dragObject);
				dragableBoxesArray[numericId]['parentObj'] = destinationObj;
			}else{
				destinationObj.parentNode.insertBefore(dragObject,destinationObj);
				dragableBoxesArray[numericId]['parentObj'] = destinationObj.parentNode;
			}				
		}else{
			if(dragObjectNextSibling){
				dragObjectParent.insertBefore(dragObject,dragObjectNextSibling);	
			}else{
				dragObjectParent.appendChild(dragObject);
			}				
		}
		
		autoScrollActive = false;
		rectangleDiv.style.display = 'none'; 
		dragObject = false;
		dragObjectNextSibling = false;
		destinationObj = false;
		
		if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);

		documentHeight = document.documentElement.clientHeight;	
	}

	// Cookie 저장을 위한 함수.
	function saveCookies()
	{
		var tmpUrlArray = new Array();
		cookieCounter = 0;
		
		for ( var no=1 ; no <= numberOfColumns ; no++ )
		{
			var parentObj = document.getElementById('dragableBoxesColumn' + no);
			var items = parentObj.getElementsByTagName('DIV');
			if( 0 == items.length ) continue;
			var item = items[0];
			var tmpItemArray = new Array();
			
			while ( item )
			{
				var numericId = item.id.replace(/[^0-9]/g,'');
				
				if ( 'rectangleDiv' != item.id  )
				{
					if ( 'none' != document.getElementById('dragableBox' + numericId).style.display )
					{
						tmpItemArray[tmpItemArray.length] = numericId;
					}
				}
				
				item = item.nextSibling;			
			}
			
			var columnIndex = no;
			
			for ( var no2 = tmpItemArray.length - 1 ; no2 >= 0 ; no2-- )
			{
				var tmpIndex = tmpItemArray[no2];
				
				var target = dragableBoxesArray[tmpIndex]['target'];
				var typeOfUrl;
				if ( 'userDefine' == target || 'userView' == target )
				{
					typeOfUrl = dragableBoxesArray[tmpIndex]['url'];
				}
				else
				{
					typeOfUrl = dragableBoxesArray[tmpIndex]['typeOfUrl'];
				}
				var display = dragableBoxesArray[tmpIndex]['display'];
				var minutesBeforeReload = dragableBoxesArray[tmpIndex]['minutesBeforeReload'];
				var heightOfBox = dragableBoxesArray[tmpIndex]['heightOfBox'];
				var query = dragableBoxesArray[tmpIndex]['query'];
				var start = dragableBoxesArray[tmpIndex]['start'];
				var boxId = dragableBoxesArray[tmpIndex]['boxId'];
				var uniqueIdentifier = dragableBoxesArray[tmpIndex]['uniqueIdentifier'];
				var state = dragableBoxesArray[tmpIndex]['state'];
				
				Set_Cookie(nameOfCookie + cookieCounter,
						target + '#;#'
						+ typeOfUrl + '#;#'
						+ display + '#;#'
						+ minutesBeforeReload + '#;#'
						+ heightOfBox + '#;#'
						+ columnIndex + '#;#'
						+ query + '#;#'
						+ start + '#;#'
						+ boxId + '#;#'
						+ uniqueIdentifier + '#;#'
						+ state, 60000);
				
				cookieRSSSources[tmpIndex] = cookieCounter;
				cookieCounter++;
			}
		}
		
		Set_Cookie(nameOfCookie + cookieCounter, '', -500);
	}
	
	// Drag&Drop 관련 위/아래 position 가져오는 함수.
	function getTopPos(inputObj)
	{		
	  var returnValue = inputObj.offsetTop;
	  while((inputObj = inputObj.offsetParent) != null){
	  	if(inputObj.tagName!='HTML')returnValue += inputObj.offsetTop;
	  }
	  return returnValue;
	}
	
	// Drag&Drop 관련 좌/우 position 가져오는 함수.
	function getLeftPos(inputObj)
	{
	  var returnValue = inputObj.offsetLeft;
	  while((inputObj = inputObj.offsetParent) != null){
	  	if(inputObj.tagName!='HTML')returnValue += inputObj.offsetLeft;
	  }
	  return returnValue;
	}
		
	// 컨텐츠 창 메인화면 설정 함수.
	function createColumns()
	{
		if(!columnParentBoxId){
			alert('No parent box defined for your columns');
			return;
		}
		columnParentBox = document.getElementById(columnParentBoxId);
		var columnWidth = Math.floor(100/numberOfColumns);
		var sumWidth = 0;
		for(var no=0;no<numberOfColumns;no++){
			var div = document.createElement('DIV');
			if(no==(numberOfColumns-1))columnWidth = 99 - sumWidth;
			sumWidth = sumWidth + columnWidth;
			div.style.cssText = 'float:left;width:'+columnWidth+'%;padding:0px;margin:0px;';
			div.style.height='100%';
			div.style.styleFloat='left';
			div.style.width = columnWidth + '%';
			div.style.padding = '0px';
			div.style.margin = '0px';

			div.id = 'dragableBoxesColumn' + (no+1);
			columnParentBox.appendChild(div);
			
			var clearObj = document.createElement('HR');	
			clearObj.style.clear = 'both';
			clearObj.style.visibility = 'hidden';
			div.appendChild(clearObj);
		}
		
		
		
		var clearingDiv = document.createElement('DIV');
		columnParentBox.appendChild(clearingDiv);
		clearingDiv.style.clear='both';
		
	}
	
	// 마우스 over시 변경될 컨텐츠 창 헤더 설정 함수.
	function mouseoverBoxHeader()
	{
		if(dragDropCounter==10)return;
		var id = this.id.replace(/[^0-9]/g,'');
		document.getElementById('dragableBoxExpand' + id).style.visibility = 'visible';		
		document.getElementById('dragableBoxRefreshSource' + id).style.visibility = 'visible';		
		document.getElementById('dragableBoxCloseLink' + id).style.visibility = 'visible';
		if(document.getElementById('dragableBoxEditLink' + id))document.getElementById('dragableBoxEditLink' + id).style.visibility = 'visible';
		
	}
	
	// 마우스 out시 변경될 컨텐츠 창 헤더 설정 함수.
	function mouseoutBoxHeader(e,obj)
	{
		if(!obj)obj=this;
		
		var id = obj.id.replace(/[^0-9]/g,'');
		document.getElementById('dragableBoxExpand' + id).style.visibility = 'hidden';		
		document.getElementById('dragableBoxRefreshSource' + id).style.visibility = 'hidden';		
		document.getElementById('dragableBoxCloseLink' + id).style.visibility = 'hidden';		
		if(document.getElementById('dragableBoxEditLink' + id))document.getElementById('dragableBoxEditLink' + id).style.visibility = 'hidden';		
		
	}
	
	// reload 이벤트 함수.
	function refreshRSS()
	{
		reloadRSSData(this.id.replace(/[^0-9]/g,''));
		setTimeout('dragDropCounter=-5',5);
	}
	
	// 펼치기/접기 이벤트 함수.
	function showHideBoxContent(e,inputObj)
	{
		if(document.all)e = event;
		if(!inputObj)inputObj=this;

		var numericId = inputObj.id.replace(/[^0-9]/g,'');
		var obj = document.getElementById('dragableBoxContent' + numericId);

		obj.style.display = inputObj.src.indexOf(src_rightImage)>=0?'none':'block';
		inputObj.src = inputObj.src.indexOf(src_rightImage)>=0?src_downImage:src_rightImage;
		inputObj.alt = inputObj.src.indexOf(src_rightImage)>=0?'펼치기':'접기';
		dragableBoxesArray[numericId]['state'] = obj.style.display=='block'?1:0;
		
		if(useCookiesToRememberRSSSources)
		{
			if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			setTimeout('dragDropCounter=-5',5);
		}
	}
	
	// '닫기' 버튼에 마우스 over시 이벤트 함수.
	function mouseover_CloseButton()
	{
		this.className = 'closeButton_over';	
		setTimeout('dragDropCounter=-5',5);
	}
	
	// '닫기' 버튼 하이라이트 효과 이벤트 함수.
	function highlightCloseButton()
	{
		this.className = 'closeButton_over';	
	}
	
	// '닫기' 버튼에 마우스 out시 이벤트 함수.
	function mouseout_CloseButton()
	{
		this.className = 'closeButton';	
	}
	
	// '닫기' 버튼 실행 설정 함수.
	function closeDragableBox(e,inputObj)
	{
		if(!inputObj)inputObj = this;
		var numericId = inputObj.id.replace(/[^0-9]/g,'');
		document.getElementById('dragableBox' + numericId).style.display = 'none';	
		
		Set_Cookie(nameOfCookie + cookieRSSSources[numericId], 'none', 60000);

		setTimeout('dragDropCounter=-5',5);
		
	}
	
	// 컨텐츠 창 Edit 설정 함수.
	function editRSSContent()
	{
		var numericId = this.id.replace(/[^0-9]/g,'');
		var obj = document.getElementById('dragableBoxEdit' + numericId);
		if(obj.style.display=='none'){
			obj.style.display='block';
			this.innerHTML = txt_editLink_stop;
			document.getElementById('dragableBoxHeader' + numericId).style.height = '135px';
		}else{
			obj.style.display='none';
			this.innerHTML = txt_editLink;
			document.getElementById('dragableBoxHeader' + numericId).style.height = '20px';
		}
		setTimeout('dragDropCounter=-5',5);
	}
	
	// 상태바 속 메시지 설정 함수.
	function showStatusBarMessage(numericId,message)
	{
		document.getElementById('dragableBoxStatusBar' + numericId).innerHTML = message;
	}
	
	// 컨텐츠 창 내에 헤더 박스 삽입하는 함수.
	function addBoxHeader(parentObj,externalUrl,notDrabable)
	{
		
		var div = document.createElement('DIV');
		
		div.className = 'dragableBoxHeader';
		div.id = 'dragableBoxHeader' + boxIndex;
		div.onmouseover = mouseoverBoxHeader;
		div.onmouseout = mouseoutBoxHeader;
		
		
		
		if(!notDrabable)
		{
			div.onmousedown = initDragDropBox;
			div.style.cursor = 'move';
		}

		var image = document.createElement('IMG');	
		image.id = 'dragableBoxExpand' + boxIndex;
		image.src = src_rightImage;
		image.style.visibility = 'hidden';	
		image.style.cursor = 'pointer';
		image.onmousedown = showHideBoxContent;	
		div.appendChild(image);

		var textSpan = document.createElement('SPAN');
		textSpan.id = 'dragableBoxHeader_txt' + boxIndex;
		div.appendChild(textSpan);
		parentObj.appendChild(div);	
		textSpan.style.paddingBottom='2px';// **//

		var closeLink = document.createElement('A');
		closeLink.style.cssText = 'float:right';
		closeLink.style.styleFloat = 'right';
		closeLink.style.marginRight = '3px';
		closeLink.id = 'dragableBoxCloseLink' + boxIndex;
		closeLink.innerHTML = '<img src=images/close.gif alt=닫기>';// **//
		closeLink.className = 'closeButton';
		closeLink.onmouseover = mouseover_CloseButton;// **//
		closeLink.onmouseout = mouseout_CloseButton;// **//
		closeLink.style.cursor = 'pointer';
		closeLink.style.visibility = 'hidden';
		closeLink.onmousedown = closeDragableBox;
		div.appendChild(closeLink);

		var image = document.createElement('IMG');
		image.src = src_refreshSource;
		image.alt = '새로고침';
		image.id = 'dragableBoxRefreshSource' + boxIndex;
		image.style.cssText = 'float:right';
		image.style.styleFloat = 'right';
		image.style.visibility = 'hidden';
		image.onclick = refreshRSS;
		image.style.cursor = 'pointer';
		image.onmouseover = mouseover_CloseButton;
		image.onmouseout = mouseout_CloseButton;
		if(!externalUrl)image.style.display='none';
		div.appendChild(image);
	}
	
	// 최종 parsing된 결과값을 컨텐츠 창에 저장하는 함수.
	function saveFeed(boxIndex)
	{
		var contentsType = dragableBoxesArray[boxIndex]['target'];
		var heightOfBox = dragableBoxesArray[boxIndex]['heightOfBox'] = document.getElementById('heightOfBox[' + boxIndex + ']').value;
		var intervalObj = dragableBoxesArray[boxIndex]['intervalObj'];
		if(intervalObj)clearInterval(intervalObj);
		
		if(heightOfBox && heightOfBox>40){
			var contentObj = document.getElementById('dragableBoxContent' + boxIndex);
			contentObj.style.height = heightOfBox + 'px';
			contentObj.setAttribute('heightOfBox',heightOfBox);
			contentObj.heightOfBox = heightOfBox;	
			if(document.all)contentObj.style.overflowY = 'auto';else contentObj.style.overflow='-moz-scrollbars-vertical;';
			if(opera)contentObj.style.overflow='auto';
		}
		
		dragableBoxesArray[boxIndex]['heightOfBox'] = heightOfBox;
		dragableBoxesArray[boxIndex]['heightOfBox'] = document.getElementById('heightOfBox[' + boxIndex + ']').value;
		dragableBoxesArray[boxIndex]['minutesBeforeReload'] = document.getElementById('minutesBeforeReload[' + boxIndex + ']').value;
		
		if(dragableBoxesArray[boxIndex]['minutesBeforeReload'] && dragableBoxesArray[boxIndex]['minutesBeforeReload']>5){
			var tmpInterval = setInterval("reloadRSSData(" + boxIndex + ")",(dragableBoxesArray[boxIndex]['minutesBeforeReload']*1000*60));	
			dragableBoxesArray[boxIndex]['intervalObj'] = tmpInterval;
		}
		
		if ( 'userDefine' == contentsType )
		{
			dragableBoxesArray[boxIndex]['url'] = document.getElementById('url[' + boxIndex + ']').value;
		}
		else if ( 'userView' != contentsType )
		{
			dragableBoxesArray[boxIndex]['query'] = document.getElementById('query[' + boxIndex + ']').value;
			dragableBoxesArray[boxIndex]['display'] = Math.min( document.getElementById('display[' + boxIndex + ']').value, 100 );
			setUrl(boxIndex);
		}
		
		reloadRSSData(boxIndex);
		
		if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
	}
	
	// 컨텐츠 창 Edit 페이지 설정 함수.
	function addRSSEditContent(parentObj)
	{

		var editLink = document.createElement('A');
		editLink.href = '#';
		editLink.onclick = cancelEvent;
		editLink.style.cssText = 'float:right';
		editLink.style.styleFloat = 'right';
		editLink.id = 'dragableBoxEditLink' + boxIndex;
		editLink.innerHTML = txt_editLink;
		editLink.className = 'dragableBoxEditLink';
		editLink.style.cursor = 'pointer';
		editLink.style.visibility = 'hidden';
		editLink.onmousedown = editRSSContent;
		parentObj.appendChild(editLink);	
				
		var editBox = document.createElement('DIV');
		editBox.style.clear='both';
		editBox.id = 'dragableBoxEdit' + boxIndex;
		editBox.style.display='none';
		
		var contentsType = dragableBoxesArray[boxIndex]['target'];
		var content;
		
		if ( 'userDefine' == contentsType )
		{
			content = '<form><table cellpadding="1" cellspacing="1"><tr><td>Source:<\/td><td><input type="text" id="url[' + boxIndex + ']" value="' + dragableBoxesArray[boxIndex]['url'] + '" size="25" maxlength="255"><\/td><\/tr>'
			+'<tr><td>Fixed height:<\/td><td><input type="text" id="heightOfBox[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value)this.value=' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" value="' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" size="2" maxlength="3"><\/td><\/tr><tr>'
			+'<tr><td>Reload every:<\/td><td width="30"><input type="text" id="minutesBeforeReload[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value || this.value/1<1)this.value=' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" value="' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" size="2" maxlength="3">&nbsp;minute<\/td><\/tr>'
			+'<tr><td><input type="button" onclick="saveFeed(' + boxIndex + ')" value="Save"><\/td><\/tr><\/table><\/form>';
		}
		else if ( 'userView' == contentsType )
		{
			content = '<form><table cellpadding="1" cellspacing="1">'
			+'<tr><td>Fixed height:<\/td><td><input type="text" id="heightOfBox[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value)this.value=' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" value="' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" size="2" maxlength="3"><\/td><\/tr><tr>'
			+'<tr><td>Reload every:<\/td><td width="30"><input type="text" id="minutesBeforeReload[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value || this.value/1<1)this.value=' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" value="' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" size="2" maxlength="3">&nbsp;minute<\/td><\/tr>'
			+'<tr><td><input type="button" onclick="saveFeed(' + boxIndex + ')" value="Save"><\/td><\/tr><\/table><\/form>';
		}
		else
		{
			content = '<form><table cellpadding="1" cellspacing="1"><tr><td>Query:<\/td><td><input type="text" id="query[' + boxIndex + ']" value="' + dragableBoxesArray[boxIndex]['query'] + '" size="25" maxlength="255"><\/td><\/tr>'
			+'<tr><td>Items:<\/td><td width="30"><input type="text" id="display[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value)this.value=' + dragableBoxesArray[boxIndex]['display'] + '" value="' + dragableBoxesArray[boxIndex]['display'] + '" size="2" maxlength="2"><\/td><\/tr><tr><td>Fixed height:<\/td><td><input type="text" id="heightOfBox[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value)this.value=' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" value="' + dragableBoxesArray[boxIndex]['heightOfBox'] + '" size="2" maxlength="3"><\/td><\/tr><tr>'
			+'<tr><td>Reload every:<\/td><td width="30"><input type="text" id="minutesBeforeReload[' + boxIndex + ']" onblur="this.value = this.value.replace(/[^0-9]/g,\'\');if(!this.value || this.value/1<1)this.value=' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" value="' + dragableBoxesArray[boxIndex]['minutesBeforeReload'] + '" size="2" maxlength="3">&nbsp;minute<\/td><\/tr>'
			+'<tr><td><input type="button" onclick="saveFeed(' + boxIndex + ')" value="Save"><\/td><\/tr><\/table><\/form>';
		}
		
		editBox.innerHTML = content;
		parentObj.appendChild(editBox);		
		
	}
	
	// 최종 생성된 컨텐츠 창을 Main Page에 추가하는 함수.
	function addBoxContentContainer(parentObj,heightOfBox)
	{
		var div = document.createElement('DIV');
		div.className = 'dragableBoxContent';
		if(opera)div.style.clear='none';
		div.id = 'dragableBoxContent' + boxIndex;
		parentObj.appendChild(div);		
		if(heightOfBox && heightOfBox/1>40){
			div.style.height = heightOfBox + 'px';
			div.setAttribute('heightOfBox',heightOfBox);
			div.heightOfBox = heightOfBox;	
			if(document.all)div.style.overflowY = 'auto';else div.style.overflow='-moz-scrollbars-vertical;';
			if(opera)div.style.overflow='auto';
		}
	}
	
	// 상태바 설정 함수.
	function addBoxStatusBar(parentObj)
	{
		var div = document.createElement('DIV');
		div.className = 'dragableBoxStatusBar';
		div.id = 'dragableBoxStatusBar' + boxIndex;
		parentObj.appendChild(div);	
	}
	
	// 컨텐츠 창 생성 함수
	function createABox(columnIndex,heightOfBox,externalUrl,uniqueIdentifier,notDragable)
	{
		boxIndex++;
		
		var maindiv = document.createElement('DIV');
		maindiv.className = 'dragableBox';
		maindiv.id = 'dragableBox' + boxIndex;
		
		var div = document.createElement('DIV');
		div.className='dragableBoxInner';
		maindiv.appendChild(div);
		
		
		addBoxHeader(div,externalUrl,notDragable);
		addBoxContentContainer(div,heightOfBox);
		addBoxStatusBar(div);
		
		var obj = document.getElementById('dragableBoxesColumn' + columnIndex);
		var subs = obj.getElementsByTagName('DIV');
		if(subs.length>0){
			obj.insertBefore(maindiv,subs[0]);
		}else{
			obj.appendChild(maindiv);
		}
		
		dragableBoxesArray[boxIndex] = new Array();
		dragableBoxesArray[boxIndex]['obj'] = maindiv;
		dragableBoxesArray[boxIndex]['parentObj'] = maindiv.parentNode;
		dragableBoxesArray[boxIndex]['uniqueIdentifier'] = uniqueIdentifier;
		dragableBoxesArray[boxIndex]['heightOfBox'] = heightOfBox;
		dragableBoxesArray[boxIndex]['state'] = 1;	// Expanded
		
		staticObjectArray[uniqueIdentifier] = boxIndex;
		
		return boxIndex;
	}
	
	// 받아온 결과값을 관련 모듈로 보내주는 함수.
	function showRSSData(ajaxIndex,boxIndex)
	{
		switch(dragableBoxesArray[boxIndex]['target']){
		case "rank":
			showRankData(ajaxIndex,boxIndex);
			break;
		case "flickrimage":
			showFlickrImageData(ajaxIndex,boxIndex);
			break;
		case "naverimage":
			showNaverImageData(ajaxIndex,boxIndex);
			break;
		case "daumimage":
			showDaumImageData(ajaxIndex,boxIndex);
			break;
		case "youtubevideo":
			showYoutubeVideoData(ajaxIndex,boxIndex);
		case "video":
			showVideoData(ajaxIndex,boxIndex);
			break;
		case "blog":
			showBlogNewsData(ajaxIndex,boxIndex);
			break;
		case "news":
			showBlogNewsData(ajaxIndex,boxIndex);
			break;
		case "jisik":
			showBlogNewsData(ajaxIndex,boxIndex);
			break;
		case "navermap":
			showNaverMapData(ajaxIndex,boxIndex);
			break;
		case "daummap":
			showDaumMapData(ajaxIndex,boxIndex);
			break;	
		case "googlemap":
			showGoogleMapData(ajaxIndex,boxIndex);
			break;	
		case "userDefine":
			showUserDefine(ajaxIndex,boxIndex);
			break;
		case "userView":
			showUserView(ajaxIndex,boxIndex);
			break;
		}

	}

	// ‘Naver 실시간 급상승 검색어’ XML 결과값 파싱 및 랜더링 모듈.
	function showRankData(ajaxIndex,boxIndex)
	{
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");
		
		var titleArray = new Array();
		
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
			
			titleArray = [title1, title2, title3, title4, title5, title6, title7, title8, title9, title10];
		}
		
		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_naver+ '"\/>&nbsp;<\/span><span>' + "실시간 급상승 검색어" + '<\/span>';	// title
		var string = '<div onmousedown="return queryStart(' + boxIndex + ');">';
		string += '<table cellpadding="1" cellspacing="0">';
		var txt; 
		for(var i=0 ; i<titleArray.length ; i++){	// Looping through XML items
			txt += titleArray[i]+", ";
			string +=  '<tr><td><img src="' + src_smallRightArrow + '"/><\/td><td class=\"boxItemRank\">['+(i+1)+']<\/td><td><p class=\"boxItemRank\">' + titleArray[i] + '<\/p><\/td><\/tr>';		
		}
		string += '<\/table><\/div>';
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string;
		showStatusBarMessage(boxIndex,'');
		ajaxObjects[ajaxIndex] = false;
	}
	
	// 'Flickr 이미지 검색' JSON 결과값 파싱 및 랜더링 모듈.
	function showFlickrImageData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;
		var thumbnailSize = Math.floor( mainImgWidth / dragableBoxesArray[boxIndex]['display'] );
		var imageLinked = new Array();
		var imageSrced = new Array();
		var i=0;
		var rssContent = ajaxObjects[ajaxIndex].response;
		
		// 가져온 텍스트 중에서 "jsonFlickrApi" 라는 문자열을 지운뒤
		var flickritems = rssContent.substring(13,rssContent.length);
		
		// 텍스트를 객체로 만든다.
		var jsonValue = eval(flickritems);
		
		// 만들어진 객체에서 태그들을 뽑아와 배열에 저장한다.
		var tagList = jsonValue.photos.photo;

		// imageSrced[i] = thumbnailURL, imageLinked[i] = imageURL
		for (i = 0; i < tagList.length; i++) {
			imageSrced[i] = "http://farm" + tagList[i].farm + ".static.flickr.com/" + tagList[i].server + "/" + tagList[i].id + "_" + tagList[i].secret + "_t.jpg";
			imageLinked[i] = "http://farm" + tagList[i].farm + ".static.flickr.com/" + tagList[i].server + "/" + tagList[i].id + "_" + tagList[i].secret + "_m.jpg";
		}

		var total = jsonValue.photos.total;		// total number of Image

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_flickr+ '"\/>&nbsp;<\/span><span>' + "이미지 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		// imageSrced[i] = thumbnailURL, imageLinked[i] = imageURL
		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';
		//set thumbnail
		string += '<div id="flickrImgThumb'+boxIndex+'" style="padding: 5px 0px">';
		 //thumbnail prevous button
		string += '<span><img src="'+src_prevBtn+'" class="pageButton" \/><\/span><span class="flickrThumbnail">';
		 //thumbnail next button 
		for(i=0; i<imageSrced.length; i++){
			string += '<img title="'+i+'"src="'+imageSrced[i]+'" width="'+thumbnailSize+'" height="'+thumbnailSize+'"\/>';
		}
		 //thumbnail next button
		string += '<\/span><span><img src="'+src_nextBtn+'" class="pageButton" \/><\/span><\/div>';
		//set main image
		string += '<div id="flickrImg'+boxIndex+'" class="flickrImg" style="padding: 5px 0px"><a href="'+ imageLinked[0] +'" target="_blank"><img src="'+imageLinked[0]+'" width="'+mainImgWidth+'"\/><\/a><\/div>';
		string += '<\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
		
		//btn 이벤트
		var thumbLine = document.getElementById('flickrImgThumb'+boxIndex);
		var prev = thumbLine.firstChild.firstChild;
		prev.onclick = function(){
			if(dragableBoxesArray[boxIndex]['start'] !=1)
			{
				dragableBoxesArray[boxIndex]['start']--;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}	
		}
		
		var next = thumbLine.lastChild.firstChild;
		next.onclick = function() {
			if(dragableBoxesArray[boxIndex]['start'] < (total/dragableBoxesArray[boxIndex]['display'])){
				dragableBoxesArray[boxIndex]['start']++;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}
		}
		
		//thumbnail 이벤트: mainImage와 link 바꿔주기
		// imageSrced[i] = thumbnailURL, imageLinked[i] = imageURL
		var links = thumbLine.childNodes[1].childNodes;
		for(i=0; i<links.length; i++){
			links[i].onclick = function(){
				changeFlickrImg(this, boxIndex, imageLinked);
			}
		}	
		
		showStatusBarMessage(boxIndex,''); 
	}
	
	// showFlickrImageData 부속 함수.
	// 클릭한 썸네일의 내용을 메인에 뿌려주는 모듈.
	// imageSrced[i] = thumbnailURL, imageLinked[i] = imageURL
	function changeFlickrImg(thumb, boxIndex, imageLinked)
	{
		var no = thumb.title;
		var imgLink = document.getElementById('flickrImg'+boxIndex).firstChild;
		imgLink.href = imageLinked[no];
		var mainImg = imgLink.firstChild;
		mainImg.src = imageLinked[no];
	}
	
	// 'Naver 이미지 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showNaverImageData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;
		var thumbnailSize = Math.floor( mainImgWidth / dragableBoxesArray[boxIndex]['display'] );
		var imageLinked = new Array();
		var imageSrced = new Array();
		var i=0;
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");

		// imageLinked[i] = imageURL,  imageSrced[i] = thumbnailURL
		for (var i = 0; i < items.length; i++) {
			var item = items.item(i);
			
			var linkNode = item.getElementsByTagName("link").item(0);
			imageLinked[i] = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
			
			var imageNode = item.getElementsByTagName("thumbnail").item(0);
			imageSrced[i] = (imageNode.firstChild) ? imageNode.firstChild.nodeValue : "";
		}

		var totalNode = rssContent.getElementsByTagName("total").item(0);
		var total = (totalNode.firstChild) ? totalNode.firstChild.nodeValue : "";		// total number of Image

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_naver+ '"\/>&nbsp;<\/span><span>' + "이미지 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		// imageLinked[i] = imageURL,  imageSrced[i] = thumbnailURL
		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';
		//set thumbnail
		string += '<div id="naverImgThumb'+boxIndex+'" style="padding: 5px 0px">';
		 //thumbnail prevous button
		string += '<span><img src="'+src_prevBtn+'" class="pageButton" \/><\/span><span class="naverThumbnail">';
		 //thumbnail next button 
		for(i=0; i<imageSrced.length; i++){
			string += '<img title="'+i+'"src="'+imageSrced[i]+'" width="'+thumbnailSize+'" height="'+thumbnailSize+'"\/>';
		}
		 //thumbnail next button
		string += '<\/span><span><img src="'+src_nextBtn+'" class="pageButton" \/><\/span><\/div>';
		//set main image
		string += '<div id="naverImg'+boxIndex+'" class="naverImg" style="padding: 5px 0px"><a href="'+ imageLinked[0] +'" target="_blank"><img src="'+imageLinked[0]+'" width="'+mainImgWidth+'"\/><\/a><\/div>';
		string += '<\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
		
		//btn 이벤트
		var thumbLine = document.getElementById('naverImgThumb'+boxIndex);
		var prev = thumbLine.firstChild.firstChild;
		prev.onclick = function(){
			if(dragableBoxesArray[boxIndex]['start'] !=1)
			{
				dragableBoxesArray[boxIndex]['start'] = dragableBoxesArray[boxIndex]['start'] - dragableBoxesArray[boxIndex]['display'];
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}	
		}
		
		var next = thumbLine.lastChild.firstChild;
		next.onclick = function() {
			if(dragableBoxesArray[boxIndex]['start'] < (total/dragableBoxesArray[boxIndex]['display'])){
				dragableBoxesArray[boxIndex]['start'] = dragableBoxesArray[boxIndex]['start'] + dragableBoxesArray[boxIndex]['display'];
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}
		}
		
		//thumbnail 이벤트: mainImage와 link 바꿔주기
		// imageLinked[i] = imageURL,  imageSrced[i] = thumbnailURL
		var links = thumbLine.childNodes[1].childNodes;
		for(i=0; i<links.length; i++){
			links[i].onclick = function(){
				changeNaverImg(this, boxIndex, imageLinked);
			}
		}	
		
		showStatusBarMessage(boxIndex,'');
	}
	
	// showNaverImageData 부속 함수.
	// 클릭한 썸네일의 내용을 메인에 뿌려주는 모듈.
	// imageLinked[i] = imageURL,  imageSrced[i] = thumbnailURL
	function changeNaverImg(thumb, boxIndex, imageLinked)
	{
		var no = thumb.title;
		var imgLink = document.getElementById('naverImg'+boxIndex).firstChild;
		imgLink.href = imageLinked[no];
		var mainImg = imgLink.firstChild;
		mainImg.src = imageLinked[no];
	}

	// 'Daum 이미지 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showDaumImageData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;
		var thumbnailSize = Math.floor( mainImgWidth / dragableBoxesArray[boxIndex]['display'] );
		var imageLinked = new Array();
		var imageSrced = new Array();
		var i=0;
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");

		// imageLinked[i] = link, imageSrced[i] = imageURL, imageSrced[i] = thumbnailURL
		for (var i = 0; i < items.length; i++) {
			var item = items.item(i);
			
			var linkNode = item.getElementsByTagName("link").item(0);
			imageLinked[i] = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
			//imageArr[i][0] = linked;
			
			var imageNode = item.getElementsByTagName("thumbnail").item(0);
			imageSrced[i] = (imageNode.firstChild) ? imageNode.firstChild.nodeValue : "";
		}

		var totalNode = rssContent.getElementsByTagName("totalCount").item(0);
		var total = (totalNode.firstChild) ? totalNode.firstChild.nodeValue : "";		// total number of Image

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_daum+ '"\/>&nbsp;<\/span><span>' + "이미지 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		// imageLinked[i] = link, imageSrced[i] = imageURL, imageSrced[i] = thumbnailURL
		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';
		//set thumbnail
		string += '<div id="daumImgThumb'+boxIndex+'" style="padding: 5px 0px">';
		 //thumbnail prevous button
		string += '<span><img src="'+src_prevBtn+'" class="pageButton" \/><\/span><span class="daumThumbnail">';
		 //thumbnail next button 
		for(i=0; i<imageSrced.length; i++){
			string += '<img title="'+i+'"src="'+imageSrced[i]+'" width="'+thumbnailSize+'" height="'+thumbnailSize+'"\/>';
		}
		 //thumbnail next button
		string += '<\/span><span><img src="'+src_nextBtn+'" class="pageButton" \/><\/span><\/div>';
		//set main image
		string += '<div id="daumImg'+boxIndex+'" class="daumImg" style="padding: 5px 0px"><a href="'+ imageLinked[0] +'" target="_blank"><img src="'+imageSrced[0]+'" width="'+mainImgWidth+'"\/><\/a><\/div>';
		string += '<\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
		
		//btn 이벤트
		var thumbLine = document.getElementById('daumImgThumb'+boxIndex);
		var prev = thumbLine.firstChild.firstChild;
		prev.onclick = function(){
			if(dragableBoxesArray[boxIndex]['start'] !=1)
			{
				dragableBoxesArray[boxIndex]['start']--;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}	
		}
		
		var next = thumbLine.lastChild.firstChild;
		next.onclick = function() {
			if(dragableBoxesArray[boxIndex]['start'] < (total/dragableBoxesArray[boxIndex]['display'])){
				dragableBoxesArray[boxIndex]['start']++;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}
		}
		
		//thumbnail 이벤트: mainImage와 link 바꿔주기
		// imageLinked[i] = link, imageSrced[i] = imageURL, imageSrced[i] = thumbnailURL
		var links = thumbLine.childNodes[1].childNodes;
		for(i=0; i<links.length; i++){
			links[i].onclick = function(){
				changeDaumImg(this, boxIndex, imageLinked, imageSrced);
			}
		}	
		
		showStatusBarMessage(boxIndex,''); 
	}
	
	// showDaumImageData 부속 함수.
	// 클릭한 썸네일의 내용을 메인에 뿌려주는 모듈.
	// imageLinked[i] = link, imageSrced[i] = imageURL, imageSrced[i] = thumbnailURL
	function changeDaumImg(thumb, boxIndex, imageLinked, imageSrced)
	{
		var no = thumb.title;
		var imgLink = document.getElementById('daumImg'+boxIndex).firstChild;
		imgLink.href = imageLinked[no];
		var mainImg = imgLink.firstChild;
		mainImg.src = imageSrced[no];
	}
	
	// 'YouTube 동영상 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showYoutubeVideoData(ajaxIndex,boxIndex)
	{
		var mainVedWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;
		var mainVedHeight = mainVedWidth * 0.8;
		var thumbnailSize = Math.floor( mainVedWidth / dragableBoxesArray[boxIndex]['display'] );

		var videoPlayered = new Array();
		var videoThumbed = new Array();
		var i=0;
		var rssContent = ajaxObjects[ajaxIndex].response;
		
		// 가져온 텍스트 중에서 "<?xml version="1.0" encoding="utf-8"?>" 라는 문자열을 지운뒤
		var flickritems = rssContent.substring(38,rssContent.length);
				
		// 텍스트를 객체로 만든다.
		var jsonValue = eval("(" + rssContent + ")");
		
		// 만들어진 객체에서 태그들을 뽑아와 배열에 저장한다.
		var tagList = jsonValue.feed;

		// 비디오 제목 : jsonValue.feed.entry[i].media$group.media$title.$t
		// 비디오 썸네일 : jsonValue.feed.entry[i].media$group.media$thumbnail[0 ~ 5].url
		// 비디오 아이디 : jsonValue.feed.entry[i].media$group.yt$videoid.$t

		// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
		for (i = 0; i < tagList.entry.length; i++) {
			videoThumbed[i] = tagList.entry[i].media$group.media$thumbnail[0].url;
			videoPlayered[i] = "http://www.youtube.com/v/" + tagList.entry[i].media$group.yt$videoid.$t + "&f=gdata_videos$playerapiid=videoPlayer&enablejsapi=1";
		}
		
		var total = tagList.openSearch$totalResults.$t;	// total number of Video
		
		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_youtube+ '"\/>&nbsp;<\/span><span>' + "동영상 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title
	
		// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
		//set html source
		var string='';
		var objectSrc = new Array();
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';
		//set thumbnail
		string += '<div id="youtubeVideoThumb'+boxIndex+'" style="padding: 5px 0px">';
		 //thumbnail prevous button
		string += '<span><img src="'+src_prevBtn+'" class="pageButton" \/><\/span><span class="youtubeThumbnail">';
		 //thumbnail next button 
		for(i=0; i<videoThumbed.length; i++){
			string += '<img title="'+i+'"src="'+ videoThumbed[i] +'" width="'+thumbnailSize+'" height="'+thumbnailSize+'"\/>';
		}
		 //thumbnail next button
		string += '<\/span><span><img src="'+src_nextBtn+'" class="pageButton" \/><\/span><\/div>';
		//set main video
		string += '<div id="youtubeVideo'+boxIndex+'" class="youtubeVideo" style="padding: 5px 0px">';
		objectSrc[0] = '<object id="youtubemainVideo'+boxIndex+'" type="application/x-shockwave-flash" width="'+mainVedWidth+'" height="'+mainVedHeight+'" align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0">'
						+'<param name="movie" value="';
		objectSrc[1] = videoPlayered[0];
		objectSrc[2] = '" \/>';
		objectSrc[3] = '<param name="allowScriptAccess" value="always" \/>'
			 			+'<param name="allowFullScreen" value="true" \/>'
			 			+'<param name="bgcolor" value="#000000" \/>'
			 			+'<embed src="';
		objectSrc[4] = videoPlayered[0];
		objectSrc[5] = '" width="'+mainVedWidth+'" height="'+mainVedHeight+'" allowScriptAccess="always" type="application/x-shockwave-flash" allowFullScreen="true" bgcolor="#000000" ><\/embed>'
			 			+'<\/object>';
		
		string += objectSrc[0] + objectSrc[1] + objectSrc[2] + objectSrc[3] + objectSrc[4] + objectSrc[5];
		string += '<\/div><\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
		
		
		//btn 이벤트
		var thumbLine = document.getElementById('youtubeVideoThumb'+boxIndex);
		var prev = thumbLine.firstChild.firstChild;
		prev.onclick = function(){
			if(dragableBoxesArray[boxIndex]['start'] !=1)
			{
				dragableBoxesArray[boxIndex]['start'] = dragableBoxesArray[boxIndex]['start'] - dragableBoxesArray[boxIndex]['display'];
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}	
		}
		
		var next = thumbLine.lastChild.firstChild;
		next.onclick = function() {
			if(dragableBoxesArray[boxIndex]['start'] < (total/dragableBoxesArray[boxIndex]['display'])){
				dragableBoxesArray[boxIndex]['start'] = dragableBoxesArray[boxIndex]['start'] + dragableBoxesArray[boxIndex]['display'];
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}
		}
		
		//thumbnail 이벤트: mainImage와 link 바꿔주기
		var links = thumbLine.childNodes[1].childNodes;
		for(i=0; i<links.length; i++){
			links[i].onclick = function(){
				changeYoutubeVid(this, boxIndex, videoPlayered, objectSrc);	
			}		
		}	
	
		showStatusBarMessage(boxIndex, '');
	}
	
	// showYoutubeVideoData()의 부속함수.
	// 클릭한 썸네일의 내용을 메인에 뿌려주는 모듈.
	// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
	function changeYoutubeVid(thumb, boxIndex, videoPlayered, objectSrc)
	{
		var no = thumb.title;
		
		objectSrc[1] = videoPlayered[no];		//param value값 재설정
		objectSrc[4] = videoPlayered[no];		//embed src값 재설정
		
		document.getElementById('youtubeVideo'+boxIndex).innerHTML = objectSrc[0] + objectSrc[1] + objectSrc[2] + objectSrc[3] + objectSrc[4] + objectSrc[5];
	}
	
	// 'Daum 동영상 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showVideoData(ajaxIndex,boxIndex)
	{
		var mainVedWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;
		var mainVedHeight = mainVedWidth * 0.8;
		var thumbnailSize = Math.floor( mainVedWidth / dragableBoxesArray[boxIndex]['display'] );

		var videoPlayered = new Array();
		var videoThumbed = new Array();
		var i=0;
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");
		
		// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
		for (var i = 0; i < items.length; i++) {
			var item = items.item(i);
						
			var playerNode = item.getElementsByTagName("player_url").item(0);
			var playered = (playerNode.firstChild) ? playerNode.firstChild.nodeValue : "";
			videoPlayered[i] = playered;
			
			var thumbNode = item.getElementsByTagName("thumbnail").item(0);
			var thumbed = (thumbNode.firstChild) ? thumbNode.firstChild.nodeValue : "";
			videoThumbed[i] = thumbed;
		}
		
		var totalNode = rssContent.getElementsByTagName("totalCount").item(0);
		var total = (totalNode.firstChild) ? totalNode.firstChild.nodeValue : "";	// total number of Video
		
		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_daum+ '"\/>&nbsp;<\/span><span>' + "동영상 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title
	
		// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
		//set html source
		var string='';
		var objectSrc = new Array();
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';
		//set thumbnail
		string += '<div id="daumVideoThumb'+boxIndex+'" style="padding: 5px 0px">';
		 //thumbnail prevous button
		string += '<span><img src="'+src_prevBtn+'" class="pageButton" \/><\/span><span class="daumThumbnail">';
		 //thumbnail next button 
		for(i=0; i<videoThumbed.length; i++){
			string += '<img title="'+i+'"src="'+ videoThumbed[i] +'" width="'+thumbnailSize+'" height="'+thumbnailSize+'"\/>';
		}
		 //thumbnail next button
		string += '<\/span><span><img src="'+src_nextBtn+'" class="pageButton" \/><\/span><\/div>';
		//set main video
		string += '<div id="daumVideo'+boxIndex+'" class="daumVideo" style="padding: 5px 0px">';
		objectSrc[0] = '<object id="daummainVideo'+boxIndex+'" type="application/x-shockwave-flash" width="'+mainVedWidth+'" height="'+mainVedHeight+'" align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0">'
						+'<param name="movie" value="';
		objectSrc[1] = videoPlayered[0];
		objectSrc[2] = '" \/>';
		objectSrc[3] = '<param name="allowScriptAccess" value="always" \/>'
			 			+'<param name="allowFullScreen" value="true" \/>'
			 			+'<param name="bgcolor" value="#000000" \/>'
			 			+'<embed src="';
		objectSrc[4] = videoPlayered[0];
		objectSrc[5] = '" width="'+mainVedWidth+'" height="'+mainVedHeight+'" allowScriptAccess="always" type="application/x-shockwave-flash" allowFullScreen="true" bgcolor="#000000" ><\/embed>'
			 			+'<\/object>';
		
		string += objectSrc[0] + objectSrc[1] + objectSrc[2] + objectSrc[3] + objectSrc[4] + objectSrc[5];
		string += '<\/div><\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
		
		
		//btn 이벤트
		var thumbLine = document.getElementById('daumVideoThumb'+boxIndex);
		var prev = thumbLine.firstChild.firstChild;
		prev.onclick = function(){
			if(dragableBoxesArray[boxIndex]['start'] !=1)
			{
				dragableBoxesArray[boxIndex]['start']--;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}	
		}
		
		var next = thumbLine.lastChild.firstChild;
		next.onclick = function() {
			if(dragableBoxesArray[boxIndex]['start'] < (total/dragableBoxesArray[boxIndex]['display'])){
				dragableBoxesArray[boxIndex]['start']++;
				setUrl(boxIndex);
				reloadRSSData(boxIndex);
				if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
			}
		}
		
		//thumbnail 이벤트: mainImage와 link 바꿔주기
		var links = thumbLine.childNodes[1].childNodes;
		for(i=0; i<links.length; i++){
			links[i].onclick = function(){
				changeVid(this, boxIndex, videoPlayered, objectSrc);	
			}		
		}	
	
		showStatusBarMessage(boxIndex, '');
	}
	
	// showVideoData()의 부속함수.
	// 클릭한 썸네일의 내용을 메인에 뿌려주는 모듈.
	// videoPlayered[i] = videoURL, videoThumbed[i] = thumbnailURL
	function changeVid(thumb, boxIndex, videoPlayered, objectSrc)
	{
		var no = thumb.title;
		
		objectSrc[1] = videoPlayered[no];		//param value값 재설정
		objectSrc[4] = videoPlayered[no];		//embed src값 재설정
		
		document.getElementById('daumVideo'+boxIndex).innerHTML = objectSrc[0] + objectSrc[1] + objectSrc[2] + objectSrc[3] + objectSrc[4] + objectSrc[5];
	}
	
	function showUserView(ajaxIndex,boxIndex)
	{
		var i;
		
		dragableBoxesArray[boxIndex]['target'] = 'userDefine';
		var mainWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 30;
		var rssContent = ajaxObjects[ajaxIndex].response;
		var tokens = rssContent.split("%^");
		
		var item = new Array();
		// item[i][0]='boxId', item[i][1]='text'
		
		for( i = 0 ; i < tokens.length ; i++ )
		{
			item[i] = tokens[i].split("#%");
		}
		
		var string = "<div onmousedown=\"return queryStart(" + boxIndex + ");\">";
		
		for ( i = 0 ; i < item.length ; i++ )
		{
			item[i][0] = item[i][0].replace(/@/g, "-");
			string += "<table width=\"" + mainWidth + "px\" style=\"table-layout: fixed;\">";
			string += "<tr><td width=\"8px\"><img src=\"" + src_smallRightArrow + "\"\/><\/td><td><b>" + item[i][0] + "<\/b><\/td><\/tr>"
			string += "<tr><td><\/td><td style=\"word-break: break-all;\">";
			
			var filetype = item[i][1].slice( item[i][1].length - 3, item[i][1].length );
			if ( -1 != filetype.search(/jpg/i) || -1 != filetype.search(/gif/i) || -1 != filetype.search(/png/i) || -1 != filetype.search(/bmp/i) )
			{
				string += "<img src=\"" + item[i][1] + "\"\/>";
			}
			else
			{
				string += item[i][1];
			}
			string += "<\/td><\/tr><\/table>";
		}
		
		string += "<\/div>";
		
		document.getElementById('userMessage' + boxIndex).innerHTML = string;		
		showStatusBarMessage(boxIndex,'');
		ajaxObjects[ajaxIndex] = false;
	}
	
	function showUserDefine(ajaxIndex,boxIndex)
	{
		var i;
		
		var rssContent = ajaxObjects[ajaxIndex].response;
		var items = rssContent.split("%^");
		
		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' + src_rss + '"\/>&nbsp;<\/span><span>' + "Xml/Rss Tree" + '<\/span>';
		
		var Tree = new Array();
		
		for ( i = 0 ; i < items.length ; i++ )
		{
			Tree[i] = items[i];
		}
		
		createTree( Tree, boxIndex );
		
		showStatusBarMessage(boxIndex,'');
		ajaxObjects[ajaxIndex] = false;
		
		if ( dragableBoxesArray[boxIndex]['boxId'] )
		{
			viewAction( boxIndex );
		}
	}
	
	// 검색할 페이지 설정 함수.
	function pageChange( boxIndex, pageno )
	{
		var display = dragableBoxesArray[boxIndex]['display'];
		var start = ( ( pageno - 1 ) * display ) + 1;
		
		dragableBoxesArray[boxIndex]['start'] = start;
		
		setUrl(boxIndex);
		reloadRSSData(boxIndex);
		
		if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
	}
	
	function contentTreeOC( obj, mode ) {
		var id = obj.parentNode.parentNode.parentNode.id;
		
		if (mode == 'open') {
			document.getElementById(id.replace("close", "open")).style.display = '';
			document.getElementById(id).style.display = 'none';
		} else if (mode == 'close') {
			document.getElementById(id).style.display = 'none';
			document.getElementById(id.replace("open", "close")).style.display = '';
		}
	}
	
	// 'Naver 블로그/뉴스/지식iN 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showBlogNewsData( ajaxIndex, boxIndex )
	{
		var i;
		var contentsType;
		
		var id = dragableBoxesArray[boxIndex]['target'];
		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");
		
		var titled = new Array();
		var linked = new Array();
		var desced = new Array();
		
		for (var i = 0; i < items.length; i++) {
			var item = items.item(i);
			
			var titleNode = item.getElementsByTagName("title").item(0);
			var title = (titleNode.firstChild) ? titleNode.firstChild.nodeValue : "";
			titled[i] = title;
			
			var linkNode = item.getElementsByTagName("link").item(0);
			var link = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
			linked[i] = link;
			
			var descNode = item.getElementsByTagName("description").item(0);
			var desc = (descNode.firstChild) ? descNode.firstChild.nodeValue : "";
			desced[i] = desc;
		}
		
		var totalNode = rssContent.getElementsByTagName("total").item(0);
		var total = (totalNode.firstChild) ? totalNode.firstChild.nodeValue : "";	// total number of Result
		
		if ( id == "blog" )
		{
			contentsType = "블로그 검색";
		}
		else if ( id == "news" )
		{
			contentsType = "뉴스 검색";
		}
		else
		{
			contentsType = "지식iN 검색";
		}
		
		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_naver+ '"\/>&nbsp;<\/span><span>' + contentsType + '&nbsp;::&nbsp;\'' + dragableBoxesArray[boxIndex]['query'] + '\'<\/span>';
		
		// titled[i] = title, linked[i] = link, desced[i] = description
		var string = '<div onmousedown="return queryStart(' + boxIndex + ');" onmouseup="queryDrop(' + boxIndex + ');return false;">';
		
		for ( i = 0 ; i < titled.length ; i++ )
		{
			// 열림
			string += '<table id="' + id + boxIndex + i + '_close">';
			string += '<tr><td style="cursor: pointer" onclick="contentTreeOC(this,\'open\')"><img src="' + src_smallRightArrow + '"><\/td><td><a class="boxItemHeader" href="' + linked[i] + '" target="_blank">' + titled[i] + '<\/a><\/td><\/tr>';
			string += '<\/table>';
			
			// 닫힘
			string += '<table id="' + id + boxIndex + i + '_open" style="display: none">';
			string += '<tr><td style="cursor: pointer" onclick="contentTreeOC(this,\'close\')"><img src="' + src_smallDownArrow + '"><\/td><td><a class="boxItemHeader" href="' + linked[i] + '" target="_blank">' + titled[i] + '<\/a><\/td><\/tr>';
			string += '<tr><td><\/td><td>' + desced[i] + '<\/td><\/tr>';
			string += '<\/table>';
		}
		
		var start = dragableBoxesArray[boxIndex]['start'] - 1;
		var display = dragableBoxesArray[boxIndex]['display'];
		var pageno = Math.floor( start / display ) + 1;
		var current = ( Math.floor( ( pageno - 1 ) / 5 ) * 5 ) + 1;
		var maxPageno = Math.min( Math.floor( ( total - 1 ) / display ) + 1, Math.floor( 999 / display ) + 1 );
				
		string += '<div align=center>';
		
		if ( 1 == current )
		{
			string += '<span style="padding: 0px 5px"><img src="' + src_prevBtn + '"><\/span>';
		}
		else
		{
			string += '<span style="padding: 0px 5px" style="cursor: pointer" onclick="pageChange(' + boxIndex + ',' + ( current - 5 ) + ')"><img src="' + src_prevBtn + '"><\/span>';
		}
		
		for ( i = current ; i < current + 5 ; i++ )
		{
			string += '<span style="padding: 0px 5px"';
			
			if ( i > maxPageno )
			{
				string += '>&nbsp;&nbsp;<\/span>';
			}
			else if ( i != pageno )
			{
				string += ' style="cursor: pointer" onclick="pageChange(' + boxIndex + ',' + i + ')">' + i + '<\/span>';
			}
			else
			{
				string += '><b>' + i + '<\/b><\/span>';
			}
		}
		
		if ( ( Math.floor( ( maxPageno - 1 ) / 5 ) * 5 ) + 1 == current )
		{
			string += '<span style="padding: 0px 5px"><img src="' + src_nextBtn + '"><\/span><\/div>';
		}
		else
		{
			string += '<span style="padding: 0px 5px" style="cursor: pointer" onclick="pageChange(' + boxIndex + ',' + ( current + 5 ) + ')"><img src="' + src_nextBtn + '"><\/span><\/div>';
		}
		
		string += '<\/div>';
		
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string;
		showStatusBarMessage(boxIndex, '');
		ajaxObjects[ajaxIndex] = false;
	}

	// 'Naver 지도 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showNaverMapData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;

		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("point");
		var item = items.item(0);
		
		// (x, y) 좌표 추출
		var linkNode = item.getElementsByTagName("x").item(0);
		var mapXpoint = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
			
		var imageNode = item.getElementsByTagName("y").item(0);
		var mapYpoint = (imageNode.firstChild) ? imageNode.firstChild.nodeValue : "";		

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_naver+ '"\/>&nbsp;<\/span><span>' + "지도 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';

		//set main map data
		string += '<div id="naverMap'+boxIndex+'" class="naverMap" style="padding: 5px 0px">';
		string += '<\/div><\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
				
		showStatusBarMessage(boxIndex,'');
		
		var naverMapDivId = "naverMap" + boxIndex;
		
		// 네이버 지도 객체 NMap 생성
		// NMap(container[, opts])
		// opts객체는 3개의 값(width, height, mapMode)을 설정할 수 있다.
		// mapMode는 지도의 모습을 결정한다. 0은 일반지도, 1은 겹침지도, 2는 위성지도 이다.
		var naver_map = new NMap(document.getElementById(naverMapDivId), {width:mainImgWidth, height:mainImgWidth, mapMode:1});
		
		// 지도에 표시할 마킹(아이콘) 만들기
		var point = new NPoint(mapXpoint, mapYpoint);
		var iconSize = new NSize(57, 65);
		var iconOffset = new NSize(30, 65);
		var markerIcon = new NIcon(naverMapSpot, iconSize, iconOffset);
		var marker = new NMark(point, markerIcon);
		
		// 지도 크기 조절을 위한 NZoomControl 객체 생성
		var zoom = new NZoomControl();
		zoom.setAlign("left");			// 수평 위치
		zoom.setValign("top");			// 수직 위치
		
		// 지도 전환 버튼 객체 생성
		var mapBtn = new NMapBtns();
		mapBtn.setAlign("center");	// 수평 위치
		mapBtn.setValign("top");		// 수직 위치
		
		// 지도 저장 버튼 객체 생성
		var saveBtn = new NSaveBtn();
		saveBtn.setAlign("right");			// 수평 위치
		saveBtn.setValign("bottom");		// 수직 위치
		
		// 네이버 지도 그리기
		naver_map.setCenterAndZoom(point, 3);		// 지도에 나타낼 좌표와 확대단계 지정
		naver_map.addOverlay(marker);					// 마커 삽입
		naver_map.addControl(mapBtn);					// 지도 전환 버튼 삽입
		naver_map.addControl(saveBtn);					// 지도 저장 버튼 삽입		
		naver_map.addControl(zoom);					// 지도 크기 조절 객체 삽입
	}
	
	// 'Daum 지도 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showDaumMapData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;

		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("item");
		var item = items.item(0);
		
		// (경도, 위도) 좌표 추출
		var linkNode = item.getElementsByTagName("lng").item(0);
		var mapXpoint = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
			
		var imageNode = item.getElementsByTagName("lat").item(0);
		var mapYpoint = (imageNode.firstChild) ? imageNode.firstChild.nodeValue : "";		

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_daum+ '"\/>&nbsp;<\/span><span>' + "지도 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';

		//set main map data
		string += '<div id="daumMap'+boxIndex+'" class="daumMap" style="padding: 5px 0px">';
		string += '<\/div><\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
				
		showStatusBarMessage(boxIndex,'');
		
		var daumMapDivId = "daumMap" + boxIndex;
		
		// Daum 지도 객체 DMap 생성
		var daum_map = new DMap(daumMapDivId, {map_type:"TYPE_SKYVIEW", width:mainImgWidth, height:mainImgWidth});
		
		// 좌표계를 wgs84 좌표계로 설정
		daum_map.setCoordinateType("wgs84");
		
		// 좌표 객체 생성
		var point = new DPoint(mapXpoint, mapYpoint);
		
		// 확대/축소 컨트롤러
		var zoomControl = new DZoomControl();
		zoomControl.setAlign("left");
		zoomControl.setValign("top");
		
		// 지도 확대/축소 컨트롤러 추가
		daum_map.addControl(zoomControl);
		
		// 지정된 좌표를 지도의 중앙으로 하고 확대 단계를 1로 설정
		daum_map.setCenter(point, 3);
		
		// 지도에 지도 전환 버튼 객체 추가
		daum_map.addControl(new DMapTypeControl());
		
		// 마커의 크기 설정
		var size = new DSize(57, 65);
		
		// 마커를 배치할 때 반영될 값 설정
		var offset = new DPoint(-30, -65);
		var icon = new DIcon(naverMapSpot, size, offset);
		
		// 마커 객체 생성
		var marker = new DMark(point, {mark:icon});
		
		// 지도에 마커 객체 추가
		daum_map.addOverlay(marker);
	}
	
	// 'Google 지도 검색' XML 결과값 파싱 및 랜더링 모듈.
	function showGoogleMapData(ajaxIndex,boxIndex)
	{
		var mainImgWidth = document.getElementById('dragableBoxContent' + boxIndex).offsetWidth - 40;

		var rssContent = ajaxObjects[ajaxIndex].responseXML;
		var items = rssContent.getElementsByTagName("Point");
		var item = items.item(0);
		
		// 좌표 추출
		var linkNode = item.getElementsByTagName("coordinates").item(0);
		var mapPoint = (linkNode.firstChild) ? linkNode.firstChild.nodeValue : "";
		
		// mapTotalPoint[0] = y좌표, mapTotalPoint[1] = x좌표
		var mapTotalPoint = mapPoint.split(",");

		document.getElementById('dragableBoxHeader_txt' + boxIndex).innerHTML = '<span><img src="' +src_google+ '"\/>&nbsp;<\/span><span>' + "지도 검색" +'&nbsp;::&nbsp;\''+dragableBoxesArray[boxIndex]['query']+'\''+ '<\/span>';	// title

		//set html source
		var string='';
		
		string += '<div align=center onmouseup="queryDrop(' + boxIndex + ');return false;">';

		//set main map data
		string += '<div id="googleMap'+boxIndex+'" class="googleMap" style="padding: 5px 0px">';
		string += '<\/div><\/div>';
		
		//input all data
		document.getElementById('dragableBoxContent' + boxIndex).innerHTML = string; 
				
		showStatusBarMessage(boxIndex,'');
		
		var googleMapDivId = "googleMap" + boxIndex;
		
		// 구글 지도 객체 생성
		var mapSize = new GSize(mainImgWidth, mainImgWidth)
		var google_map = new GMap2(document.getElementById(googleMapDivId), {size:mapSize});
		var point = new GLatLng(mapTotalPoint[1], mapTotalPoint[0]);
		
		// 마커 설정
		var icon = new GIcon();
		icon.image = naverMapSpot;
		icon.iconSize = new GSize(57, 65);
		
		// 마커를 배치할 때 반영될 값 설정
		icon.iconAnchor = new GPoint(30, 65);
		
		// 마커 객체 생성
		var marker = new GMarker(point, icon);
		
		// 지도 위에 지도 유형 컨트롤러 추가
		google_map.addControl(new GMapTypeControl());
		
		// 지도 위에 확대 컨트롤러 추가
		google_map.addControl(new GLargeMapControl());
		
		// 지도에 표현할 중앙 좌표 설정과 지도 확대 단계 지정
		google_map.setCenter(point, 17);
		
		// 지도 위에 마커 추가
		google_map.addOverlay(marker);
	}
	
	// 컨텐츠 창 reload시 이벤트 함수.
	function reloadRSSData(boxIndex)
	{
		showStatusBarMessage(boxIndex,'Loading data...');
		getRssData(boxIndex);
	}

	// 검색 target에 따라 각기 다른 요청 URL을 설정하기 위한 함수.
	function setUrl(boxIndex)
	{
		var url;
		
		if ( dragableBoxesArray[boxIndex]['start'] == null || 
				dragableBoxesArray[boxIndex]['start'] == "undefined" ||
				dragableBoxesArray[boxIndex]['start'] < 1 )
		{
			dragableBoxesArray[boxIndex]['start'] = 1;
		}	//start Number of Image
		
		if(dragableBoxesArray[boxIndex]['target'] == "rank")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&query="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
				+"&target="+dragableBoxesArray[boxIndex]['target'];
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "flickrimage")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&text="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
				+ "&per_page=" + dragableBoxesArray[boxIndex]['display']
				+ "&page=" + dragableBoxesArray[boxIndex]['start'];
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "naverimage")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&query="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
				+"&target=image"
				+ "&display=" + dragableBoxesArray[boxIndex]['display']
				+ "&start=" + dragableBoxesArray[boxIndex]['start'];
		}
		
		else if( dragableBoxesArray[boxIndex]['target'] == "daumimage" )
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&q="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
			    + "&pageno="+dragableBoxesArray[boxIndex]['start']
			    + "&result="+dragableBoxesArray[boxIndex]['display'];
		}
		
		else if( dragableBoxesArray[boxIndex]['target'] == "youtubevideo" )
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&q="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
			    + "&start-index="+dragableBoxesArray[boxIndex]['start']
			    + "&max-results="+dragableBoxesArray[boxIndex]['display'];
		}
		
		else if( dragableBoxesArray[boxIndex]['target'] == "video" )
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&q="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
			    + "&pageno="+dragableBoxesArray[boxIndex]['start']
			    + "&result="+dragableBoxesArray[boxIndex]['display'];
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "navermap")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&query="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] );
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "daummap")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&q="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] );
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "googlemap")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&q="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] );
		}
		
		else if(dragableBoxesArray[boxIndex]['target'] == "jisik")
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&query="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
				+"&target=kin"
				+"&start="+dragableBoxesArray[boxIndex]['start']
				+"&display="+dragableBoxesArray[boxIndex]['display'];
		}
		
		else
		{
			url = dragableBoxesArray[boxIndex]['typeOfUrl']+"&query="+encodeURIComponent( dragableBoxesArray[boxIndex]['query'] )
				+"&target="+dragableBoxesArray[boxIndex]['target']
				+"&start="+dragableBoxesArray[boxIndex]['start']
				+"&display="+dragableBoxesArray[boxIndex]['display'];
		}
		
		dragableBoxesArray[boxIndex]['url'] = url;
	}
	
	// proxy를 통해 요청을 보내고 결과값 응답을 받기 위한 설정 함수.
	function getRssData(boxIndex)
	{
		var URL;
		var ajaxIndex= ajaxObjects.length;
		ajaxObjects[ajaxIndex] = new sack();
		
		if ( 'userView' == dragableBoxesArray[boxIndex]['target'] )
		{
			URL = 'jsp/rankPro.jsp?xmlUrl=' + escape( dragableBoxesArray[boxIndex]['url'] ) +
			'&type=' + dragableBoxesArray[boxIndex]['target']  +
			dragableBoxesArray[boxIndex]['boxId'];
		}
		else
		{
			URL = 'jsp/rankPro.jsp?xmlUrl=' + escape( dragableBoxesArray[boxIndex]['url'] ) +
			'&type=' + dragableBoxesArray[boxIndex]['target']  +
			'&display=' +dragableBoxesArray[boxIndex]['display'];	// Specifying which file to get
		}
		
		ajaxObjects[ajaxIndex].requestFile = URL;
		ajaxObjects[ajaxIndex].onCompletion = function(){ showRSSData(ajaxIndex,boxIndex); };	// Specify
																								// function
																								// that
																								// will
																								// be
																								// executed
																								// after
																								// file
																								// has
																								// been
																								// found
		ajaxObjects[ajaxIndex].runAJAX();		// Execute AJAX function
	}
	
	// 컨텐츠 창 추가/이동/삭제 시 Coocie 설정 및 관련 정보 세팅을 위한 함수.
	function createARSSBox(target,typeOfUrl,display,minutesBeforeReload,heightOfBox,columnIndex,query,start,boxId,uniqueIdentifier,state)
	{
		var tmpIndex = createABox(columnIndex,heightOfBox,true);
		var tmpInterval = false;
		
		if(!minutesBeforeReload)minutesBeforeReload = '0';
		
		if(useCookiesToRememberRSSSources)
		{
			cookieRSSSources[tmpIndex] = cookieCounter;
			
			Set_Cookie(nameOfCookie + cookieCounter,
					target + '#;#'
					+ typeOfUrl + '#;#'
					+ display + '#;#'
					+ minutesBeforeReload + '#;#'
					+ heightOfBox + '#;#'
					+ columnIndex + '#;#'
					+ query + '#;#'
					+ start + '#;#'
					+ boxId + '#;#'
					+ uniqueIdentifier + '#;#'
					+ state, 60000);
			cookieCounter++;
		}
		
		// 공통url과 query와 display와 start를 분리 시킨다.
		dragableBoxesArray[tmpIndex]['target'] = target;
		dragableBoxesArray[tmpIndex]['display'] = display?display:10;
		dragableBoxesArray[tmpIndex]['minutesBeforeReload'] = minutesBeforeReload;
		dragableBoxesArray[tmpIndex]['heightOfBox'] = heightOfBox;
		dragableBoxesArray[tmpIndex]['query'] = query;
		dragableBoxesArray[tmpIndex]['start'] = start;
		dragableBoxesArray[tmpIndex]['boxId'] = boxId;
		dragableBoxesArray[tmpIndex]['uniqueIdentifier'] = uniqueIdentifier;
		dragableBoxesArray[tmpIndex]['state'] = state;
		
		if ( 'userDefine' == target || 'userView' == target )
		{
			dragableBoxesArray[tmpIndex]['url'] = typeOfUrl;
			dragableBoxesArray[tmpIndex]['typeOfUrl'] = undefined;
		}
		else
		{
			dragableBoxesArray[tmpIndex]['url'] = '';
			dragableBoxesArray[tmpIndex]['typeOfUrl'] = typeOfUrl;
			setUrl(tmpIndex);
		}
		
		// rss값 가져오기 ->콜백함수로 바로 연결
		var url = dragableBoxesArray[tmpIndex]['url'];
		
		if(state==0){
			showHideBoxContent(false,document.getElementById('dragableBoxExpand' + tmpIndex));
		}
		
		staticObjectArray[uniqueIdentifier] = tmpIndex;
		
		if(minutesBeforeReload && minutesBeforeReload>0) {
			tmpInterval = setInterval("reloadRSSData(" + tmpIndex + ")",(minutesBeforeReload*1000*60));
		}

		dragableBoxesArray[tmpIndex]['intervalObj'] = tmpInterval;
			
		addRSSEditContent(document.getElementById('dragableBoxHeader' + tmpIndex))
			
		if(!document.getElementById('dragableBoxContent' + tmpIndex).innerHTML)
			document.getElementById('dragableBoxContent' + tmpIndex).innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style=font-family:verdana><font style=font-size:7pt>loading</font> <img align=center src=images/loader.gif></span>';
		
		if(url.length>0 && url!='undefined')
		{
			if(target =="rank")hideHeaderOptionsForHalfStaticBoxes(tmpIndex);
			
			getRssData(tmpIndex);
		}
		else
		{
			hideHeaderOptionsForStaticBoxes(tmpIndex);
		}
	}

	function createHelpObjects()
	{
		/* Creating rectangle div */
		rectangleDiv = document.createElement('DIV');
		rectangleDiv.id='rectangleDiv';
		rectangleDiv.style.display='none';
		document.body.appendChild(rectangleDiv);
	}
	
	function cancelSelectionEvent(e)
	{
		if(document.all)e = event;
		
		if (e.target) source = e.target;
			else if (e.srcElement) source = e.srcElement;
			if (source.nodeType == 3) // defeat Safari bug
				source = source.parentNode;
		if(source.tagName.toLowerCase()=='input')return true;
						
		if(dragDropCounter>=0)return false; else return true;	
	}
	
	function cancelEvent()
	{
		return false;
	}
	
	// Drag&Drop 이벤트를 위한 생성자 함수.
	function initEvents()
	{
		document.body.onmousemove = moveDragableElement;
		document.body.onmouseup = stop_dragDropElement;
		document.body.onselectstart = cancelSelectionEvent;

		document.body.ondragstart = cancelEvent;	
		
		documentHeight = document.documentElement.clientHeight;	
	}
	
	// Cookie로부터 받아온 설정값으로 이전에 사용했던 컨텐츠 창을 생성하기 위한 함수.
	function createRSSBoxesFromCookie()
	{ 
		var cookieValue = Get_Cookie(nameOfCookie + '0');
		var noneCounter = 0;
		
		cookieCounter = 0;
		
		while( cookieValue && cookieValue != '' ) 
		{
			if ( 'none' != cookieValue )
			{
				var items = cookieValue.split('#;#');
				
				if ( items[0] == 'trans' )
				{
					createTransFeed(items[0],items[5],items[9],items[10]);
				}
				else
				{
					createARSSBox(items[0],items[1],items[2],items[3],items[4],items[5],items[6],items[7],items[8],items[9],items[10]);
					cookieRSSSources[boxIndex] = cookieCounter - 1;
				}
			}
			else
			{
				noneCounter++;
			}
 
			cookieValue = Get_Cookie( nameOfCookie + ( cookieCounter + noneCounter ) );
		}
		
		if ( 0 != noneCounter && 0 == cookieCounter ) {
			cookieCounter = 1;
		}
	}
	
	/* Clear cookies */
	
	function clearCookiesForDragableBoxes()
	{
		var cookieValue = Get_Cookie(nameOfCookie);
		while(cookieValue && cookieValue!=''){
			Set_Cookie(nameOfCookie + cookieCounter,'',-500);
			cookieCounter++;
			cookieValue = Get_Cookie(nameOfCookie + cookieCounter);
		}
	}
	
	/* Delete all boxes */
	
	function deleteAllDragableBoxes()
	{
		var divs = document.getElementsByTagName('DIV');
		for(var no=0;no<divs.length;no++){
			if(divs[no].className=='dragableBox')closeDragableBox(false,divs[no]);	
		}
	}
	
	/* Reset back to default settings */
	
	function resetDragableBoxes()
	{
		cookieCounter = 0;
		clearCookiesForDragableBoxes();
		
		deleteAllDragableBoxes();
		cookieCounter = 0;
		
		createDefaultBoxes();
	}
	
	function hideHeaderOptionsForStaticBoxes(boxIndex)
	{
		if(document.getElementById('dragableBoxRefreshSource' + boxIndex))document.getElementById('dragableBoxRefreshSource' + boxIndex).style.display='none';
		if(document.getElementById('dragableBoxCloseLink' + boxIndex))document.getElementById('dragableBoxCloseLink' + boxIndex).style.display='none';		
		if(document.getElementById('dragableBoxEditLink' + boxIndex))document.getElementById('dragableBoxEditLink' + boxIndex).style.display='none';		
	}
	// jeonglan function
	function hideHeaderOptionsForHalfStaticBoxes(boxIndex)
	{
		if(document.getElementById('dragableBoxRefreshSource' + boxIndex))document.getElementById('dragableBoxRefreshSource' + boxIndex).style.display='none';
		if(document.getElementById('dragableBoxEditLink' + boxIndex))document.getElementById('dragableBoxEditLink' + boxIndex).style.display='none';		
	}
		
	/* Disable drag for a box */
	function disableBoxDrag(boxIndex)
	{
		document.getElementById('dragableBoxHeader' + boxIndex).onmousedown = '';
		document.getElementById('dragableBoxHeader' + boxIndex).style.cursor = 'default';
	}
	
	// 처음 접속시, 실시간 검색어를 토대로 한 뉴스/블로그/동영상 검색결과를 보여주기 위한 함수.
	function createDefaultBoxes()
	{
		var naverUrl = "http://openapi.naver.com/search?key=5d46b3688e9cf81c472fac8694e3cf09";
		var daumVideoUrl = "http://apis.daum.net/search/vclip?output=xml&apikey=35a76c8bd2a376dbc839f25f9521df54489297c5";
		
		if( 0 == cookieCounter )
		{
			// 실시간 검색어로 쿼리 넣을 때는
			// naver.js 파일의 requestRank() 함수 활용
			createRankFeed("rank",naverUrl,1)
			requestRank("news",5,naverUrl,2);
			requestRank("blog",5,naverUrl,2);
			requestRank("video",6,daumVideoUrl,3);
		}
		if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
	}
	
	// 컨텐츠 창 관련 생성자 함수.
	function initDragableBoxesScript()
	{
		createColumns();	// Always the first line of this function
		createHelpObjects();	// Always the second line of this function
		initEvents();	// Always the third line of this function
		
		// var map = new DMap("map");
		if(useCookiesToRememberRSSSources)createRSSBoxesFromCookie();	// Create
																		// RSS
																		// boxes
																		// from
																		// cookies
		createDefaultBoxes();
	}
/*----------------------------------------------------------------------------------------------------
 window 생성전 
----------------------------------------------------------------------------------------------------*/

	// 컨텐츠 창 생성 전 설정 함수.
	function createFeed(contentsType,display,typeOfUrl,query,column)
	{  
		if(!display)display = 4;
		if(!column)column = 1;
		
		var target = contentsType;
		var start = 1;  // daum api에서는 pageno으로 대체됨
		var reloadInterval = 10;
		if(isNaN(reloadInterval) || reloadInterval/1<5)reloadInterval = false;

		createARSSBox(target,typeOfUrl,display,reloadInterval,0,column,query,start);
	}

	// 'Naver 실시간 급상승 검색어' 검색 전 설정 함수.
	function createRankFeed(contentsType,typeOfUrl,column)
	{
		var query = "nexearch";
		var target = contentsType;
		var reloadInterval = 5;
		if(isNaN(reloadInterval) || reloadInterval/1<5)reloadInterval = false;
		if(!column)column = 1;
		
		createARSSBox(target,typeOfUrl,0,reloadInterval,0,column,query,0);
	}
	
	// 'Naver 지도' 검색 전 설정 함수.
	function createNaverMapFeed(contentsType,typeOfUrl)
	{
		var query = document.getElementById("inputQuery").value;
		var target = contentsType;
		var reloadInterval = 0;
		if(isNaN(reloadInterval) || reloadInterval/1<5)reloadInterval = false;
		var column = 1;
		
		createARSSBox(target,typeOfUrl,0,reloadInterval,0,column,query,0);
	}

	function createUserFeed(formObj)
	{
		var url = formObj.rssUrl.value;
		var height = 0;/*formObj.height.value;*/
		var reloadInterval = 5;
		var target = 'userDefine';
		var column = 1;
		var display = 4;
		if(isNaN(height) || height/1<40)height = false;	
		if(isNaN(reloadInterval) || reloadInterval/1<5)reloadInterval = false;
		
		createARSSBox(target,url,display,reloadInterval,height,column);
	}
	
	// '영문번역' 컨텐츠 창 생성 전 설정 함수.
	function createTransFeed(contentsType, columnIndex, uniqueIdentifier, state)
	{
		if(!columnIndex) columnIndex = 1;
		if(!uniqueIdentifier) uniqueIdentifier = 0; // 영->한
		
		var tmpIndex = createABox(columnIndex,0,true);
		
		if(useCookiesToRememberRSSSources)
		{
			cookieRSSSources[tmpIndex] = cookieCounter;
			
			Set_Cookie(nameOfCookie + cookieCounter, contentsType + '#;#0#;#0#;#0#;#0#;#' + columnIndex + '#;#0#;#0#;#0#;#' + uniqueIdentifier + '#;#' + state, 60000);
			cookieCounter++;
		}
		
		dragableBoxesArray[tmpIndex]['target'] = contentsType;
		dragableBoxesArray[tmpIndex]['uniqueIdentifier'] = uniqueIdentifier;
		dragableBoxesArray[tmpIndex]['state'] = state;
		
		var width = document.getElementById('dragableBoxContent' + tmpIndex).offsetWidth - 20;
		
		if( 0 == state ) {
			showHideBoxContent(false,document.getElementById('dragableBoxExpand' + tmpIndex));
		}
		
		hideHeaderOptionsForHalfStaticBoxes(tmpIndex);
		
		document.getElementById('dragableBoxHeader_txt' + tmpIndex).innerHTML = '<span><img src="' + src_google + '"\/>&nbsp;<\/span><span>' + "영/한 번역기" + '<\/span>';
		
		var string = "<div onmousedown=\"queryStart(" + boxIndex + ")\">";
		
		if ( 0 == uniqueIdentifier )
		{
			string += "<div align=center><textarea id=\"translationSrc" + tmpIndex + "\" style=\"width:" + width + "px\">Google Translator<\/textarea><\/div>";
			string += "<div align=center><textarea id=\"translationDest" + tmpIndex + "\" style=\"width:" + width + "px\">구글 번역기<\/textarea><\/div>";
			string += "<div align=right><span id=\"translationTag" + tmpIndex + "\" style='cursor: pointer' onclick=\"transChange(" + tmpIndex + ")\">영->한&nbsp;<\/span><span><input type=\"button\" value=\"번역\" onclick=\"translate(" + tmpIndex + ")\"><\/span><\/div>";
		}
		else
		{
			string += "<div align=center><textarea id=\"translationSrc" + tmpIndex + "\" style=\"width:" + width + "px\">구글 번역기<\/textarea><\/div>";
			string += "<div align=center><textarea id=\"translationDest" + tmpIndex + "\" style=\"width:" + width + "px\">Google Translator<\/textarea><\/div>";
			string += "<div align=right><span id=\"translationTag" + tmpIndex + "\" style='cursor: pointer' onclick=\"transChange(" + tmpIndex + ")\">한->영&nbsp;<\/span><span><input type=\"button\" value=\"번역\" onclick=\"translate(" + tmpIndex + ")\"><\/span><\/div>";
		}
		
		string += "<\/div>";
		
		document.getElementById('dragableBoxContent' + tmpIndex).innerHTML = string;
	}

	// 컨텐츠 창 생성 전 검색어 설정 및 검색 target에 따른 세팅 함수.
	function prepareFeed(whichContent)
	{
		var contentsType = whichContent.getAttribute("id");
		var naverUrl = "http://openapi.naver.com/search?key=5d46b3688e9cf81c472fac8694e3cf09";
		var naverMapUrl = "http://map.naver.com/api/geocode.php?key=8fbc8bc9ad156420d43c8a5d0e071351";
		var daumVideoUrl = "http://apis.daum.net/search/vclip?output=xml&apikey=35a76c8bd2a376dbc839f25f9521df54489297c5";
		var daumImageUrl = "http://apis.daum.net/search/image?output=xml&apikey=35a76c8bd2a376dbc839f25f9521df54489297c5";
		var daumMapUrl = "http://apis.daum.net/maps/addr2coord?apikey=5980040a4b9dfaff826a319a0dcd87514a64a868&output=xml";
		var flickrUrl = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6272ccbc741d12fd5690b854a926276d&format=json";
		var youtubeUrl = "http://gdata.youtube.com/feeds/api/videos?orderby=published&v=2&alt=json";
		var googleMapUrl = "http://maps.google.co.kr/maps/geo?key=ABQIAAAAU3oPnPUTK4p6fuHoLCdYSRQsI7D0bbMbR5uKuoSpMUWbDnYxQBT_6vpxZeWyeCuEv16iN_0pYLtvEw&output=xml&sensor=false";
		
		var query = document.getElementById("inputQuery").value;
		
		switch(contentsType)
		{
			case "rank":
				createRankFeed(contentsType,naverUrl);
				break;	
			case "flickrimage":
				createFeed(contentsType,6,flickrUrl,query,1);
				break;
			case "naverimage":
				createFeed(contentsType,6,naverUrl,query,1);
				break;
			case "daumimage":
				createFeed(contentsType,6,daumImageUrl,query,1);
				break;
			case "youtubevideo":
				createFeed(contentsType,6,youtubeUrl,query,1);
				break;
			case "video":
				createFeed(contentsType,6,daumVideoUrl,query,1);
				break;
			case "trans":
				createTransFeed(contentsType);
				break;
			case "news":
				createFeed(contentsType,5,naverUrl,query,1);
				break;	
			case "jisik":
				createFeed(contentsType,5,naverUrl,query,1);
				break;	
			case "blog":
				createFeed(contentsType,5,naverUrl,query,1);
				break;	
			case "navermap":
				createNaverMapFeed(contentsType,naverMapUrl);
				break;
			case "daummap":
				createNaverMapFeed(contentsType,daumMapUrl);
				break;
			case "googlemap":
				createNaverMapFeed(contentsType,googleMapUrl);
				break;
		}	
	}	

	// Browser 기본 설정 함수.
	function initContent()
	{	
		if(!document.getElementsByTagName) return false;;
		if(!document.getElementById) return false;
		if(!document.getElementById("menu"))return false;
		var menu = document.getElementById("menu");
		var links = menu.getElementsByTagName("a");

		for(var i=0; i<links.length; i++){
			links[i].onclick = function() {
				return prepareFeed(this);
			}
		}
	}

	function addLoadEvent(func){
		var oldonload = window.onload;
		if (typeof oldonload != 'function') {
			window.onload = func;
		} else {
			window.onload = function() {
				oldonload();
				func();
			}
		}
	}	
	
addLoadEvent(initDragableBoxesScript);
addLoadEvent(initContent);