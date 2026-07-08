import asyncio
import re

import aiomqtt

from src.config import settings
from src.db import metric
from src.ws import ws

TOPIC_METRIC = {
    "/IskraBanya/Temp": "temp",
    "/IskraBanya/Humid": "humid",
    "/IskraBanya/TempOut": "temp_out",
    "/IskraBanya/Pressure": "pressure",
    "/IskraBanya/Uptime": "uptime",
}


def parse_uptime(payload: str) -> float | None:
    """
    Parses uptime like "#d#h#m" into time
    """
    match = re.fullmatch(r"(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?", payload.strip())
    if not match or not any(match.groups()):
        return None
    days, hours, minutes = (int(x) if x else 0 for x in match.groups())
    return days * 86400 + hours * 3600 + minutes * 60


def parse_value(metric_name: str, payload: str) -> float | None:
    """
    Converts raw payload into a numeric value for the given metric
    """
    if metric_name == "uptime":
        return parse_uptime(payload)
    try:
        return float(payload)
    except ValueError:
        return None


async def handle_message(topic: str, payload: str) -> None:
    """
    Handles message and writes it to database
    """
    _metric = TOPIC_METRIC.get(topic)
    if _metric is None:
        return

    value = parse_value(_metric, payload)
    if value is None:
        return

    await metric.add(_metric, value)
    await ws.broadcast({_metric: value})


async def mqtt_listen() -> None:
    """
    Listens to MQTT server in background
    """
    while True:
        try:
            async with aiomqtt.Client(
                hostname=settings.settings.MQTT_HOST,
                port=settings.settings.MQTT_PORT,
                username=settings.settings.MQTT_USER,
                password=settings.settings.MQTT_PASSWORD,
                identifier=settings.settings.MQTT_CLIENT_ID,
            ) as client:
                await client.subscribe("/IskraBanya/#")
                async for message in client.messages:
                    await handle_message(
                        message.topic.value,
                        message.payload.decode(),
                    )
        except aiomqtt.MqttError:
            await asyncio.sleep(5)
