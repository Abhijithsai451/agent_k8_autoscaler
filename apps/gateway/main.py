from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.gateway.routes import auth, tasks
from apps.gateway.config import settings

app = FastAPI(title = "agent-k8-autoscaler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.gateway_host,
        port=settings.gateway_port,
        reload=True,
    )
