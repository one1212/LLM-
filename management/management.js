// 요소 선택
const uploadBtn = document.getElementById('uploadBtn');
const hiddenInput = document.getElementById('hiddenFileInput');
const fileListBody = document.getElementById('fileListBody');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
// 6. 선택 다운로드 기능
const downloadBtn = document.querySelector('.action-btn.primary');

// 1. 업로드 버튼 클릭 시 파일 창 열기 (클릭 피드백은 CSS :active로 처리)
uploadBtn.addEventListener('click', () => hiddenInput.click());

// 2. 파일 선택 시 테이블에 행 추가
hiddenInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const ext = file.name.split('.').pop().toUpperCase();

    const tr = document.createElement('tr');
    // 새 행이 추가될 때 애니메이션 효과를 위해 클래스 추가 가능
    tr.innerHTML = `
        <td><input type="checkbox" class="file-check"></td>
        <td><span class="file-icon ${ext}">${ext}</span> ${file.name}</td>
        <td>${date}</td>
        <td>사용자(나)</td>
    `;
    
    fileListBody.prepend(tr);
    hiddenInput.value = ''; // 파일 선택 초기화

    if (selectAll.checked) {
    tr.style.backgroundColor = '#f0f7ff';
}
});

// 3. 선택 삭제 (삭제 시 확인창 및 파란색 테마 유지)
deleteBtn.addEventListener('click', () => {
    const checked = document.querySelectorAll('.file-check:checked');
    if (checked.length === 0) {
        alert("삭제할 파일을 선택해주세요.");
        return;
    }

    if(confirm(`${checked.length}개의 파일을 삭제하시겠습니까?`)) {
        checked.forEach(item => {
            const tr = item.closest('tr');
            tr.style.opacity = '0';
            tr.style.transition = '0.3s';
            setTimeout(() => tr.remove(), 300); // 부드럽게 삭제
        });
    }
});

// 4. 전체 선택 (파란색 체크박스 동기화)
selectAll.addEventListener('change', (e) => {
    const checks = document.querySelectorAll('.file-check');
    checks.forEach(c => {
        c.checked = e.target.checked;
        // 선택 시 행 배경색 변경 효과를 주고 싶다면 여기에 추가
        const tr = c.closest('tr');
        if (e.target.checked) {
            tr.style.backgroundColor = '#f0f7ff';
        } else {
            tr.style.backgroundColor = 'transparent';
        }
    });
});

// 5. [추가] 개별 체크박스 클릭 시 행 배경색 변경 (선택된 느낌 강조)
fileListBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('file-check')) {
        const tr = e.target.closest('tr');
        if (e.target.checked) {
            tr.style.backgroundColor = '#f0f7ff'; // 연한 파란색 배경
            tr.style.transition = 'background-color 0.2s';
        } else {
            tr.style.backgroundColor = 'transparent';
        }
    }
});

//6. 선택 다운로드 기능
downloadBtn.addEventListener('click', () => {
    // 체크된 모든 체크박스 가져오기
    const checked = document.querySelectorAll('.file-check:checked');

    if (checked.length === 0) {
        alert("다운로드할 파일을 선택해주세요.");
        return;
    }

    // 선택된 각 행을 돌며 파일 다운로드 실행
    checked.forEach((item, index) => {
        const tr = item.closest('tr');
        // 두 번째 <td> 안의 텍스트에서 파일명만 추출
        const fileName = tr.cells[1].innerText.replace(/^(PDF|PNG|JPG|TXT|ZIP)\s/, '').trim();
        
        // 실제 환경에서는 파일의 URL이 필요합니다.
        // 여기서는 예시로 파일명을 이용한 경로를 생성합니다.
        const fileUrl = `../downloads/${fileName}`; 

        // 브라우저의 다중 다운로드 차단을 방지하기 위해 약간의 시차를 두고 실행
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName; // 다운로드될 파일명 설정
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // 0.3초 간격
    });
});