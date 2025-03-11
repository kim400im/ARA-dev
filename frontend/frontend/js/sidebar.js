// sidebar.js
import { toggleButton, toggleSectionButtons, chatContainer, headerLogoButton } from './dom-elements.js';

export function initializeSidebar() {
  // 사이드바 초기 설정
  if (localStorage.getItem('chatContainerExpanded') === 'true') {
    chatContainer.classList.add('expanded');
    headerLogoButton.classList.add('expanded')
  }

  // 사이드바 상태 저장하여 새로고침 후에도 유지
  toggleButton.addEventListener('click', function () {
      // chat-container가 확장되도록 토글`
    const isexpanded = chatContainer.classList.toggle('expanded');
    headerLogoButton.classList.toggle('expanded');
    localStorage.setItem('chatContainerExpanded', isexpanded);
  });

  // 사이드바 리스트 토글 처리
  toggleSectionButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      const menuHeader = event.target.closest('.menu-header');
      const collapsible = menuHeader.nextElementSibling;

      // 토글 상태 변경
      if (collapsible.classList.contains('expanded')) {
        collapsible.classList.remove('expanded');
        button.querySelector('.material-icons').textContent = 'expand_more';
      } else {
        collapsible.classList.add('expanded');
        button.querySelector('.material-icons').textContent = 'expand_less';
      }
    });
  });
}