// 사용자들의 화면 해상도나 모니터 크기에 따라 browser의 크기도 달라지게 되는데,
// 이에 따라 Main Page의 각 요소들간의 비율을 자동적으로 적절하게 세팅해주는 기능이다.

// 가로 크기 설정
function getInnerWidth(){
	if(window.ActiveXObject){
		if(document.documentElement.clientWidth == 0)
			return window.document.body.clientWidth;
		return document.documentElement.clientWidth;
	}
	else
		return window.innerWidth;

}

// 세로 크기 설정
function getInnerHeight(){
	if(window.ActiveXObject){
		if(document.documentElement.clientHeight == 0)
			return window.document.body.clientHeight;
		return document.documentElement.clientHeight;
	}
	else
		return window.innerHeight;
}