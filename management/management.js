document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    const fileGrid = document.getElementById('fileGrid');
    const deleteBtn = document.getElementById('deleteBtn');

    // 1. 업로드 카드 클릭 시 파일 선택창 열기
    uploadBtn.addEventListener('click', () => {
        hiddenFileInput.click();
    });

    // 2. 파일 선택 이벤트
    hiddenFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            addFileCard(file);
        });
        hiddenFileInput.value = '';
    });

    // 3. 카드 그리드에 새 카드 추가
    function addFileCard(file) {
        const cardId = 'card-' + Date.now() + Math.random().toString(36).substr(2, 5);
        const fileName = file.name;
        const date = new Date().toLocaleDateString('ko-KR');
        
        const cardHtml = `
            <div class="file-card" id="${cardId}" style="position: relative; transition: all 0.3s ease; border: 1px solid #333;">
                <div class="card-check-wrapper" style="position: absolute; top: 15px; left: 15px; z-index: 10;">
                    <input type="checkbox" class="file-check" data-id="${cardId}" style="width: 18px; height: 18px; cursor: pointer; accent-color: #5eead4;">
                </div>

                <div class="card-header" style="padding-left: 25px;">
                    <div>
                        <div class="card-title" style="font-weight: 700; color: #fff;">${fileName}</div>
                        <div class="card-info-text" style="font-size: 11px; color: #666;">${date}</div>
                    </div>
                    <i class="fa-regular fa-comment-dots" style="color: #5eead4; font-size: 18px;"></i>
                </div>
                
                <div class="mode-selection-area" style="margin-top: 25px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 15px; text-align: center;">
                    <p style="font-size: 10px; color: #666; margin-bottom: 10px;">분석 모드를 선택하세요</p>
                    <div style="display: flex; gap: 6px;">
                        <button class="mini-opt-btn" onclick="startAnalysis('${cardId}', 'fast')" style="flex:1; padding: 8px; border-radius: 10px; border: 1px solid #334155; background: #2d2d2d; color: #5eead4; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ 고속</button>
                        <button class="mini-opt-btn" onclick="startAnalysis('${cardId}', 'slow')" style="flex:1; padding: 8px; border-radius: 10px; border: 1px solid #334155; background: #2d2d2d; color: #94a3b8; font-size: 11px; font-weight: 700; cursor: pointer;">☁️ 일반</button>
                    </div>
                </div>

                <div class="card-footer" style="display:flex; justify-content:space-between; margin-top: auto; padding-top: 20px; font-size:12px; color:#444;">
                    <span>ID: ${cardId.slice(-4)}</span>
                    <span class="status-label-footer">대기 중...</span>
                </div>
            </div>
        `;

        uploadBtn.insertAdjacentHTML('afterend', cardHtml);
    }

    // 4. 선택 삭제 기능
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const checkedBoxes = document.querySelectorAll('.file-check:checked');
            if (checkedBoxes.length === 0) {
                alert('삭제할 카드를 선택해주세요.');
                return;
            }
            if (confirm(`${checkedBoxes.length}개의 프로젝트를 삭제하시겠습니까?`)) {
                checkedBoxes.forEach(box => {
                    const cardId = box.getAttribute('data-id');
                    const card = document.getElementById(cardId);
                    if (card) card.remove();
                });
            }
        });
    }

    // 5. 분석 시작 함수
    window.startAnalysis = function(cardId, mode) {
        const card = document.getElementById(cardId);
        const selectionArea = card.querySelector('.mode-selection-area');

        selectionArea.outerHTML = `
            <div class="card-status-area" style="margin-top: 20px; padding-left: 25px;">
                <div class="progress-text" style="display:flex; justify-content:space-between; font-size:11px; color:#5eead4; margin-bottom:8px;">
                    <span class="status-label">${mode === 'fast' ? '⚡ 고속 분석 중' : '☁️ 백그라운드 분석 중'}</span>
                    <span class="percent">0%</span>
                </div>
                <div class="progress-bar-bg" style="width:100%; height:4px; background:#333; border-radius:2px; overflow:hidden;">
                    <div class="progress-bar-fill" style="width: 0%; height:100%; background:#5eead4; transition: width 0.3s ease;"></div>
                </div>
                <p class="status-msg" style="font-size:10px; color:#5eead4; margin-top:6px;">엔진 초기화 중...</p>
            </div>
        `;
        simulateRAGCard(cardId, mode);
    };

    // 6. 시뮬레이션 및 모달 연결
    function simulateRAGCard(cardId, mode) {
        const card = document.getElementById(cardId);
        const bar = card.querySelector('.progress-bar-fill');
        const percentText = card.querySelector('.percent');
        const statusMsg = card.querySelector('.status-msg');

        let progress = 0;
        const intervalTime = mode === 'fast' ? 100 : 400; 
        const progressStep = mode === 'fast' ? 5 : 2;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * progressStep) + 1;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                bar.style.width = '100%';
                percentText.innerText = '100%';
                
                setTimeout(() => {
                    const statusArea = card.querySelector('.card-status-area');
                    const fileName = card.querySelector('.card-title').innerText;
                    const date = card.querySelector('.card-info-text').innerText;

                    if(statusArea) {
                        statusArea.innerHTML = `
                            <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                                <div class="status-badge completed" style="background:rgba(94,234,212,0.1); color:#5eead4; padding:4px 12px; border-radius:20px; font-size:11px; display:inline-block; border:1px solid rgba(94,234,212,0.3);">
                                    분석 완료
                                </div>
                                <button class="view-btn" onclick="event.stopPropagation(); openPreview('${fileName}', '${date}', '이 파일(${fileName})에 대한 RAG 분석이 성공적으로 완료되었습니다. <br>이제 채팅방에서 질문을 시작할 수 있습니다.')" style="background:#5eead4; color:#121212; border:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;">미리보기 →</button>
                            </div>
                        `;
                    }
                    
                    card.style.borderColor = '#5eead4';
                    card.style.boxShadow = '0 0 15px rgba(94, 234, 212, 0.1)';
                    card.querySelector('.status-label-footer').innerText = '분석 완료 (미리보기 가능)';
                    
                    // 카드 클릭 시 모달 열기
                    card.onclick = function(e) {
                        if (e.target.closest('.file-check') || e.target.closest('.mini-opt-btn')) return;
                        openPreview(fileName, date, "이 프로젝트의 분석 데이터 미리보기입니다.");
                    };
                }, 500);
            } else {
                if(bar) bar.style.width = `${progress}%`;
                if(percentText) percentText.innerText = `${progress}%`;
                if(progress > 40 && progress < 80) statusMsg.innerText = "데이터 지식화 중...";
                if(progress >= 80) statusMsg.innerText = "최종 인덱싱 중...";
            }
        }, intervalTime);
    }
});

// --- 모달 기능 (전역 함수) ---

function openPreview(title, date, content) {
    const modal = document.getElementById('previewModal');
    const previewTitle = document.getElementById('previewTitle');
    const previewDate = document.getElementById('previewDate');
    const previewBody = document.getElementById('previewBody');
    const goToChatBtn = document.getElementById('goToChatBtn');

    previewTitle.innerText = title;
    previewDate.innerText = date;
    previewBody.innerHTML = content;
    
    // [중요] 채팅방 입장 버튼에 이동 이벤트 연결
    goToChatBtn.onclick = function() {
        window.location.href = `../message/message.html?file=${encodeURIComponent(title)}`;
    };

    modal.style.display = 'flex';
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
}

// 배경 클릭 시 닫기
window.addEventListener('click', (event) => {
    const modal = document.getElementById('previewModal');
    if (event.target == modal) {
        closePreview();
    }
});