// main.js
import { initializeEventHandlers } from './event-handlers.js';
import { loadChatroomData } from './chat-actions.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeEventHandlers();
  loadChatroomData(); // 페이지 로드 시 채팅방 데이터 로드
});