# NotebookLM Frame Extractor – Conversational Agent Knowledge Base

## 1. App Overview
- **Purpose:** Extract visually distinct frames from an uploaded MP4 entirely in the browser. No server communication or uploads occur; processing is client-side via the HTML5 `<video>` and `<canvas>` APIs.
- **Key Outcome:** Users receive PNG snapshots of notable frames plus an optional ZIP (PNG frames + `frames.json` manifest) for downstream AI tooling.

## 2. User Journey & UI Landmarks
1. **Landing Copy:** Explains the goal and highlights adjustable sensitivity for frame differences.
2. **Upload Section:** Users must select an MP4 via the “Video file” input before the “Extract frames” button becomes useful.
3. **Parameter Inputs:**
   - "Frame difference threshold"
   - "Minimum seconds between saved frames"
   - "Fallback FPS for older browsers"
4. **Run Extraction:** Clicking “Extract frames” kicks off processing. A status panel appears showing progress and the current video time. A progress bar tracks processed frames.
5. **Results Section:** Once frames are saved, a summary (count + processed duration) appears alongside a list of frames with “Open” and “Download PNG” actions. A "Download all as ZIP" button becomes active when at least one frame is captured.

## 3. Parameters Explained
### 3.1 Frame Difference Threshold
- **Definition:** Average per-pixel absolute difference between consecutive frames (0–255 scale) computed on grayscale values. Higher values demand more visual change before a frame is kept.
- **Default:** 8.
- **Guidance:**
  - Lower thresholds (e.g., 2–4) capture subtle movements, increasing saved frames.
  - Higher thresholds (10+) focus on major scene changes.
  - Mention that lighting flicker may inflate differences; users can compensate by raising the threshold.

### 3.2 Minimum Seconds Between Saved Frames
- **Definition:** Enforces temporal spacing between saved frames so near-duplicates aren’t stored.
- **Default:** 0.35 seconds.
- **Guidance:**
  - Set to 0 to allow consecutive frames when detail matters.
  - Increase to 1–2 seconds for slideshow-like captures.
  - If no frames appear, suggest reducing both threshold and minimum interval.

### 3.3 Fallback FPS for Older Browsers
- **Definition:** When `requestVideoFrameCallback` isn’t available, the app samples the video by stepping through this frame rate.
- **Default:** 30 FPS.
- **Guidance:**
  - Lower the FPS if processing is slow on large videos.
  - Raise it (up to source FPS) for more precise sampling when compatibility mode is in effect.

## 4. Processing Logic & Status Feedback
- **Initial Load:** Video metadata (duration, resolution) must load before extraction. Errors here usually indicate unsupported codecs or corrupt files.
- **Frame Capture:**
  - Draws frames to a hidden canvas, computes differences against the prior saved frame’s pixel data, and honors the minimum interval gate.
  - Saved frames receive filenames like `frame_00012_t3.42.png`, embedding index and timestamp.
- **Progress Messaging:** Status text reports number of frames processed and current timestamp; the progress bar either reflects actual frame callbacks or estimated totals in fallback mode.
- **Completion:** Summary updates with total frames saved and seconds processed. The ZIP button binds to the captured frame set.

## 5. Outputs & Downloads
- **Per-frame links:** Each list item offers “Open” (new tab preview) and “Download PNG.”
- **Bulk Export:** “Download all as ZIP” packages every PNG plus a `frames.json` manifest containing frame index, timestamp (seconds), filename, and diff score.
- **URL Cleanup:** Revoking previous blob URLs prevents memory leaks when new runs start.

## 6. Troubleshooting & FAQs for the Agent
- **"Couldn’t process video" errors:** Encourage checking file format (MP4/H.264/AAC), trying a shorter clip, or reducing resolution.
- **"No frames saved" result:** Suggest lowering the threshold and/or minimum interval, or verifying the video actually changes visually.
- **Performance hiccups:** Recommend closing other heavy tabs, shrinking the video, or lowering fallback FPS.
- **Browser compatibility:** Latest Chromium, Firefox, Safari supported. Older browsers rely on fallback stepping; progress may be slower but still works.
- **Privacy reassurance:** Emphasize that files never leave the user’s device.

## 7. Conversational Tips & Suggested Prompts
- Greet users and confirm their goal (e.g., “extract key reference frames for animation tools”).
- Offer to explain each parameter before they run extraction.
- Walk them through a typical workflow: upload → adjust threshold/interval → run → review frames → download ZIP.
- Provide proactive tuning advice: “If you need more frames, lower the threshold slightly and try again.”
- When they finish, mention the manifest for downstream automation and how filenames encode timestamps.

## 8. Safety & Limits
- Large or high-resolution videos can strain the browser; advise processing shorter segments if crashes occur.
- Reassure users that cancelling or refreshing clears temporary data; nothing is stored persistently.

## 9. Quick Reference Cheat Sheet
- **Defaults:** threshold 8, min interval 0.35s, fallback FPS 30.
- **Outputs:** PNG per saved frame, optional ZIP with PNGs + `frames.json` metadata.
- **Key Dependencies:** Runs in browser; uses Canvas API, `requestVideoFrameCallback` when available, JSZip + FileSaver for downloads.

