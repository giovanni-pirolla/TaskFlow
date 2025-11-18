// Calendar JS com animações e transições aprimoradas
(() => {
  const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

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
  const selectedInfo = document.getElementById('selectedInfo');

  function renderWeekdays(){
    weekdaysEl.innerHTML = '';
    weekDays.forEach(d => {
      const el = document.createElement('div');
      el.textContent = d;
      weekdaysEl.appendChild(el);
    });
  }

  function daysInMonth(year, month){
    return new Date(year, month+1, 0).getDate();
  }

  function renderCalendar(year, month){
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    daysGrid.style.opacity = '0';
    daysGrid.style.transform = 'translateY(15px)';

    setTimeout(() => {
      daysGrid.innerHTML = '';
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = daysInMonth(year, month);

      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDays = daysInMonth(prevYear, prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        daysGrid.appendChild(makeDayCell(dayNum, prevYear, prevMonth, true));
      }

      for (let d = 1; d <= totalDays; d++) {
        daysGrid.appendChild(makeDayCell(d, year, month, false));
      }

      const cellsSoFar = daysGrid.children.length;
      const cellsNeeded = (Math.ceil(cellsSoFar / 7) * 7) - cellsSoFar;
      const nextMonth = (month + 1) % 12;
      const nextYear = month === 11 ? year + 1 : year;

      for (let i = 1; i <= cellsNeeded; i++) {
        daysGrid.appendChild(makeDayCell(i, nextYear, nextMonth, true));
      }

      daysGrid.style.opacity = '1';
      daysGrid.style.transform = 'translateY(0)';
    }, 200);
  }

  function makeDayCell(dayNum, year, month, otherMonth){
    const btn = document.createElement('div');
    btn.className = 'day' + (otherMonth ? ' other-month' : '');
    btn.textContent = dayNum;

    const dateObj = new Date(year, month, dayNum);

    if (isSameDate(dateObj, today)) {
      btn.classList.add('today');
    }

    if (selectedDate && isSameDate(dateObj, selectedDate)) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      selectedDate = dateObj;
      visibleYear = dateObj.getFullYear();
      visibleMonth = dateObj.getMonth();

      btn.animate([
        { transform: 'scale(1)', boxShadow: '0 0 0px rgba(99,102,241,0)' },
        { transform: 'scale(1.15)', boxShadow: '0 0 15px rgba(99,102,241,0.6)' },
        { transform: 'scale(1)', boxShadow: '0 0 0px rgba(99,102,241,0)' }
      ],{
        duration: 260,
        easing: 'ease-out'
      });

      renderCalendar(visibleYear, visibleMonth);
      updateSelectedInfo();
    });

    return btn;
  }

  function isSameDate(a,b){
    return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  function updateSelectedInfo(){
    if (!selectedDate) {
      selectedInfo.textContent = 'Nenhuma data selecionada';
      return;
    }

    const d = selectedDate;
    selectedInfo.textContent = `Selecionado: ${d.getDate()}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));

  function changeMonth(direction){
    visibleMonth += direction;
    if (visibleMonth < 0) { visibleMonth = 11; visibleYear--; }
    if (visibleMonth > 11) { visibleMonth = 0; visibleYear++; }

    monthTitle.animate([
      { opacity: 0, transform: 'translateY(-10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ],{ duration: 250 });

    renderCalendar(visibleYear, visibleMonth);
  }

  todayBtn.addEventListener('click', () => {
    visibleYear = today.getFullYear();
    visibleMonth = today.getMonth();
    selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    renderCalendar(visibleYear, visibleMonth);
    updateSelectedInfo();
  });

  renderWeekdays();
  renderCalendar(visibleYear, visibleMonth);
})();
