from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.responses import JSONResponse
import markdown
import re
from typing import Optional


load_dotenv()
app = FastAPI()
# 환경 변수에서 API 키 가져오기
openai_api_key = os.getenv("OPENAI_API_KEY")

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=openai_api_key)
# client = OpenAI()

# OpenAI API 키 설정

# 입력 모델 정의
class InputData(BaseModel):
    question: str

class Prompt(BaseModel):
    prompt: str

class Query(BaseModel):
    question: str

# 업로드 파일 저장 경로
UPLOAD_DIRECTORY = "./uploaded_files"



# 디렉토리 생성
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@app.get("/")
async def read_root():
    return {"message": "Hello Python"}

@app.post("/process_prompt")
async def process_prompt(prompt: Prompt):
    # 여기서는 간단히 입력받은 prompt를 그대로 반환합니다.
    # 실제 LLM 처리는 이 부분에 구현하면 됩니다.
    return {"response": f"Processed: {prompt.prompt}"}


# 비교적 일관된 출력을 내는 0.3
# Settings.llm = OpenAI(temperature=0.3, model="gpt-4o-mini")

# 저장된 폴더에서 사업보고서를 가져온다.
folder_path = './uploaded_files'


def clean_markdown(text: str) -> str:
    """
    마크다운 텍스트를 깔끔하게 정리하는 함수
    1. 이스케이프된 줄바꿈 처리
    2. 불필요한 공백 제거
    3. 마크다운 요소 정리
    """
    # 1단계: 기본 정리
    text = text.replace('\\n', '\n')  # 이스케이프된 줄바꿈 처리
    text = re.sub(r'\n{3,}', '\n\n', text)  # 3개 이상 연속된 줄바꿈을 2개로 통일
    
    # 2단계: 각 요소별 처리
    lines = text.split('\n')
    processed_lines = []
    current_section = []
    
    for line in lines:
        line = line.strip()
        if not line:  # 빈 줄 처리
            if current_section:  # 현재 섹션이 있으면 처리하고 초기화
                processed_lines.extend(current_section)
                processed_lines.append('')
                current_section = []
        elif line.startswith('#'):  # 제목 처리
            if current_section:  # 이전 섹션 처리
                processed_lines.extend(current_section)
                processed_lines.append('')
                current_section = []
            # 제목 스타일 정리
            line = re.sub(r'#{1,6}\s*', lambda m: m.group().strip() + ' ', line)
            current_section.append(line)
        elif line.startswith('-'):  # 목록 항목 처리
            line = re.sub(r'-\s*', '- ', line)  # 목록 기호 뒤 공백 정리
            current_section.append(line)
        elif '**' in line:  # 강조 표시 정리
            line = re.sub(r'\*\*\s*(.*?)\s*\*\*', r'**\1**', line)
            current_section.append(line)
        else:
            current_section.append(line)
    
    # 마지막 섹션 처리
    if current_section:
        processed_lines.extend(current_section)
    
    # 3단계: 최종 텍스트 조립
    text = '\n'.join(processed_lines)
    
    # 4단계: 최종 정리
    text = re.sub(r'\n{3,}', '\n\n', text)  # 연속된 빈 줄 정리
    text = text.strip()  # 시작과 끝의 공백 제거
    
    return text

@app.post("/process_normal")
async def process_input(data: InputData):
    try:
        # System 프롬프트 수정
        system_prompt = """마크다운 형식으로 응답해주세요. 다음 규칙을 따라주세요:
        1. 제목은 # 또는 ## 사용
        2. 목록은 - 사용
        3. 중요 내용은 ** 사용
        4. 각 섹션은 빈 줄로 구분
        
        예시:
        # 주요 제목
        
        ## 1. 첫 번째 섹션
        - **중요한 내용**: 설명입니다
        
        ## 2. 두 번째 섹션
        - 일반적인 내용입니다"""

        # ChatGPT API 호출
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.question}
            ],
            temperature=0.7
        )

        # 응답 텍스트 정리
        markdown_text = response.choices[0].message.content.strip()
        cleaned_markdown = clean_markdown(markdown_text)
        
        return {"response": cleaned_markdown}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

