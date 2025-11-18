// JS para validação e animações da página de registro

document.addEventListener("DOMContentLoaded", () => {
    const btnRegistrar = document.querySelector(".register-button");
    const inputs = document.querySelectorAll(".input-field");

    btnRegistrar.addEventListener("click", () => {
        const nome = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const senha = inputs[2].value;
        const confirmar = inputs[3].value;

        if (!nome || !email || !senha || !confirmar) {
            showMessage("Preencha todos os campos!", "error");
            return;
        }

        if (!validateEmail(email)) {
            showMessage("Email inválido!", "error");
            return;
        }

        if (senha !== confirmar) {
            showMessage("As senhas não coincidem!", "error");
            return;
        }

        showMessage("Registrado com sucesso!", "success");
        clearFields();
    });
});

function validateEmail(email) {
    const regex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}

function clearFields() {
    document.querySelectorAll(".input-field").forEach(input => input.value = "");
}

// Exibe mensagens animadas
function showMessage(text, type) {
    const oldMsg = document.querySelector('.msg');
    if (oldMsg) oldMsg.remove();

    const msg = document.createElement("div");
    msg.className = `msg ${type}`;
    msg.textContent = text;

    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.padding = "12px 20px";
    msg.style.borderRadius = "10px";
    msg.style.fontSize = "16px";
    msg.style.zIndex = "999";
    msg.style.animation = "fadeIn 0.5s ease";

    if (type === "error") {
        msg.style.background = "#ef4444";
    } else {
        msg.style.background = "#22c55e";
    }

    document.body.appendChild(msg);

    setTimeout(() => {
        msg.style.animation = "fadeOut 0.5s ease";
        setTimeout(() => msg.remove(), 500);
    }, 2500);
}

// Keyframe animations por JS (caso CSS externo não esteja presente)
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
