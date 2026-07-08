import asyncio

import aiomqtt

from src.config import settings
from src.db import metric

TOPIC_METRIC = {
    "/IskraBanya/Temp": "temp",
    "/IskraBanya/Humid": "humid",
    "/IskraBanya/TempOut": "temp_out",
    "/IskraBanya/Pressure": "pressure",
    "/IskraBanya/Uptime": "uptime",
}


async def handle_message(topic: str, payload: str) -> None:
    """
    Handles message and writes it to database
    """
    _metric = TOPIC_METRIC.get(topic)
    if metric is None:
        return

    try:
        value = float(payload)
    except ValueError:
        return

    await metric.add(_metric, value)  # pyright: ignore


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
