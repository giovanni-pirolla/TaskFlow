const input = document.getElementById("taskInput");
const button = document.getElementById("addIt");
const list = document.getElementById("lista");
let priorities = 0;


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
    titulo.contentEditable=true;
    titulo.focus();

    const rangeTitle=document.createRange();
    rangeTitle.selectNodeContents(titulo);

    const selectionTitle= window.getSelection();
    selectionTitle.removeAllRanges();
    selectionTitle.addRange(rangeTitle);

    titulo.addEventListener("blur", ()=>{
        titulo.contentEditable=false;
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

    progression.textContent=`Tarefas Concluídas: ${done}/${total}`;
    prioridades.textContent=`Tarefas em Prioridade: ${priorities}`;
}



//Função para adicionar tarefa
function addTask() {
    const taskText = input.value.trim();

    if (taskText !== "") {
        const li = document.createElement("li");

        // Container para checkbox + texto
        const taskContainer = document.createElement("div");
        taskContainer.classList.add("task-container");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox"

        const span = document.createElement("span");
        span.textContent = taskText;

        checkbox.addEventListener("change", () => {
            span.classList.toggle("done", checkbox.checked);
            updateProgress();
        });

        taskContainer.appendChild(checkbox);
        taskContainer.appendChild(span);

        // Container para os botões
        const btnContainer = document.createElement("div");
        btnContainer.classList.add("botoes");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.classList.add("edit");

        editBtn.addEventListener("click", () => {
            span.contentEditable = true;
            span.focus();

            const range = document.createRange();
            range.selectNodeContents(span);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            span.addEventListener("blur", () => {
                span.contentEditable = false;
            });

            span.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    span.contentEditable = false;
                    span.blur();
                }
            });
        });

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remover";
        removeBtn.classList.add("remove");

        removeBtn.addEventListener("click", () => {
            li.classList.add("exit");
            li.addEventListener("animationend", () => {
                list.removeChild(li);
                updateProgress();
            }, { once: true });
        });

        const prioridadeBtn = document.createElement("button");
        const prioridadeImg = document.createElement("img");
        prioridadeImg.src = "Imagens/alerta.webp";
        prioridadeBtn.alt = "Adicionar Prioridade";
        prioridadeBtn.classList.add("prioridade-btn");
        prioridadeBtn.appendChild(prioridadeImg);

        prioridadeBtn.addEventListener("click", () => {
        const viraPrioridade = !li.classList.contains("prioridade");

        li.classList.add("moving");

        if (viraPrioridade) {
            li.classList.add("prioridade");
            priorities++;
        } else {
            li.classList.remove("prioridade");
            priorities--;
        }

        li.addEventListener("transitionend", () => {
            li.classList.remove("moving");
        }, { once: true });
        updateProgress();
        });

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(removeBtn);
        btnContainer.appendChild(prioridadeBtn);

        // Monta o li final
        li.appendChild(taskContainer);
        li.appendChild(btnContainer);

        list.appendChild(li);

        li.classList.add("enter");
        li.addEventListener("animationend", () => {
        li.classList.remove("enter");
        }, { once: true });

        input.value = "";
        input.focus();

        updateProgress();
    }
}


//Eventos para adicionar tarefas
button.addEventListener("click", addTask);

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});


