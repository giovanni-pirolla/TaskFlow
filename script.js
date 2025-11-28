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
            checkboxes.forEach((cb, i) => {
                cb.checked = true;
                nomes[i].classList.add("done");
            });
            document.body.classList.add("tudo-concluido");
            document.body.classList.remove("tudo-desmarcado");
            showAlert("Todas as tarefas foram marcadas como concluídas!", "sucesso");
        } else {
            checkboxes.forEach((cb, i) => {
                cb.checked = false;
                nomes[i].classList.remove("done");
            });
            document.body.classList.remove("tudo-concluido");
            document.body.classList.add("tudo-desmarcado");
            showAlert("Todas as tarefas foram desmarcadas.", "aviso");
        }

        updateProgress();
        atualizarProximasTarefas();
        salvarTarefas();
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

    const salvarTitulo = () => {
        titulo.contentEditable = false;
        atualizarTituloProgressao();
        salvarTarefas();
    };

    titulo.addEventListener("blur", salvarTitulo, { once: true });
    titulo.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            salvarTitulo();
        }
    }, { once: true });
});

function capitalize(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function atualizarTituloProgressao() {
    const progressTitle = document.getElementById("progress-title");
    progressTitle.textContent = `Progresso de ${titulo.textContent}`;
}

function updateProgress() {
    const tasks = list.querySelectorAll("li");
    const doneTasks = list.querySelectorAll("li .done");

    const total = tasks.length;
    const done = doneTasks.length;

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

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

function atualizarProximasTarefas() {
    const tarefas = list.querySelectorAll("li");
    const tarefasComPrazo = [];

    tarefas.forEach(tarefa => {
        const checkbox = tarefa.querySelector(".checkbox");
        if (checkbox.checked) return;

        const inputPrazo = tarefa.querySelector(".prazo");
        if (!inputPrazo || !inputPrazo.value) return;

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
    const alertaExistente = document.querySelector(".alerta");
    if (alertaExistente) alertaExistente.remove();

    const alerta = document.createElement("div");
    alerta.className = `alerta ${tipo}`;
    alerta.textContent = mensagem;

    document.body.appendChild(alerta);

    setTimeout(() => alerta.classList.add("mostrar"), 10);

    setTimeout(() => {
        alerta.classList.remove("mostrar");
        alerta.addEventListener("transitionend", () => alerta.remove());
    }, 3000);
}

// ====================== SALVAR E CARREGAR TAREFAS ======================
function salvarTarefas() {
    const tarefas = [];
    document.querySelectorAll("#lista > li").forEach(li => {
        const desc = li.querySelector(".descricao-input");
        tarefas.push({
            id: li.dataset.id,
            nome: li.querySelector(".nome").textContent.trim(),
            prazo: li.querySelector(".prazo").value || "",
            concluida: li.querySelector(".checkbox").checked,
            prioridade: li.classList.contains("prioridade"),
            descricao: desc ? desc.value : ""
        });
    });
    localStorage.setItem("flowlist_tarefas", JSON.stringify(tarefas));
    localStorage.setItem("flowlist_titulo", titulo.textContent.trim());
}

function carregarTarefasSalvas() {
    const dados = localStorage.getItem("flowlist_tarefas");
    if (!dados) return;

    const tarefas = JSON.parse(dados);
    list.innerHTML = "";
    priorities = 0;

    tarefas.forEach(t => {
        const li = document.createElement("li");
        li.dataset.id = t.id;

        const taskContainer = document.createElement("div");
        taskContainer.classList.add("task-container");
        const taskContent = document.createElement("div");
        taskContent.classList.add("task-content");

        const descContainer = document.createElement("div");
        descContainer.classList.add("descricao-container");
        const descInput = document.createElement("textarea");
        descInput.placeholder = "Descrição da tarefa...";
        descInput.classList.add("descricao-input");
        descInput.value = t.descricao || "";
        descInput.addEventListener("blur", salvarTarefas);
        descContainer.appendChild(descInput);
        // Estado inicial fechado
        descContainer.style.display = "none";
        descContainer.style.maxHeight = "0";
        descContainer.style.opacity = "0";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.checked = t.concluida;

        const nome = document.createElement("span");
        nome.classList.add("nome");
        nome.textContent = t.nome;
        if (t.concluida) nome.classList.add("done");

        const prazo = document.createElement("input");
        prazo.type = "date";
        prazo.className = "prazo";
        if (t.prazo) prazo.value = t.prazo;

        checkbox.addEventListener("change", () => {
            nome.classList.toggle("done", checkbox.checked);
            li.classList.toggle("concluida", checkbox.checked);
            updateProgress(); atualizarProximasTarefas(); salvarTarefas();
        });

        prazo.addEventListener("change", () => {
            atualizarProximasTarefas();
            salvarTarefas();
        });

        taskContent.appendChild(nome);
        taskContent.appendChild(prazo);
        taskContent.appendChild(descContainer);
        taskContainer.appendChild(checkbox);
        taskContainer.appendChild(taskContent);

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("botoes");

        // === BOTÃO DE DESCRIÇÃO COM SETA QUE GIRA ===
        const descBtn = document.createElement("button");
        descBtn.classList.add("desc-btn", "closed");

        const arrowIcon = document.createElement("span");
        arrowIcon.classList.add("arrow-icon");
        arrowIcon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/>
            </svg>
        `;
        descBtn.appendChild(arrowIcon);

        descBtn.addEventListener("click", () => {
            const isClosed = descContainer.style.display === "none" || descContainer.style.display === "";

            if (isClosed) {
                descContainer.style.display = "block";
                descContainer.style.maxHeight = descContainer.scrollHeight + "px";
                descContainer.style.opacity = "1";
                descBtn.classList.remove("closed");
                descBtn.classList.add("open");
            } else {
                descContainer.style.maxHeight = "0";
                descContainer.style.opacity = "0";
                descBtn.classList.remove("open");
                descBtn.classList.add("closed");

                descContainer.addEventListener("transitionend", () => {
                    if (descContainer.style.maxHeight === "0px") {
                        descContainer.style.display = "none";
                    }
                }, { once: true });
            }
        });

        const editBtn = document.createElement("button");
        const editIcon = document.createElement("img");
        editIcon.src = "imagens/editar_tarefa.png";
        editIcon.alt = "Editar tarefa";
        editIcon.title = "Editar tarefa";
        editBtn.classList.add("edit");
        editBtn.appendChild(editIcon);

        editBtn.addEventListener("click", () => {
            const original = nome.textContent.trim();
            nome.contentEditable = true;
            nome.focus();
            const range = document.createRange();
            range.selectNodeContents(nome);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            const finalizar = () => {
                nome.contentEditable = false;
                const novo = capitalize(nome.textContent.trim());
                if (Array.from(document.querySelectorAll(".nome")).filter(n => n !== nome).some(n => n.textContent.toLowerCase() === novo.toLowerCase())) {
                    showAlert("Essa tarefa já existe!");
                    nome.textContent = original;
                } else {
                    nome.textContent = novo;
                }
                atualizarProximasTarefas();
                salvarTarefas();
            };
            nome.addEventListener("blur", finalizar, { once: true });
            nome.addEventListener("keypress", e => { if (e.key === "Enter") { e.preventDefault(); finalizar(); } }, { once: true });
        });

        const removeBtn = document.createElement("button");
        const removerImg = document.createElement("img");
        removerImg.src = "Imagens/lixeira.png";
        removeBtn.appendChild(removerImg);
        removeBtn.classList.add("remove");
        removeBtn.addEventListener("click", () => {
            li.classList.add("exit");
            li.addEventListener("animationend", () => {
                list.removeChild(li);
                if (li.classList.contains("prioridade")) priorities--;
                updateProgress(); atualizarProximasTarefas(); salvarTarefas();
            }, { once: true });
        });

        const prioridadeBtn = document.createElement("button");
        const prioridadeImg = document.createElement("img");
        prioridadeImg.src = "Imagens/alerta3.png";
        prioridadeBtn.appendChild(prioridadeImg);
        prioridadeBtn.classList.add("prioridade-btn");
        prioridadeBtn.addEventListener("click", () => {
            if (li.classList.contains("prioridade")) {
                li.classList.remove("prioridade");
                list.appendChild(li);
                priorities--;
            } else {
                li.classList.add("prioridade");
                list.prepend(li);
                priorities++;
            }
            updateProgress(); atualizarProximasTarefas(); salvarTarefas();
        });

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(removeBtn);
        btnContainer.appendChild(prioridadeBtn);
        btnContainer.appendChild(descBtn);

        li.appendChild(taskContainer);
        li.appendChild(btnContainer);

        if (t.prioridade) {
            li.classList.add("prioridade");
            priorities++;
            list.prepend(li);
        } else {
            list.appendChild(li);
        }

        li.classList.add("enter");
        li.addEventListener("animationend", () => li.classList.remove("enter"), { once: true });
    });

    const tituloSalvo = localStorage.getItem("flowlist_titulo");
    if (tituloSalvo) titulo.textContent = tituloSalvo;

    updateProgress();
    atualizarProximasTarefas();
}

// ====================== FUNÇÃO ORIGINAL addTask MODIFICADA ======================
function addTask() {
    const taskText = capitalize(input.value.trim());
    if (taskText === "") {
        showAlert("Insira o nome de uma tarefa para adicioná-la!", "aviso");
        return;
    };

    if (tarefaExiste(taskText)) {
        showAlert("Essa tarefa já foi adicionada!");
        return;
    }

    const li = document.createElement("li");
    li.dataset.id = Date.now().toString();

    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    const descContainer = document.createElement("div");
    descContainer.classList.add("descricao-container");
    const descInput = document.createElement("textarea");
    descInput.placeholder = "Descrição da tarefa...";
    descInput.classList.add("descricao-input");
    descInput.addEventListener("blur", salvarTarefas);
    descContainer.appendChild(descInput);
    descContainer.style.display = "none";
    descContainer.style.maxHeight = "0";
    descContainer.style.opacity = "0";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";

    const nome = document.createElement("span");
    nome.classList.add("nome");
    nome.textContent = taskText;

    checkbox.addEventListener("change", () => {
        nome.classList.toggle("done", checkbox.checked);
        li.classList.toggle("concluida", checkbox.checked);
        updateProgress();
        atualizarProximasTarefas();
        salvarTarefas();
    });

    const prazo = document.createElement("input");
    prazo.type = "date";
    prazo.className = "prazo";

    prazo.addEventListener("change", () => {
        atualizarProximasTarefas();
        salvarTarefas();
    });

    taskContent.appendChild(nome);
    taskContent.appendChild(prazo);
    taskContent.appendChild(descContainer);
    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(taskContent);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("botoes");

    // === BOTÃO DE DESCRIÇÃO COM SETA QUE GIRA (NA CRIAÇÃO) ===
    const descBtn = document.createElement("button");
    descBtn.classList.add("desc-btn", "closed");

    const arrowIcon = document.createElement("span");
    arrowIcon.classList.add("arrow-icon");
    arrowIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"/>
        </svg>
    `;
    descBtn.appendChild(arrowIcon);

    descBtn.addEventListener("click", () => {
        const isClosed = descContainer.style.display === "none" || descContainer.style.display === "";

        if (isClosed) {
            descContainer.style.display = "block";
            descContainer.style.maxHeight = descContainer.scrollHeight + "px";
            descContainer.style.opacity = "1";
            descBtn.classList.remove("closed");
            descBtn.classList.add("open");
        } else {
            descContainer.style.maxHeight = "0";
            descContainer.style.opacity = "0";
            descBtn.classList.remove("open");
            descBtn.classList.add("closed");

            descContainer.addEventListener("transitionend", () => {
                if (descContainer.style.maxHeight === "0px") {
                    descContainer.style.display = "none";
                }
            }, { once: true });
        }
    });

    const editBtn = document.createElement("button");
    const editIcon = document.createElement("img");
    editIcon.src = "imagens/editar_tarefa.png";
    editIcon.alt = "Editar tarefa";
    editIcon.title = "Editar tarefa";
    editBtn.classList.add("edit");
    editBtn.appendChild(editIcon);

    editBtn.addEventListener("click", () => {
        const textoOriginal = nome.textContent.trim();
        nome.contentEditable = true;
        nome.focus();

        const range = document.createRange();
        range.selectNodeContents(nome);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const finalizarEdicao = () => {
            nome.contentEditable = false;
            const novoTexto = capitalize(nome.textContent.trim());

            const nomesExistentes = Array.from(document.querySelectorAll("#lista .nome"))
                .filter(n => n !== nome)
                .map(n => n.textContent.toLowerCase());

            if (nomesExistentes.includes(novoTexto.toLowerCase())) {
                showAlert("Essa tarefa já foi adicionada!");
                nome.textContent = textoOriginal;
                return;
            }

            nome.textContent = novoTexto;
            atualizarProximasTarefas();
            salvarTarefas();
        };

        nome.addEventListener("blur", finalizarEdicao, { once: true });
        nome.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                finalizarEdicao();
            }
        }, { once: true });
    });

    const removeBtn = document.createElement("button");
    const removerImg = document.createElement("img");
    removerImg.src = "Imagens/lixeira.png";
    removeBtn.appendChild(removerImg);
    removeBtn.classList.add("remove");

    removeBtn.addEventListener("click", () => {
        li.classList.add("exit");
        li.addEventListener("animationend", () => {
            showAlert("Tarefa removida com sucesso!", "erro");
            list.removeChild(li);
            if (li.classList.contains("prioridade")) priorities--;
            updateProgress();
            atualizarProximasTarefas();
            salvarTarefas();
        }, { once: true });
    });

    const prioridadeBtn = document.createElement("button");
    const prioridadeImg = document.createElement("img");
    prioridadeImg.src = "Imagens/alerta2.png";
    prioridadeBtn.appendChild(prioridadeImg);
    prioridadeBtn.classList.add("prioridade-btn");

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

        updateProgress();
        atualizarProximasTarefas();
        salvarTarefas();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(removeBtn);
    btnContainer.appendChild(prioridadeBtn);
    btnContainer.appendChild(descBtn);

    li.appendChild(taskContainer);
    li.appendChild(btnContainer);
    list.appendChild(li);

    showAlert("Tarefa adicionada com sucesso!", "sucesso");

    li.classList.add("enter");
    li.addEventListener("animationend", () => {
        li.classList.remove("enter");
    }, { once: true });

    input.value = "";
    input.focus();

    updateProgress();
    atualizarProximasTarefas();
    salvarTarefas();
}

// ====================== CLIQUE NA TAREFA → VAI PRO CALENDÁRIO ======================
list.addEventListener("click", function(e) {
    const li = e.target.closest("li");
    if (!li || !list.contains(li)) return;
    if (e.target.closest("button, input, textarea")) return;

    const nomeTarefa = li.querySelector(".nome").textContent.trim();
    const prazo = li.querySelector(".prazo").value || "";
    const concluida = li.querySelector(".checkbox").checked;
    const nomeLista = titulo.textContent.trim() || "To-Do List";

    const params = new URLSearchParams({
        id: li.dataset.id,
        nome: nomeTarefa,
        prazo: prazo,
        lista: nomeLista,
        concluida: concluida
    });

    window.location.href = `FlowCalendar.html?${params.toString()}`;
});

// ====================== EVENTOS DE ADIÇÃO E CARREGAMENTO ======================
button.addEventListener("click", addTask);
input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
});

window.addEventListener("load", () => {
    carregarTarefasSalvas();
    atualizarTituloProgressao();
});