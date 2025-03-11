// chat-management.js
import { popup, deleteButton, closePopupButton, renameInput, saveRenameButton, chatsListUl, addChatButton, chatDescription, chatAction, chatInput, headerLogo } from './dom-elements.js';
import { loadChatroomData } from './chat-actions.js';
let chatDescText = chatDescription.querySelector('.chat-description-text');

// 새 채팅방 생성 API 호출 (서버에서 chatroomId를 반환하도록 구현)
export async function createNewChatRoom() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://api.stai.kr/chat/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      // 필요한 경우 추가 데이터를 전송할 수 있습니다.
      body: JSON.stringify({ message: userMessage, chatroom_id: chatroomId })
    });
    const result = await response.json();
    console.log("Chat Response:", result);

    if (response.ok && result.chatroomId) {
      return result.chatroomId;
    } else {
      throw new Error("Failed to create new chat room");
    }
  } catch (error) {
    console.error("Error creating new chat room:", error);
    alert("새 채팅방 생성에 실패했습니다.");
    return null;
  }
}

// 채팅방 추가
export function addNewChat(chatroomId) {
  const newChat = document.createElement('li');
  newChat.textContent = `새 과목`;
  newChat.id = chatroomId; // newChat의 id에 chatroom_id 저장

  const moreButton = document.createElement('button');
  moreButton.classList.add('chat-more-button');
  moreButton.innerHTML = '<div class="material-icons">more_horiz</div>';

  newChat.appendChild(moreButton);
  chatsListUl.insertBefore(newChat, chatsListUl.firstChild);
  return newChat;
}

let selectedChat = null;

export function initializeChatManagement() {
  // 채팅 리스트 항목 클릭 시 해당 채팅방으로 이동하도록 URL 업데이트
  chatsListUl.addEventListener('click', (e) => {
    // 채팅 옵션 버튼(.chat-more-button)이 아닌 곳을 클릭한 경우
    if (!e.target.closest('.chat-more-button')) {
      const clickedChat = e.target.closest('li');
      if (clickedChat) {
        const chatroomId = clickedChat.id;
        if (chatroomId) {
          history.pushState(null, "", `/chatroom=${chatroomId}`);
          loadChatroomData();
        }
      }
    } else {
      // 옵션 버튼 클릭 시 팝업 처리 (기존 기능)
        selectedChat = e.target.closest('li');

        openPopup();
      }
  });



  // 팝업 닫기 버튼
  closePopupButton.addEventListener('click', closePopup);

  // 채팅방 이름 변경
  saveRenameButton.addEventListener('click', renameChat);

  // 채팅방 삭제
  deleteButton.addEventListener('click', deleteChat);

  // 팝업 열기
  function openPopup() {
    popup.classList.remove('hidden');
  };

  // 팝업 닫기
  function closePopup() {
    popup.classList.add('hidden');
    selectedChat = null;
  };

  // 채팅방 이름 변경
  async function renameChat() {
    const selectedChatroomId = selectedChat.id;
    if (!selectedChatroomId) {
      alert("수정할 채팅방이 선택되지 않았습니다.");
      return;
    }
    const newTitle = renameInput.value.trim();
    if (!newTitle) {
      alert("새로운 채팅방 이름을 입력해주세요.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("인증 토큰이 없습니다. 다시 로그인해 주세요.");
      return;
    }
    if (newTitle && selectedChat) {
      selectedChat.firstChild.textContent = newTitle + ' ';
      renameInput.value = '';
      try {
        const response = await fetch(`http://api.stai.kr/api/chatroom/${selectedChatroomId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ newTitle })
        });
    
        const result = await response.json();
    
        if (response.ok) {
          alert("채팅방 이름이 변경되었습니다.");
          closePopup();
          loadChatrooms(); // 채팅방 목록 새로고침
        } else {
          alert(result.message || "채팅방 이름 변경 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("채팅방 이름 변경 중 오류:", error);
        alert("서버 오류가 발생했습니다.");
      }
    }
  };

  // 채팅방 삭제
  async function deleteChat() {
    const token = localStorage.getItem("token");
    const selectedChatroomId = selectedChat.id;
    if (!selectedChat) {
      console("삭제할 채팅방이 선택되지 않았습니다.");
      return;
    }
    if (!token) {
      alert("인증 토큰이 없습니다. 다시 로그인해 주세요.");
      return;
    }
    if (selectedChat && confirm("정말로 이 채팅방을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`http://api.stai.kr/api/chatroom/${selectedChatroomId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
    
        const result = await response.json();
    
        if (response.ok) {
          alert("채팅방이 삭제되었습니다.");
          closePopup();
          loadChatrooms(); // 채팅방 목록 다시 불러오기
          // 현재 채팅방이 삭제되는 경우 메인 페이지로 이동
          const currentPath = window.location.pathname.split("=")[1];
          if (selectedChatroomId === currentPath) {
            goToMainPage();
          }
        } else {
          alert(result.message || "채팅방 삭제 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("채팅방 삭제 중 오류:", error);
        alert("서버 오류가 발생했습니다.");
      }
    };
  };
};

// 메인페이지 이동 함수
export function goToMainPage() {
  // URL에서 chatroomId 제거하고 메인페이지로 이동
  history.pushState(null, "", "/");

  // 채팅 메시지 영역 제거 (채팅방 내용 초기화)
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.remove();
  }

  // 메인페이지 UI를 복원 (예: 채팅 설명, 액션 버튼 표시)
  if (chatDescText) {
    chatDescText.textContent = "성공적인 학습을 위한 최고의 서포터 'ARA'";
  }
  if (chatDescription) chatDescription.classList.remove('hide');
  if (chatAction) chatAction.classList.remove('hide');
  if (chatInput) chatInput.classList.remove('down');
};

// 채팅방 추가 클릭 UI 메인페이지로 이동
addChatButton.addEventListener('click', async () => {
  // URL에서 chatroomId 제거: 메인페이지로 이동
  history.pushState(null, "", "/");

  // 기존에 채팅방 데이터가 있다면 제거 (옵션)
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.remove();
  }

  // 메인페이지 UI를 복원 (예: 채팅 설명, 액션 버튼 표시)
  if (chatDescText) {
    chatDescText.textContent = '새로운 학습을 시작하세요';
  }
  if (chatDescription) chatDescription.classList.remove('hide');
  if (chatAction) chatAction.classList.remove('hide');
  if (chatInput) chatInput.classList.remove('down');

});

// 채팅방 목록 불러오기
export async function loadChatrooms() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("토큰이 없어 채팅방 목록을 불러올 수 없습니다.");
    return;
  }

  try {
    const response = await fetch("http://api.stai.kr/api/chatrooms", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // API 응답에서 chatrooms 배열을 가져옴
      // 기존 목록을 지우고 새로 채워줍니다.
      chatsListUl.innerHTML = "";
      data.chatrooms.forEach(chatroom => {
        // 새로운 li 태그 생성
        const li = document.createElement('li');
        li.id = chatroom.id;

        const prefix = "Chatroom for ";
        let displayTitle = chatroom.title;
        if (displayTitle.startsWith(prefix)) {
          displayTitle = displayTitle.substring(prefix.length);
        }
        li.textContent = displayTitle;

        // 옵션 버튼(더보기 버튼) 추가 (원래 addNewChat과 동일한 방식)
        const moreButton = document.createElement('button');
        moreButton.classList.add('chat-more-button');
        moreButton.innerHTML = '<div class="material-icons">more_horiz</div>';
        li.appendChild(moreButton);

        // 사이드바에 li 태그 추가
        chatsListUl.appendChild(li);
      });
    } else {
      console.error("채팅방 목록 불러오기 실패:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("채팅방 목록 로딩 중 에러 발생:", error);
  }
};