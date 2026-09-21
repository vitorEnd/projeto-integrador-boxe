# Roteiro de apresentação (cerca de 6 minutos)

1. **Abertura (30 s).** Apresentar o objetivo do sistema e os quatro casos de uso. Mostrar rapidamente que o aplicativo usa Next.js e MySQL.
2. **Cadastro (1 min).** Em `/cadastro`, mostrar a validação de um campo vazio. Cadastrar uma conta, tentar repetir o e-mail e entrar com a conta criada. No Prisma Studio, abrir `User` e apontar o hash da senha.
3. **Geração (1 min e 30 s).** Preencher `/perfil` com idade, altura, peso, nível iniciante, objetivo emagrecimento e frequência de três dias. Gerar um treino. Na tela, mostrar objetivo, nível, frequência e exercícios. Explicar que o objetivo escolhe categorias, o nível altera séries/descanso e a frequência altera o tamanho da sessão. No Studio, mostrar `Profile`, `Exercise`, `Workout` e `WorkoutExercise`.
4. **Registro (1 min).** No treino, testar uma duração inválida. Depois registrar data, duração e esforço válidos. Mostrar a confirmação e a nova linha em `WorkoutLog`.
5. **Evolução (1 min).** Abrir `/evolucao` e mostrar os indicadores, as calorias estimadas e o histórico. Explicar que calorias são apenas uma estimativa com duração e peso. Registrar uma nova pesagem e mostrar a mudança no histórico de peso e em `WeightLog` no Studio. Com um único treino, mostrar o aviso de dados insuficientes para tendência.
6. **Fechamento (30 s).** Atualizar a página e abrir novamente o Prisma Studio para confirmar que os dados continuam no banco.
