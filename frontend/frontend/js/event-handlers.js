// event-handlers.js
import { messageInput, sendButton, loginPopup, signInButton, closeButtons, userButton, userInfoPopup, logoutButton, loginButton, signInPopup, headerLogo } from './dom-elements.js';
import { updateSendButtonState, sendMessage, autoResize, loadChatroomData } from './chat-actions.js';
import { initializeFileHandlers } from './file-handler.js';
import { handleLogin, handleLogout, fetchUserInfo } from './auth.js';
import { initializeRegistrationHandlers } from './registration.js';
import { initializeSidebar } from './sidebar.js';
import { initializeChatManagement, loadChatrooms, goToMainPage } from './chat-management.js';

export function initializeEventHandlers() {
  // 입력창 상태 업데이트
  messageInput.addEventListener('input', updateSendButtonState);
  updateSendButtonState();

  // 메시지 전송 이벤트
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // 입력창 자동 크기 조절
  messageInput.addEventListener('input', autoResize);

  // 로그인 팝업 열기
  userButton.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo(token);
    } else {
      loginPopup.classList.remove('hidden');
    }
  });

  // 회원가입 버튼
  signInButton.addEventListener('click', (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    loginPopup.classList.add('hidden'); // 로그인 팝업 숨기기
    signInPopup.classList.remove('hidden'); // 회원가입 팝업 표시
  });

  // 닫기 버튼: 로그인 및 회원가입 팝업 닫기
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loginPopup.classList.add("hidden");
      signInPopup.classList.add("hidden");
      userInfoPopup.classList.add('hidden');
    })
  })

  // 로그아웃 이벤트
  logoutButton.addEventListener('click', handleLogout);

  // 회원가입 핸들러 초기화
  initializeRegistrationHandlers();

  // 사이드바 기능 초기화
  initializeSidebar();

  // 채팅방 관리(채팅방 추가 및 이동) 초기화
  initializeChatManagement();

  // 채팅방 데이터 로드
  loadChatroomData();

  // 채팅방 목록 로드
  loadChatrooms();

  // 로그인 이벤트
  loginButton.addEventListener('click', async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    const userid = document.querySelector('input#userid').value.trim();
    const password = document.querySelector('input#password').value.trim();

    await handleLogin(userid, password);

    // 로그인 성공 시 토큰이 저장되어 있다면 채팅방 목록 불러오기
    if (localStorage.getItem('token')) {
      loadChatrooms();
    }

  });

  // 페이지 로드 시 URL에 chatroom_id가 있다면 채팅방 데이터 로드
  const currentPath = window.location.pathname;
  if (currentPath.includes("chatroom=")) {
    loadChatroomData();
  };

  // 파일 처리 초기화
  initializeFileHandlers();

  // 로고 버튼 클릭 시, 메인페이지로 이동
  headerLogo.addEventListener('click', async () => {
    goToMainPage();
  });

}