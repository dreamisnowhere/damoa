<%@ page pageEncoding="utf-8" %>
<%@ page import = "org.apache.commons.httpclient.HttpClient" %>
<%@ page import = "org.apache.commons.httpclient.methods.GetMethod" %>
<%@ page import = "org.apache.commons.httpclient.HttpStatus" %>
<%
	request.setCharacterEncoding("utf-8");
	String xmlUrl = request.getParameter("xmlUrl");
	
	HttpClient client = new HttpClient();
	GetMethod method = new GetMethod(xmlUrl);
	
	try {
		int statusCode = client.executeMethod(method);
		
		out.clearBuffer();
		response.reset();
		
		response.setStatus(statusCode);
		
		// 서버에서 생성한 응답 결과를 그대로 클라이언트에 전송
		if (statusCode == HttpStatus.SC_OK) {
			String result = method.getResponseBodyAsString();
			response.setContentType("text/xml; charset=utf-8");			
			out.println(result);
		}
	} finally {
		if (method != null) method.releaseConnection();
	}
%>