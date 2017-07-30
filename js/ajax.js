
function sack(file){
	this.AjaxFailedAlert = "Your browser does not support the enhanced functionality of this website, and therefore you will have an experience that differs from the intended one.\n";
	this.requestFile = file;
	this.method = "POST";
	this.URLString = "";
	this.encodeURIString = true;
	this.execute = false;

	this.onLoading = function() { };
	this.onLoaded = function() { };
	this.onInteractive = function() { };
	this.onCompletion = function() { };

	// 데이터 송수신을 위한 XMLHttpRequest 객체를 생성한다.
	// 객체를 구하는 방식은 IE와 나머지 브라우저가 서로 다르다.
	// IE 같은 경우는 ActiveX 컴포넌트로 제공하고 있으며,
	// 기타 나머지 브라우저의 경우는 XMLHttpRequest 클래스를 기본적으로 제공하고 있다.
	// 따라서, 본 함수에서는 브라우저의 종류에 상관없이 알맞게 동작할 수 있도록 Cross Browser를 구현하였다.
	this.createAJAX = function() {
		try {
			this.xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (err) {
				this.xmlhttp = null;
			}
		}
		if(!this.xmlhttp && typeof XMLHttpRequest != "undefined")
			this.xmlhttp = new XMLHttpRequest();
		if (!this.xmlhttp){
			this.failed = true; 
		}
	};
	
	// 웹서버에 전송할 요청에 대한 세팅 값을 설정하는 부분이다.
	this.setVar = function(name, value){
		if (this.URLString.length < 3){
			this.URLString = name + "=" + value;
		} else {
			this.URLString += "&" + name + "=" + value;
		}
	}
	
	// XMLHttpRequest 객체가 웹 서버에 전송하는 요청 파라미터의 경우에는 반드시 UTF-8로 인코딩해서 전송해야 하는데,
	// 본 함수는 이를 설정해주는 부분이다.
	this.encVar = function(name, value){
		var varString = encodeURIComponent(name) + "=" + encodeURIComponent(value);
	return varString;
	}
	
	// 웹서버에 전송할 요청에 대한 세팅 값을 설정하는 부분이다.
	this.encodeURLString = function(string){
		varArray = string.split('&');
		for (i = 0; i < varArray.length; i++){
			urlVars = varArray[i].split('=');
			if (urlVars[0].indexOf('amp;') != -1){
				urlVars[0] = urlVars[0].substring(4);
			}
			varArray[i] = this.encVar(urlVars[0],urlVars[1]);
		}
	return varArray.join('&');
	}
	
	// 웹 서버로부터 응답이 도착하면 이를 객체화 해주는 부분이다.
	this.runResponse = function(){
		eval(this.response);
	}
	
	// 설정을 마친 요청값을 가지고 실제적으로 웹 서버에 요청을 수행하는 부분이다.
	// 요청 방법은 기본적으로 GET과 POST 방식이 있으며,
	// 응답이 왔을 때 결과값을 받는 방법은 responseText와 responseXML 방식이 있다.
	// XMLHttpRequest 객체는 웹 서버로부터 응답이 도착하면 특정한 자바스크립트 함수를 호출하는 기능이 있는데,
	// 이때 사용되는 프로퍼티가 onreadystatechang이다.
	// onreadystatechang 프로퍼티에 미리 지정해 놓은 콜백 함수는
	// XMLHttpRequest의 상태를 표시하는 readyState의 값에 따라
	// 화면을 변경하거나 경고 창을 띄우는 등의 알맞은 작업을 수행하게 된다.
	this.runAJAX = function(urlstring){
		this.responseStatus = new Array(2);
		if(this.failed && this.AjaxFailedAlert){ 
			alert(this.AjaxFailedAlert); 
		} else {
			if (urlstring){ 
				if (this.URLString.length){
					this.URLString = this.URLString + "&" + urlstring; 
				} else {
					this.URLString = urlstring; 
				}
			}
			if (this.encodeURIString){
				var timeval = new Date().getTime(); 
				this.URLString = this.encodeURLString(this.URLString);
				this.setVar("rndval", timeval);
			}
			if (this.element) { this.elementObj = document.getElementById(this.element); }
			if (this.xmlhttp) {
				var self = this;
				if (this.method == "GET") {
					var totalurlstring = this.requestFile + "?" + this.URLString;
					this.xmlhttp.open(this.method, totalurlstring, true);
				} else {
					this.xmlhttp.open(this.method, this.requestFile, true);
				}
				if (this.method == "POST"){
  					try {
						this.xmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded')  
					} catch (e) {}
				}

				this.xmlhttp.send(this.URLString);
				this.xmlhttp.onreadystatechange = function() {
					switch (self.xmlhttp.readyState){
						case 1:
							self.onLoading();
						break;
						case 2:
							self.onLoaded();
						break;
						case 3:
							self.onInteractive();
						break;
						case 4:
							self.response = self.xmlhttp.responseText;
							self.responseXML = self.xmlhttp.responseXML;
							self.responseStatus[0] = self.xmlhttp.status;
							self.responseStatus[1] = self.xmlhttp.statusText;
							self.onCompletion();
							if(self.execute){ self.runResponse(); }
							if (self.elementObj) {
								var elemNodeName = self.elementObj.nodeName;
								elemNodeName.toLowerCase();
								if (elemNodeName == "input" || elemNodeName == "select" || elemNodeName == "option" || elemNodeName == "textarea"){
									self.elementObj.value = self.response;
								} else {
									self.elementObj.innerHTML = self.response;
								}
							}
							self.URLString = "";
						break;
					}
				};
			}
		}
	};
this.createAJAX();
}