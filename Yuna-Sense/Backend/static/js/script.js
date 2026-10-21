// =========================
// ELEMENTOS DO CHAT
// =========================

const input =
    document.getElementById("entrada-usuario");

const mensagens =
    document.getElementById("mensagens");


// =========================
// ENVIAR MENSAGEM
// =========================

async function enviar() {

    const texto = input.value.trim();

    if (texto === "") {
        return;
    }

    input.disabled = true;


    // =========================
    // MENSAGEM DO USUÁRIO
    // =========================

    const mensagemUsuario =
        document.createElement("div");

    mensagemUsuario.classList.add(
        "mensagem",
        "usuario"
    );

    mensagemUsuario.textContent = texto;

    mensagens.appendChild(
        mensagemUsuario
    );

    mensagens.scrollTop =
        mensagens.scrollHeight;

    input.value = "";


    try {

        // =========================
        // ENVIA PARA O FLASK
        // =========================

        const resposta = await fetch(
            "/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    mensagem: texto
                })
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao conectar com o servidor."
            );

        }


        const dados =
            await resposta.json();


        // =========================
        // MENSAGEM DA IA
        // =========================

        const mensagemIA =
            document.createElement("div");

        mensagemIA.classList.add(
            "mensagem",
            "bot"
        );

        mensagemIA.textContent =
            dados.resposta;

        mensagens.appendChild(
            mensagemIA
        );

        mensagens.scrollTop =
            mensagens.scrollHeight;

    }


    catch (erro) {

        console.error(erro);


        const mensagemErro =
            document.createElement("div");

        mensagemErro.classList.add(
            "mensagem",
            "bot"
        );

        mensagemErro.textContent =
            "Desculpe, não consegui me conectar ao servidor.";

        mensagens.appendChild(
            mensagemErro
        );

        mensagens.scrollTop =
            mensagens.scrollHeight;

    }


    finally {

        input.disabled = false;

        input.focus();

    }

}


// =========================
// ENTER PARA ENVIAR
// =========================

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            enviar();

        }

    }
);


// =========================
// SISTEMA DE EMOÇÕES
// =========================

const botoesEmocao =
    document.querySelectorAll(
        ".emocao-btn"
    );

const emocaoSelecionada =
    document.getElementById(
        "emocao-selecionada"
    );


// =========================
// NOMES DAS EMOÇÕES
// =========================

const nomesEmocoes = {

    "muito-triste":
        "Muito triste",

    "triste":
        "Triste",

    "neutro":
        "Neutro",

    "feliz":
        "Feliz",

    "muito-feliz":
        "Muito feliz"

};


// =========================
// SELECIONAR EMOÇÃO
// =========================

botoesEmocao.forEach(
    function(botao) {

        botao.addEventListener(
            "click",
            function() {


                // Remove seleção anterior.
                botoesEmocao.forEach(
                    function(botao) {

                        botao.classList.remove(
                            "selecionada"
                        );

                    }
                );


                // Seleciona o botão clicado.
                botao.classList.add(
                    "selecionada"
                );


                // Pega a emoção.
                const emocao =
                    botao.dataset.emocao;


                // Mostra o texto.
                emocaoSelecionada.textContent =
                    `Você está se sentindo: ${nomesEmocoes[emocao]}`;


                // =========================
                // SALVA NO NAVEGADOR
                // =========================

                localStorage.setItem(
                    "emocao",
                    emocao
                );


                // =========================
                // SALVA NO BANCO DE DADOS
                // =========================

                fetch("/registrar-emocao", {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        emocao: emocao
                    })

                })

                .then(function(resposta) {

                    if (!resposta.ok) {

                        throw new Error(
                            "Não foi possível salvar a emoção."
                        );

                    }

                    return resposta.json();

                })

                .then(function(dados) {

                    console.log(
                        "Emoção salva no banco:",
                        dados
                    );

                })

                .catch(function(erro) {

                    console.error(
                        "Erro ao salvar emoção:",
                        erro
                    );

                });

            }
        );

    }
);

const botaoTema = document.getElementById("tema-btn");

const iconeSol = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="4"/>
<path d="M12 2v2"/><path d="M12 20v2"/>
<path d="m4.93 4.93 1.41 1.41"/>
<path d="m17.66 17.66 1.41 1.41"/>
<path d="M2 12h2"/><path d="M20 12h2"/>
<path d="m6.34 17.66-1.41 1.41"/>
<path d="m19.07 4.93-1.41 1.41"/>
</svg>`;

const iconeLua = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M18 5h4"/><path d="M20 3v4"/>
<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472
c.405-.022.617.46.402.803a6 6 0 0 0
8.268 8.268c.344-.215.825-.004.803.401"/>
</svg>`;

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("temaEscolhido", tema);

    // No tema claro aparece a lua; no escuro, o sol
    botaoTema.innerHTML = tema === "claro" ? iconeLua : iconeSol;
}

const temaSalvo = localStorage.getItem("temaEscolhido") || "claro";
aplicarTema(temaSalvo);

botaoTema.addEventListener("click", () => {
    const temaAtual = document.documentElement.getAttribute("data-theme");
    aplicarTema(temaAtual === "claro" ? "escuro" : "claro");
});
