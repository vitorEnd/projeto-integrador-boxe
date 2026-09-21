# Entrega

Este projeto atende aos quatro casos de uso selecionados para a apresentação. A interface e as rotas de API foram feitas em Next.js; o Prisma faz a leitura e a gravação no MySQL.

| Caso de uso | Requisitos | Onde mostrar | Banco de dados |
| --- | --- | --- | --- |
| UC01 — Cadastrar usuário | RF01 | `/cadastro` | `User` |
| UC03 — Gerar treinamento | RF04 a RF09 | `/perfil`, `/treinos/gerar`, `/treinos/[id]` | Lê `Profile` e `Exercise`; grava `Workout` e `WorkoutExercise` |
| UC04 — Registrar treinamento | RF10 e RF11 | `/treinos/[id]` | Lê `Workout`; grava `WorkoutLog` |
| UC05 — Acompanhar evolução | RF11 e RF12 | `/evolucao` | Consulta `WorkoutLog` e `WeightLog`; novas pesagens são gravadas em `WeightLog` |

## Regras e validações

- **Cadastro:** nome, e-mail e senha são obrigatórios. O e-mail precisa ser válido e único. A senha tem no mínimo oito caracteres e é salva com hash.
- **Geração:** exige login e perfil preenchido. O objetivo define as categorias de exercícios buscadas no banco; o nível define séries e descanso; a frequência semanal ajusta a quantidade de exercícios. Se faltarem exercícios compatíveis, nenhum treino é criado.
- **Registro:** o treino precisa pertencer ao aluno conectado. A data deve ser válida, a duração deve ser positiva e o esforço deve estar entre 1 e 10.
- **Evolução:** os indicadores usam somente registros do aluno conectado. São exibidos totais, médias, últimos 7 e 30 dias, histórico e calorias estimadas. Com zero registros há um aviso; com apenas um, o sistema informa que ainda não dá para observar uma tendência. Para o objetivo emagrecimento, cada pesagem tem data e peso; uma nova pesagem na mesma data corrige a anterior.

As calorias são uma estimativa: `5,8 × 3,5 × peso (kg) × duração (min) / 200`, arredondada. O valor 5,8 MET corresponde a boxe no saco no [Compêndio de Atividades Físicas](https://pacompendium.com/sports/); a fórmula consta no [material do ACE](https://www.acefitness.org/continuingeducation/courses/support_items/OLC-MATH-10/coursecontent.pdf). O sistema não mede o gasto real de cada pessoa.

## Execução

No Windows: `npm install`, `npm run demo`. Com Docker, veja os comandos no [README.md](README.md). Para conferir as tabelas durante a apresentação, execute `npm run db:studio`.

## Verificação

O comando `npm run smoke:test` percorre cadastro, login, perfil, geração, registro, pesagens e evolução usando o MySQL. Também verifica e-mail duplicado, senha com hash, tentativa de gerar treino sem perfil e bloqueio de registro em treino de outro aluno. As contas criadas durante o teste são removidas ao final. `npm run lint` e `npm run build` também foram executados.
