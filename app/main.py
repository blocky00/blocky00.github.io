from __future__ import annotations

import json
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

OUTPUT_ROOT = Path("output")
OUTPUT_ROOT.mkdir(exist_ok=True)

app = FastAPI(title="NotebookLM Frame Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)

app.mount("/results", StaticFiles(directory=OUTPUT_ROOT), name="results")


def extract_unique_frames(
    video_path: Path,
    frames_dir: Path,
    diff_threshold: float = 5.0
) -> List[dict]:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Unable to open uploaded video.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    prev_gray = None
    frame_idx = 0
    saved_frames: List[dict] = []

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        diff_score = float("inf") if prev_gray is None else float(np.mean(cv2.absdiff(gray, prev_gray)))

        if prev_gray is None or diff_score >= diff_threshold:
            timestamp = frame_idx / fps if fps else 0.0
            frame_name = f"frame_{frame_idx:05d}_t{timestamp:.2f}.png"
            frame_path = frames_dir / frame_name
            cv2.imwrite(str(frame_path), frame)

            saved_frames.append(
                {
                    "frame": frame_idx,
                    "timestamp": round(timestamp, 2),
                    "filename": frame_name,
                    "diff_score": round(diff_score if diff_score != float("inf") else 0.0, 2),
                }
            )
            prev_gray = gray

        frame_idx += 1

    cap.release()

    return saved_frames


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if file.content_type not in {"video/mp4", "video/mpeg", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only MP4 video uploads are supported.")

    job_id = uuid.uuid4().hex
    job_dir = OUTPUT_ROOT / job_id
    frames_dir = job_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
        temp_path = Path(tmp_file.name)
        shutil.copyfileobj(file.file, tmp_file)

    try:
        frames = extract_unique_frames(temp_path, frames_dir)
    except ValueError as exc:  # pragma: no cover - defensive; tests not set up
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        temp_path.unlink(missing_ok=True)

    if not frames:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail="No distinguishable frames detected in the uploaded video.")

    manifest_path = job_dir / "frames.json"
    manifest_path.write_text(json.dumps(frames, indent=2))

    zip_path = job_dir / f"{job_id}_frames.zip"
    shutil.make_archive(zip_path.with_suffix(""), "zip", frames_dir)

    response_payload = {
        "job_id": job_id,
        "frames": frames,
        "download_url": f"/results/{job_id}/{zip_path.name}",
    }

    return response_payload
