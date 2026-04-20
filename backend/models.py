from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime

class Resposta(Base):
    __tablename__ = "respostas"
    id = Column(Integer, primary_key=True, index=True)
    e_nps = Column(Integer)
    clima = Column(Integer)       
    lideranca = Column(Integer)  
    satisfacao = Column(Integer)     
    reconhecimento = Column(Integer) 
    comunicacao = Column(Integer)    
    ferramentas = Column(Integer)    
    observacoes = Column(Text, nullable=True)
    data_envio = Column(DateTime, default=datetime.utcnow)