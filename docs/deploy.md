# Deployment Notes

## Docker

The app is intended to run on a mini PC as a Docker container.

```powershell
docker compose up -d --build
```

The container listens on port `3000`. The compose file binds it to the host at:

```text
http://127.0.0.1:3002
```

## Persistent Data

These paths must be backed up and preserved between container rebuilds:

```text
data/bazaar.db
public/uploads/
```

They are mounted as volumes in `docker-compose.yml`.

## Environment

Create `.env` from `.env.example` and change the admin password.

```env
DATABASE_PATH="data/bazaar.db"
ADMIN_PASSWORD="change-me"
```

## Cloudflare Tunnel

If the tunnel runs on the host, route the hostname to:

```text
http://127.0.0.1:3002
```

If the tunnel is later moved into the same Docker network, route to:

```text
http://guitar-bazaar:3000
```
