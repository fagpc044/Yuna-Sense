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