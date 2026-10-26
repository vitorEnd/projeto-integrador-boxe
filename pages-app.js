(function () {
  "use strict";

  const STORAGE_KEY = "boxing-pages-demo-v3";
  const DEMO_EMAIL = "aluno@demo.com";
  const labels = {
    INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado",
    EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa",
    CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica",
    AQUECIMENTO: "Aquecimento", CARDIO: "Cardio", FORCA: "Força", CORE: "Core", MOBILIDADE: "Mobilidade",
  };
  const exercises = [
    { id: 1, name: "Polichinelos", description: "Aquecimento coordenado de braços e pernas.", category: "AQUECIMENTO", goals: ["EMAGRECIMENTO", "CONDICIONAMENTO", "TECNICA", "GANHO_MASSA"] },
    { id: 2, name: "Mobilidade de ombros", description: "Movimentos controlados para preparar as articulações.", category: "MOBILIDADE", goals: ["CONDICIONAMENTO", "TECNICA"] },
    { id: 3, name: "Corrida estacionária", description: "Correr no lugar em ritmo controlado.", category: "CARDIO", goals: ["EMAGRECIMENTO", "CONDICIONAMENTO"] },
    { id: 4, name: "Mountain climber", description: "Alternar joelhos em posição de prancha.", category: "CARDIO", goals: ["EMAGRECIMENTO", "CONDICIONAMENTO"] },
    { id: 5, name: "Pular corda", description: "Saltos curtos e constantes com coordenação.", category: "CARDIO", goals: ["EMAGRECIMENTO", "CONDICIONAMENTO"] },
    { id: 6, name: "Shadowboxing", description: "Movimentos de boxe sem contato, com foco na postura.", category: "TECNICA", goals: ["EMAGRECIMENTO", "CONDICIONAMENTO", "TECNICA"] },
    { id: 7, name: "Jab e direto no saco", description: "Alternar golpes retos com controle e retorno da guarda.", category: "TECNICA", goals: ["EMAGRECIMENTO", "TECNICA", "CONDICIONAMENTO"] },
    { id: 8, name: "Esquiva lateral", description: "Treinar deslocamento do tronco e retorno à base.", category: "TECNICA", goals: ["TECNICA", "CONDICIONAMENTO"] },
    { id: 9, name: "Flexão de braços", description: "Fortalecimento de peito, ombros e tríceps.", category: "FORCA", goals: ["GANHO_MASSA", "CONDICIONAMENTO"] },
    { id: 10, name: "Agachamento", description: "Fortalecimento de pernas com coluna neutra.", category: "FORCA", goals: ["GANHO_MASSA", "EMAGRECIMENTO", "CONDICIONAMENTO"] },
    { id: 11, name: "Prancha", description: "Sustentar o tronco alinhado e o abdômen contraído.", category: "CORE", goals: ["EMAGRECIMENTO", "GANHO_MASSA", "CONDICIONAMENTO"] },
    { id: 12, name: "Abdominal bicicleta", description: "Alternar cotovelo e joelho opostos.", category: "CORE", goals: ["EMAGRECIMENTO", "GANHO_MASSA", "CONDICIONAMENTO"] },
    { id: 13, name: "Alongamento de quadril", description: "Mobilidade leve para a recuperação após a sessão.", category: "MOBILIDADE", goals: ["TECNICA", "CONDICIONAMENTO"] },
  ];
  const priorities = {
    EMAGRECIMENTO: ["CARDIO", "TECNICA", "CORE", "FORCA", "AQUECIMENTO"],
    GANHO_MASSA: ["FORCA", "CORE", "TECNICA", "AQUECIMENTO"],
    CONDICIONAMENTO: ["CARDIO", "TECNICA", "MOBILIDADE", "AQUECIMENTO", "CORE"],
    TECNICA: ["TECNICA", "AQUECIMENTO", "MOBILIDADE", "CORE"],
  };
  const volume = {
    INICIANTE: { count: 4, sets: 2, rest: 90 },
    INTERMEDIARIO: { count: 5, sets: 3, rest: 60 },
    AVANCADO: { count: 6, sets: 4, rest: 45 },
  };

  const app = document.getElementById("app");
  const toastElement = document.getElementById("toast");
  let toastTimer = null;
  let state = loadState();
  let session = { workoutId: null, activeIndex: 0, secondsLeft: 60, running: false, completed: new Set() };

  function dateDaysAgo(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  function makePlan(profile) {
    const rule = volume[profile.experience] || volume.INICIANTE;
    const targetCount = Math.max(3, rule.count + (profile.frequencyDays <= 2 ? 1 : profile.frequencyDays >= 5 ? -1 : 0));
    const allowed = exercises.filter((exercise) => exercise.goals.includes(profile.goal));
    const ordered = priorities[profile.goal].flatMap((category) => allowed.filter((exercise) => exercise.category === category));
    const unique = [...new Map(ordered.map((exercise) => [exercise.id, exercise])).values()].slice(0, targetCount);
    return unique.map((exercise, index) => ({
      ...exercise, order: index + 1, sets: rule.sets,
      reps: ["FORCA", "CORE", "TECNICA"].includes(exercise.category) ? "10 a 12" : null,
      durationSeconds: ["CARDIO", "AQUECIMENTO", "MOBILIDADE"].includes(exercise.category) ? 60 : null,
      restSeconds: rule.rest,
      notes: exercise.category === "TECNICA" ? "Priorize a execução correta." : "",
    }));
  }

  function initialState() {
    const profile = { age: 24, heightCm: 178, weightKg: 78.4, experience: "INICIANTE", goal: "EMAGRECIMENTO", frequencyDays: 3 };
    const plan = makePlan(profile);
    return {
      currentUserId: null,
      users: [{
        id: "demo", name: "Aluno Demonstração", email: DEMO_EMAIL, password: "boxe1234", profile,
        workouts: [
          { id: 102, createdAt: dateDaysAgo(1), ...profile, exercises: plan },
          { id: 101, createdAt: dateDaysAgo(12), ...profile, exercises: plan },
        ],
        logs: [
          { id: 1, workoutId: 101, performedAt: dateDaysAgo(13), durationMinutes: 28, perceivedEffort: 5, notes: "Primeiro treino registrado." },
          { id: 2, workoutId: 101, performedAt: dateDaysAgo(6), durationMinutes: 32, perceivedEffort: 6, notes: "Mais ritmo nos golpes." },
          { id: 3, workoutId: 102, performedAt: dateDaysAgo(1), durationMinutes: 35, perceivedEffort: 6, notes: "Treino completo." },
        ],
        weights: [
          { id: 1, recordedOn: dateDaysAgo(35), weightKg: 80.2 },
          { id: 2, recordedOn: dateDaysAgo(21), weightKg: 79.5 },
          { id: 3, recordedOn: dateDaysAgo(7), weightKg: 78.9 },
          { id: 4, recordedOn: dateDaysAgo(0), weightKg: 78.4 },
        ],
      }],
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.users)) return saved;
    } catch { /* Começa com dados seguros de demonstração. */ }
    const fresh = initialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function currentUser() { return state.users.find((user) => user.id === state.currentUserId) || null; }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }
  function formatDate(value) { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"); }
  function formatWeight(value) { return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`; }
  function routeName() { return (location.hash.replace(/^#\/?/, "") || "login").split("?")[0]; }
  function navigate(route) { location.hash = `#/${route}`; }
  function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove("show"), 3200);
  }
  function getFormObject(form) { return Object.fromEntries(new FormData(form).entries()); }
  function firstName(name) { return String(name).trim().split(/\s+/)[0]; }
  function latestWeight(user) { return [...(user.weights || [])].sort((a, b) => a.recordedOn.localeCompare(b.recordedOn)).at(-1)?.weightKg || user.profile?.weightKg || null; }
  function estimateCalories(minutes, weight) { return weight ? Math.round((5.8 * 3.5 * weight / 200) * minutes) : 0; }

  function shell(content, user, route) {
    const protectedLinks = [
      ["dashboard", "Início"], ["treinos", "Treinos"], ["evolucao", "Evolução"], ["perfil", "Perfil"],
    ];
    const nav = user ? `
      <div class="nav-links">${protectedLinks.map(([href, title]) => `<a class="nav-link ${route.startsWith(href) || (href === "treinos" && route.startsWith("treino/")) ? "active" : ""}" href="#/${href}">${title}</a>`).join("")}</div>
      <div class="nav-user"><span>Olá, <strong>${escapeHtml(firstName(user.name))}</strong></span><button class="btn btn-ghost" data-action="logout">Sair</button></div>` : `
      <div class="row"><a class="btn btn-ghost" href="#/login">Entrar</a><a class="btn" href="#/cadastro">Criar conta</a></div>`;
    return `<header class="topbar"><nav class="nav" aria-label="Navegação principal"><a class="brand" href="#/${user ? "dashboard" : "login"}"><span class="brand-mark">B</span><span>BOXING</span></a>${nav}</nav></header>
      <main class="main">${content}</main>
      <footer class="footer"><div class="footer-inner"><span>Boxing · plataforma de apoio ao treinamento</span><span>Versão demonstrativa para GitHub Pages · dados salvos neste navegador</span></div></footer>`;
  }

  function renderLogin() {
    return `<div class="card auth-layout">
      <aside class="auth-aside"><div><p class="eyebrow" style="color:#fecaca">Seu ritmo. Seu progresso.</p><h2>Treine com direção e acompanhe cada conquista.</h2><p>Uma rotina simples para montar o treino, registrar a sessão e enxergar a evolução.</p></div><ul class="auth-list"><li><span class="auth-check">✓</span>Treinos adaptados ao objetivo e experiência</li><li><span class="auth-check">✓</span>Modo guiado com checklist e cronômetro</li><li><span class="auth-check">✓</span>Histórico, calorias e evolução do peso</li></ul></aside>
      <section class="auth-form"><p class="eyebrow">Bem-vindo</p><h1>Entre na sua conta</h1><p class="muted">Acesse seus treinos e continue de onde parou.</p>
        <div class="demo-box"><p><strong>Demonstração pronta:</strong> abra uma conta já preenchida para apresentar todas as telas.</p><button class="btn btn-secondary btn-full" type="button" data-action="demo-login">Acessar conta de demonstração →</button></div>
        <form class="stack" data-form="login"><label class="field">E-mail<input name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required /></label><label class="field">Senha<span class="row"><input name="password" type="password" autocomplete="current-password" placeholder="Sua senha" required /><button class="btn btn-secondary" type="button" data-action="toggle-password">Mostrar</button></span></label><div class="form-error"></div><button class="btn btn-full" type="submit">Entrar →</button></form>
        <p class="form-note">Ainda não possui conta? <a class="link" href="#/cadastro">Cadastre-se</a></p><p class="form-note">Nesta demonstração, não use uma senha pessoal. Os dados ficam apenas neste navegador.</p>
      </section></div>`;
  }

  function renderCadastro() {
    return `<div class="card auth-layout"><aside class="auth-aside"><div><p class="eyebrow" style="color:#fecaca">Primeiro passo</p><h2>Seu treino começa com um cadastro simples.</h2><p>Depois do acesso, o perfil orienta a geração do plano.</p></div><ul class="auth-list"><li><span class="auth-check">1</span>Crie sua conta</li><li><span class="auth-check">2</span>Complete o perfil</li><li><span class="auth-check">3</span>Gere seu treino</li></ul></aside>
      <section class="auth-form"><p class="eyebrow">Comece agora</p><h1>Crie sua conta</h1><p class="muted">São apenas três dados para iniciar.</p><form class="stack" data-form="register"><label class="field">Nome completo<input name="name" maxlength="100" autocomplete="name" placeholder="Como podemos chamar você?" required /></label><label class="field">E-mail<input name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required /></label><label class="field">Senha<small>Mínimo de 8 caracteres. Não use uma senha pessoal nesta demonstração.</small><span class="row"><input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="Crie uma senha" required /><button class="btn btn-secondary" type="button" data-action="toggle-password">Mostrar</button></span></label><div class="form-error"></div><button class="btn btn-full" type="submit">Criar minha conta →</button></form><p class="form-note">Já possui uma conta? <a class="link" href="#/login">Entrar</a></p></section></div>`;
  }

  function renderDashboard(user) {
    const profile = user.profile;
    const latest = user.workouts.at(0);
    const logs = user.logs || [];
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const weekLogs = logs.filter((log) => new Date(`${log.performedAt}T12:00:00`) >= start);
    const minutes = weekLogs.reduce((sum, log) => sum + Number(log.durationMinutes), 0);
    const target = profile?.frequencyDays || 0;
    const percentage = target ? Math.min(100, Math.round(weekLogs.length / target * 100)) : 0;
    const next = !profile ? ["Complete seu perfil", "Leva cerca de um minuto e permite personalizar os treinos.", "perfil", "Preencher perfil"] : !latest ? ["Gere seu primeiro treino", "Seu plano será montado de acordo com objetivo e experiência.", "treinos", "Gerar treinamento"] : logs.length === 0 ? ["Pronto para começar?", "Abra o treino e use o novo modo guiado.", `treino/${latest.id}`, "Iniciar meu treino"] : ["Continue sua sequência", "Faça uma nova sessão ou confira os resultados já registrados.", `treino/${latest.id}`, "Treinar agora"];
    const steps = [
      ["Perfil", !!profile, "perfil", profile ? "Tudo preenchido" : "Informe seus dados"],
      ["Treinamento", !!latest, latest ? `treino/${latest.id}` : "treinos", latest ? `${latest.exercises.length} exercícios` : "Gere seu plano"],
      ["Registro", logs.length > 0, latest ? `treino/${latest.id}` : "treinos", logs.length ? `${logs.length} realizado(s)` : "Registre a sessão"],
      ["Evolução", logs.length > 1, "evolucao", logs.length > 1 ? "Compare os resultados" : "Construa o histórico"],
    ];
    return `<header class="row-between wrap"><div><p class="eyebrow">Painel do aluno</p><h1 class="page-title">Olá, ${escapeHtml(firstName(user.name))} 👋</h1><p class="lead">Seu treino e seu progresso, sem complicação.</p></div>${user.email === DEMO_EMAIL ? `<button class="btn btn-secondary" data-action="reset-demo">Restaurar demonstração</button>` : ""}</header>
      <section class="card hero-card" style="margin-top:28px"><p class="eyebrow" style="color:#fecaca">Seu próximo passo</p><h2>${next[0]}</h2><p>${next[1]}</p><a class="btn" href="#/${next[2]}">${next[3]} →</a></section>
      <div class="section-head"><div><p class="eyebrow">Resumo</p><h2>Esta semana</h2></div><a class="link" href="#/evolucao">Ver evolução →</a></div>
      <section class="grid grid-3"><div class="card card-pad" style="grid-column:span 2"><div class="row-between"><div><span class="metric-label">Meta semanal</span><div class="metric-value">${weekLogs.length} de ${target || "—"} treinos</div></div><span class="circle-progress">${target ? percentage + "%" : "—"}</span></div><div class="progress" style="margin-top:18px"><span style="width:${percentage}%"></span></div><p class="muted" style="font-size:13px;margin-bottom:0">${target ? weekLogs.length >= target ? "Meta cumprida. Excelente consistência!" : `Faltam ${target - weekLogs.length} treino(s) para cumprir sua meta.` : "Complete o perfil para definir sua frequência."}</p></div><div class="card metric"><span class="metric-label">Tempo treinado</span><div class="metric-value">${minutes} <small class="muted">min</small></div><p class="subtle" style="font-size:12px">Registros desta semana</p></div></section>
      <div class="section-head"><div><p class="eyebrow">Jornada</p><h2>Como funciona</h2></div></div><ol class="grid grid-4 steps" style="padding:0;list-style:none">${steps.map((step, index) => `<li><a class="card card-hover step" href="#/${step[2]}"><div class="step-top"><span>ETAPA ${index + 1}</span><span class="step-number ${step[1] ? "done" : ""}">${step[1] ? "✓" : index + 1}</span></div><h3>${step[0]}</h3><p>${step[3]}</p></a></li>`).join("")}</ol>
      <section class="grid grid-2" style="margin-top:16px"><div class="card card-pad"><div class="row-between"><h2 style="margin:0;font-size:18px">Seu perfil</h2><a class="link" href="#/perfil">${profile ? "Editar" : "Completar"}</a></div>${profile ? `<div class="row wrap" style="margin-top:15px"><span class="tag">${labels[profile.goal]}</span><span class="tag">${labels[profile.experience]}</span><span class="tag">${profile.frequencyDays}x por semana</span></div>` : `<p class="muted">Informe objetivo e experiência para personalizar o plano.</p>`}</div><div class="card card-pad"><div class="row-between"><h2 style="margin:0;font-size:18px">Últimas atividades</h2><a class="link" href="#/evolucao">Histórico</a></div>${logs.length ? `<ul class="list">${[...logs].sort((a,b) => b.performedAt.localeCompare(a.performedAt)).slice(0,3).map((log) => `<li><span><strong>Treino #${log.workoutId}</strong><br><small class="subtle">${formatDate(log.performedAt)}</small></span><span>${log.durationMinutes} min · esforço ${log.perceivedEffort}</span></li>`).join("")}</ul>` : `<p class="muted">Ao concluir um treino, ele aparecerá aqui.</p>`}</div></section>`;
  }

  function renderPerfil(user) {
    const p = user.profile || {};
    return `<header><p class="eyebrow">Personalização</p><h1 class="page-title">${user.profile ? "Seu perfil" : "Conte um pouco sobre você"}</h1><p class="lead">Estas informações orientam o volume e o tipo de treino. Você pode alterá-las quando sua rotina mudar.</p></header><form class="card card-pad stack" style="max-width:780px;margin-top:28px" data-form="profile"><div><h2 style="margin:0">Dados físicos</h2><p class="muted">Usados nos indicadores e na estimativa de calorias.</p><div class="grid grid-3"><label class="field">Idade<input name="age" type="number" min="1" max="120" value="${escapeHtml(p.age || "")}" placeholder="Ex.: 22" required /></label><label class="field">Altura (cm)<input name="heightCm" type="number" min="1" step="0.1" value="${escapeHtml(p.heightCm || "")}" placeholder="Ex.: 175" required /></label><label class="field">Peso atual (kg)<input name="weightKg" type="number" min="1" max="1000" step="0.1" value="${escapeHtml(p.weightKg || "")}" placeholder="Ex.: 78" required /></label></div></div><hr style="width:100%;border:0;border-top:1px solid var(--line)"><div><h2 style="margin:0">Preferências</h2><p class="muted">Estas escolhas alteram exercícios, séries e descanso.</p><div class="grid grid-2"><label class="field">Nível de experiência<select name="experience"><option value="INICIANTE" ${p.experience === "INICIANTE" ? "selected" : ""}>Iniciante</option><option value="INTERMEDIARIO" ${p.experience === "INTERMEDIARIO" ? "selected" : ""}>Intermediário</option><option value="AVANCADO" ${p.experience === "AVANCADO" ? "selected" : ""}>Avançado</option></select></label><label class="field">Objetivo principal<select name="goal"><option value="EMAGRECIMENTO" ${p.goal === "EMAGRECIMENTO" ? "selected" : ""}>Emagrecimento</option><option value="GANHO_MASSA" ${p.goal === "GANHO_MASSA" ? "selected" : ""}>Ganho de massa</option><option value="CONDICIONAMENTO" ${!p.goal || p.goal === "CONDICIONAMENTO" ? "selected" : ""}>Condicionamento</option><option value="TECNICA" ${p.goal === "TECNICA" ? "selected" : ""}>Técnica</option></select></label><label class="field" style="grid-column:1/-1">Dias de treino por semana<input name="frequencyDays" type="number" min="1" max="7" value="${escapeHtml(p.frequencyDays || 3)}" required /><small>Escolha um valor entre 1 e 7.</small></label></div></div><div class="form-error"></div><button class="btn btn-full" type="submit">${user.profile ? "Salvar alterações" : "Salvar e continuar"} →</button></form>`;
  }

  function renderTreinos(user) {
    const p = user.profile;
    return `<header><p class="eyebrow">Treinamentos</p><h1 class="page-title">Monte seu próximo treino</h1><p class="lead">O sistema combina objetivo, nível e rotina com os exercícios disponíveis.</p></header>${p ? `<section class="grid grid-2" style="margin-top:28px"><div class="card card-pad" style="border-color:rgba(239,68,68,.4)"><div class="row-between"><h2 style="margin:0">Perfil usado</h2><a class="link" href="#/perfil">Editar</a></div><div class="grid grid-3" style="margin-top:18px"><div class="card card-pad" style="box-shadow:none"><span class="metric-label">Objetivo</span><strong style="display:block;margin-top:5px">${labels[p.goal]}</strong></div><div class="card card-pad" style="box-shadow:none"><span class="metric-label">Experiência</span><strong style="display:block;margin-top:5px">${labels[p.experience]}</strong></div><div class="card card-pad" style="box-shadow:none"><span class="metric-label">Frequência</span><strong style="display:block;margin-top:5px">${p.frequencyDays}x por semana</strong></div></div><button class="btn" style="margin-top:20px" data-action="generate">Gerar novo treinamento →</button></div><aside class="card card-pad"><p class="eyebrow" style="color:var(--subtle)">Como funciona</p><ol class="stack" style="padding-left:22px"><li><strong>Seleção</strong><br><small class="muted">Exercícios compatíveis são escolhidos.</small></li><li><strong>Organização</strong><br><small class="muted">Séries e descanso são ajustados.</small></li><li><strong>Execução</strong><br><small class="muted">Checklist e cronômetro ajudam no treino.</small></li></ol></aside></section>` : `<section class="card card-pad" style="max-width:680px;margin-top:28px"><p class="eyebrow" style="color:var(--orange)">Falta uma etapa</p><h2>Complete seu perfil primeiro</h2><p class="muted">Precisamos do objetivo e da experiência para gerar um plano coerente.</p><a class="btn" href="#/perfil">Completar perfil →</a></section>`}
      <div class="section-head"><div><p class="eyebrow">Histórico</p><h2>Treinos gerados</h2></div></div>${user.workouts.length ? `<div class="grid grid-2">${user.workouts.map((workout, index) => `<a class="card card-pad card-hover row-between" href="#/treino/${workout.id}"><span><span class="row"><strong>Treino #${workout.id}</strong>${index === 0 ? `<span class="tag tag-red">Atual</span>` : ""}</span><small class="muted">${workout.exercises.length} exercícios · ${labels[workout.goal]}</small><br><small class="subtle">Criado em ${formatDate(workout.createdAt)}</small></span><span>→</span></a>`).join("")}</div>` : `<div class="empty">Seu primeiro treino aparecerá aqui.</div>`}`;
  }

  function resetSessionFor(workout) {
    if (session.workoutId !== workout.id) session = { workoutId: workout.id, activeIndex: 0, secondsLeft: workout.exercises[0]?.durationSeconds || 60, running: false, completed: new Set() };
  }
  function timerText(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`; }
  function renderTreino(user, id) {
    const workout = user.workouts.find((item) => String(item.id) === String(id));
    if (!workout) return `<div class="empty"><h1>Treino não encontrado</h1><a class="btn" href="#/treinos">Voltar aos treinos</a></div>`;
    resetSessionFor(workout);
    const active = workout.exercises[session.activeIndex];
    const progress = Math.round(session.completed.size / workout.exercises.length * 100);
    const estimated = Math.max(1, Math.round(workout.exercises.reduce((sum, item) => sum + item.sets * (item.durationSeconds || 60) + (item.sets - 1) * item.restSeconds, 0) / 60));
    return `<header class="row-between wrap"><div><p class="eyebrow">Treino #${workout.id}</p><h1 class="page-title">Seu treinamento</h1><p class="lead">Siga no seu ritmo e priorize a execução correta.</p></div><div class="card card-pad"><span class="metric-label">Tempo estimado</span><strong style="display:block">~${estimated} minutos</strong></div></header>
      <section class="card card-pad grid grid-4" style="margin-top:24px"><div><span class="metric-label">Objetivo</span><strong style="display:block">${labels[workout.goal]}</strong></div><div><span class="metric-label">Nível</span><strong style="display:block">${labels[workout.experience]}</strong></div><div><span class="metric-label">Frequência</span><strong style="display:block">${workout.frequencyDays} dias/semana</strong></div><div><span class="metric-label">Criado em</span><strong style="display:block">${formatDate(workout.createdAt)}</strong></div></section>
      <div class="section-head"><div><p class="eyebrow">Modo guiado</p><h2>Execute passo a passo</h2><p class="muted" style="margin:3px 0">O checklist fica apenas nesta sessão.</p></div><div style="min-width:210px;text-align:right"><strong id="progress-label">${session.completed.size} de ${workout.exercises.length} concluídos</strong><div class="progress" style="margin-top:8px"><span id="workout-progress" style="width:${progress}%"></span></div></div></div>
      <section class="workout-layout"><ol class="exercise-list">${workout.exercises.map((item, index) => `<li class="exercise ${index === session.activeIndex ? "active" : ""} ${session.completed.has(item.id) ? "done" : ""}" data-exercise-card="${item.id}"><button class="check ${session.completed.has(item.id) ? "checked" : ""}" data-action="toggle-exercise" data-id="${item.id}" aria-label="Marcar ${escapeHtml(item.name)} como concluído">✓</button><div class="exercise-body" data-action="select-exercise" data-id="${item.id}"><div class="exercise-title"><span class="exercise-index">${String(item.order).padStart(2,"0")}</span><h3>${escapeHtml(item.name)}</h3><span class="tag">${labels[item.category]}</span></div><p>${escapeHtml(item.description)}</p><p class="prescription">${item.sets} séries · ${item.reps ? item.reps + " repetições" : item.durationSeconds + " segundos"} · descanso de ${item.restSeconds}s</p>${item.notes ? `<p style="color:#fdba74">Dica: ${item.notes}</p>` : ""}</div></li>`).join("")}</ol>
        <aside class="card timer-card"><p class="eyebrow" style="color:var(--subtle)">Exercício atual</p><h3 id="timer-exercise">${escapeHtml(active.name)}</h3><p class="muted" style="font-size:13px">Controle a execução ou uma rodada.</p><div class="timer" id="timer-value">${timerText(session.secondsLeft)}</div><div class="timer-actions"><button class="btn" data-action="timer-toggle" id="timer-toggle">${session.running ? "Pausar" : session.secondsLeft === 0 ? "Reiniciar" : "Iniciar"}</button><button class="btn btn-secondary" data-action="timer-reset">Resetar</button></div><button class="btn btn-ghost btn-full" style="margin-top:8px" data-action="complete-next">${session.completed.has(active.id) ? "Ir para o próximo" : "Concluir e avançar →"}</button>${progress === 100 ? `<div class="alert alert-success" style="margin-top:14px">Treino concluído! Registre a sessão abaixo.</div>` : ""}</aside></section>
      <form class="card card-pad stack" style="margin-top:28px;border-color:rgba(52,211,153,.3)" data-form="complete" data-workout-id="${workout.id}"><div><p class="eyebrow" style="color:var(--green)">Finalização</p><h2 style="margin:5px 0">Como foi o treino?</h2><p class="muted">Este registro alimenta sua meta e os gráficos.</p></div><div class="grid grid-3"><label class="field">Data<input name="performedAt" type="date" max="${dateDaysAgo(0)}" value="${dateDaysAgo(0)}" required /></label><label class="field">Duração (min)<input name="durationMinutes" type="number" min="1" max="1440" placeholder="Ex.: 35" required /></label><label class="field">Esforço percebido<select name="perceivedEffort" required><option value="">Selecione</option>${Array.from({length:10},(_,i)=>i+1).map(value => `<option value="${value}">${value} — ${value <= 3 ? "leve" : value <= 6 ? "moderado" : value <= 8 ? "intenso" : "máximo"}</option>`).join("")}</select></label></div><label class="field">Observação (opcional)<textarea name="notes" maxlength="500" placeholder="Ex.: Senti mais facilidade nos golpes."></textarea></label><div class="form-error"></div><button class="btn" type="submit">Salvar treino realizado</button></form>`;
  }

  function chartDays(logs) {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setHours(12,0,0,0); date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0,10);
      return { key, label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""), minutes: logs.filter((log) => log.performedAt === key).reduce((sum, log) => sum + Number(log.durationMinutes), 0) };
    });
  }
  function weightSvg(weights) {
    if (!weights.length) return `<div class="empty" style="margin-top:18px">Registre pesagens para visualizar a tendência.</div>`;
    const recent = [...weights].sort((a,b) => a.recordedOn.localeCompare(b.recordedOn)).slice(-8);
    const values = recent.map((item) => Number(item.weightKg)); const min = Math.min(...values); const max = Math.max(...values); const range = Math.max(1, max - min);
    const points = recent.map((item,index) => ({ ...item, x: recent.length === 1 ? 280 : 28 + index * 504 / (recent.length - 1), y: 145 - (Number(item.weightKg) - min) / range * 105 }));
    return `<svg class="weight-chart" viewBox="0 0 560 180" role="img" aria-label="Tendência das pesagens"><defs><linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb923c" stop-opacity=".35"/><stop offset="1" stop-color="#fb923c" stop-opacity="0"/></linearGradient></defs>${points.length > 1 ? `<polygon points="28,160 ${points.map(p=>p.x+","+p.y).join(" ")} 532,160" fill="url(#weightArea)"/><polyline points="${points.map(p=>p.x+","+p.y).join(" ")}" fill="none" stroke="#fb923c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` : ""}${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="6" fill="#09090b" stroke="#fb923c" stroke-width="3"/><text x="${p.x}" y="177" fill="#71717a" font-size="11" text-anchor="middle">${p.recordedOn.slice(5).split("-").reverse().join("/")}</text>`).join("")}</svg>`;
  }
  function renderEvolucao(user) {
    const logs = [...(user.logs || [])].sort((a,b) => b.performedAt.localeCompare(a.performedAt));
    const weights = [...(user.weights || [])].sort((a,b) => a.recordedOn.localeCompare(b.recordedOn));
    const minutes = logs.reduce((sum, log) => sum + Number(log.durationMinutes), 0);
    const effort = logs.reduce((sum, log) => sum + Number(log.perceivedEffort), 0);
    const weight = latestWeight(user);
    const calories = logs.reduce((sum, log) => sum + estimateCalories(Number(log.durationMinutes), weight), 0);
    const days = chartDays(logs); const maxMinutes = Math.max(1, ...days.map(day => day.minutes));
    const first = weights[0]; const last = weights.at(-1); const change = first && last ? Number(last.weightKg) - Number(first.weightKg) : 0;
    return `<header><p class="eyebrow">Acompanhamento</p><h1 class="page-title">Sua evolução</h1><p class="lead">Veja treinos, consistência e peso em um só lugar.</p></header>
      <section class="grid grid-3 metrics-grid" style="margin-top:28px"><div class="card metric"><span class="metric-label">Treinos realizados</span><div class="metric-value">${logs.length}</div></div><div class="card metric metric-accent"><span class="metric-label">Calorias (estimativa)</span><div class="metric-value">${calories} kcal</div></div><div class="card metric"><span class="metric-label">Minutos treinados</span><div class="metric-value">${minutes}</div></div><div class="card metric"><span class="metric-label">Média de duração</span><div class="metric-value">${logs.length ? Math.round(minutes/logs.length) + " min" : "—"}</div></div><div class="card metric"><span class="metric-label">Média de esforço</span><div class="metric-value">${logs.length ? (effort/logs.length).toFixed(1) + " / 10" : "—"}</div></div><div class="card metric"><span class="metric-label">Peso mais recente</span><div class="metric-value">${weight ? formatWeight(weight) : "—"}</div></div></section>
      <div class="section-head"><div><p class="eyebrow">Visão rápida</p><h2>Seus dados em gráficos</h2></div></div><section class="grid grid-2"><div class="card card-pad"><div class="row-between"><span><strong>Minutos nos últimos 7 dias</strong><br><small class="subtle">Treinos registrados por dia</small></span><span class="tag tag-red">${days.reduce((sum,day)=>sum+day.minutes,0)} min</span></div><div class="bar-chart">${days.map(day=>`<div class="bar-item"><span class="bar-value">${day.minutes || ""}</span><span class="bar ${day.minutes ? "has-value" : ""}" style="height:${day.minutes ? Math.max(12, day.minutes/maxMinutes*125) : 4}px"></span><span class="bar-label">${day.label}</span></div>`).join("")}</div></div><div class="card card-pad"><div class="row-between"><span><strong>Tendência de peso</strong><br><small class="subtle">Até 8 pesagens recentes</small></span>${last ? `<span class="tag" style="color:#fdba74;background:rgba(251,146,60,.12)">${formatWeight(last.weightKg)}</span>` : ""}</div>${weightSvg(weights)}</div></section>
      ${user.profile?.goal === "EMAGRECIMENTO" ? `<section class="card card-pad" style="margin-top:22px" id="peso"><div class="row-between wrap"><div><h2 style="margin:0">Acompanhar peso</h2><p class="muted">Uma pesagem por data; repetir a data atualiza o valor.</p></div>${last ? `<div class="tag">Atual: ${formatWeight(last.weightKg)}</div>` : ""}</div><form class="grid grid-3" data-form="weight"><label class="field">Data<input name="recordedOn" type="date" max="${dateDaysAgo(0)}" value="${dateDaysAgo(0)}" required></label><label class="field">Peso (kg)<input name="weightKg" type="number" min="1" max="1000" step="0.1" placeholder="Ex.: 78,5" required></label><button class="btn" style="align-self:end" type="submit">Registrar peso</button><div class="form-error"></div></form>${weights.length > 1 ? `<p class="muted">Mudança desde a primeira pesagem: <strong style="color:white">${change > 0 ? "+" : ""}${formatWeight(change)}</strong></p>` : ""}<ul class="list">${[...weights].reverse().slice(0,8).map(item=>`<li><span>${formatDate(item.recordedOn)}</span><strong>${formatWeight(item.weightKg)}</strong></li>`).join("")}</ul></section>` : ""}
      <div class="section-head"><div><p class="eyebrow">Registros</p><h2>Histórico de treinamentos</h2></div></div>${logs.length ? `<div class="stack">${logs.map(log=>`<article class="card card-pad row-between wrap"><div><strong>Treino #${log.workoutId} · ${formatDate(log.performedAt)}</strong><p class="muted" style="margin:4px 0">${log.durationMinutes} min · esforço ${log.perceivedEffort}/10 · ~${estimateCalories(log.durationMinutes,weight)} kcal</p>${log.notes ? `<small>${escapeHtml(log.notes)}</small>` : ""}</div><a class="link" href="#/treino/${log.workoutId}">Ver treino</a></article>`).join("")}</div>` : `<div class="empty">Nenhum treino registrado ainda.</div>`}`;
  }

  function render() {
    const route = routeName();
    const user = currentUser();
    const publicRoute = route === "login" || route === "cadastro";
    if (!user && !publicRoute) { navigate("login"); return; }
    if (user && publicRoute) { navigate("dashboard"); return; }
    let content;
    if (route === "cadastro") content = renderCadastro();
    else if (route === "login") content = renderLogin();
    else if (route === "dashboard") content = renderDashboard(user);
    else if (route === "perfil") content = renderPerfil(user);
    else if (route === "treinos") content = renderTreinos(user);
    else if (route.startsWith("treino/")) content = renderTreino(user, route.split("/")[1]);
    else if (route === "evolucao") content = renderEvolucao(user);
    else { navigate(user ? "dashboard" : "login"); return; }
    app.innerHTML = shell(content, user, route);
    document.title = `${route === "dashboard" ? "Início" : route === "evolucao" ? "Evolução" : route === "perfil" ? "Perfil" : route.startsWith("treino") ? "Treinos" : route === "cadastro" ? "Cadastro" : "Entrar"} | Boxing`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function setFormError(form, message) {
    const holder = form.querySelector(".form-error");
    if (holder) holder.innerHTML = message ? `<div class="alert alert-error">${escapeHtml(message)}</div>` : "";
  }

  app.addEventListener("submit", function (event) {
    const form = event.target.closest("form");
    if (!form) return;
    event.preventDefault();
    const data = getFormObject(form);
    const type = form.dataset.form;
    setFormError(form, "");
    if (type === "login") {
      const user = state.users.find((item) => item.email.toLowerCase() === String(data.email).trim().toLowerCase() && item.password === data.password);
      if (!user) { setFormError(form, "E-mail ou senha inválidos."); return; }
      state.currentUserId = user.id; saveState(); navigate("dashboard"); showToast("Login realizado com sucesso.");
    } else if (type === "register") {
      const email = String(data.email).trim().toLowerCase();
      if (state.users.some((item) => item.email.toLowerCase() === email)) { setFormError(form, "E-mail já cadastrado neste navegador."); return; }
      const user = { id: `user-${Date.now()}`, name: String(data.name).trim(), email, password: String(data.password), profile: null, workouts: [], logs: [], weights: [] };
      state.users.push(user); state.currentUserId = user.id; saveState(); navigate("perfil"); showToast("Conta criada. Complete seu perfil.");
    } else if (type === "profile") {
      const user = currentUser(); const previousGoal = user.profile?.goal;
      user.profile = { age: Number(data.age), heightCm: Number(data.heightCm), weightKg: Number(data.weightKg), experience: data.experience, goal: data.goal, frequencyDays: Number(data.frequencyDays) };
      const today = dateDaysAgo(0); const existing = user.weights.find((item) => item.recordedOn === today);
      if (existing) existing.weightKg = Number(data.weightKg); else user.weights.push({ id: Date.now(), recordedOn: today, weightKg: Number(data.weightKg) });
      saveState(); navigate("treinos"); showToast(previousGoal ? "Perfil atualizado com sucesso." : "Perfil salvo. Agora gere seu treino.");
    } else if (type === "complete") {
      const user = currentUser();
      user.logs.push({ id: Date.now(), workoutId: Number(form.dataset.workoutId), performedAt: data.performedAt, durationMinutes: Number(data.durationMinutes), perceivedEffort: Number(data.perceivedEffort), notes: String(data.notes || "").trim() });
      saveState(); navigate("evolucao"); showToast("Treino registrado com sucesso.");
    } else if (type === "weight") {
      const user = currentUser(); const value = Number(data.weightKg);
      const existing = user.weights.find((item) => item.recordedOn === data.recordedOn);
      if (existing) existing.weightKg = value; else user.weights.push({ id: Date.now(), recordedOn: data.recordedOn, weightKg: value });
      user.profile.weightKg = value; saveState(); render(); showToast("Pesagem registrada.");
    }
  });

  app.addEventListener("click", function (event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const action = control.dataset.action;
    if (action === "demo-login") {
      const demo = state.users.find((user) => user.email === DEMO_EMAIL) || initialState().users[0];
      if (!state.users.some((user) => user.id === demo.id)) state.users.unshift(demo);
      state.currentUserId = demo.id; saveState(); navigate("dashboard"); showToast("Demonstração carregada.");
    } else if (action === "reset-demo") {
      if (!window.confirm("Restaurar os dados originais da conta de demonstração?")) return;
      state = initialState(); state.currentUserId = "demo"; saveState(); render(); showToast("Dados da demonstração restaurados.");
    } else if (action === "logout") {
      state.currentUserId = null; saveState(); navigate("login");
    } else if (action === "toggle-password") {
      const input = control.parentElement.querySelector("input"); input.type = input.type === "password" ? "text" : "password"; control.textContent = input.type === "password" ? "Mostrar" : "Ocultar";
    } else if (action === "generate") {
      const user = currentUser(); const profile = user.profile;
      const workout = { id: Date.now(), createdAt: dateDaysAgo(0), ...profile, exercises: makePlan(profile) };
      user.workouts.unshift(workout); saveState(); navigate(`treino/${workout.id}`); showToast("Treinamento gerado com sucesso.");
    } else if (action === "select-exercise" || action === "toggle-exercise") {
      const user = currentUser(); const workout = user.workouts.find((item) => item.id === session.workoutId); const index = workout.exercises.findIndex((item) => String(item.id) === control.dataset.id);
      if (action === "toggle-exercise") {
        const id = workout.exercises[index].id;
        if (session.completed.has(id)) session.completed.delete(id);
        else session.completed.add(id);
      }
      session.activeIndex = index; session.running = false; session.secondsLeft = workout.exercises[index].durationSeconds || 60; render();
    } else if (action === "timer-toggle") {
      const user = currentUser(); const workout = user.workouts.find((item) => item.id === session.workoutId); const active = workout.exercises[session.activeIndex];
      if (session.secondsLeft === 0) session.secondsLeft = active.durationSeconds || 60;
      session.running = !session.running; updateTimerUI();
    } else if (action === "timer-reset") {
      const user = currentUser(); const workout = user.workouts.find((item) => item.id === session.workoutId); session.running = false; session.secondsLeft = workout.exercises[session.activeIndex].durationSeconds || 60; updateTimerUI();
    } else if (action === "complete-next") {
      const user = currentUser(); const workout = user.workouts.find((item) => item.id === session.workoutId); const active = workout.exercises[session.activeIndex]; session.completed.add(active.id); const next = workout.exercises.findIndex((item,index) => index > session.activeIndex && !session.completed.has(item.id)); if (next >= 0) { session.activeIndex = next; session.secondsLeft = workout.exercises[next].durationSeconds || 60; } session.running = false; render();
    }
  });

  function updateTimerUI() {
    const value = document.getElementById("timer-value"); const button = document.getElementById("timer-toggle");
    if (value) value.textContent = timerText(session.secondsLeft);
    if (button) button.textContent = session.running ? "Pausar" : session.secondsLeft === 0 ? "Reiniciar" : "Iniciar";
  }

  window.addEventListener("hashchange", render);
  setInterval(() => {
    if (!session.running) return;
    session.secondsLeft = Math.max(0, session.secondsLeft - 1);
    if (session.secondsLeft === 0) session.running = false;
    updateTimerUI();
  }, 1000);
  if (!location.hash) navigate("login"); else render();
})();
