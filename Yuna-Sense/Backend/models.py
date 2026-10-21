from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Mensagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    texto = db.Column(db.String(500), nullable=False)
    data = db.Column(db.Date, nullable=False, unique=True)
    categoria = db.Column(db.String(50), nullable=False)


class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(80), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.String(500), default="Olá! Estou usando o Yuna Sense.")
    foto = db.Column(db.String(255), default="default.png")

class Emocao(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuario.id"),
        nullable=False
    )

    emocao = db.Column(
        db.String(30),
        nullable=False
    )

    data = db.Column(
        db.Date,
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint(
            "usuario_id",
            "data",
            name="uq_emocao_usuario_data"
        ),
    )