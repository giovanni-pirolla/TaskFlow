// Variável global para armazenar todas as tarefas de todas as listas com prazo.
window.tarefasDoCalendario = [];

// Carregamento dos dados

/**
 * Recupera todas as listas do Local Storage, itera sobre as tarefas e popula o array 'tarefasDoCalendario' com os dados relevantes (ID, nome, prazo, lista).
 */
function carregarTarefasDoStorage() {
    const dados = localStorage.getItem("flowlist_todas_listas");
    if (!dados) return; // Sai da função se não houver dados salvos.
    
    const todasListas = JSON.parse(dados);
    window.tarefasDoCalendario = []; // Limpa o array antes de popular.
    
    // Itera sobre as listas salvas e suas tarefas.
    Object.keys(todasListas).forEach(nomeLista => {
        const tarefasDaLista = todasListas[nomeLista];
        tarefasDaLista.forEach(t => {
            window.tarefasDoCalendario.push({
                id: t.id,
                nome: t.nome.trim(),
                prazo: t.prazo,
                lista: nomeLista,
                concluida: t.concluida
            });
        });
    });
}

/**
 * Verifica se há um parâmetro 'prazo' na URL. Se houver, define a data
 * selecionada e o mês para essa data.
 */
function destacarTarefaDaURL() {
    const params = new URLSearchParams(window.location.search);
    const prazo = params.get("prazo");
    if (prazo) {
        const [y, m, d] = prazo.split('-');
        // Cria a data no formato Date (m-1 porque meses em JS são base 0).
        selectedDate = new Date(y, m - 1, d); 
        visibleYear = selectedDate.getFullYear();
        visibleMonth = selectedDate.getMonth();
        // Limpa os parâmetros da URL após o uso para evitar re-destaque.
        history.replaceState({}, '', location.pathname); 
    }
}

//Variáveis de estado e DOM

// Arrays de nomes usados para renderização.
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Variáveis de controle de data.
const today = new Date();
let visibleYear = today.getFullYear(); // Ano exibido no calendário.
let visibleMonth = today.getMonth(); // Mês exibido no calendário (0-11).
let selectedDate = null; // Data selecionada atualmente pelo usuário.

// Referências aos elementos do DOM.
const monthTitle = document.getElementById('monthTitle'); // Título do mês/ano.
const weekdaysEl = document.getElementById('weekdays'); // Contêiner dos nomes dos dias da semana.
const daysGrid = document.getElementById('daysGrid'); // Contêiner principal da grade de dias.
const prevBtn = document.getElementById('prevBtn'); // Botão Mês Anterior.
const nextBtn = document.getElementById('nextBtn'); // Botão Mês Próximo.
const todayBtn = document.getElementById('todayBtn'); // Botão Voltar para Hoje.
const selectedDateDisplay = document.getElementById('selectedDateDisplay'); // Exibição da data selecionada.
const tasksList = document.getElementById('tasksList'); // Contêiner da lista de tarefas do dia.

// Renderização e lógica do calendário

/**
 * Escreve os nomes dos dias da semana no cabeçalho.
 */
function renderWeekdays() {
    weekdaysEl.innerHTML = '';
    weekDays.forEach(d => {
        const el = document.createElement('div');
        el.textContent = d;
        weekdaysEl.appendChild(el);
    });
}

/**
 * Verifica se existe alguma tarefa com prazo definido para a data fornecida.
 */
function temTarefaNoDia(date) {
    // Formata a data para a string de prazo (YYYY-MM-DD).
    const str = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    // Retorna verdadeiro se alguma tarefa no array tiver esse prazo.
    return window.tarefasDoCalendario.some(t => t.prazo === str);
}

/**
 * Cria o elemento DIV que representa um dia na grade do calendário.
 */
function makeDayCell(dayNum, year, month, other) {
    const div = document.createElement('div');
    // Adiciona a classe 'other-month' se o dia não for do mês atual.
    div.className = 'day' + (other ? ' other-month' : '');
    div.textContent = dayNum;
    const dateObj = new Date(year, month, dayNum);

    // Adiciona classes de destaque (hoje, selecionado, tem-tarefas).
    if (dateObj.toDateString() === new Date().toDateString()) div.classList.add('today');
    if (selectedDate && dateObj.toDateString() === selectedDate.toDateString()) div.classList.add('selected');
    if (temTarefaNoDia(dateObj)) div.classList.add('has-tasks');

    // Evento de clique para selecionar o dia.
    div.onclick = () => {
        selectedDate = dateObj;
        renderCalendar(dateObj.getFullYear(), dateObj.getMonth()); // Renderiza para atualizar o destaque.
        mostrarTarefasDoDia(dateObj); // Exibe as tarefas do dia clicado.
    };
    return div;
}

/**
 * Desenha a grade completa do calendário para o mês e ano especificados.
 */
function renderCalendar(y, m) {
    monthTitle.textContent = `${monthNames[m]} ${y}`;
    daysGrid.innerHTML = ''; // Limpa a grade anterior.

    // Calcula o dia da semana do primeiro dia do mês (0 = Dom, 6 = Sáb).
    const firstDay = new Date(y, m, 1).getDay();
    // Obtém o número total de dias no mês atual.
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Obtém o número total de dias no mês anterior.
    const prevDays = new Date(y, m, 0).getDate();

    // 1. Preenche com dias do mês anterior.
    for (let i = firstDay - 1; i >= 0; i--) daysGrid.appendChild(makeDayCell(prevDays - i, y, m - 1, true));
    // 2. Preenche com dias do mês atual.
    for (let d = 1; d <= daysInMonth; d++) daysGrid.appendChild(makeDayCell(d, y, m, false));
    // 3. Preenche com dias do próximo mês (para completar 6 linhas, 42 células).
    const remaining = 42 - daysGrid.children.length;
    for (let i = 1; i <= remaining; i++) daysGrid.appendChild(makeDayCell(i, y, m + 1, true));
}

/**
 * Filtra as tarefas para a data selecionada e as exibe na lista de tarefas.
 */
function mostrarTarefasDoDia(date) {
    // Exibe a data completa formatada em português.
    selectedDateDisplay.textContent = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Formata a data para a string de prazo (YYYY-MM-DD).
    const str = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    
    // Filtra as tarefas que correspondem ao prazo.
    const tarefasDoDia = window.tarefasDoCalendario.filter(t => t.prazo === str);

    // Renderiza a lista de tarefas ou uma mensagem de "Nenhuma tarefa".
    tasksList.innerHTML = tarefasDoDia.length === 0
        ? '<div class="no-tasks">Nenhuma tarefa neste dia</div>'
        : tarefasDoDia.map(t => `
            <div class="task-item ${t.concluida ? 'done' : ''}">
              <div class="task-name">${t.nome}</div>
              <div class="task-list">Lista: ${t.lista}</div>
            </div>
          `).join(''); // Converte o array de strings HTML em uma única string.
}

//Configuração dos botões de navegação

// Navegação para o mês anterior.
prevBtn.onclick = () => { 
    visibleMonth--; 
    if (visibleMonth < 0) { visibleMonth = 11; visibleYear--; } 
    renderCalendar(visibleYear, visibleMonth); 
};
// Navegação para o próximo mês.
nextBtn.onclick = () => { 
    visibleMonth++; 
    if (visibleMonth > 11) { visibleMonth = 0; visibleYear++; } 
    renderCalendar(visibleYear, visibleMonth); 
};
// Adiciona o ícone SVG de um calendário ao botão "Hoje".
todayBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
`;
// Volta a visualização para a data atual.
todayBtn.onclick = () => { 
    visibleYear = today.getFullYear(); 
    visibleMonth = today.getMonth(); 
    selectedDate = new Date(); 
    renderCalendar(visibleYear, visibleMonth); 
    mostrarTarefasDoDia(selectedDate); 
};

// Inicialização do calendário

// Carrega os dados salvos.
carregarTarefasDoStorage();
// Verifica se há alguma tarefa para destacar vinda da URL.
destacarTarefaDaURL();
// Renderiza a barra de dias da semana.
renderWeekdays();
// Renderiza o calendário no mês/ano visível (que pode ter sido alterado pela URL).
renderCalendar(visibleYear, visibleMonth);
// Exibe as tarefas do dia selecionado (ou o dia de hoje, se nada foi selecionado).
mostrarTarefasDoDia(selectedDate || today);