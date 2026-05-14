# 운영 방침

## 기준 환경

- 실제 운영은 미니 PC에서만 진행합니다.
- 운영 DB는 미니 PC의 `data/bazaar.db`를 기준으로 합니다.
- 업로드 이미지는 미니 PC의 `public/uploads/`를 기준으로 합니다.
- 이 작업용 PC에서는 Docker 컨테이너를 올리지 않습니다.
- 이 작업용 PC에서는 운영 DB나 운영 업로드 파일을 복사하거나 덮어쓰지 않습니다.

## 브랜치

- `prod`: 운영 브랜치입니다. 미니 PC는 이 브랜치만 받습니다.
- `dev`: 개발 및 베타 개선 작업 브랜치입니다. 이 PC의 기본 작업 브랜치입니다.
- `master`: 기존 브랜치입니다. 새 운영 배포 기준으로는 사용하지 않습니다.

작업 흐름은 아래처럼 둡니다.

```text
dev에서 작업
-> 빌드 확인
-> dev에 커밋/푸시
-> 테스트 후 prod로 병합
-> 미니 PC에서 prod만 pull
```

## 작업용 PC 규칙

작업용 PC에서 할 수 있는 일입니다.

- 코드 수정
- 문서 수정
- `npm run build`
- 커밋과 푸시
- 브랜치 병합 준비

작업용 PC에서 하지 않는 일입니다.

- `docker compose up`
- 운영 컨테이너 실행
- 운영 DB 직접 사용
- 운영 업로드 파일 덮어쓰기

## 운영 배포

운영 배포는 미니 PC에서만 진행합니다.

```powershell
git switch prod
git pull --ff-only origin prod
.\scripts\backup.ps1
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d --build
```

배포 전에는 반드시 백업을 먼저 생성합니다.

## 백업 대상

```text
data/
public/uploads/
```

백업 파일은 미니 PC의 저장소 루트 아래 `backups/`에 생성됩니다.
