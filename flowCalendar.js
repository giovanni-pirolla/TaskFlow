window.tarefasDoCalendario = [];

function carregarTarefasDoStorage() {
  const dados = localStorage.getItem("flowlist_tarefas");
  if (!dados) return;
  const tarefasSalvas = JSON.parse(dados);
  window.tarefasDoCalendario = tarefasSalvas.map(t => ({
    id: t.id,
    nome: t.nome.trim(),
    prazo: t.prazo,
    lista: localStorage.getItem("flowlist_titulo")?.trim() || "To-Do List",
    concluida: t.concluida
  }));
}

function destacarTarefaDaURL() {
  const params = new URLSearchParams(window.location.search);
  const prazo = params.get("prazo");
  if (prazo) {
    const [y, m, d] = prazo.split('-');
    selectedDate = new Date(y, m - 1, d);
    visibleYear = selectedDate.getFullYear();
    visibleMonth = selectedDate.getMonth();
    history.replaceState({}, '', location.pathname);
  }
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const today = new Date();
let visibleYear = today.getFullYear();
let visibleMonth = today.getMonth();
let selectedDate = null;

const monthTitle = document.getElementById('monthTitle');
const weekdaysEl = document.getElementById('weekdays');
const daysGrid = document.getElementById('daysGrid');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const todayBtn = document.getElementById('todayBtn');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const tasksList = document.getElementById('tasksList');

function renderWeekdays() {
  weekdaysEl.innerHTML = '';
  weekDays.forEach(d => {
    const el = document.createElement('div');
    el.textContent = d;
    weekdaysEl.appendChild(el);
  });
}

function temTarefaNoDia(date) {
  const str = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  return window.tarefasDoCalendario.some(t => t.prazo === str);
}

function makeDayCell(dayNum, year, month, other) {
  const div = document.createElement('div');
  div.className = 'day' + (other ? ' other-month' : '');
  div.textContent = dayNum;
  const dateObj = new Date(year, month, dayNum);

  if (dateObj.toDateString() === new Date().toDateString()) div.classList.add('today');
  if (selectedDate && dateObj.toDateString() === selectedDate.toDateString()) div.classList.add('selected');
  if (temTarefaNoDia(dateObj)) div.classList.add('has-tasks');

  div.onclick = () => {
    selectedDate = dateObj;
    renderCalendar(dateObj.getFullYear(), dateObj.getMonth());
    mostrarTarefasDoDia(dateObj);
  };
  return div;
}

function renderCalendar(y, m) {
  monthTitle.textContent = `${monthNames[m]} ${y}`;
  daysGrid.innerHTML = '';

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) daysGrid.appendChild(makeDayCell(prevDays - i, y, m - 1, true));
  for (let d = 1; d <= daysInMonth; d++) daysGrid.appendChild(makeDayCell(d, y, m, false));
  const remaining = 42 - daysGrid.children.length;
  for (let i = 1; i <= remaining; i++) daysGrid.appendChild(makeDayCell(i, y, m + 1, true));
}

function mostrarTarefasDoDia(date) {
  selectedDateDisplay.textContent = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const str = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  const tarefasDoDia = window.tarefasDoCalendario.filter(t => t.prazo === str);

  tasksList.innerHTML = tarefasDoDia.length === 0
    ? '<div class="no-tasks">Nenhuma tarefa neste dia</div>'
    : tarefasDoDia.map(t => `
            <div class="task-item ${t.concluida ? 'done' : ''}">
              <div class="task-name">${t.nome}</div>
              <div class="task-list">Lista: ${t.lista}</div>
            </div>
          `).join('');
}

prevBtn.onclick = () => { visibleMonth--; if (visibleMonth < 0) { visibleMonth = 11; visibleYear--; } renderCalendar(visibleYear, visibleMonth); };
nextBtn.onclick = () => { visibleMonth++; if (visibleMonth > 11) { visibleMonth = 0; visibleYear++; } renderCalendar(visibleYear, visibleMonth); };
todayBtn.onclick = () => { visibleYear = today.getFullYear(); visibleMonth = today.getMonth(); selectedDate = new Date(); renderCalendar(visibleYear, visibleMonth); mostrarTarefasDoDia(selectedDate); };

carregarTarefasDoStorage();
destacarTarefaDaURL();
renderWeekdays();
renderCalendar(visibleYear, visibleMonth);
mostrarTarefasDoDia(selectedDate || today);