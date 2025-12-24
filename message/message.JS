const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const promptAside = document.getElementById('prompt-aside');

// 1. 메시지 전송 기능 (우측 정렬 + 체크박스)
function sendMessage(content, type = 'text') {
    const text = type === 'text' ? chatInput.value.trim() : `📄 파일: ${content}`;
    if (text !== "") {
        const msgId = Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message right'; // 우측 정렬 클래스 적용
        
        messageDiv.innerHTML = `
            <div class="bubble">${text}</div>
            <div class="profile-group">
                <div class="avatar"></div>
                <input type="checkbox" id="check-${msgId}" class="custom-checkbox">
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        if(type === 'text') chatInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 2. 파일 탐색기에서 파일 선택 시 처리
function handleFileSelect(input) {
    const file = input.files[0];
    if (file) {
        sendMessage(file.name, 'file');
        input.value = ''; // 초기화
    }
}

// 3. 패널 제어
function openPrompt() { promptAside.classList.add('active'); }
function closePrompt() { promptAside.classList.remove('active'); }

// 이벤트 리스너
sendBtn.addEventListener('click', () => sendMessage());
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});