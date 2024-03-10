### Start backend

```bash
docker compose -f docker-compose.dev.yml up --build
```

### For frontend

```bash
cd web

yarn install

npx prisma db push

yarn seed

yarn dev
```
