# NotebookLM Frame Extractor

A single-page web app that runs completely in the browser to extract visually distinct frames from NotebookLM-exported MP4 videos. Upload a video and the page will render only the frames that differ from previous saves by a configurable threshold, then let you download PNGs or a bundled ZIP (with a manifest) without sending any data to a server.

## Features

- Client-side processing using the HTML5 Video + Canvas APIs; no backend services or uploads required.
- Adjustable difference threshold and minimum spacing to control how many frames are emitted.
- Automatic fallback for browsers that do not support `requestVideoFrameCallback` by stepping through the video at a configurable FPS estimate.
- Instant download links for each extracted frame and an optional ZIP containing all frames plus `frames.json` metadata.

## Getting started

1. Open [`frame_extractor.html`](frame_extractor.html) in any modern desktop browser (Chrome, Edge, Firefox, or Safari).
2. Choose your NotebookLM MP4 export and tweak the extraction settings if needed.
3. Click **Extract frames** and wait for processing to finish.
4. Download individual PNGs or the generated ZIP archive.

> **Tip:** Processing long or high-resolution videos is CPU intensive. Keep the tab focused during extraction and consider increasing the minimum interval or threshold to reduce the number of frames captured.

## Technical notes

- The per-frame difference score is the average absolute RGB delta compared to the previously saved frame, producing values in the 0–255 range.
- Frame filenames include their index and timestamp (e.g., `frame_00012_t4.80.png`) to simplify importing into downstream AI tools.
- All generated object URLs are revoked once you start a new extraction to free browser memory.

## Compatibility

The app targets evergreen browsers. On platforms where `requestVideoFrameCallback` is unavailable, it falls back to seeking through the video at the configured FPS estimate. Mobile browsers may throttle background tabs, so for best results keep the page active during processing.
