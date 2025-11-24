const input = document.getElementById("taskInput");
const button = document.getElementById("addIt");
const list = document.getElementById("lista");
let priorities = 0;

// Botão de lista concluída
const botaoConcluido = document.querySelector(".botao-arredondado");

if (botaoConcluido) {
    const concluidoImg = document.createElement("img");
    concluidoImg.src = "Imagens/concluido.png";
    concluidoImg.alt = "Marcar Lista como Concluída";
    concluidoImg.classList.add("icone-concluido");

    botaoConcluido.classList.add("concluido-btn");
    botaoConcluido.appendChild(concluidoImg);
}

function customConfirm(message, callback) {
    const overlay = document.getElementById("confirm-overlay");
    const text = document.getElementById("confirm-text");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    text.textContent = message;
    overlay.classList.remove("hidden");

    const limpar = () => {
        overlay.classList.add("hidden");
        okBtn.onclick = null;
        cancelBtn.onclick = null;
    };

    okBtn.onclick = () => {
        limpar();
        callback(true);
    };

    cancelBtn.onclick = () => {
        limpar();
        callback(false);
    };
}

botaoConcluido.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll("#lista .checkbox");
    const nomes = document.querySelectorAll("#lista .nome");
    const existeNaoConcluida = Array.from(checkboxes).some(cb => !cb.checked);

    const mensagem = existeNaoConcluida
        ? "Deseja marcar TODAS as tarefas como concluídas?"
        : "Deseja desmarcar TODAS as tarefas?";

    customConfirm(mensagem, (confirma) => {
        if (!confirma) return;

        if (existeNaoConcluida) {
            //Marca tudo
            checkboxes.forEach((cb, i) => {
                cb.checked = true;
                nomes[i].classList.add("done");
            });

            //Adiciona classe global do estado "tudo concluído"
            document.body.classList.add("tudo-concluido");
            document.body.classList.remove("tudo-desmarcado");

            showAlert("Todas as tarefas foram marcadas como concluídas!", "sucesso");

        } else {
            //Desmarca tudo
            checkboxes.forEach((cb, i) => {
                cb.checked = false;
                nomes[i].classList.remove("done");
            });

            // Adiciona classe global do estado "tudo desmarcado"
            document.body.classList.remove("tudo-concluido");
            document.body.classList.add("tudo-desmarcado");

            showAlert("Todas as tarefas foram desmarcadas.", "aviso");
        }

        updateProgress();
        atualizarProximasTarefas();
    });
});


// Botão para editar o título
const titulo = document.getElementById("titulo");
const tituloBtn = document.createElement("button");
tituloBtn.classList.add("titleEdit");

const tituloIcon = document.createElement("img");
tituloIcon.src = "Imagens/icone-removebg-preview.png";
tituloIcon.alt = "Editar Título";
tituloBtn.appendChild(tituloIcon);

titulo.insertAdjacentElement("afterend", tituloBtn);

tituloBtn.addEventListener("click", () => {
    titulo.contentEditable = true;
    titulo.focus();

    const rangeTitle = document.createRange();
    rangeTitle.selectNodeContents(titulo);

    const selectionTitle = window.getSelection();
    selectionTitle.removeAllRanges();
    selectionTitle.addRange(rangeTitle);

    titulo.addEventListener("blur", () => {
        titulo.contentEditable = false;
        atualizarTituloProgressao();
    })

    titulo.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            titulo.contentEditable = false;
            titulo.blur();
            atualizarTituloProgressao();
        }
    })
})

function capitalize(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Função só para atualizar o título da progressão
function atualizarTituloProgressao() {
    const progressTitle = document.getElementById("progress-title");
    progressTitle.textContent = `Progresso de ${titulo.textContent}`;
}

//Funções para medir progresso de tarefas

function updateProgress() {
    const tasks = list.querySelectorAll("li");
    const doneTasks = list.querySelectorAll("li .done");

    const total = tasks.length;
    const done = doneTasks.length;

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    // Circunferência do círculo
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percent / 100) * circumference;

    const progressCircle = document.querySelector(".progress");
    const progressText = document.getElementById("progress-text");
    const progression = document.getElementById("progressao");
    const prioridades = document.getElementById("prioridades");

    progressCircle.style.strokeDashoffset = offset;
    progressText.textContent = `${percent}%`;

    progression.textContent = `Tarefas Concluídas: ${done}/${total}`;
    prioridades.textContent = `Tarefas em Prioridade: ${priorities}`;
}

//função para atualizar as tarefas exibidas em "próximas tarefas"
function atualizarProximasTarefas() {
    const tarefas = list.querySelectorAll("li");
    const tarefasComPrazo = [];

    tarefas.forEach(tarefa => {
        // Ignora tarefas concluídas

        const inputPrazo = tarefa.querySelector(".prazo");
        if (!inputPrazo || !inputPrazo.value) return;

        // Extrai ano, mês, dia
        const [ano, mes, dia] = inputPrazo.value.split("-").map(Number);
        const dataPrazo = new Date(ano, mes - 1, dia);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diferencaDias = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
        if (diferencaDias < 0) return;

        tarefasComPrazo.push({
            elemento: tarefa,
            prazo: dataPrazo,
            diferenca: diferencaDias
        });
    });

    tarefasComPrazo.sort((a, b) => a.prazo - b.prazo);

    const proximasTres = tarefasComPrazo.slice(0, 3);
    const proximasContainer = document.getElementById("lista-proximas");
    proximasContainer.innerHTML = "";

    proximasTres.forEach(tarefa => {
        const listaProximas = document.createElement("li");

        const nome = tarefa.elemento.querySelector(".nome").textContent;
        const prazo = tarefa.prazo.toLocaleDateString("pt-BR");

        listaProximas.textContent = `${nome} | Prazo: ${prazo}`;
        listaProximas.title = nome;
        listaProximas.tabIndex = 0;

        listaProximas.dataset.ref = tarefa.elemento.dataset.id;

        listaProximas.addEventListener("click", () => {
            const original = document.querySelector(`[data-id='${listaProximas.dataset.ref}']`);
            if (!original) return;

            document.querySelectorAll("li.highlight")
                .forEach(el => el.classList.remove("highlight"));

            original.classList.add("highlight");
            original.scrollIntoView({ behavior: "smooth", block: "center" });

            setTimeout(() => original.classList.remove("highlight"), 2000);
        });

        proximasContainer.appendChild(listaProximas);
    });
}

function tarefaExiste(nome) {
    const tarefas = list.querySelectorAll(".nome");
    return Array.from(tarefas).some(tarefa =>
        tarefa.textContent.trim().toLowerCase() === nome.toLowerCase()
    );
}

function showAlert(mensagem, tipo = "erro") {
  // Verifica se já existe um alerta ativo e remove antes de criar outro
  const alertaExistente = document.querySelector(".alerta");
  if (alertaExistente) alertaExistente.remove();

  const alerta = document.createElement("div");
  alerta.className = `alerta ${tipo}`;
  alerta.textContent = mensagem;

  document.body.appendChild(alerta);

  // Animação de entrada
  setTimeout(() => alerta.classList.add("mostrar"), 10);

  // Remove automaticamente após 3 segundos
  setTimeout(() => {
    alerta.classList.remove("mostrar");
    alerta.addEventListener("transitionend", () => alerta.remove());
  }, 3000);
}

//Função para adicionar tarefa
function addTask() {
    const taskText = capitalize(input.value.trim());
    if (taskText === ""){
        showAlert("Insira o nome de uma tarefa para adicioná-la!", "aviso");
        return;
    };

    if (tarefaExiste(taskText)) {
        showAlert("Essa tarefa já foi adicionada!");
        return;
    }

    const li = document.createElement("li");
    li.dataset.id = Date.now().toString();

    // Container para checkbox + texto
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    // Campo de descrição (inicialmente escondido)
    const descContainer = document.createElement("div");
    descContainer.classList.add("descricao-container");
    const descInput = document.createElement("textarea");
    descInput.placeholder = "Descrição da tarefa...";
    descInput.classList.add("descricao-input");

    descContainer.appendChild(descInput);
    descContainer.style.display = "none"; // começa fechado

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";

    // Nome da tarefa
    const nome = document.createElement("span");
    nome.classList.add("nome");
    nome.textContent = taskText;

    checkbox.addEventListener("change", () => {
        nome.classList.toggle("done", checkbox.checked);
        li.classList.toggle("concluida", checkbox.checked);

        updateProgress();
        atualizarProximasTarefas();
    });

    // Input de prazo
    const prazo = document.createElement("input");
    prazo.type = "date";
    prazo.className = "prazo";

    // Atualiza próximas tarefas quando a data muda
    prazo.addEventListener("change", () => {
        prazo.classList.toggle("done", checkbox.checked);
        atualizarProximasTarefas();
    });

    taskContent.appendChild(nome);
    taskContent.appendChild(prazo);
    taskContent.appendChild(descContainer);
    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(taskContent);

    // Container de botões
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("botoes");

    // Botão para abrir/fechar descrição
    const descBtn = document.createElement("button");
    descBtn.textContent = "+";
    descBtn.classList.add("desc-btn");

    descBtn.addEventListener("click", () => {
    descContainer.style.display =
        descContainer.style.display === "none" ? "block" : "none";
    });

    // Botão editar
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.classList.add("edit");

    editBtn.addEventListener("click", () => {
        const textoOriginal = nome.textContent.trim();
        nome.contentEditable = true;
        nome.focus();

        const range = document.createRange();
        range.selectNodeContents(nome);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        nome.addEventListener("blur", () => {
            nome.contentEditable = false;
            nome.textContent = capitalize(nome.textContent.trim());
            atualizarProximasTarefas();
        });

        nome.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const novoTexto = capitalize(nome.textContent.trim());
        
                const tarefas = document.querySelectorAll("#lista .nome");
                
                // lista com todos os nomes, exceto o próprio elemento
                const nomes = Array.from(tarefas)
                    .filter(t => t !== nome)
                    .map(t => t.textContent.toLowerCase());
        
                if (nomes.includes(novoTexto.toLowerCase())) {
                    showAlert("Essa tarefa já foi adicionada!");
                    nome.textContent = textoOriginal;
                    nome.blur();
                    return;
                }
        
                nome.textContent = novoTexto;
                nome.contentEditable = false;
                nome.blur();
                atualizarProximasTarefas();
            }
        });        
    });

    // Botão remover
    const removeBtn = document.createElement("button");
    const removerImg = document.createElement("img");
    removerImg.src = "Imagens/lixeira.png";
    removeBtn.alt = "Remover Tarefa";
    removeBtn.classList.add("prioridade-btn");
    removeBtn.appendChild(removerImg);
    removeBtn.classList.add("remove");

    removeBtn.addEventListener("click", () => {
        li.classList.add("exit");
        li.addEventListener("animationend", () => {
            showAlert("Tarefa removida com sucesso!", "erro");
            list.removeChild(li);
            updateProgress();
            atualizarProximasTarefas();
        }, { once: true });

        if (li.classList.contains("prioridade")) {
            priorities--;
        }
    });

    // Botão prioridade
    const prioridadeBtn = document.createElement("button");
    const prioridadeImg = document.createElement("img");
    prioridadeImg.src = "Imagens/alerta2.png";
    prioridadeBtn.alt = "Adicionar Prioridade";
    prioridadeBtn.classList.add("prioridade-btn");
    prioridadeBtn.appendChild(prioridadeImg);

    prioridadeBtn.addEventListener("click", () => {
        const viraPrioridade = !li.classList.contains("prioridade");

        if (viraPrioridade) {
            li.classList.add("prioridade");
            list.prepend(li);
            priorities++;
        } else {
            li.classList.remove("prioridade");
            list.append(li);
            priorities--;
        }

        li.addEventListener("transitionend", () => {
            li.classList.remove("moving");
        }, { once: true });

        updateProgress();
        atualizarProximasTarefas();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(removeBtn);
    btnContainer.appendChild(prioridadeBtn);
    btnContainer.appendChild(descBtn);


    // Monta o li final
    li.appendChild(taskContainer);
    li.appendChild(btnContainer);

    list.appendChild(li);
    showAlert("Tarefa adicionada com sucesso!", "sucesso");

    li.classList.add("enter");
    li.addEventListener("animationend", () => {
        li.classList.remove("enter");
    }, { once: true });

    // Limpa input
    input.value = "";
    input.focus();

    // Atualiza progresso e próximas tarefas
    updateProgress();
    atualizarProximasTarefas();
}


//Eventos para adicionar tarefas
button.addEventListener("click", addTask);

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});