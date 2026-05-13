# 배포 메모

## Docker 실행

이 앱은 미니 PC에서 Docker 컨테이너로 실행하는 것을 기준으로 합니다.

```powershell
docker compose up -d --build
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

터널이 미니 PC 호스트에서 실행 중이면 hostname을 아래 주소로 연결합니다.

```text
http://127.0.0.1:3002
```

터널을 나중에 같은 Docker 네트워크 안으로 옮긴다면 아래 주소로 연결할 수 있습니다.

```text
http://guitar-bazaar:3000
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
