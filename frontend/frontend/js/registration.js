// registration.js
import { loginPopup, signInPopup, signInForm, signInButton, closeButtons } from './dom-elements.js';

export function initializeRegistrationHandlers() {
  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    const username = document.getElementById('set-username').value.trim();
    const userid = document.getElementById('set-userid').value.trim();
    const password = document.getElementById('set-password').value.trim();

    if (!username || !userid || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://api.stai.kr/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userid, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // "회원가입이 완료되었습니다!"
        // 회원가입 팝업 닫고 로그인 팝업 열기
        signInPopup.classList.add('hidden');
        loginPopup.classList.remove('hidden');
      } else {
        alert(result.message); // 오류 메시지 출력
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('회원가입 요청 중 오류가 발생했습니다.');
    }
  });
}