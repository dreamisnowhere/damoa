// 한/영과 영/한의 입력 포멧을 변경해주는 함수
function transChange( boxIndex )
{
	dragableBoxesArray[boxIndex]['uniqueIdentifier'] = ( 0 == dragableBoxesArray[boxIndex]['uniqueIdentifier'] ) ? 1 : 0;
	
	if ( 0 == dragableBoxesArray[boxIndex]['uniqueIdentifier'] )
	{
		document.getElementById("translationSrc" + boxIndex).value = "Google Translator";
		document.getElementById("translationDest" + boxIndex).value = "구글 번역기";
		document.getElementById("translationTag" + boxIndex).firstChild.nodeValue = "영->한 ";
	}
	else
	{
		document.getElementById("translationSrc" + boxIndex).value = "구글 번역기";
		document.getElementById("translationDest" + boxIndex).value = "Google Translator";
		document.getElementById("translationTag" + boxIndex).firstChild.nodeValue = "한->영 ";
	}
	
	if(useCookiesToRememberRSSSources)setTimeout('saveCookies()',100);
}

// 번역을 요청하는 함수.
function translate( boxIndex )
{
	var text = document.getElementById("translationSrc" + boxIndex).value;
	var src;
	var dest;

	if ( '0' == dragableBoxesArray[boxIndex]['uniqueIdentifier'] )
	{
		src = "en";
		dest = "ko";
	}
	else
	{
		src = "ko";
		dest = "en";
	}
	
	google.language.translate(text, src, dest, function(result) {
		if (!result.error) {
			document.getElementById("translationDest" + boxIndex).value = result.translation;
		}
	});
}