# Demonstração no GitHub Pages

## Link para apresentar

https://vitorend.github.io/projeto-integrador-boxe/

O endereço abre diretamente o protótipo. O site possui duas formas de uso:

1. **Acessar conta de demonstração:** opção recomendada para a apresentação. O perfil, os treinos, três realizações e quatro pesagens já estão preenchidos.
2. **Criar conta:** permite demonstrar desde o cadastro, preenchimento do perfil e geração do primeiro treino.

## Roteiro rápido para o integrante que apresentar

1. Abra o link em um navegador.
2. Clique em **Acessar conta de demonstração**.
3. No painel, mostre a meta semanal, as etapas concluídas e as últimas atividades.
4. Abra **Treinos** e escolha o treino marcado como atual.
5. Marque um exercício, inicie e pause o cronômetro e use **Concluir e avançar**.
6. Preencha duração e esforço em **Como foi o treino?** e salve.
7. Em **Evolução**, mostre os indicadores, o gráfico de minutos, a linha de peso e o histórico.
8. Se quiser começar novamente, volte ao painel e clique em **Restaurar demonstração**.

## Dados da conta pronta

- E-mail: `aluno@demo.com`
- Senha: `boxe1234`

O botão da tela inicial entra automaticamente, então não é necessário digitar esses dados.

## Diferença entre as duas versões

O GitHub Pages publica somente arquivos estáticos. Ele não executa o servidor do Next.js, as rotas de API ou o MySQL. Por isso:

- a demonstração pública usa `localStorage` e guarda os dados no navegador do visitante;
- o código da demonstração fica em `index.html`, `pages-style.css` e `pages-app.js`;
- a aplicação acadêmica completa continua em `src/` e usa Next.js, Prisma e MySQL;
- para provar a persistência real no MySQL, execute localmente `npm run demo` e `npm run db:studio`.

Os dados do GitHub Pages não são enviados para um servidor. Não use uma senha pessoal ao criar uma conta na demonstração.

## Configuração do GitHub Pages

O repositório deve usar:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/ (root)`

O arquivo `index.html` na raiz faz o GitHub Pages abrir o protótipo em vez de renderizar o README.
