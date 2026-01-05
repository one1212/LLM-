document.addEventListener('DOMContentLoaded', () => {
    // 1. 기존 요소 및 신규 효과 요소 선택/생성
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const themeToggle = document.getElementById('theme-toggle-btn');
    const colorDots = document.querySelectorAll('.color-dot');
    const mainContent = document.querySelector('.main-content');
    const messageLink = document.querySelector('a[href*="message.html"]');
    
    // 여름/겨울용 특수 요소 동적 추가 (기존 구조를 해치지 않음)
    const summerWater = document.createElement('div'); summerWater.className = 'summer-water';
    const winterGround = document.createElement('div'); winterGround.className = 'winter-ground';
    const snowman = document.createElement('div'); snowman.className = 'snowman'; snowman.innerHTML = '☃️';
    mainContent.append(summerWater, winterGround, snowman);

    let effectInterval = null;

    // 2. 효과(입자) 생성 함수
    function startEffect(season) {
        stopEffect();
        let symbols = [], mode = 'fall', interval = 350;

        if (season === "빨강") { // 봄
            symbols = ['🌸', '✨'];
        } else if (season === "파랑") { // 여름
            symbols = ['🫧', '💧']; mode = 'rise'; interval = 400; // 기포가 아래에서 위로
        } else if (season === "주황") { // 가을
            symbols = ['🍁', '🍂', '🍃']; interval = 500;
        } else if (season === "남색") { // 겨울
            symbols = ['❄️', '☃️', '🌨️']; interval = 250; // 눈사람 입자 포함
        }

        if (symbols.length === 0) return;

        effectInterval = setInterval(() => {
            const el = document.createElement('div');
            el.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            el.className = 'effect-element';
            el.style.left = Math.random() * 100 + 'vw';
            
            if (mode === 'rise') {
                el.style.bottom = '-20px';
                el.style.animation = `rise ${Math.random() * 3 + 3}s ease-in forwards`;
            } else {
                el.style.top = '-20px';
                const duration = season === "남색" ? Math.random() * 2 + 3 : Math.random() * 5 + 5;
                el.style.animation = `fall ${duration}s linear forwards`;
            }

            el.style.fontSize = (Math.random() * 10 + 15) + 'px';
            el.style.opacity = Math.random() * 0.7 + 0.3;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 6000);
        }, interval);
    }

    function stopEffect() {
        clearInterval(effectInterval);
        document.querySelectorAll('.effect-element').forEach(el => el.remove());
    }

    // 3. 계절 테마 적용 핵심 함수 (요청 사항 반영)
    const applySeasonTheme = (seasonTitle) => {
        // 클래스 초기화
        document.body.classList.remove('theme-spring', 'theme-summer', 'theme-autumn', 'theme-winter');
        stopEffect();

        if (seasonTitle === "빨강") {
            document.body.classList.add('theme-spring');
            startEffect("빨강");
        } else if (seasonTitle === "파랑") {
            document.body.classList.add('theme-summer');
            // 여름: JS에서 기포 rise 모드 실행 (CSS에서 물 차오름 애니메이션 작동)
            startEffect("파랑"); 
        } else if (seasonTitle === "주황") {
            document.body.classList.add('theme-autumn');
            startEffect("주황");
        } else if (seasonTitle === "남색") {
            document.body.classList.add('theme-winter');
            document.documentElement.setAttribute('data-theme', 'dark'); // 겨울은 다크모드 강제
            startEffect("남색");
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    };

    // 4. 기존 이벤트 리스너 (그대로 유지)
    settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('show');
    });

    themeToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsMenu.classList.remove('show');
        }
    });

    colorDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const seasonTitle = dot.getAttribute('title');
            applySeasonTheme(seasonTitle);
            if (seasonTitle) localStorage.setItem('selected-season', seasonTitle);
            else localStorage.removeItem('selected-season');
        });
    });

    // 메시지 알림 제거 로직
    if (messageLink) {
        messageLink.addEventListener('click', function() {
            const badge = this.querySelector('.badge');
            if (badge) badge.style.display = 'none';
        });
    }

    // 초기 실행
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const savedSeason = localStorage.getItem('selected-season');
    if (savedSeason) applySeasonTheme(savedSeason);
});