document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    const fileGrid = document.getElementById('fileGrid');
    const deleteBtn = document.getElementById('deleteBtn');

    // --- [추가 요소] 드래그 앤 드롭 및 큐 관련 ---
    const dropZone = document.getElementById('dropZone');
    const queueContainer = document.getElementById('uploadQueueContainer');
    const queueList = document.getElementById('fileQueueList');
    const fileCountText = document.getElementById('fileCount');
    const startUploadBtn = document.getElementById('startUploadBtn');
    const clearQueueBtn = document.getElementById('clearQueueBtn');

    let pendingFiles = []; // 업로드 대기 중인 실제 파일 객체 배열

    // --- 초기 실행: 저장된 데이터 불러오기 ---
    loadFilesFromStorage();

    // 1. 업로드 클릭 이벤트 (기존 버튼 + 드롭존 클릭 시)
    const openExplorer = () => hiddenFileInput.click();
    if (uploadBtn) uploadBtn.addEventListener('click', openExplorer);
    if (dropZone) dropZone.addEventListener('click', openExplorer);

    // 2. 파일 선택 이벤트 (탐색기 사용 시)
    hiddenFileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        hiddenFileInput.value = ''; // 같은 파일 재선택 가능하게 초기화
    });

    // --- [수정/추가] 드래그 앤 드롭 이벤트 핸들러 ---
    if (dropZone) {
        ['dragover', 'dragenter'].forEach(type => {
            dropZone.addEventListener(type, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);
        });
    }

    // --- [수정/추가] 파일 대기열 처리 함수 ---
    function handleFiles(files) {
        const fileArray = Array.from(files);
        if (fileArray.length > 0) {
            // 큐 컨테이너 표시
            if (queueContainer) queueContainer.style.display = 'block';
            
            fileArray.forEach(file => {
                pendingFiles.push(file);
                addToFileQueueUI(file);
            });
            updateQueueCount();
        }
    }

    // 대기 목록 UI 요소 생성
    function addToFileQueueUI(file) {
        if (!queueList) return;
        const li = document.createElement('li');
        li.className = 'file-queue-item';
        li.innerHTML = `
            <span><i class="fa-regular fa-file-lines"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            <button class="remove-file-btn"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        li.querySelector('.remove-file-btn').onclick = (e) => {
            e.stopPropagation();
            pendingFiles = pendingFiles.filter(f => f !== file);
            li.remove();
            updateQueueCount();
            if (pendingFiles.length === 0 && queueContainer) {
                queueContainer.style.display = 'none';
            }
        };
        
        queueList.appendChild(li);
    }

    function updateQueueCount() {
        if (fileCountText) fileCountText.innerText = pendingFiles.length;
    }

    // --- [추가] 분석 시작 버튼 (대기열 파일을 실제 카드로 변환) ---
    if (startUploadBtn) {
        startUploadBtn.addEventListener('click', () => {
            pendingFiles.forEach(file => {
                const cardData = {
                    id: 'card-' + Date.now() + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    date: new Date().toLocaleDateString('ko-KR'),
                    status: 'ready' // 초기 상태
                };
                addFileCard(cardData);
                saveFileToStorage(cardData);
            });
            
            pendingFiles = [];
            if (queueList) queueList.innerHTML = '';
            if (queueContainer) queueContainer.style.display = 'none';
        });
    }

    if (clearQueueBtn) {
        clearQueueBtn.addEventListener('click', () => {
            pendingFiles = [];
            if (queueList) queueList.innerHTML = '';
            if (queueContainer) queueContainer.style.display = 'none';
        });
    }

    // 3. 카드 그리드에 새 카드 추가 (UI 렌더링)
    function addFileCard(data) {
        if (!fileGrid) return;
        const cardHtml = `
            <div class="file-card" id="${data.id}" style="position: relative; transition: all 0.3s ease; border: 1px solid ${data.status === 'completed' ? '#5eead4' : '#333'};">
                <div class="card-check-wrapper" style="position: absolute; top: 15px; left: 15px; z-index: 10;">
                    <input type="checkbox" class="file-check" data-id="${data.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: #5eead4;">
                </div>

                <div class="card-header" style="padding-left: 25px;">
                    <div>
                        <div class="card-title" style="font-weight: 700; color: #fff;">${data.name}</div>
                        <div class="card-info-text" style="font-size: 11px; color: #666;">${data.date}</div>
                    </div>
                    <i class="fa-regular fa-comment-dots" style="color: #5eead4; font-size: 18px;"></i>
                </div>
                
                <div class="status-content-area">
                    ${renderCardContent(data)}
                </div>

                <div class="card-footer" style="display:flex; justify-content:space-between; margin-top: auto; padding-top: 20px; font-size:12px; color:#444;">
                    <span>ID: ${data.id.slice(-4)}</span>
                    <span class="status-label-footer">${data.status === 'completed' ? '분석 완료 (미리보기 가능)' : '대기 중...'}</span>
                </div>
            </div>
        `;

        const addNewCard = document.querySelector('.file-card.add-new');
        if (addNewCard) {
            addNewCard.insertAdjacentHTML('afterend', cardHtml);
        } else {
            fileGrid.insertAdjacentHTML('beforeend', cardHtml);
        }

        if (data.status === 'completed') {
            const card = document.getElementById(data.id);
            card.onclick = function(e) {
                if (e.target.closest('.file-check')) return;
                window.location.href = '../report/report.html?id=quality_pdf';
            };
        }
    }

    function renderCardContent(data) {
        if (data.status === 'ready') {
            return `
                <div class="mode-selection-area" style="margin-top: 25px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 15px; text-align: center;">
                    <p style="font-size: 10px; color: #666; margin-bottom: 10px;">분석 모드를 선택하세요</p>
                    <div style="display: flex; gap: 6px;">
                        <button class="mini-opt-btn" onclick="startAnalysis('${data.id}', 'fast')" style="flex:1; padding: 8px; border-radius: 10px; border: 1px solid #334155; background: #2d2d2d; color: #5eead4; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ 고속</button>
                        <button class="mini-opt-btn" onclick="startAnalysis('${data.id}', 'slow')" style="flex:1; padding: 8px; border-radius: 10px; border: 1px solid #334155; background: #2d2d2d; color: #94a3b8; font-size: 11px; font-weight: 700; cursor: pointer;">☁️ 일반</button>
                    </div>
                </div>`;
        } else if (data.status === 'completed') {
            return `
                <div class="card-status-area" style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; padding-left: 25px;">
                    <div class="status-badge completed" style="background:rgba(94,234,212,0.1); color:#5eead4; padding:4px 12px; border-radius:20px; font-size:11px; display:inline-block; border:1px solid rgba(94,234,212,0.3);">
                        분석 완료
                    </div>
                    <button class="view-btn" onclick="event.stopPropagation(); window.location.href='../report/report.html?id=quality_pdf'" 
                        style="background:#5eead4; color:#121212; border:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;">
                        미리보기 →
                    </button>
                </div>`;
        }
        return '';
    }

    // 4. 선택 삭제 기능 (기존 유지)
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
                    if (card) {
                        card.remove();
                        deleteFileFromStorage(cardId);
                    }
                });
            }
        });
    }

    // 5. [수정됨] 분석 시작 함수 - 스켈레톤 및 단계별 메시지 초기화
    window.startAnalysis = function(cardId, mode) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        // 스켈레톤 클래스 추가
        card.classList.add('skeleton-processing');
        
        const selectionArea = card.querySelector('.status-content-area');
        selectionArea.innerHTML = `
            <div class="card-status-area" style="margin-top: 20px; padding-left: 25px;">
                <div class="progress-text" style="display:flex; justify-content:space-between; font-size:11px; color:#5eead4; margin-bottom:8px;">
                    <span class="status-label">${mode === 'fast' ? '⚡ 고속 엔진 가동' : '☁️ 정밀 분석 진행'}</span>
                    <span class="percent">0%</span>
                </div>
                <div class="progress-bar-bg" style="width:100%; height:4px; background:#333; border-radius:2px; overflow:hidden;">
                    <div class="progress-bar-fill" style="width: 0%; height:100%; background:#5eead4; transition: width 0.3s ease;"></div>
                </div>
                <p class="status-msg" style="font-size:10px; color:#5eead4; margin-top:6px; font-weight: 500;">텍스트 추출 준비 중...</p>
            </div>
        `;
        simulateRAGCard(cardId, mode);
    };

    // 6. [수정됨] 시뮬레이션 - 단계별 텍스트 업데이트 로직 고도화
    function simulateRAGCard(cardId, mode) {
        const card = document.getElementById(cardId);
        if (!card) return;
        const bar = card.querySelector('.progress-bar-fill');
        const percentText = card.querySelector('.percent');
        const statusMsg = card.querySelector('.status-msg');

        let progress = 0;
        const intervalTime = mode === 'fast' ? 120 : 450; 
        const progressStep = mode === 'fast' ? 6 : 3;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * progressStep) + 1;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if(bar) bar.style.width = '100%';
                if(percentText) percentText.innerText = '100%';
                if(statusMsg) statusMsg.innerText = "분석 완료! 데이터를 불러옵니다.";
                
                setTimeout(() => {
                    // 분석 완료 후 스켈레톤 제거
                    card.classList.remove('skeleton-processing');
                    
                    updateFileStatusInStorage(cardId, 'completed');
                    const statusArea = card.querySelector('.status-content-area');
                    if (statusArea) statusArea.innerHTML = renderCardContent({status: 'completed', id: cardId});
                    
                    card.style.borderColor = '#5eead4';
                    card.style.boxShadow = '0 0 15px rgba(94, 234, 212, 0.1)';
                    const footerLabel = card.querySelector('.status-label-footer');
                    if (footerLabel) footerLabel.innerText = '분석 완료 (미리보기 가능)';
                    
                    card.onclick = function(e) {
                        if (e.target.closest('.file-check')) return;
                        window.location.href = '../report/report.html?id=quality_pdf';
                    };
                }, 600);
            } else {
                if(bar) bar.style.width = `${progress}%`;
                if(percentText) percentText.innerText = `${progress}%`;
                
                // --- 단계별 메시지 고도화 ---
                if (progress < 25) {
                    statusMsg.innerText = `📄 텍스트 추출 중... (${progress}%)`;
                } else if (progress < 50) {
                    statusMsg.innerText = `🔍 핵심 키워드 분류 중... (${progress}%)`;
                } else if (progress < 80) {
                    statusMsg.innerText = `🧠 벡터 DB 인덱싱 중... (${progress}%)`;
                    card.style.boxShadow = `0 0 ${progress/5}px rgba(94, 234, 212, 0.05)`;
                } else {
                    statusMsg.innerText = `✨ 최종 결과 생성 중... (${progress}%)`;
                }
            }
        }, intervalTime);
    }

    // --- [로컬 스토리지 관리 함수들] (기존 유지) ---
    function saveFileToStorage(fileData) {
        let files = JSON.parse(localStorage.getItem('myFiles') || '[]');
        files.push(fileData);
        localStorage.setItem('myFiles', JSON.stringify(files));
    }

    function loadFilesFromStorage() {
        let files = JSON.parse(localStorage.getItem('myFiles') || '[]');
        files.forEach(data => addFileCard(data));
    }

    function deleteFileFromStorage(cardId) {
        let files = JSON.parse(localStorage.getItem('myFiles') || '[]');
        files = files.filter(f => f.id !== cardId);
        localStorage.setItem('myFiles', JSON.stringify(files));
    }

    function updateFileStatusInStorage(cardId, status) {
        let files = JSON.parse(localStorage.getItem('myFiles') || '[]');
        const index = files.findIndex(f => f.id === cardId);
        if (index !== -1) {
            files[index].status = status;
            localStorage.setItem('myFiles', JSON.stringify(files));
        }
    }
});

// 모달 기능 (기존 유지)
function openPreview(title, date, content) {
    const modal = document.getElementById('previewModal');
    const previewTitle = document.getElementById('previewTitle');
    const previewDate = document.getElementById('previewDate');
    const previewBody = document.getElementById('previewBody');
    const goToChatBtn = document.getElementById('goToChatBtn');

    if (previewTitle) previewTitle.innerText = title;
    if (previewDate) previewDate.innerText = date;
    if (previewBody) previewBody.innerHTML = content;
    
    if (goToChatBtn) {
        goToChatBtn.onclick = function() {
            window.location.href = `../message/message.html?file=${encodeURIComponent(title)}`;
        };
    }
    if (modal) modal.style.display = 'flex';
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    if(modal) modal.style.display = 'none';
}