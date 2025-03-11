// const express = require('express');
// const { handleChat } = require('../controllers/chatController');

// const router = express.Router();

// // POST /api/chat
// router.post('/', handleChat);
// module.exports = router;
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase"); // Supabase 클라이언트
const { generateBotResponse } = require("../utils/botResponse"); // 봇 응답 생성 함수
const authenticateToken = require("../middlewares/auth");
const axios = require("axios");

// 채팅 메시지 처리 API
router.post("/chat/new", authenticateToken, async (req, res) => {
  const { message, chatroom_id } = req.body;
  const userId = req.user.userId;
  console.log("got post")

  if (!message) {
    return res.status(400).json({ message: "userId and message are required." });
  }

  try {
    let chatroom;

    console.log("chat room id is ", chatroom_id)

    if (chatroom_id){
        const { data: existingChatroom, error: chatroomError } = await supabase
        .from("chatrooms")
        .select("*")
        .eq("id", chatroom_id)
        .eq("user_id", userId)
        .single();

      if (chatroomError || !existingChatroom) {
        console.error("Invalid chatroom_id or unauthorized access.");
        return res.status(404).json({ message: "Chatroom not found or unauthorized." });
      }

      chatroom = existingChatroom;
    } else {
      console.log("make chatroom!")
      // chatroom_id가 없으면 subjects와 chatrooms 생성
      const subjectName = `새 과목`; // 고유한 과목 이름 생성
      const { data: subject, error: subjectError } = await supabase
        .from("subjects")
        .insert([{ name: subjectName, user_id: userId }])
        .select()
        .single();

      if (subjectError) {
        console.error("Error creating subject:", subjectError);
        return res.status(500).json({ message: "Error creating subject." });
      }

      const chatroomTitle = `Chatroom for ${subjectName}`;
      const { data: newChatroom, error: chatroomError } = await supabase
        .from("chatrooms")
        .insert([{ user_id: userId, title: chatroomTitle, subject_id: subject.id }])
        .select()
        .single();

      if (chatroomError) {
        console.error("Error creating chatroom:", chatroomError);
        return res.status(500).json({ message: "Error creating chatroom." });
      }

      chatroom = newChatroom;
    }

    // 메시지 저장
    const { error: userMessageError } = await supabase
      .from("messages")
      .insert([
        {
          chatroom_id: chatroom.id,
          sender_type: "user",
          message_type: "text",
          content: message,
        },
      ]);

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return res.status(500).json({ message: "Error saving user message." });
    }

    // 봇 응답 생성 및 저장
    //const botMessage = generateBotResponse(message); // 봇 응답 생성 
    // LLM 서버 요청
    const llmResponse = await axios.post("http://localhost:8000/process_normal", {
      question: message,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const botMessage = llmResponse.data.response; // LLM 응답

    const { error: botMessageError } = await supabase
      .from("messages")
      .insert([
        {
          chatroom_id: chatroom.id,
          sender_type: "bot",
          message_type: "text",
          content: botMessage,
        },
      ]);

    if (botMessageError) {
      console.error("Error saving bot message:", botMessageError);
      return res.status(500).json({ message: "Error saving bot message." });
    }

    // 응답 반환
    return res.status(200).json({
      message: "Chat processed successfully.",
      chatroomId: chatroom.id,
      subjectId: chatroom.subject_id,
      userMessage: message,
      botMessage,
    });
    
  } catch (error) {
    console.error("Error processing chat:", error);
    return res.status(500).json({ message: "An error occurred while processing chat." });
  }
});






// 채팅방 데이터 API
router.get("/chatroom/:id", authenticateToken, async (req, res) => {
  const chatroomId = req.params.id;
  const userId = req.user.userId;

  try {
      // chatroomId에서 '=' 문자 제거 (있는 경우)
      const cleanChatroomId = chatroomId.replace('=', '');

      // 채팅방 정보 조회
      const { data: chatroom, error: chatroomError } = await supabase
          .from("chatrooms")
          .select("id, title, subject_id")
          .eq("id", cleanChatroomId)
          .eq("user_id", userId)
          .single();

      if (chatroomError || !chatroom) {
          console.error("Chatroom error:", chatroomError);
          return res.status(404).json({ message: "채팅방을 찾을 수 없습니다." });
      }

      // 채팅 메시지 조회
      const { data: messages, error: messagesError } = await supabase
          .from("messages")
          .select("id, sender_type, message_type, content, created_at")
          .eq("chatroom_id", cleanChatroomId)
          .order("created_at", { ascending: true });

      if (messagesError) {
          console.error("Messages error:", messagesError);
          return res.status(500).json({ message: "메시지 조회 중 오류가 발생했습니다." });
      }

      res.json({ chatroom, messages });
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


router.get("/api/chatrooms", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // 유저 정보 가져오기

  try {
    // 현재 로그인한 사용자의 채팅방 목록 가져오기
    const { data: chatrooms, error } = await supabase
      .from("chatrooms")
      .select("id, title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chatrooms:", error);
      return res.status(500).json({ message: "채팅방 정보를 불러오는 중 오류 발생" });
    }

    res.json({ chatrooms });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

router.delete("/api/chatroom/:id", authenticateToken, async (req, res) => {
  const chatroomId = req.params.id;
  const userId = req.user.userId; // 로그인한 사용자 ID

  try {
    // 채팅방 존재 여부 및 소유자 확인
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, subject_id")
      .eq("id", chatroomId)
      .eq("user_id", userId)
      .single();

    if (chatroomError || !chatroom) {
      console.error("Chatroom not found or unauthorized.");
      return res.status(404).json({ message: "채팅방을 찾을 수 없거나 삭제 권한이 없습니다." });
    }

    // messages 테이블에서 해당 채팅방의 메시지 삭제
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("chatroom_id", chatroomId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return res.status(500).json({ message: "메시지 삭제 중 오류가 발생했습니다." });
    }

    // subjects 테이블에서 해당 subject 삭제
    const { error: subjectError } = await supabase
      .from("subjects")
      .delete()
      .eq("id", chatroom.subject_id);

    if (subjectError) {
      console.error("Error deleting subject:", subjectError);
      return res.status(500).json({ message: "과목 삭제 중 오류가 발생했습니다." });
    }

    // chatrooms 테이블에서 해당 채팅방 삭제
    const { error: chatroomDeleteError } = await supabase
      .from("chatrooms")
      .delete()
      .eq("id", chatroomId);

    if (chatroomDeleteError) {
      console.error("Error deleting chatroom:", chatroomDeleteError);
      return res.status(500).json({ message: "채팅방 삭제 중 오류가 발생했습니다." });
    }

    return res.status(200).json({ message: "채팅방이 성공적으로 삭제되었습니다." });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.put("/api/chatroom/:id", authenticateToken, async (req, res) => {
  const chatroomId = req.params.id;
  const userId = req.user.userId;
  const { newTitle } = req.body;

  if (!newTitle || newTitle.trim() === "") {
    return res.status(400).json({ message: "새로운 채팅방 이름을 입력해야 합니다." });
  }

  try {
    // 채팅방 존재 여부 및 소유자 확인
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, subject_id")
      .eq("id", chatroomId)
      .eq("user_id", userId)
      .single();

    if (chatroomError || !chatroom) {
      console.error("Chatroom not found or unauthorized.");
      return res.status(404).json({ message: "채팅방을 찾을 수 없거나 수정 권한이 없습니다." });
    }

    // 채팅방 이름 업데이트
    const { error: chatroomUpdateError } = await supabase
      .from("chatrooms")
      .update({ title: `Chatroom for ${newTitle}` })
      .eq("id", chatroomId);

    if (chatroomUpdateError) {
      console.error("Error updating chatroom title:", chatroomUpdateError);
      return res.status(500).json({ message: "채팅방 이름 수정 중 오류가 발생했습니다." });
    }

    // subjects 테이블의 name 업데이트
    const { error: subjectUpdateError } = await supabase
      .from("subjects")
      .update({ name: newTitle })
      .eq("id", chatroom.subject_id);

    if (subjectUpdateError) {
      console.error("Error updating subject name:", subjectUpdateError);
      return res.status(500).json({ message: "과목 이름 수정 중 오류가 발생했습니다." });
    }

    return res.status(200).json({ message: "채팅방과 과목 이름이 성공적으로 수정되었습니다." });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


module.exports = router;
