from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sinfães Analytics API")

# Liberação total de CORS para o React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RespostaCreate(BaseModel):
    e_nps: int
    nota_clima: int
    nota_lideranca: int
    nota_satisfacao: int
    nota_reconhecimento: int
    nota_comunicacao: int
    nota_ferramentas: int
    observacoes: str = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/respostas/")
def criar_resposta(resposta: RespostaCreate, db: Session = Depends(get_db)):
    db_resposta = models.Resposta(**resposta.model_dump())
    db.add(db_resposta)
    db.commit()
    db.refresh(db_resposta)
    return db_resposta

@app.get("/api/resultados/")
def listar_resultados(db: Session = Depends(get_db)):
    return db.query(models.Resposta).all()