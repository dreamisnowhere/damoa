# 다모아 (DAMOA) Webpage

### '그냥 재미로' 프로젝트 ('Just for fun' Project)
* DAMOA : Drag-Able Multilingual meta-search system using Open apis and Ajax for web2.0
* 대학교 논문 & 졸업 과제물
* 관련 논문
  - [Open API를 활용한 다국어 정보검색 시스템 모델링에 관한 연구](http://www.dbpia.co.kr/Journal/ArticleDetail/NODE01986607)
    - 2009년도 춘계학술대회, 2009.5, 129-132 (4 pages)
    - 한국산업정보학회 (Federation of Korean Information Industries)
    - 저자 : 황세찬, 김홍철, 김선진, 정주석, 강신재
  - [Open API와 Ajax를 이용한 다국어 메타검색 서비스의 모델링 및 구현 - Modeling and Implementation of Multilingual Meta-search Service using Open APIs and Ajax](http://www.dbpia.co.kr/Journal/ArticleDetail/NODE02011448)
    - 한국산업정보학회논문지 제14권 제5호, 2009.12, 11-18 (8 pages)
    - 한국산업정보학회 (Federation of Korean Information Industries)
    - 저자 : 김선진, 강신재
* Last Update
  - 2011.01.01. (ver 2.0)
  - 2017.08.06.
    - 거의 6년이 다 되도록 방치되어 있다보니, 당시 개발에 사용했던 Open API 들 중의 일부는 종료되거나 유료화가 된 것도 있고, 일부는 신규 버전이 출시되면서 구버전은 사용이 중단되어버린 것들도 있어서, 현재는 수많은 오류들만 내뿜고 있음
    - 사용 가능한 API 들은 모두 https 로 전환된 상황 (cross-domain 호출 이슈)
      - ~~ajax 요청을 해야하는 다른 도메인의 서버를 클라이언트와 같이 개발하거나 서버개발쪽 수정요청이 가능한 경우~~
        - 서버에서 CORS 요청이 허용되도록 구현
      - CORS 구현이 안되어 있는 서버로 ajax 요청을 해야하지만 서버쪽 컨트롤이 불가능할 경우
        - jsonp 방식으로 요청
        - 하지만, 클라이언트 요청시 스크립트에서 결과값을 사용할 수 없다는 문제
          - `Refused to execute script, because its MIME type ('application/json') is not executable, and strict MIME type checking is enabled.`
          - https://stackoverflow.com/questions/24528211/chrome-refuses-to-execute-an-ajax-script-due-to-wrong-mime-type
