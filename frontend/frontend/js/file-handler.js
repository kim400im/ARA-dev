// file-handler.js
import { fileInput, addFileButton, fileList } from './dom-elements.js';

export function initializeFileHandlers() {
  // 파일 추가 버튼 클릭시 파일 선택창 열기
  addFileButton.addEventListener('click', () => fileInput.click());

  // 파일 선택 후 리스트에 추가
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);

    files.forEach((file) => {
      // 중복 파일 처리
      const isDuplicate = Array.from(fileList.children).some(
        (child) => child.firstChild.textContent === file.name
      );
      if (!isDuplicate) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');

        // 파일 이름 표시
        const fileName = document.createElement('span');
        fileName.textContent = file.name;

        // 삭제 버튼
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', () => fileItem.remove());

        // 리스트에 추가
        fileItem.appendChild(fileName);
        fileItem.appendChild(deleteButton);
        fileList.appendChild(fileItem);
      }
    });
    // 파일 입력창 초기화
    fileInput.value = '';
  });
}