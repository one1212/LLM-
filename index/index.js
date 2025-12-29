document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const messageLink = document.querySelector('a[href*="message.html"]');

    // 2. 초기 테마 설정 (로컬 스토리지 확인)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 3. 메시지 배지 제거 로직 (기존 코드 유지 및 보완)
    if (messageLink) {
        messageLink.addEventListener('click', function(e) {
            const badge = this.querySelector('.badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }

    // 4. 설정 메뉴 토글 로직
    if (settingsBtn && settingsMenu) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 클릭 이벤트 전파 방지
            settingsMenu.classList.toggle('show');
        });
    }

    // 5. 테마 전환 로직 (테마 메뉴 클릭 시)
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 메뉴가 바로 닫히지 않게 하려면 추가
            
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // 테마 적용 및 저장
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            console.log(`테마가 ${newTheme} 모드로 변경되었습니다.`);
        });
    }

    // 6. 메뉴 바깥 영역 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (settingsMenu && !settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsMenu.classList.remove('show');
        }
    });
});