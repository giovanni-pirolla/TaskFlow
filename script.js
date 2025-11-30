// Variáveis globais para acesso aos elementos do DOM e estado da aplicação.
const input = document.getElementById("taskInput"); // Campo de entrada de texto da tarefa.
const button = document.getElementById("addIt"); // Botão para adicionar a tarefa.
const list = document.getElementById("lista"); // Contêiner <ul> das tarefas.
const titulo = document.getElementById("titulo"); // Elemento que exibe o nome da lista.
let priorities = 0; // Contador para o número de tarefas prioritárias.
let listaAtual = "To-do List"; // Nome da lista de tarefas atualmente em exibição.

// local Storage

/**
 * Recupera todas as listas salvas no Local Storage.
 * Inicializa com uma lista padrão se não houver dados.
 */
function obterTodasListas() {
    const dados = localStorage.getItem("flowlist_todas_listas");
    if (!dados) {
        const listasPadrao = { "To-do List": [] };
        localStorage.setItem("flowlist_todas_listas", JSON.stringify(listasPadrao)); // Salva o objeto como string JSON.
        return listasPadrao;
    }
    return JSON.parse(dados); // Converte a string JSON de volta para objeto JavaScript.
}

/**
 * Salva o objeto contendo todas as listas no Local Storage.
 */
function salvarTodasListas(listas) {
    localStorage.setItem("flowlist_todas_listas", JSON.stringify(listas));
}

/**
 * Obtém o nome da última lista visualizada.
 */
function obterListaAtual() {
    return localStorage.getItem("flowlist_lista_atual") || "To-do List";
}

/**
 * Define qual lista está ativa no momento.
 */
function definirListaAtual(nomeLista) {
    listaAtual = nomeLista;
    localStorage.setItem("flowlist_lista_atual", nomeLista);
}

/**
 * Coleta os dados de todas as tarefas da lista exibida na tela (DOM)
 * e os salva no Local Storage, sobrescrevendo a lista atual.
 */
function salvarTarefas() {
    const listas = obterTodasListas();
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

    listas[listaAtual] = tarefas; // Atualiza a lista atual no objeto completo.
    salvarTodasListas(listas);
}

// Gerenciamento de listas

/**
 * Cria uma nova lista vazia e a adiciona ao Local Storage.
 */
function criarNovaLista(nomeLista) {
    const listas = obterTodasListas();

    if (listas[nomeLista]) {
        showAlert("Já existe uma lista com esse nome!", "erro");
        return false;
    }

    listas[nomeLista] = [];
    salvarTodasListas(listas);
    renderizarListas(); // Atualiza a exibição das listas no menu.
    showAlert(`Lista "${nomeLista}" criada com sucesso!`, "sucesso");
    return true;
}

/**
 * Remove uma lista específica. Impede a remoção da lista padrão.
 */
function removerLista(nomeLista) {
    if (nomeLista === "To-do List") {
        showAlert("A lista padrão não pode ser removida!", "erro");
        return;
    }

    // Modal de confirmação antes de executar a exclusão.
    customConfirm(`Deseja realmente remover a lista "${nomeLista}"? Todas as tarefas serão perdidas.`, (confirma) => {
        if (!confirma) return;

        const listas = obterTodasListas();
        delete listas[nomeLista]; // Remove a lista do objeto.
        salvarTodasListas(listas);

        if (listaAtual === nomeLista) {
            carregarLista("To-do List"); // Retorna à lista padrão se a atual for removida.
        }

        renderizarListas();
        showAlert(`Lista "${nomeLista}" removida com sucesso!`, "sucesso");
    });
}

/**
 * Carrega e exibe as tarefas de uma lista selecionada.
 */
function carregarLista(nomeLista) {
    definirListaAtual(nomeLista);

    const listas = obterTodasListas();
    const tarefas = listas[nomeLista] || [];

    list.innerHTML = ""; // Limpa a lista atual do DOM.
    priorities = 0; // Reinicia o contador de prioridades.

    if (tarefas.length === 0) {
        // --- INSERÇÃO DO SVG/HTML DE PLACEHOLDER ---
        list.innerHTML = `
            <div class="empty-list-placeholder">
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                <p>Nenhuma tarefa nessa lista...</p>
            </div>
        `;
        // --- FIM DA INSERÇÃO ---
    } else {
        tarefas.forEach(t => {
            const li = criarElementoLi(t);
            if (t.prioridade) {
                li.classList.add("prioridade");
                priorities++;
                list.prepend(li); // Insere tarefas prioritárias no início da lista.
            } else {
                list.appendChild(li); // Insere tarefas normais no final.
            }
        });
    }

    titulo.textContent = nomeLista;
    atualizarTituloProgressao();
    updateProgress(); // Atualiza a barra de progresso.
    atualizarProximasTarefas(); // Atualiza a lista de prazos curtos.
    renderizarListas();
}

/**
 * Desenha os botões/itens de todas as listas salvas no menu lateral.
 */
function renderizarListas() {
    const container = document.getElementById("container-listas");
    const listas = obterTodasListas();
    const nomesListas = Object.keys(listas);

    container.innerHTML = "";

    nomesListas.forEach(nomeLista => {
        const itemLista = document.createElement("div");
        itemLista.classList.add("item-lista");

        if (nomeLista === listaAtual) {
            itemLista.classList.add("lista-ativa"); // Marca a lista atualmente aberta.
        }

        const nomeSpan = document.createElement("span");
        nomeSpan.textContent = nomeLista;
        nomeSpan.classList.add("nome-lista");

        itemLista.appendChild(nomeSpan);

        if (nomeLista !== "To-do List") {
            // Cria botão de remoção para listas não padrão.
            const btnRemover = document.createElement("button");
            const imgRemover = document.createElement("img");
            imgRemover.src = "Imagens/lixeira.png";
            btnRemover.classList.add("btn-remover-lista");
            btnRemover.title = "Remover lista";
            btnRemover.alt = "Remover lista";
            btnRemover.appendChild(imgRemover);

            btnRemover.addEventListener("click", (e) => {
                e.stopPropagation(); // Evita que o clique no botão ative o evento de clique do itemLista.
                removerLista(nomeLista);
            });

            itemLista.appendChild(btnRemover);
        }

        itemLista.addEventListener("click", () => {
            if (nomeLista !== listaAtual) {
                carregarLista(nomeLista); // Carrega a lista ao ser clicada.
            }
        });

        container.appendChild(itemLista);
    });
}

// Eventos do modal de nova lista
// ... (seu código de eventos de modal aqui) ...
document.getElementById("nova-lista-btn").addEventListener("click", () => {
    const modal = document.getElementById("modal-nova-lista");
    const input = document.getElementById("input-nome-lista");
    modal.classList.remove("hidden");
    input.value = "";
    setTimeout(() => input.focus(), 100);
});

document.getElementById("modal-criar-btn").addEventListener("click", () => {
    const input = document.getElementById("input-nome-lista");
    const nomeLista = input.value.trim();

    if (!nomeLista) {
        showAlert("Digite um nome para a lista!", "aviso");
        return;
    }

    if (criarNovaLista(nomeLista)) {
        document.getElementById("modal-nova-lista").classList.add("hidden");
    }
});

document.getElementById("modal-cancelar-btn").addEventListener("click", () => {
    document.getElementById("modal-nova-lista").classList.add("hidden");
});

document.getElementById("input-nome-lista").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("modal-criar-btn").click();
    }
});

// Função pra confirmação personalizada (modal)

const botaoConcluido = document.querySelector(".botao-arredondado");

if (botaoConcluido) {
    const concluidoImg = document.createElement("img");
    concluidoImg.src = "Imagens/concluido.png";
    concluidoImg.alt = "Marcar Lista como Concluída";
    concluidoImg.classList.add("icone-concluido");
    botaoConcluido.classList.add("concluido-btn");
    botaoConcluido.appendChild(concluidoImg);
}

/**
 * Exibe um modal de confirmação customizado e executa um callback.
 */
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
        callback(true); // Confirmação positiva.
    };

    cancelBtn.onclick = () => {
        limpar();
        callback(false); // Confirmação negativa.
    };
}

// Evento de clique para marcar/desmarcar todas as tarefas.
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
            // Marca todas.
            checkboxes.forEach((cb, i) => {
                cb.checked = true;
                nomes[i].classList.add("done");
            });
            document.body.classList.add("tudo-concluido");
            document.body.classList.remove("tudo-desmarcado");
            showAlert("Todas as tarefas foram marcadas como concluídas!", "sucesso");
        } else {
            // Desmarca todas.
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

// Edição do titulo

const tituloBtn = document.createElement("button");
tituloBtn.classList.add("titleEdit");

const tituloIcon = document.createElement("img");
tituloIcon.src = "Imagens/icone-removebg-preview.png";
tituloIcon.alt = "Editar Título";
tituloBtn.appendChild(tituloIcon);

titulo.insertAdjacentElement("afterend", tituloBtn);

// Evento de clique para habilitar a edição do título da lista.
tituloBtn.addEventListener("click", () => {
    const tituloAntigo = titulo.textContent.trim();

    titulo.contentEditable = true;
    titulo.focus();

    // Seleciona o texto inteiro para facilitar a edição.
    const rangeTitle = document.createRange();
    rangeTitle.selectNodeContents(titulo);
    const selectionTitle = window.getSelection();
    selectionTitle.removeAllRanges();
    selectionTitle.addRange(rangeTitle);

    // função que salva e limpa os listeners
    const salvarTitulo = () => {
        // Limpa os listeners para evitar vária execuções
        titulo.removeEventListener("blur", salvarTitulo);
        titulo.removeEventListener("keypress", handleKeypress);

        titulo.contentEditable = false;
        const novoTitulo = titulo.textContent.trim();

        if (!novoTitulo) {
            titulo.textContent = tituloAntigo;
            showAlert("O nome da lista não pode estar vazio!", "erro");
            return;
        }
        
        // Validação e salvamento do titulo
        const listas = obterTodasListas();

        if (novoTitulo !== tituloAntigo && listas[novoTitulo]) {
            titulo.textContent = tituloAntigo;
            showAlert("Já existe uma lista com esse nome!", "erro");
            return;
        }

        if (novoTitulo !== tituloAntigo) {
            const tarefas = listas[tituloAntigo];
            delete listas[tituloAntigo];
            listas[novoTitulo] = tarefas;
            salvarTodasListas(listas);
            definirListaAtual(novoTitulo);
        }

        atualizarTituloProgressao();
        renderizarListas();
    };
    
    // Keypress separado
    const handleKeypress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            salvarTitulo(); // Salva e remove os listeners
            titulo.blur(); // Remove o foco do título
        }
    };

    // Adiciona o blur ao titulo
    titulo.addEventListener("blur", salvarTitulo, { once: true }); 

    // Adiciona o keypress ao titulo 
    titulo.addEventListener("keypress", handleKeypress);
});

/**
 * Função utilitária para capitalizar a primeira letra de cada palavra.
 */
function capitalize(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Atualiza o texto do título da seção de progresso.
 */
function atualizarTituloProgressao() {
    const progressTitle = document.getElementById("progress-title");
    progressTitle.textContent = `Progresso de ${titulo.textContent}`;
}

//Barra de progresso e próximas tarefas

/**
 * Calcula a porcentagem de tarefas concluídas e atualiza o gráfico SVG.
 */
function updateProgress() {
    const tasks = list.querySelectorAll("li");
    const doneTasks = list.querySelectorAll("li .done");

    const total = tasks.length;
    const done = doneTasks.length;

    const rawPercent = total > 0 ? (done / total) : 0;
    const displayPercent = Math.round(rawPercent * 100);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    // Calcula o deslocamento do traço (stroke-dashoffset) para simular o preenchimento do círculo SVG.
    const offset = circumference - (rawPercent * circumference);

    const progressCircle = document.querySelector(".progress");
    const progressText = document.getElementById("progress-text");
    const progression = document.getElementById("progressao");
    const prioridades = document.getElementById("prioridades");
    
    // Verifica se o progressCircle existe antes de tentar manipulá-lo
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
    }

    if (progressText) progressText.textContent = `${displayPercent}%`;
    if (progression) progression.textContent = `Tarefas Concluídas: ${done}/${total}`;
    if (prioridades) prioridades.textContent = `Tarefas em Prioridade: ${priorities}`;
}

/**
 * Filtra as tarefas não concluídas, ordena-as pela data de prazo
 * e exibe as três mais urgentes.
 */
function atualizarProximasTarefas() {
    const tarefas = list.querySelectorAll("li");
    const tarefasComPrazo = [];

    tarefas.forEach(tarefa => {
        const checkbox = tarefa.querySelector(".checkbox");
        if (checkbox.checked) return; // Ignora tarefas concluídas.

        const inputPrazo = tarefa.querySelector(".prazo");
        if (!inputPrazo || !inputPrazo.value) return; // Ignora tarefas sem prazo.

        // Converte a string de data para objeto Date.
        const [ano, mes, dia] = inputPrazo.value.split("-").map(Number);
        const dataPrazo = new Date(ano, mes - 1, dia);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diferencaDias = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
        if (diferencaDias < 0){
            return; // Ignora tarefas atrasadas/vencidas.
        } 

        tarefasComPrazo.push({
            elemento: tarefa,
            prazo: dataPrazo,
            diferenca: diferencaDias
        });
    });

    // Ordena as tarefas do prazo mais próximo para o mais distante.
    tarefasComPrazo.sort((a, b) => a.prazo - b.prazo);

    const proximasTres = tarefasComPrazo.slice(0, 3); // Seleciona apenas as 3 mais urgentes.
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

        // Evento de clique para rolar até a tarefa original na lista principal.
        listaProximas.addEventListener("click", () => {
            const original = document.querySelector(`[data-id='${listaProximas.dataset.ref}']`);
            if (!original) return;

            document.querySelectorAll("li.highlight")
                .forEach(el => el.classList.remove("highlight"));

            original.classList.add("highlight");
            original.scrollIntoView({ behavior: "smooth", block: "center" }); // Rolagem suave.

            setTimeout(() => original.classList.remove("highlight"), 2000); // Remove o destaque após 2s.
        });

        proximasContainer.appendChild(listaProximas);
    });
}

/**
 * Verifica se já existe uma tarefa com o mesmo nome na lista.
 */
function tarefaExiste(nome) {
    const tarefas = list.querySelectorAll(".nome");
    return Array.from(tarefas).some(tarefa =>
        tarefa.textContent.trim().toLowerCase() === nome.toLowerCase()
    );
}

/**
 * Exibe um alerta temporário na tela para feedback ao usuário.
 */
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

// Criação da Li propriamente dita

/**
 * Cria e configura um elemento <li> completo para uma tarefa.
 */
function criarElementoLi(t) {
    const li = document.createElement("li");
    li.dataset.id = t.id;

    // Criação de containers e elementos básicos como checkbox, nome, prazo, etc.

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
    descInput.addEventListener("blur", salvarTarefas); // Salva ao sair do campo de descrição.
    descContainer.appendChild(descInput);
    // Configurações iniciais de CSS para ocultar a descrição.
    descContainer.style.display = "none";
    descContainer.style.maxHeight = "0";
    descContainer.style.opacity = "0";
    descInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            descInput.blur();
        }
    });

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
    
    // Função pra verificar atraso
    const checkAtraso = (prazoValue, isConcluida) => {
        // Remove a classe antes de reavaliar
        li.classList.remove("atrasada"); 
        
        if (prazoValue && !isConcluida) {
            const [ano, mes, dia] = prazoValue.split("-").map(Number);
            const dataPrazo = new Date(ano, mes - 1, dia);

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0); // Zera hora para comparação correta de dias.

            const diferencaDias = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));

            if (diferencaDias < 0) {
                li.classList.add("atrasada");
            }
        }
    };
    
    checkAtraso(t.prazo, t.concluida);

    // Lógica de alteração do checkbox.
    checkbox.addEventListener("change", () => {
        const isChecked = checkbox.checked;
        
        nome.classList.toggle("done", isChecked);
        li.classList.toggle("concluida", isChecked);
        
        // Verifica o atraso ao marcar/desmarcar
        checkAtraso(prazo.value, isChecked);
        
        // Lógica de prioridade
        if (li.classList.contains("prioridade")) {
            if (isChecked) {
                li.classList.remove("prioridade");
                list.appendChild(li); // Move para o final
                if(priorities > 0) priorities--;
            }
        }
        
        updateProgress();
        atualizarProximasTarefas();
        salvarTarefas();
    });

    // Lógica de alteração do prazo.
    prazo.addEventListener("change", () => {
        // Reavalia o status de atraso imediatamente
        checkAtraso(prazo.value, checkbox.checked); 
        
        // Recarrega a lista para reavaliar a classe "atrasada" e atualizar listas de prazos
        atualizarProximasTarefas();
        salvarTarefas();
    });

    // Adiciona os elementos criados ao li.
    taskContent.appendChild(nome);
    taskContent.appendChild(prazo);
    taskContent.appendChild(descContainer);
    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(taskContent);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("botoes");

    // Botão de expandir/recolher descrição.
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
            // Abre a descrição.
            descContainer.style.display = "block";
            descContainer.style.maxHeight = descContainer.scrollHeight + "px";
            descContainer.style.opacity = "1";
            descBtn.classList.remove("closed");
            descBtn.classList.add("open");
        } else {
            // Fecha a descrição com transição CSS.
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

    // Botão de editar o nome da tarefa.
    const editBtn = document.createElement("button");
    const editIcon = document.createElement("img");
    editIcon.src = "Imagens/editar_tarefa.png";
    editIcon.alt = "Editar tarefa";
    editIcon.title = "Editar tarefa";
    editBtn.classList.add("edit");
    editBtn.appendChild(editIcon);

    editBtn.addEventListener("click", () => {
        const original = nome.textContent.trim();
        nome.contentEditable = true;
        nome.focus();

        // Seleciona o conteúdo para edição imediata.
        const range = document.createRange();
        range.selectNodeContents(nome);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        const finalizar = () => {
            nome.removeEventListener("blur", finalizar);
            nome.removeEventListener("keypress", handleKeypressTarefa);

            nome.contentEditable = false;
            const novo = capitalize(nome.textContent.trim());

            // Verifica se há nomes repetidos
            if (Array.from(document.querySelectorAll(".nome")).filter(n => n !== nome).some(n => n.textContent.toLowerCase() === novo.toLowerCase())) {
                showAlert("Essa tarefa já existe!");
                nome.textContent = original;
            } else {
                nome.textContent = novo;
            }
            atualizarProximasTarefas();
            salvarTarefas();
        };

        const handleKeypressTarefa = e => {
            if (e.key === "Enter") {
                e.preventDefault();
                finalizar();
            }
        };

        nome.addEventListener("blur", finalizar);
        nome.addEventListener("keypress", handleKeypressTarefa);
    });

    // Botão de remover a tarefa.
    const removeBtn = document.createElement("button");
    const removerImg = document.createElement("img");
    removerImg.src = "Imagens/lixeira.png";
    removeBtn.appendChild(removerImg);
    removeBtn.classList.add("remove");
    removeBtn.addEventListener("click", () => {
        li.classList.add("exit"); // Adiciona classe para animação de saída.
        li.addEventListener("animationend", () => {
            list.removeChild(li); // Remove do DOM após a animação.
            if (li.classList.contains("prioridade")) priorities--;
            updateProgress();
            atualizarProximasTarefas();
            salvarTarefas();
            // Verifica se a lista está vazia pra mostrar o placeholder.
            if (list.children.length === 0) {
                carregarLista(listaAtual); // Recarrega a lista para mostrar o placeholder
            }
        }, { once: true });
    });

    // Botão de marcar/desmarcar prioridade.
    const prioridadeBtn = document.createElement("button");
    const prioridadeImg = document.createElement("img");
    prioridadeImg.src = "Imagens/alerta3.png";
    prioridadeBtn.appendChild(prioridadeImg);
    prioridadeBtn.classList.add("prioridade-btn");
    prioridadeBtn.addEventListener("click", () => {
        if (li.classList.contains("prioridade")) {
            li.classList.remove("prioridade");
            list.appendChild(li); // Remove prioridade e move para o fim.
            if(priorities > 0)priorities--;
        } else {
            if(!checkbox.checked && !li.classList.contains("atrasada")){
                li.classList.add("prioridade");
                list.prepend(li); // Adiciona prioridade e move para o topo.
                priorities++;
            }else{
                showAlert("Tarefas concluídas ou atrasadas não podem ser marcadas como prioridade!", "aviso");
            }
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

    li.classList.add("enter"); // Adiciona classe para animação de entrada.
    li.addEventListener("animationend", () => li.classList.remove("enter"), { once: true });

    return li;
}

/**
 * Coleta o texto do input e adiciona uma nova tarefa à lista.
 */
function addTask() {
    const taskText = capitalize(input.value.trim());
    if (taskText === "") {
        showAlert("Insira o nome de uma tarefa para adicioná-la!", "aviso");
        return;
    }

    if (tarefaExiste(taskText)) {
        showAlert("Essa tarefa já foi adicionada!");
        return;
    }
    
    // Se a lista estiver vazia e o placeholder estiver visível, remova-o.
    const placeholder = document.querySelector(".empty-list-placeholder");
    if (placeholder) {
        list.innerHTML = "";
    }

    // Estrutura de dados da nova tarefa.
    const tarefa = {
        id: Date.now().toString(),
        nome: taskText,
        prazo: "",
        concluida: false,
        prioridade: false,
        descricao: ""
    };

    const li = criarElementoLi(tarefa);
    list.appendChild(li);

    showAlert("Tarefa adicionada com sucesso!", "sucesso");

    input.value = "";
    input.focus();

    updateProgress();
    atualizarProximasTarefas();
    salvarTarefas();
}

// --- INICIALIZAÇÃO E EVENTOS GLOBAIS ---

// Evento de clique na tarefa para navegação ao calendário.
list.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li || !list.contains(li)) return;
    if (e.target.closest("button, input, textarea")) return; // Ignora cliques em elementos interativos internos.

    const nomeTarefa = li.querySelector(".nome").textContent.trim();
    const prazo = li.querySelector(".prazo").value || "";
    const concluida = li.querySelector(".checkbox").checked;
    const nomeLista = titulo.textContent.trim() || "To-Do List";

    // Prepara os parâmetros da tarefa para envio via URL.
    const params = new URLSearchParams({
        id: li.dataset.id,
        nome: nomeTarefa,
        prazo: prazo,
        lista: nomeLista,
        concluida: concluida
    });

    // Redireciona para a página FlowCalendar.html.
    window.location.href = `FlowCalendar.html?${params.toString()}`;
});

// Associa a função addTask aos eventos de clique e Enter.
button.addEventListener("click", addTask);
input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
});

// Inicializa a aplicação ao carregar a página.
window.addEventListener("load", () => {
    listaAtual = obterListaAtual();
    carregarLista(listaAtual);
});