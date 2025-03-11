# ARA WEB Frontend

## 개요
- 이게 무슨 프로그램인지
- 그냥저냥 등등
- 기획서 링크 남겨도 댐

## 개발 환경
- Windows 10
- Visual Studio Code
- docker
- HTML, CSS, JS

## 사용법
```

# Pull docker image
$ docker pull httpd

# Run docker container (Windows)
$ docker run -d -it^
  --ara-fe-server^
  my-apache-app^
  -p 8080:80^
  -v D:\ARA\ARA-FE:/usr/local/apache2/htdocs^
  httpd

# Run docker container (Linux)
$ docker run -d -it \
  --ara-fe-server \
  my-apache-app \
  -p 8080:80 \
  -v D:\ARA\ARA-FE:/usr/local/apache2/htdocs \
  httpd

```