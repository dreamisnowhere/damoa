var query = '';
var startPoint = 0;
var draging = false;
var inputBox = false;

// 블록 지정이 시작되면 텍스트 객체화가 시작되도록 하는 함수.
function queryStart( boxIndex )
{
	if ( window.ActiveXObject || 0 != boxIndex )
	{
		if (window.getSelection)
		{
			query = window.getSelection();
		}
		else if (document.getSelection)
		{
			query = document.getSelection();
		}
		else if (document.selection)
		{
			query = document.selection.createRange().text;
		}
		else
		{
			return false;
		}
	}
	else
	{
		query = document.getElementById("inputQuery").value.substring(document.getElementById("inputQuery").selectionStart, document.getElementById("inputQuery").selectionEnd);
	}
	
	if ( query == '' )
	{
		return true;
	}
	else
	{
		draging = true;
		startPoint = boxIndex;
		
		return false;
	}
}

// 블록 지정이 끝나는 부분을 설정하는 함수.
function queryCancel()
{
	if ( !inputBox )
	{
		query = '';
		startPoint = 0;
		draging = false;
	
		if ( !window.ActiveXObject )
		{
			document.getElementById("inputQuery").selectionStart = document.getElementById("inputQuery").selectionEnd;
		}
	}
	else
	{
		inputBox = false;
	}
}

// 블록 지정한 Text를 Drop한 지점의 액션을 지정.
function queryDrop( boxIndex )
{
	if ( draging && ( startPoint != boxIndex ) )
	{
		document.getElementById('query[' + boxIndex + ']').value = query;
		dragableBoxesArray[boxIndex]['query'] = query;
		dragableBoxesArray[boxIndex]['start'] = 1;
		
		setUrl(boxIndex);
		reloadRSSData(boxIndex);
		
		if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
	}
	
	queryCancel();
}

function inputCheck()
{
	inputBox = true;
}