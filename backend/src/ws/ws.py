from fastapi import WebSocket

connections: set[WebSocket] = set()


async def broadcast(message: dict) -> None:
    for ws in list(connections):
        try:
            await ws.send_json(message)
        except Exception:
            connections.discard(ws)
