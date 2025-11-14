(() => {
  // Configurações (em PT-BR)
  const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Estado
  const today = new Date();
  let visibleYear = today.getFullYear();
  let visibleMonth = today.getMonth(); // 0..11
  let selectedDate = null;

  // Elementos
  const monthTitle = document.getElementById('monthTitle');
  const weekdaysEl = document.getElementById('weekdays');
  const daysGrid = document.getElementById('daysGrid');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');
  const selectedInfo = document.getElementById('selectedInfo');

  // Render header weekdays
  function renderWeekdays(){
    weekdaysEl.innerHTML = '';
    weekDays.forEach(d => {
      const el = document.createElement('div');
      el.textContent = d;
      weekdaysEl.appendChild(el);
    });
  }

  // Calcula número de dias do mês
  function daysInMonth(year, month){
    return new Date(year, month+1, 0).getDate();
  }

  function renderCalendar(year, month){
    monthTitle.textContent = `${monthNames[month]} ${year}`;
    daysGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay(); // 0..6 (domingo=0)
    const totalDays = daysInMonth(year, month);

    // Mostrar alguns dias do mês anterior para preencher a grade
    const prevMonth = month === 0 ? 11 : month-1;
    const prevYear = month === 0 ? year-1 : year;
    const prevMonthDays = daysInMonth(prevYear, prevMonth);

    // Preencher dias do mês anterior
    for(let i = firstDay - 1; i >= 0; i--){
      const dayNum = prevMonthDays - i;
      const cell = makeDayCell(dayNum, prevYear, prevMonth, true);
      daysGrid.appendChild(cell);
    }

    // Preencher dias do mês atual
    for(let d = 1; d <= totalDays; d++){
      const cell = makeDayCell(d, year, month, false);
      daysGrid.appendChild(cell);
    }

    // Preencher dias do próximo mês para completar 6 linhas (opcional)
    const cellsSoFar = daysGrid.children.length;
    const cellsNeeded = (Math.ceil(cellsSoFar / 7) * 7) - cellsSoFar;
    const nextMonth = (month + 1) % 12;
    const nextYear = month === 11 ? year + 1 : year;
    for(let i = 1; i <= cellsNeeded; i++){
      const cell = makeDayCell(i, nextYear, nextMonth, true);
      daysGrid.appendChild(cell);
    }
  }

  function makeDayCell(dayNum, year, month, otherMonth){
    const btn = document.createElement('div');
    btn.className = 'day' + (otherMonth ? ' other-month' : '');
    btn.textContent = dayNum;

    const dateObj = new Date(year, month, dayNum);
    // marcar hoje
    if (isSameDate(dateObj, today)){
      btn.classList.add('today');
    }
    // marcar selecionado
    if (selectedDate && isSameDate(dateObj, selectedDate)){
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      // atualizar seleção (mesmo que seja dia de outro mês -> navegar)
      selectedDate = dateObj;
      visibleYear = dateObj.getFullYear();
      visibleMonth = dateObj.getMonth();
      // re-render para aplicar classes e ajustar grade (se clicou em outro mês)
      renderCalendar(visibleYear, visibleMonth);
      updateSelectedInfo();
    });

    return btn;
  }

  function isSameDate(a,b){
    if(!a || !b) return false;
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  function updateSelectedInfo(){
    if(!selectedDate){
      selectedInfo.textContent = 'Nenhuma data selecionada';
      return;
    }
    const d = selectedDate;
    selectedInfo.textContent = `Selecionado: ${d.getDate()}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  // Navegação
  prevBtn.addEventListener('click', () => {
    visibleMonth--;
    if(visibleMonth < 0){ visibleMonth = 11; visibleYear--; }
    renderCalendar(visibleYear, visibleMonth);
  });
  nextBtn.addEventListener('click', () => {
    visibleMonth++;
    if(visibleMonth > 11){ visibleMonth = 0; visibleYear++; }
    renderCalendar(visibleYear, visibleMonth);
  });
  todayBtn.addEventListener('click', () => {
    visibleYear = today.getFullYear();
    visibleMonth = today.getMonth();
    selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    renderCalendar(visibleYear, visibleMonth);
    updateSelectedInfo();
  });

  // init
  renderWeekdays();
  renderCalendar(visibleYear, visibleMonth);
})();
