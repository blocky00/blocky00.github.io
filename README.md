# NotebookLM Frame Extractor

A minimal FastAPI backend and lightweight HTML frontend for extracting visually distinct frames from NotebookLM-style MP4 exports. Upload an MP4 file and receive PNG stills labeled with their frame numbers and timestamps, plus a downloadable archive.

## Getting started

1. **Install dependencies**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run the backend**

   ```bash
   uvicorn app.main:app --reload
   ```

   The API exposes:

   - `POST /upload` — accepts an MP4 file (`multipart/form-data` key `file`) and returns the list of extracted frames with download links.
   - `/results/...` — static files served from the `output/` directory (individual frames and generated ZIP archives).

3. **Open the frontend**

   Serve `frame_extractor.html` (e.g. with the Live Server VS Code extension or any static file server) and point it to the running backend (defaults to the same origin).

## How it works

- The backend stores uploaded videos temporarily, extracts frames with OpenCV, and saves only frames that differ from the previous saved frame by an average grayscale difference threshold (default `5.0`).
- Outputs are written to `output/<job_id>/frames`. A manifest (`frames.json`) and a ZIP archive of all frames are also generated for convenience.

Adjust the logic in `app/main.py` if you need custom thresholds, alternative output formats, or long-running background jobs.
