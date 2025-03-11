const express = require("express");
const path = require("path");

const app = express();

// 정적 파일 제공 (프론트엔드 파일 경로)
app.use(express.static(path.join(__dirname, "frontend")));

// 모든 경로를 index.html로 리다이렉트
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// 서버 실행
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Frontend server is running at http://localhost:${PORT}`);
});