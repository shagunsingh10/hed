### Start backend

1. Add openai api key in server/.env file

2. Run in terminal

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

### For frontend

1. Add client id and client secret in web/.env

2. Run these step by step

   ```bash
   cd web

   yarn install

   npx prisma db push

   yarn seed

   yarn dev
   ```
