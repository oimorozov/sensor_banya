from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from src.db import metric
from src.ws import ws as websocket
from src.api.user import current_user, sessions

router = APIRouter()


@router.get("/current")
async def current(_: str = Depends(current_user)):
    return await metric.get_latest()


@router.websocket("/ws")
async def ws(_ws: WebSocket):
    session = _ws.cookies.get("session")
    if not session or session not in sessions:
        await _ws.close(code=1008)
        return

    await _ws.accept()
    websocket.connections.add(_ws)
    try:
        while True:
            await _ws.receive_text()
    except WebSocketDisconnect:
        websocket.connections.discard(_ws)
