import os
from datetime import datetime
from zoneinfo import ZoneInfo

from google import genai
from google.genai import types
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from models import db, Mensagem, Usuario, Emocao


load_dotenv()

MINHA_CHAVE = os.getenv("MINHA_CHAVE")

client = genai.Client(api_key=MINHA_CHAVE)

FUSO_BRASIL = ZoneInfo("America/Sao_Paulo")

historico = []

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL or "sqlite:///yuna.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():

    if "usuario_id" not in session:
        return redirect(url_for("cadastro"))

    hoje = datetime.now(FUSO_BRASIL).date()

    mensagem = Mensagem.query.filter_by(
        data=hoje
    ).first()

    if mensagem is None:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="""
            Crie uma mensagem curta e diferente de encorajamento.
            Seja positiva, acolhedora e natural.
            Gere apenas uma frase.
            Não use aspas.
            """
        )

        texto = response.text.strip()

        mensagem_nova = Mensagem(
            texto=texto,
            data=hoje,
            categoria="encorajamento"
        )

        db.session.add(mensagem_nova)

        try:
            db.session.commit()

            mensagem = mensagem_nova

        except IntegrityError:

            db.session.rollback()

            mensagem = Mensagem.query.filter_by(
                data=hoje
            ).first()

    return render_template(
        "index.html",
        mensagem_diaria=mensagem
    )

@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():

    if request.method == "POST":

        usuario = request.form["usuario"]
        senha = request.form["senha"]
        confirmar_senha = request.form["confirmar_senha"]

        if senha != confirmar_senha:
            flash("As senhas não são iguais!", "erro")
            return render_template("cadastro.html")

        usuario_existente = Usuario.query.filter_by(
            usuario=usuario
        ).first()

        if usuario_existente:
            flash("Esse usuário já existe!", "erro")
            return render_template("cadastro.html")

        senha_hash = generate_password_hash(senha)

        novo_usuario = Usuario(
            usuario=usuario,
            senha=senha_hash
        )

        db.session.add(novo_usuario)
        db.session.commit()

        flash("Cadastro realizado com sucesso!", "sucesso")

        return redirect(url_for("login"))

    return render_template("cadastro.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        usuario = request.form["usuario"]
        senha = request.form["senha"]

        usuario_encontrado = Usuario.query.filter_by(
            usuario=usuario
        ).first()

        if usuario_encontrado:

            senha_correta = check_password_hash(
                usuario_encontrado.senha,
                senha
            )

            if senha_correta:

                session["usuario_id"] = usuario_encontrado.id
                session["usuario"] = usuario_encontrado.usuario

                return redirect(url_for("home"))

        flash("Usuário ou senha incorretos!", "erro")
        return render_template("login.html")

    return render_template("login.html")

@app.route("/perfil")
def perfil():

    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario = Usuario.query.get(session["usuario_id"])

    historico_emocoes = Emocao.query.filter_by(
        usuario_id=session["usuario_id"]
    ).order_by(
        Emocao.data.desc()
    ).limit(7).all()

    return render_template(
        "perfil.html",
        usuario=usuario,
        historico_emocoes=historico_emocoes
    )

@app.route("/editar-perfil", methods=["GET", "POST"])
def editar_perfil():

    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario = Usuario.query.get(session["usuario_id"])

    if request.method == "POST":

        bio = request.form.get("bio")

        if bio is not None:
            usuario.bio = bio

        foto = request.files.get("foto")

        if foto and foto.filename:

            nome_foto = secure_filename(foto.filename)

            pasta = os.path.join(
                app.static_folder,
                "uploads"
            )

            caminho = os.path.join(
                pasta,
                nome_foto
            )

            foto.save(caminho)

            usuario.foto = nome_foto

        db.session.commit()

        flash(
            "Perfil atualizado com sucesso!",
            "sucesso"
        )

        return redirect(url_for("perfil"))

    return render_template(
        "editar_perfil.html",
        usuario=usuario
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/recuperar-senha", methods=["GET", "POST"])
def recuperar_senha():
    if request.method == "POST":
        usuario_nome = request.form["usuario"]
        nova_senha = request.form["nova_senha"]

        usuario = Usuario.query.filter_by(usuario=usuario_nome).first()

        if not usuario:
            flash("Usuário não encontrado.", "erro")
            return redirect(url_for("recuperar_senha"))

        usuario.senha = generate_password_hash(nova_senha)
        db.session.commit()

        flash("Senha alterada com sucesso!", "sucesso")
        return redirect(url_for("login"))

    return render_template("recuperar_senha.html")

@app.route("/registrar-emocao", methods=["POST"])
def registrar_emocao():

    if "usuario_id" not in session:
        return jsonify({
            "erro": "Usuário não autenticado."
        }), 401

    dados = request.get_json()

    emocao = dados.get("emocao")

    emocoes_permitidas = [
        "muito-triste",
        "triste",
        "neutro",
        "feliz",
        "muito-feliz"
    ]

    if emocao not in emocoes_permitidas:
        return jsonify({
            "erro": "Emoção inválida."
        }), 400

    hoje = datetime.now(FUSO_BRASIL).date()

    registro = Emocao.query.filter_by(
        usuario_id=session["usuario_id"],
        data=hoje
    ).first()

    if registro:
        registro.emocao = emocao

    else:
        registro = Emocao(
            usuario_id=session["usuario_id"],
            emocao=emocao,
            data=hoje
        )

        db.session.add(registro)

    db.session.commit()

    return jsonify({
        "sucesso": True
    })

@app.route("/chat", methods=["POST"])
def chat():

    dados = request.get_json()

    pergunta = dados["mensagem"]

    historico.append({
        "role": "user",
        "parts": [{"text": pergunta}]
    })

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=historico,
        config=types.GenerateContentConfig(
            system_instruction=
            "Você é um assistente terapeuta, responda com empatia "
            "e profissionalismo. "
            "Se necessário faça perguntas para entender melhor "
            "a situação do usuário. "
            "Seja curto e direto, no máximo quatro linhas."
        )
    )

    resposta = response.text

    historico.append({
        "role": "model",
        "parts": [{"text": resposta}]
    })

    return jsonify({
        "resposta": resposta
    })

if __name__ == "__main__":
    app.run(debug=True)