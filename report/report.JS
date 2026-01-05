/**
 * 리포트 페이지 통합 로직 (report.js)
 */

// 1. 데이터를 가져오는 함수 (서버 연동 시 사용)
async function fetchReportData(pdfId) {
    /* 실제로는 여기서 서버에 요청을 보냅니다: 
       const response = await fetch(`/api/reports/${pdfId}`);
       return await response.json();
    */
    
    // 테스트를 위해 현재는 데이터베이스 객체에서 찾아 반환합니다.
    return pdfDatabase[pdfId]; 
}

// 2. 화면을 그리는 함수 (어떤 구조의 데이터든 대응)
const renderReport = (data) => {
    if (!data) return;

    // 제목, 날짜 등 기본 정보
    document.getElementById('analysisCategory').textContent = data.category || "일반 분석";
    document.getElementById('reportTitle').textContent = data.title;
    document.getElementById('reportDate').textContent = `분석 일시: ${data.date}`;
    document.getElementById('aiComment').textContent = data.comment;

    // 가변형 테이블 헤더 생성 (데이터에 들어있는 대로)
    const thead = document.getElementById('tableHead');
    thead.innerHTML = `<tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

    // 가변형 테이블 본문 생성
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = data.rows.map(row => `
        <tr>${row.map(cell => {
            const cls = (cell === 'O' || cell === '정상' || cell === '완료') ? 'status-o' : 
                        (cell === 'X' || cell === '오류' || cell === '지연' ? 'status-x' : '');
            return `<td class="${cls}">${cell}</td>`;
        }).join('')}</tr>
    `).join('');

    // 출처 생성
    document.getElementById('citationList').innerHTML = (data.citations || [])
        .map(file => `<a href="#" class="cite-item">${file}</a>`).join(', ');
};

// 3. 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const pdfId = params.get('id'); 

    // 서버(또는 DB)에서 데이터를 가져옴
    const data = await fetchReportData(pdfId);
    
    if (data) {
        renderReport(data);
    } else {
        // 데이터가 없는 새 파일일 경우 처리
        document.getElementById('reportTitle').textContent = "분석 중이거나 데이터를 찾을 수 없습니다.";
    }
});