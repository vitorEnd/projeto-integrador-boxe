# Treinamentos de boxe

Sistema web para cadastrar alunos, sugerir treinos e acompanhar os treinos realizados. Os dados ficam em MySQL. Foram implementados os casos de uso UC01, UC03, UC04 e UC05.

## Rodar no Windows (sem Docker)

Com Node.js instalado, abra o PowerShell nesta pasta:

```powershell
npm install
npm run demo
```

Depois abra `http://localhost:3000`. O comando `demo` prepara o MySQL e inicia o site. Na primeira execução, ele baixa o MySQL Community Server (cerca de 281 MB), aplica a migração e cadastra os exercícios. Os arquivos do banco ficam na pasta `.local`, que não é versionada. Depois de reiniciar o computador, use `npm run demo` novamente; os dados permanecem.

## Rodar com Docker

```powershell
npm install
docker compose up -d
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Se já existir um `.env`, confira se `DATABASE_URL` aponta para o MySQL usado. Não use os dois métodos de banco ao mesmo tempo na porta 3306.

## Conferir os registros

Em outro terminal, rode `npm run db:studio` e abra o endereço exibido. É possível ver `User`, `Profile`, `Exercise`, `Workout`, `WorkoutExercise`, `WorkoutLog` e `WeightLog`. Em `User`, a senha é guardada como hash (`passwordHash`).

Para demonstrar: cadastre uma conta, entre, preencha o perfil com objetivo emagrecimento, gere o treino, registre a realização e abra a página de evolução. Nela, registre também uma nova pesagem. O passo a passo está em [ROTEIRO_VIDEO.md](ROTEIRO_VIDEO.md).

Se o cadastro ou login mostrar que o banco não está pronto, interrompa o site com `Ctrl+C`, rode `npm run demo` novamente e atualize a página. Para repetir a verificação automática dos quatro casos de uso com o site aberto, rode `npm run smoke:test`; as contas criadas por esse teste são removidas ao final.
