"""
Send push notifications to guests.

Supports two modes:
  1. Supabase Realtime broadcast (built-in, no extra setup)
  2. Firebase Cloud Messaging (FCM) for native mobile/browser push

Usage:
    python notifications/push_notifications.py --message "Dinner starts at 7pm" --channel wedding
    python notifications/push_notifications.py --message "Your room is ready" --mode fcm --topic all_guests
"""
import argparse
import os
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).parent.parent))
from supabase_client import supabase


def broadcast_realtime(channel: str, event: str, payload: dict) -> None:
    """Broadcast a message to all subscribers on a Supabase Realtime channel."""
    result = (
        supabase
        .channel(channel)
        .send({
            "type": "broadcast",
            "event": event,
            "payload": payload,
        })
    )
    print(f"Broadcast sent to channel '{channel}': {payload}")


def send_fcm(server_key: str, topic: str, title: str, body: str) -> None:
    """Send a push notification via Firebase Cloud Messaging to a topic."""
    url = "https://fcm.googleapis.com/fcm/send"
    headers = {
        "Authorization": f"key={server_key}",
        "Content-Type": "application/json",
    }
    data = {
        "to": f"/topics/{topic}",
        "notification": {"title": title, "body": body},
    }
    resp = requests.post(url, json=data, headers=headers, timeout=10)
    resp.raise_for_status()
    print(f"FCM notification sent to topic '{topic}': {resp.json()}")


def main(message: str, mode: str, channel: str, topic: str, title: str) -> None:
    if mode == "realtime":
        broadcast_realtime(channel, "notification", {"title": title, "body": message})
    elif mode == "fcm":
        server_key = os.environ.get("FCM_SERVER_KEY")
        if not server_key:
            print("Error: FCM_SERVER_KEY not set in .env")
            sys.exit(1)
        send_fcm(server_key, topic, title, message)
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send push notifications to guests")
    parser.add_argument("--message", required=True, help="Notification body text")
    parser.add_argument("--title", default="Wedding Update", help="Notification title")
    parser.add_argument("--mode", choices=["realtime", "fcm"], default="realtime", help="Delivery mode")
    parser.add_argument("--channel", default="wedding", help="Supabase Realtime channel name (realtime mode)")
    parser.add_argument("--topic", default="all_guests", help="FCM topic (fcm mode)")
    args = parser.parse_args()
    main(args.message, args.mode, args.channel, args.topic, args.title)
