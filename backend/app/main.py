from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router

app=FastAPI(title="Food Store",description="API del sistema de pedidos Food Store",version="1.0.0")

app.add_middleware(CORSMiddleware,allow_origins=[settings.FRONTEND_ORIGIN],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

@app.on_event("startup")

def startup(): create_all_tables()
for r in [auth_router,usuarios_router,categorias_router,productos_router,pedidos_router]: app.include_router(r,prefix="/api/v1")

@app.get("/",tags=["Estado"])

def estado(): return {"mensaje":"API Food Store funcionando"}
