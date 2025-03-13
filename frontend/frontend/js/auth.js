// auth.js
import { loginPopup, userInfoPopup, userInfoName, userInfoId, logoutButton, chatsListUl } from './dom-elements.js';
import { goToMainPage } from './chat-management.js';

// 로그인상태에서 회원 정보 열기
export async function fetchUserInfo(token) {

  if (!token) {
    console.warn("로그인되지 않은 상태입니다. 로그인 창을 표시합니다.");
    loginPopup.classList.remove("hidden");
    return;
  }
  // const token = localStorage.getItem("token");
  
  // if (!token) {
  //   loginPopup.classList.remove('hidden');
  // }
  
  // else {
    // 사용자 정보 업데이트 및 팝업 표시
    // userInfoPopup.classList.remove('hidden');
    // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // userInfoName.textContent = `환영합니다, ${userInfo.username}님!`;
    // userInfoId.textContent = `아이디: ${userInfo.userid}`;
    try {
      // 서버로 사용자 정보 요청
      const response = await fetch("https://api.stai.kr/auth/user-info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
  
      if (response.ok) {
        const userInfo = await response.json();
        // 사용자 정보 업데이트 및 팝업 표시
        userInfoPopup.classList.remove("hidden");
        userInfoName.textContent = `환영합니다, ${userInfo.username}님!`;
        userInfoId.textContent = `아이디: ${userInfo.userid}`;
      } else if (response.status === 401 || response.status === 403) {
        // console.log("Response not OK:", response.status, response.statusText); // 디버깅 추가
        console.warn("토큰이 만료됨. 로그인 창을 표시합니다.");
        localStorage.removeItem("token");
        loginPopup.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      alert("서버 요청 중 오류가 발생했습니다.");
    }
  // }
};

// 로그인
export async function handleLogin(userid, password) {
  if (!userid || !password) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const response = await fetch('https://api.stai.kr/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid, password }),
      credentials: "include", // 쿠키를 활성화
    });

    const result = await response.json();
    console.log("Server Response:", result); // JSON 응답 확인
    console.log("JWT Token:", result.token); // 토큰 출력

    if (response.ok) {
      alert(result.message); // "Login successful"
      console.log(`Logged in as: ${result.userid}`);
      console.log("JWT Token:", result.token); // 토큰 출력
      localStorage.setItem('token', result.token);
      loginPopup.classList.add("hidden"); // 팝업 닫기
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("로그인 요청 중 오류가 발생했습니다.")
  }
};

// 로그아웃
export async function handleLogout() {
  const token = localStorage.getItem("token");
  console.log('token before logout is ', token);

  try {
    const response = await fetch("https://api.stai.kr/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // 쿠키 포함
      },
      credentials: "include",
    });

    if (response.ok) {
      localStorage.removeItem("token");

      // 2. 쿠키 삭제 (쿠키 이름에 따라 수정)
      // document.cookie = "token=; Max-Age=0; path=/;";
      alert("로그아웃 되었습니다.");
      userInfoPopup.classList.add("hidden");

      // 채팅방 목록 비움
      if (chatsListUl) {
        chatsListUl.innerHTML = "";
      };

      // 메인페이지로 이동
      goToMainPage();
    } else {
      alert("로그아웃 처리 중 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("서버 요청 중 오류가 발생했습니다.");
  }
};