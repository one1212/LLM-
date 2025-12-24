document.querySelector('a[href*="message.html"]').addEventListener('click', function(e) {
    // e.preventDefault(); // 이 주석을 풀면 페이지 이동이 막히고 배지가 사라지는 것만 확인 가능합니다.
    const badge = this.querySelector('.badge');
    if(badge) {
        badge.style.display = 'none';
    }
});