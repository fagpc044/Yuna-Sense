
document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("temaEscolhido") || "claro"
);

const botaoTema = document.getElementById("tema-btn");

if (botaoTema) {
    const iconeSol = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/><path d="M12 20v2"/>
            <path d="M4.93 4.93 6.34 6.34"/>
            <path d="M17.66 17.66 19.07 19.07"/>
            <path d="M2 12h2"/><path d="M20 12h2"/>
            <path d="M6.34 17.66 4.93 19.07"/>
            <path d="M19.07 4.93 17.66 6.34"/>
        </svg>`;

    const iconeLua = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472
            c.405-.022.617.46.402.803a6 6 0 0 0
            8.268 8.268c.344-.215.825-.004.803.401"/>
        </svg>`;

    function aplicarTema(tema) {
        document.documentElement.setAttribute("data-theme", tema);
        localStorage.setItem("temaEscolhido", tema);
        botaoTema.innerHTML = tema === "claro" ? iconeLua : iconeSol;
    }

    aplicarTema(
        localStorage.getItem("temaEscolhido") || "claro"
    );

    botaoTema.addEventListener("click", () => {
        const temaAtual =
            document.documentElement.getAttribute("data-theme");

        aplicarTema(temaAtual === "claro" ? "escuro" : "claro");
    });
}
