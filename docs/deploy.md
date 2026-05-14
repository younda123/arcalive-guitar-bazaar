# 배포 메모

## Docker 실행

이 앱은 미니 PC에서 Docker 컨테이너로 실행하는 것을 기준으로 합니다. 작업용 PC에서는 Docker 컨테이너를 올리지 않습니다.

미니 PC는 운영 브랜치인 `prod`만 받습니다.

```powershell
git switch prod
git pull --ff-only origin prod
```

그다음 컨테이너를 갱신합니다.

```powershell
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --build
```

컨테이너 내부 앱 포트는 `3000`입니다. `docker-compose.yml`에서는 호스트의 다음 주소로만 열어둡니다.

```text
http://127.0.0.1:3002
```

## 유지해야 하는 데이터

컨테이너를 다시 만들더라도 아래 경로는 유지되어야 합니다.

```text
data/bazaar.db
public/uploads/
```

두 경로는 `docker-compose.yml`에서 volume으로 연결되어 있습니다.

## 환경 변수

`.env.example`을 복사해 `.env`를 만들고, 관리자 비밀번호를 반드시 바꿉니다.

```env
DATABASE_PATH="data/bazaar.db"
ADMIN_PASSWORD="change-me"
```

## Cloudflare Tunnel

Cloudflare Tunnel 설정은 도메인 연결 단계에서 진행합니다.

기존 `livlog` 터널 컨테이너와 같은 Docker 네트워크를 쓰려면 미니 PC에서 아래 명령으로 실행합니다.

```powershell
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --build
```

이렇게 실행하면 `guitar-bazaar` 컨테이너가 기존 `livlog_default` 네트워크에도 붙습니다.

Cloudflare의 Published application route는 아래처럼 설정합니다.

```text
bazaar.lekisworks.com -> http://guitar-bazaar:3000
```

터널이 Docker 밖에서 미니 PC 호스트 서비스로 실행 중이면 hostname을 아래 주소로 연결합니다.

```text
http://127.0.0.1:3002
```

터널이 Docker 안에 있지만 `livlog_default` 네트워크 연결을 쓰지 않는다면 아래 주소를 시도할 수 있습니다.

```text
http://host.docker.internal:3002
```

## 백업

미니 PC의 저장소 루트에서 실행합니다.

```powershell
.\scripts\backup.ps1
```

스크립트는 `backups/` 아래에 시간 정보가 붙은 zip 파일을 만듭니다. 백업 대상은 다음과 같습니다.

```text
data/
public/uploads/
```

복구할 때는 먼저 컨테이너를 중지합니다.

```powershell
docker compose down
```

그다음 백업 zip을 저장소 루트에 풀어 `data/`와 `public/uploads/`를 복원하고 다시 실행합니다.

```powershell
docker compose up -d
```
