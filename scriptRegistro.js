/**
 * Executa as configurações iniciais e associa os eventos após o carregamento do DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Botão de registro
    const btnRegistrar = document.querySelector(".register-button");
    // Campos de input (Nome, Email, Senha, Confirmação).
    const inputs = document.querySelectorAll(".input-field");

    // Adiciona o listener de clique ao botão de registro.
    btnRegistrar.addEventListener("click", () => {
        // Coleta e normaliza os valores dos campos.
        const nome = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const senha = inputs[2].value;
        const confirmar = inputs[3].value;

        // Validação de campos vazios.
        if (!nome || !email || !senha || !confirmar) {
            showMessage("Preencha todos os campos!", "error");
            return; // Interrompe a execução.
        }

        // Validação do formato do email.
        if (!validateEmail(email)) {
            showMessage("Email inválido!", "error");
            return;
        }

        // Validação de senhas coincidentes.
        if (senha !== confirmar) {
            showMessage("As senhas não coincidem!", "error");
            return;
        }

        // Registro bem-sucedido (apenas uma simulação visual para o dia da apresentação).
        showMessage("Registrado com sucesso!", "success");
        clearFields(); // Limpa os campos após o sucesso.
    });
});

/**
 * Função para validar o formato do email usando uma Expressão Regular (Regex).
 * @param {string} email - String de email a ser testada.
 * @returns {boolean} - Retorna true se o formato for válido.
 */
function validateEmail(email) {
    // Regex para um formato básico de email (texto@texto.dominio).
    const regex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}

/**
 * Limpa o valor de todos os campos de input.
 */
function clearFields() {
    document.querySelectorAll(".input-field").forEach(input => input.value = "");
}

/**
 * Exibe uma mensagem de alerta (sucesso ou erro) no topo da tela.
 * @param {string} text - Conteúdo da mensagem.
 * @param {string} type - Tipo da mensagem ('success' ou 'error').
 */
function showMessage(text, type) {
    // Remove mensagens anteriores para exibir apenas a mais recente.
    const oldMsg = document.querySelector('.msg');
    if (oldMsg) oldMsg.remove();

    // Cria e configura o elemento da mensagem.
    const msg = document.createElement("div");
    msg.className = `msg ${type}`;
    msg.textContent = text;

    // Estilos CSS inline para posicionamento e aparência.
    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.padding = "12px 20px";
    msg.style.borderRadius = "10px";
    msg.style.fontSize = "16px";
    msg.style.zIndex = "999";
    msg.style.animation = "fadeIn 0.5s ease"; // Aplica a animação de entrada.

    // Define a cor de fundo com base no tipo de mensagem.
    if (type === "error") {
        msg.style.background = "#ef4444";
    } else {
        msg.style.background = "#22c55e";
    }

    document.body.appendChild(msg);

    // Configura o timer para remover a mensagem.
    setTimeout(() => {
        msg.style.animation = "fadeOut 0.5s ease"; // Inicia a animação de saída.
        // Remove o elemento após a conclusão da animação de fadeOut.
        setTimeout(() => msg.remove(), 500);
    }, 2500); // Exibe por 2.5 segundos.
}

// Animações CSS

/**
 * Usa os keyframes CSS no cabeçalho do documento para garantir
 * que as animações fadeIn e fadeOut funcionem.
 */
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, -20px); }
}
`;
document.head.appendChild(style);