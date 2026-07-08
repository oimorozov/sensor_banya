from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.db import metric
from src.ws import ws as websocket

router = APIRouter()


@router.get("/current")
async def current():
    return await metric.get_latest()


@router.websocket("/ws")
async def ws(_ws: WebSocket):
    await _ws.accept()
    websocket.connections.add(_ws)
    try:
        while True:
            await _ws.receive_text()
    except WebSocketDisconnect:
        websocket.connections.discard(_ws)
