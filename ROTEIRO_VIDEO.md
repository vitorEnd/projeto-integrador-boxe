# Roteiro de apresentação — quatro integrantes

**Duração prevista:** 7 a 8 minutos. Substituam “Integrante 1” etc. pelos nomes do grupo. As frases entre aspas são sugestões de fala: cada pessoa pode adaptar ao seu jeito, desde que mostre as ações indicadas. Usem dados fictícios para a gravação.

O professor avalia **funcionalidade, banco de dados, regras de negócio, erros/validações e coerência com o caso de uso**. Por isso, em cada parte do vídeo mostrem: **a tela funcionando → uma validação → a regra aplicada → o dado no MySQL**.

## Preparação antes de gravar

1. No PowerShell, dentro da pasta do projeto, executem `npm install` (se ainda não foi feito) e `npm run demo`. Esperem aparecer `Ready` e abram `http://localhost:3000`. Não fechem esse terminal durante a gravação.
2. Em outro PowerShell, executem `npm run db:studio`. Deixem o Prisma Studio aberto em uma segunda aba. Ele mostrará as tabelas reais do MySQL: `User`, `Session`, `Profile`, `Exercise`, `Workout`, `WorkoutExercise`, `WorkoutLog` e `WeightLog`.
3. Preparem um **e-mail novo** para o cadastro ao vivo, por exemplo `aluno.boxe.video01@example.com`. Se já tiver sido usado em um ensaio, troquem o número. Preparem uma senha com pelo menos oito caracteres. Não precisam dizê-la em voz alta.
4. Deixem anotados os dados fictícios do perfil: **idade 22**, **altura 175 cm**, **peso 78 kg**, **iniciante**, **objetivo emagrecimento**, **3 dias por semana**. Para registrar o treino, usem a data de hoje, **35 minutos**, esforço **6** e observação “Treino realizado no estúdio”.
5. No Prisma Studio, ao trocar de tabela, procurem o registro pelo e-mail ou pelo `userId`. Não assumam que o ID será 1: ele depende dos registros já existentes. Aumentem o zoom do navegador para que os campos fiquem legíveis no vídeo.
6. Façam um ensaio completo. Se a página de cadastro ou login disser que o banco não está pronto, parem o site com `Ctrl+C` e executem `npm run demo` novamente.

## Divisão e tempo

| Tempo aproximado | Quem fala | Parte | Prova principal |
| --- | --- | --- | --- |
| 0:00–1:45 | Integrante 1 | Introdução, UC01 e login | Cadastro, erro de e-mail repetido e `User` |
| 1:45–3:45 | Integrante 2 | UC03 — gerar treinamento | `Profile`, `Exercise`, `Workout`, `WorkoutExercise` |
| 3:45–5:25 | Integrante 3 | UC04 — registrar treinamento | Validação, confirmação e `WorkoutLog` |
| 5:25–7:45 | Integrante 4 | UC05 — acompanhar evolução e encerramento | Indicadores, calorias, peso e `WeightLog` |

### Integrante 1 — apresentação, cadastro e login (0:00–1:45)

**0:00 — Tela inicial ou `/cadastro`. Fala:**

> “Nosso projeto é uma plataforma web de apoio ao treinamento de boxe. O aluno se cadastra, informa seu perfil, recebe uma sugestão de treino, registra quando treinou e acompanha os dados. Ela ajuda o estúdio a organizar essas informações; não substitui o treinador. Vamos demonstrar os quatro casos de uso selecionados: UC01, UC03, UC04 e UC05.”

**0:20 — Mostre o formulário de `/cadastro`. Deixe o nome vazio e tente cadastrar. Fala:**

> “O primeiro caso de uso é o UC01, ligado ao RF01. Nome, e-mail e senha são obrigatórios. A tela bloqueia um campo vazio, e a API também faz essa validação antes de gravar qualquer usuário.”

**0:40 — Preencha nome, e-mail novo e senha; clique em `Cadastrar`. A tela irá para `/login` com confirmação. Volte rapidamente a `/cadastro`, tente o mesmo e-mail e mostre `E-mail já cadastrado.`. Fala:**

> “Com dados válidos, o cadastro é salvo no MySQL. Se eu tentar repetir o e-mail, o sistema impede a duplicação. Isso é verificado na API e reforçado por uma restrição `UNIQUE` na tabela `User`.”

**1:05 — Vá a `/login`, entre com a conta criada e mostre o painel com o nome do aluno. Fala:**

> “O login é uma função auxiliar para proteger os outros casos de uso. A senha é comparada com o hash; a sessão fica no banco e o navegador recebe um cookie de sessão.”

**1:25 — No Prisma Studio, abra `User`, localize o novo e-mail e mostre `name`, `email` e `passwordHash`, sem ler o hash inteiro. Fala e passagem:**

> “Aqui está a conta no MySQL. O campo `passwordHash` comprova que a senha não foi salva em texto puro. Agora o segundo integrante vai usar esse usuário para gerar um treinamento.”

**O que precisa ficar visível:** formulário, bloqueio de campo obrigatório, sucesso, erro de e-mail repetido e linha em `User`. Se o tempo apertar, mantenham o teste de e-mail duplicado e a prova no banco; dispensem outros erros.

### Integrante 2 — perfil e geração do treino (1:45–3:45)

**1:45 — Volte ao site e abra `Treinos` ou `/treinos/gerar` antes de preencher o perfil. A página pede para completá-lo. Fala:**

> “O UC03 corresponde aos RF04 a RF09. Para gerar um treino, o aluno precisa estar autenticado e ter perfil completo. Sem objetivo, nível e frequência, o sistema não gera a sugestão e encaminha o aluno ao perfil.”

**2:05 — Em `/perfil`, preencha os dados preparados: 22 anos, 175 cm, 78 kg, iniciante, emagrecimento e 3 dias por semana. Salve. Use o link `Próximo: gerar treino`. Fala:**

> “O perfil guarda dados físicos básicos, nível de experiência, objetivo e disponibilidade semanal. Neste exemplo escolhemos emagrecimento. O registro fica na tabela `Profile`. O peso inicial também aparece no acompanhamento de peso.”

**2:35 — Em `/treinos/gerar`, mostre objetivo, nível e frequência. Clique em `Gerar treinamento`. Na página `Seu treinamento`, aponte ordem, categorias, séries, repetições ou duração e descanso. Fala:**

> “O gerador é determinístico: ele consulta os exercícios do MySQL e aplica regras fixas, sem IA generativa. O objetivo de emagrecimento prioriza cardio, técnica e core. O nível iniciante define duas séries e descanso de 90 segundos. Com três dias por semana, o treino iniciante fica com quatro exercícios. Frequências de um a dois dias adicionam um exercício por sessão; frequências de cinco a sete dias reduzem um. Assim, os dados do perfil realmente mudam o resultado.”

**3:15 — No Prisma Studio, mostre `Exercise`, `Profile`, `Workout` e `WorkoutExercise`. Fala e passagem:**

> “Os quinze exercícios disponíveis vêm da tabela `Exercise`. O treino gerado foi salvo em `Workout`, e cada exercício selecionado, com ordem e volume, foi salvo em `WorkoutExercise`. O resultado continua disponível após atualizar a página. O próximo integrante vai registrar a realização desse treino.”

**O que precisa ficar visível:** mensagem de perfil obrigatório, perfil salvo, treino gerado, exercícios organizados e linhas nas tabelas. Não digam que os exercícios estão fixos na tela: eles são consultados no banco. Se o professor pedir comparação de perfis, vejam a seção “Demonstrações extras” abaixo.

### Integrante 3 — registro da realização (3:45–5:25)

**3:45 — Volte à página do treino e role até `Registrar como realizado`. Fala:**

> “O UC04 cobre RF10 e RF11. O treino gerado é uma sugestão; para dizer que foi realizado, o aluno registra a data, a duração, o esforço percebido e, se quiser, uma observação.”

**4:05 — Coloque duração `0` e tente enviar. O formulário impedirá o envio. Corrija para `35`, selecione esforço `6`, mantenha a data de hoje e escreva uma observação curta. Fala:**

> “A duração precisa ser maior que zero, o esforço deve ficar entre 1 e 10 e a data precisa ser válida. A validação existe tanto no formulário quanto no servidor. A API também confere se o treino pertence ao aluno conectado; outro usuário não consegue registrá-lo.”

**4:35 — Clique em `Registrar como realizado`; mostre `Treinamento registrado com sucesso.` e o link `Ver evolução`. Depois abra `WorkoutLog` no Prisma Studio. Fala:**

> “Agora existe um registro em `WorkoutLog` com o usuário, o treino, a data, 35 minutos e esforço 6. O treino continua em `Workout`; o histórico de realizações fica em `WorkoutLog`. Essa separação permite registrar o mesmo plano em ocasiões diferentes e calcular a evolução.”

**5:10 — Passe a fala:**

> “Com o primeiro registro salvo, podemos consultar os indicadores reais na página de evolução.”

**O que precisa ficar visível:** erro de duração zero, dados válidos, confirmação e linha em `WorkoutLog`. Se o navegador mostrar a validação nativa do campo em vez de um aviso vermelho, está correto: o servidor também rejeita duração zero.

### Integrante 4 — evolução, pesagens e fechamento (5:25–7:45)

**5:25 — Clique em `Ver evolução`. Mostre os cartões e o histórico. Fala:**

> “O UC05 cobre RF11 e RF12. A página consulta somente os `WorkoutLog` do aluno conectado. Ela calcula total de treinos, minutos, média de duração, média do esforço e quantos treinos ocorreram nos últimos 7 e 30 dias. O histórico abaixo mostra cada realização. Como temos apenas um registro, o sistema avisa que ainda não há dados suficientes para identificar uma evolução significativa.”

**5:55 — Aponte o cartão `Calorias queimadas (estimativa)` e abra, se houver tempo, `Como são estimadas as calorias?`. Fala:**

> “Também aparece uma estimativa de calorias baseada na duração do treino e no peso registrado para a data. Usamos uma referência de intensidade para boxe no saco. É uma aproximação; o aplicativo não mede o gasto real e não faz previsão de emagrecimento.”

**6:20 — Role até `Acompanhar peso`. Mostre o peso inicial de 78 kg. Para exibir duas datas no mesmo vídeo, registre uma pesagem fictícia de `79 kg` com a data de ontem. Mostre o histórico e a diferença entre a primeira e a última data. Fala:**

> “Como o objetivo deste perfil é emagrecimento, há um registro de pesagens por data. A tela mostra o peso mais recente e a mudança entre as pesagens, sem afirmar que o treino causou essa variação. Cada data tem um registro; informar a mesma data novamente atualiza o valor.”

**6:50 — No Prisma Studio, mostre `WeightLog` e volte a `WorkoutLog`. Atualize `/evolucao` para mostrar que os dados permanecem. Fala:**

> “As pesagens estão em `WeightLog`, e os treinos realizados continuam em `WorkoutLog`. Os números da tela vêm dessas tabelas no MySQL, associados ao usuário autenticado. Ao atualizar a página, os dados permanecem.”

**7:15 — Encerramento. Fala:**

> “Assim demonstramos os quatro casos: cadastro em `User`; geração em `Workout` e `WorkoutExercise` a partir do perfil e dos exercícios do banco; registro em `WorkoutLog`; e acompanhamento dos indicadores e das pesagens. A interface foi feita com Next.js e Tailwind, as regras e APIs com Next.js, e a persistência com MySQL e Prisma. O projeto está no GitHub com instruções de execução.”

**O que precisa ficar visível:** indicadores, aviso de um registro, histórico, calorias identificadas como estimativa, formulário e histórico de peso, `WeightLog` e `WorkoutLog` no Studio.

## Demonstrações extras, se sobrar tempo

- **Provar a frequência na geração:** volte ao perfil, mude de 3 para 1 dia por semana, salve e gere outro treino. Para iniciante, a regra passa de quatro para cinco exercícios. Isso cria outro `Workout`; não altera o anterior.
- **Provar o nível:** mude o nível para intermediário e gere outro treino. O volume base passa a cinco exercícios, três séries e descanso de 60 segundos. Avançado usa seis exercícios, quatro séries e descanso de 45 segundos, antes do ajuste de frequência.
- **Provar 2+ registros na evolução:** volte a um treino e registre outra realização com data de ontem e duração diferente. A página de evolução deixa de mostrar o aviso de dados insuficientes e atualiza total e médias.
- **Mostrar zero registros:** entre na evolução antes de registrar o primeiro treino. A página informa que ainda não há treinamentos registrados.
- **Mostrar autenticação:** abra uma janela anônima e tente acessar `/dashboard` ou `/evolucao`; o sistema redireciona para o login. Evitem gastar tempo com isso se o vídeo estiver perto de oito minutos.

## Mapa rápido para responder ao professor

| Pergunta possível | Resposta curta e correta |
| --- | --- |
| Quais casos de uso e requisitos foram entregues? | UC01/RF01; UC03/RF04–RF09; UC04/RF10–RF11; UC05/RF11–RF12. Login e perfil são funções auxiliares. |
| Qual é a arquitetura? | Interface em Next.js com Tailwind; rotas de API e regras em Next.js; Prisma acessa um banco MySQL real. |
| O banco é real ou simulado? | Real. Prisma Studio mostra as tabelas, e os registros permanecem após atualizar ou reiniciar a aplicação. `.local` ou o volume Docker guardam os dados, dependendo do modo de execução. |
| Como a senha é protegida? | `bcryptjs` gera um hash em `User.passwordHash`. Login compara a senha digitada com esse hash. A sessão fica em `Session` e usa cookie HTTP-only. |
| De onde vêm os exercícios? | Da tabela `Exercise`, preenchida por um seed idempotente com quinze exercícios. O gerador consulta esses registros antes de selecionar os compatíveis. |
| Existe inteligência artificial na geração? | Não. As prioridades por objetivo e os volumes por nível/frequência estão em regras determinísticas no código. |
| Como cada dado do perfil muda o treino? | Objetivo filtra/prioriza categorias; nível limita exercícios e define séries/descanso; frequência soma um exercício quando é 1–2 dias ou subtrai um quando é 5–7 dias. |
| O que acontece se faltar perfil ou exercício compatível? | O sistema não gera o treino; pede para completar o perfil ou orienta a procurar o treinador se não encontrar combinação possível. |
| Como evitam registrar treino de outro aluno? | A API obtém o usuário pela sessão e verifica se `Workout.userId` pertence a ele. Não aceita um `userId` enviado pela tela. |
| O que é salvo ao concluir o treino? | Uma linha em `WorkoutLog` com usuário, treino, data, duração, esforço e observação. O plano original permanece em `Workout`. |
| Como são calculados os indicadores? | A página consulta os `WorkoutLog` do usuário e calcula contagem, soma dos minutos, médias e contagens nos últimos 7 e 30 dias. |
| O que acontece com zero ou um registro? | Zero: estado vazio. Um: indicadores básicos e aviso de que ainda não há dados para identificar tendência. Dois ou mais: indicadores e histórico normalmente. |
| Calorias são um valor exato? | Não. São uma estimativa com duração, peso e 5,8 MET como referência para boxe no saco; a página mostra essa limitação. |
| Como funciona o peso? | O peso inicial vem do perfil. Com objetivo emagrecimento, novas pesagens são salvas em `WeightLog` por data; o peso mais recente atualiza `Profile.weightKg`. |
| O site está hospedado no GitHub? | O GitHub hospeda o código. Para usar o sistema é preciso executar o projeto com MySQL conforme o README; o link do repositório não é um site em produção. |

## Conferência final antes de enviar

- Cada integrante consegue dizer seu **UC**, os **RFs**, a **regra**, a **validação** e a **tabela** sem ler o código.
- O vídeo mostra cadastro válido e inválido, e-mail repetido, treino gerado, registro válido e inválido, evolução e uma pesagem.
- `User`, `Profile`, `Exercise`, `Workout`, `WorkoutExercise`, `WorkoutLog` e `WeightLog` aparecem no Prisma Studio quando forem citadas.
- Não afirmem que calorias são medidas ou que uma mudança de peso foi causada pelo treino. São dados registrados e uma estimativa simples.
- Não digam que o site está publicado só porque o código está no GitHub. Enviem o link do repositório junto com este roteiro e o README.
