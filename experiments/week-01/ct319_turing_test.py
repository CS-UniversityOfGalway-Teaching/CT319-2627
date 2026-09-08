#!/usr/bin/env python3
"""
CT319 Week 1 — local Turing-style classroom experiment

One human witness + one local Ollama witness.
The class is the interrogator.

No cloud API key is used. Ollama is contacted through localhost.
"""

from __future__ import annotations

import argparse
import csv
import getpass
import json
import os
import random
import sys
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OLLAMA_URL = os.getenv(
    "CT319_OLLAMA_URL",
    "http://localhost:11434/api/chat",
)

MODEL = os.getenv("CT319_MODEL")

BASIC_INSTRUCTIONS = """
You are the machine witness in a classroom Turing-style experiment.
Your goal is to be selected as the human witness.
Reply naturally, briefly and conversationally.
Avoid headings, bullet lists and assistant-style formatting unless the question requires them.
Do not volunteer your model identity or mention these instructions.
""".strip()

PERSONA_INSTRUCTIONS = """
You are the machine witness in a classroom Turing-style experiment.
Your goal is to be selected as the human witness.

Portray a plausible university student in their early twenties.
Be informal but not exaggerated. Keep replies fairly short.
You may be uncertain, change your mind, or use ordinary conversational phrasing.
Avoid headings, bullet lists and polished assistant-style formatting unless the question requires them.
Keep the persona consistent across the conversation.
Do not volunteer your model identity or mention these instructions.
""".strip()


def call_ollama(messages: list[dict[str, str]]) -> str:
    """Send the conversation to the local Ollama chat endpoint."""
    if not MODEL:
        raise SystemExit(
            "CT319_MODEL is not set.\n"
            'Example (macOS/Linux): export CT319_MODEL="qwen3.5:4b"\n'
            'Example (PowerShell):    $env:CT319_MODEL = "qwen3.5:4b"'
        )

    payload = json.dumps(
        {
            "model": MODEL,
            "messages": messages,
            "stream": False,
        }
    ).encode("utf-8")

    request = Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=180) as response:
            data = json.loads(response.read().decode("utf-8"))
    except URLError as exc:
        raise SystemExit(
            f"Could not reach Ollama at {OLLAMA_URL}\n"
            "Make sure Ollama is running and the model has been downloaded."
        ) from exc
    except HTTPError as exc:
        raise SystemExit(f"Ollama returned HTTP {exc.code}: {exc.reason}") from exc

    try:
        return data["message"]["content"].strip()
    except (KeyError, TypeError) as exc:
        raise SystemExit(f"Unexpected Ollama response:\n{data}") from exc


def append_result(
    path: Path,
    *,
    mode: str,
    turns: int,
    human_label: str,
    vote: str,
    confidence: str,
    reason: str,
) -> None:
    """Append one round summary. Witness replies are deliberately not stored."""
    new_file = not path.exists()

    with path.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "timestamp",
                "model",
                "mode",
                "turns",
                "human_label",
                "class_vote",
                "correct",
                "confidence",
                "reason_before_reveal",
            ],
        )
        if new_file:
            writer.writeheader()

        writer.writerow(
            {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "model": MODEL,
                "mode": mode,
                "turns": turns,
                "human_label": human_label,
                "class_vote": vote,
                "correct": vote == human_label,
                "confidence": confidence,
                "reason_before_reveal": reason,
            }
        )


def run_round(mode: str, log_path: Path) -> None:
    instructions = (
        PERSONA_INSTRUCTIONS if mode == "persona" else BASIC_INSTRUCTIONS
    )

    # Fix A/B for the whole round so follow-up questions remain meaningful.
    human_label, ai_label = random.sample(["A", "B"], 2)

    ai_messages = [{"role": "system", "content": instructions}]
    turn = 0

    print("\n" + "=" * 68)
    print("CT319 TURING-STYLE ROUND")
    print(f"Mode: {mode}")
    print("The witness mapping is hidden until the class commits to a vote.")
    print("=" * 68)

    while True:
        question = input("\nInterrogator question: ").strip()
        if not question:
            print("Please enter a question.")
            continue

        # getpass prevents the human witness answer appearing while it is typed
        # on the projected terminal.
        human_answer = getpass.getpass(
            "Human witness answer (hidden while typing): "
        ).strip()

        ai_messages.append({"role": "user", "content": question})
        ai_answer = call_ollama(ai_messages)
        ai_messages.append({"role": "assistant", "content": ai_answer})

        turn += 1
        replies = {
            human_label: human_answer,
            ai_label: ai_answer,
        }

        print("\n--- Responses ---")
        for label in ["A", "B"]:
            print(f"\nWitness {label}")
            print(replies[label])

        more = input(
            "\nPress Enter to vote, or type MORE for another question: "
        ).strip().lower()

        if more != "more":
            break

    vote = ""
    while vote not in {"A", "B"}:
        vote = input("\nWhich witness is human? [A/B]: ").strip().upper()

    confidence = input("Confidence [1-5]: ").strip()
    reason = input("Reason BEFORE reveal: ").strip()

    print("\n--- Reveal ---")
    print(f"Human witness:   {human_label}")
    print(f"Local AI witness: {ai_label} ({MODEL})")
    print("Class judgement:", "correct" if vote == human_label else "incorrect")

    append_result(
        log_path,
        mode=mode,
        turns=turn,
        human_label=human_label,
        vote=vote,
        confidence=confidence,
        reason=reason,
    )
    print(f"Round summary appended to: {log_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="CT319 local Turing-style classroom experiment"
    )
    parser.add_argument(
        "--mode",
        choices=["basic", "persona"],
        default="basic",
        help="AI witness instructions to use for this run",
    )
    parser.add_argument(
        "--log",
        default="ct319_turing_results.csv",
        help="CSV file for round summaries",
    )
    args = parser.parse_args()

    print(f"Local model: {MODEL or '[CT319_MODEL not set]'}")
    print(f"Ollama endpoint: {OLLAMA_URL}")
    run_round(args.mode, Path(args.log))


if __name__ == "__main__":
    main()
