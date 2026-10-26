# Atualização do projeto — versão 2

> A demonstração pública pronta para apresentação está documentada em [GITHUB_PAGES.md](GITHUB_PAGES.md).

Esta atualização melhora a experiência de uso sem alterar os quatro casos de uso principais. O cadastro, a geração do treino, o registro da realização e a evolução continuam usando o banco MySQL. As mudanças foram feitas a partir de dificuldades percebidas na primeira versão: pouca orientação entre as etapas, ausência de apoio durante a execução do treino e indicadores apresentados apenas como números.

## O que foi atualizado

| Antes | Atualização | Benefício para o aluno |
| --- | --- | --- |
| Painel mostrava apenas o próximo passo | Meta semanal com barra de progresso, minutos da semana e últimas atividades | O aluno entende rapidamente o que já fez e o que falta |
| Treino era uma lista estática | Modo treino guiado com checklist, progresso e cronômetro | Facilita acompanhar a sessão sem perder a ordem dos exercícios |
| Evolução mostrava somente cartões numéricos | Gráfico dos minutos nos últimos 7 dias e tendência de peso | A mudança ao longo do tempo fica mais fácil de interpretar |
| Treinos antigos não apareciam juntos | Histórico dos quatro treinos gerados mais recentes | O aluno pode reabrir um plano anterior |
| Navegação simples e pouco adaptada ao celular | Menu com página ativa, navegação móvel fixa e hierarquia visual melhor | Reduz dúvidas sobre onde o aluno está |
| Formulários tinham pouca orientação | Exemplos, explicações, agrupamento dos campos e opção de mostrar senha | Cadastro e preenchimento ficam mais claros |

## Nova função: modo treino guiado

O modo guiado aparece na página de cada treino e possui:

- checklist individual para cada exercício;
- barra com a porcentagem concluída;
- destaque do exercício atual;
- cronômetro com iniciar, pausar, reiniciar e resetar;
- botão para concluir e avançar para o próximo exercício;
- mensagem de conclusão quando todos forem marcados.

O checklist e o cronômetro ajudam apenas durante a sessão e ficam no navegador. O registro oficial continua sendo salvo em `WorkoutLog` pelo formulário “Como foi o treino?”. Essa separação evita gravar no banco um treino que o usuário apenas marcou por engano durante a execução.

## Como demonstrar a atualização ao professor

### 1. Mostrar o painel

Fala sugerida:

> “Na primeira versão, o painel apenas indicava a próxima etapa. Agora ele também mostra a meta semanal, a porcentagem cumprida, os minutos treinados e as últimas atividades. A meta vem da frequência que o aluno informou no perfil, e os resultados vêm dos registros de treino no MySQL.”

Mostre a barra “Meta semanal” e explique que um perfil com frequência de três dias terá meta de três treinos. Depois de registrar uma realização, a barra passa para 1 de 3.

### 2. Mostrar a página de geração

Fala sugerida:

> “A página de geração agora explica de forma visual quais dados serão utilizados e como o treino é montado. Também incluímos um histórico dos últimos treinos gerados, com quantidade de exercícios e registros.”

Mostre os três cartões do perfil, gere um novo treino e depois volte para confirmar que o novo item aparece no histórico.

### 3. Demonstrar o modo treino guiado

Fala sugerida:

> “A principal função nova é o modo treino guiado. O aluno marca os exercícios concluídos, acompanha a porcentagem e usa o cronômetro para controlar a rodada. Isso resolve o problema de precisar memorizar a sequência enquanto treina.”

Marque o primeiro exercício, inicie e pause o cronômetro e use “Concluir e avançar”. Explique que o checklist é um apoio temporário; a realização só entra nas estatísticas depois de usar o formulário de registro.

### 4. Registrar e mostrar os gráficos

Fala sugerida:

> “Depois de registrar duração e esforço, o painel semanal é atualizado. Na evolução, além dos indicadores que já existiam, agora há um gráfico de minutos dos últimos sete dias e uma linha com a tendência das pesagens.”

Registre um treino de 35 minutos, abra “Evolução” e aponte a barra do dia atual. Para a linha de peso ficar mais clara, cadastre pesagens em duas datas diferentes.

### 5. Mostrar a adaptação ao celular

Fala sugerida:

> “Também reorganizamos toda a interface. Em telas menores, o menu continua visível com as quatro áreas principais. Os formulários agora explicam o objetivo de cada campo, e a página ativa fica destacada.”

Se possível, reduza a largura do navegador para mostrar o menu móvel e os cartões reorganizados em uma coluna.

## Relação com os casos de uso

- **UC01 — Cadastrar aluno:** formulário mais claro, senha visível sob escolha do usuário e mensagens de erro destacadas.
- **UC03 — Gerar treinamento:** perfil resumido, explicação do processo e histórico de treinos gerados.
- **UC04 — Registrar treinamento:** modo guiado antes do registro e formulário de finalização reorganizado.
- **UC05 — Acompanhar evolução:** meta semanal, gráficos de minutos e peso, além das métricas existentes.

## Verificações realizadas

- `npm run lint`: análise de qualidade sem erros;
- `npm run build`: compilação de produção concluída;
- `npm run smoke:test`: UC01, UC03, UC04 e UC05 verificados com MySQL;
- teste visual no navegador: login, perfil, geração, cronômetro, checklist, registro e gráficos.

