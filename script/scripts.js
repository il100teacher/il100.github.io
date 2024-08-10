// 매니페스트 파일 연결
const link = document.createElement('link');
link.rel = 'manifest';
link.href = './script/manifest.json';
document.head.appendChild(link);

// 브라우저 및 디바이스 탐지
const agent = navigator.userAgent;
const isAndroid = agent.match(/Android/i) !== null;
const isChrome = agent.match(/Chrome/i) !== null && agent.match(/SamsungBrowser/i) === null;
const isIOS = /iPad|iPhone|iPod/.test(agent) && !window.MSStream;

// Android에서 Chrome이 아닌 경우, Chrome으로 리디렉션
if ((agent.indexOf("NAVER") > 0 || agent.indexOf("KAKAOTALK") > 0 || agent.indexOf("inapp") > 0 || !isChrome) && isAndroid) {
    const currentUrl = location.hostname + location.pathname;
    location.href = 'intent://' + currentUrl + '#Intent;scheme=http;package=com.android.chrome;action=android.intent.action.VIEW;end';
}

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./serviceworker.js')
            .then((reg) => {
                console.log('Success', reg.scope);
            })
            .catch((err) => console.log('Failure', err));
    });
}

let deferredPrompt;
let installButton;

// 앱 설치 여부 확인
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('isAppInstalled') === 'true';
}

// 설치 프롬프트를 저장하고 버튼 표시
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();  // 기본 설치 프롬프트 차단
    deferredPrompt = e;
    if (!isAppInstalled()) {
        showInstallButton();
    }
});

// 앱 설치 이벤트 처리
window.addEventListener('appinstalled', () => {
    console.log('App installed');
    localStorage.setItem('isAppInstalled', 'true');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// 설치 버튼 표시 함수
function showInstallButton() {
    installButton = document.createElement('button');
    installButton.innerText = '바로가기 설치하기';
    installButton.className = 'install-button';
    installButton.onclick = async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
            installButton.style.display = 'none';
        }
        deferredPrompt = null;
    };
    document.body.appendChild(installButton);
}


// 페이지 로드 시 실행
window.onload = () => {
    if (!isAppInstalled()) {
        showInstallButton();
    }
};

// iOS 사용자 안내
if (isIOS) {
    const iosInstruction = document.createElement('div');
    iosInstruction.innerText = '아이폰은 사파리에서 "Add To Home Screen" 버튼을 눌러주세요.';
    iosInstruction.className = 'ios-instruction';
    document.body.appendChild(iosInstruction);
} else if (!isChrome) {
    const installInstruction = document.createElement('div');
    installInstruction.innerText = '설정메뉴에서 "홈 화면에 추가"를 선택하여 주세요.';
    installInstruction.className = 'install-instruction';
    document.body.appendChild(installInstruction);
}
