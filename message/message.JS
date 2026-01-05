let selectedFile = null;

// 요소 선택
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const promptAside = document.getElementById('prompt-aside');
const promptEditor = document.getElementById('prompt-editor-box');
const filePreviewContainer = document.getElementById('file-preview-container');

// 1. 통합 메시지 전송 함수
function sendMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text && !selectedFile) return;

    // 수정: selectedFile 객체 자체를 포함하여 전달 (다운로드 URL 생성을 위함)
    const messageData = {
        text: text,
        file: selectedFile ? { 
            name: selectedFile.name, 
            blob: selectedFile // 파일 데이터 원본 추가
        } : null
    };

    renderCombinedMessage(messageData);

    chatInput.value = "";
    removeFilePreview();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 2. 통합 메시지 렌더링
function renderCombinedMessage(data) {
    const msgId = Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message right';

    // 파일 레이아웃 (다운로드 링크 추가)
    let fileHtml = "";
    if (data.file) {
        // 추가: 브라우저 메모리에 임시 다운로드 경로 생성
        const downloadUrl = URL.createObjectURL(data.file.blob);
        
        fileHtml = `
            <div class="file-attachment" style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 10px; border-radius: 10px; margin-bottom: 8px; border: 1px solid #f1f5f9; color: #475569; font-size: 14px; min-width: 200px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons" style="color: #3b82f6; font-size: 18px;">description</span>
                    <span class="file-name">${data.file.name}</span>
                </div>
                <a href="${downloadUrl}" download="${data.file.name}" style="color: #64748b; text-decoration: none; display: flex; align-items: center;">
                    <span class="material-icons" style="font-size: 20px; cursor: pointer;">download</span>
                </a>
            </div>`;
    }

    // 텍스트 레이아웃
    let textHtml = data.text ? `<div class="text-content" style="word-break: break-all; line-height: 1.5;">${data.text}</div>` : "";

    messageDiv.innerHTML = `
        <div class="bubble combined" style="max-width: 80%;">${fileHtml}${textHtml}</div>
        <div class="profile-group">
            <div class="avatar"></div>
            <input type="checkbox" id="check-${msgId}" class="custom-checkbox message-selector">
        </div>
    `;
    chatMessages.appendChild(messageDiv);
}

// 3. 파일 미리보기 처리
function handleFilePreview(input) {
    const file = input.files[0];
    if (!file) return;
    selectedFile = file; // 파일 객체 저장
    if (filePreviewContainer) {
        filePreviewContainer.innerHTML = `
            <div class="file-chip" style="display:inline-flex; align-items:center; background:#eff6ff; padding:5px 10px; border-radius:15px; font-size:13px;">
                <span>📄 ${file.name}</span>
                <span class="remove-file" onclick="removeFilePreview()" style="cursor:pointer; margin-left:8px; font-weight:bold;">×</span>
            </div>`;
    }
    input.value = '';
}

function removeFilePreview() {
    selectedFile = null;
    if (filePreviewContainer) filePreviewContainer.innerHTML = "";
}

// 4. 패널 제어 및 로딩 (메시지 수집 로직)
function openPrompt() {
    const actionBtn = document.querySelector('.prompt-action-btn');
    if (!actionBtn) return;

    actionBtn.classList.add('loading');
    const originalContent = actionBtn.innerHTML;
    actionBtn.innerHTML = `<span class="spinner"></span> 프롬프트 생성 중...`;

    setTimeout(() => {
        const selectedMessages = document.querySelectorAll('.message-selector:checked');
        let combinedText = "";

        selectedMessages.forEach((checkbox) => {
            const messageDiv = checkbox.closest('.message');

            const fileName = messageDiv.querySelector('.file-name');
            if (fileName) {
                combinedText += `[첨부 파일: ${fileName.innerText.trim()}]\n`;
            }

            const textContent = messageDiv.querySelector('.text-content');
            if (textContent) {
                combinedText += textContent.innerText.trim() + "\n";
            }

            combinedText += "\n";
        });

        if (promptEditor) {
            promptEditor.innerText = combinedText.trim() || "선택된 메시지가 없습니다.";
        }
        if (promptAside) promptAside.classList.add('active');

        actionBtn.classList.remove('loading');
        actionBtn.innerHTML = originalContent;
    }, 1200);
}

function closePrompt() {
    if (promptAside) {
        promptAside.classList.remove('active');
        setTimeout(() => {
            if (!promptAside.classList.contains('active')) {
                promptAside.style.width = "";
            }
        }, 300);
    }
}

// 5. 클립보드 복사 함수
function copyPrompt() {
    const chatInput = document.getElementById('chat-input');
    const promptEditor = document.getElementById('prompt-editor-box');

    let textToCopy = "";

    if (chatInput && chatInput.value.trim() !== "") {
        textToCopy = chatInput.value.trim();
    } else if (promptEditor) {
        textToCopy = promptEditor.innerText.trim();
    }

    if (!textToCopy || textToCopy.includes("선택된 메시지가 없습니다")) {
        alert("복사할 내용이 없습니다.");
        return;
    }

    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    tempTextArea.style.position = "fixed";
    tempTextArea.style.left = "-9999px";
    tempTextArea.style.top = "0";
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const copyBtn = document.querySelector('.btn-copy');
            if (copyBtn) {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = `<span class="material-icons" style="font-size:16px;">done</span> 복사 완료!`;
                copyBtn.style.backgroundColor = "#bbf7d0";

                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                    copyBtn.style.backgroundColor = "";
                }, 2000);
            }
        }
    } catch (err) {
        console.error("복사 오류:", err);
    } finally {
        document.body.removeChild(tempTextArea);
    }
}

// 6. 드래그 너비 조절
const handle = document.getElementById('resize-handle');
let isResizing = false;
if (handle && promptAside) {
    handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        promptAside.style.transition = 'none';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth * 0.8) {
            promptAside.style.width = `${newWidth}px`;
        }
    });
    window.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            promptAside.style.transition = 'width 0.3s ease, opacity 0.3s ease';
        }
    });
}

// 7. 이벤트 리스너 등록
if (sendBtn) sendBtn.onclick = sendMessage;
if (chatInput) {
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };
}
const copyBtnElement = document.querySelector('.btn-copy');
if (copyBtnElement) copyBtnElement.onclick = copyPrompt;