# Remotion Project Instructions

## Git Workflow (IMPORTANT)

- **Always rebase before pushing:** `git fetch origin main && git rebase origin/main`
- **Force push after rebasing:** `git push --force-with-lease` (history changes require this)
- **Why conflicts happen:** PRs get merged while your branch is behind main - same files modified in both places
- **Resolving conflicts:** Edit the conflicted file, then `git add <file>` + `git rebase --continue`

## Remotion Project Structure

- **Entry point:** `src/index.ts` → registers `RemotionRoot`
- **Compositions:** Defined in `src/Root.tsx` - each `<Composition>` is a renderable video
- **Components:** Each video is a separate `.tsx` file (e.g., `WhatsAppConversation.tsx`)
- **Render config:** `render.config.json` controls which videos to render (set `enabled: true/false`)

## GitHub Actions (Artifact-Only Approach)

- **No write permissions** - videos uploaded as downloadable artifacts only
- Workflow reads `render.config.json` to render only enabled compositions
- Trigger manually via `workflow_dispatch` or automatically on push to main
- Download rendered videos from the workflow's "Artifacts" section

## Remotion Best Practices

- Use `useCurrentFrame()` and `useVideoConfig()` for timing/dimensions
- Use `spring()` for organic/bouncy animations
- Use `interpolate()` for linear value mapping
- Use `<Sequence>` for timing when elements appear
- Use `<Series>` for sequential playback (one after another)
- Always use `extrapolateRight: 'clamp'` to prevent values exceeding range
- Use `random(seed)` for deterministic randomness (same result every render)

## Videos Created

| ID | Description | Dimensions | Format |
|----|-------------|------------|--------|
| `WhatsAppConversation` | German Bitcoin chat | 1080x1920 | Vertical (9:16) |
| `EvolvingMotion` | Motion rules evolution demo | 1080x1080 | Square (1:1) |
| `LinkedInCinematic` | B2B trends with glitch effects | 1080x1350 | Portrait (4:5) |
| `SlackLinkedInRoast` | Funny Slack convo about LinkedIn UX | 1920x1080 | Landscape (16:9) |

## Render Config Example

```json
{
  "compositions": [
    {"id": "SlackLinkedInRoast", "output": "slack-linkedin-roast.mp4", "enabled": true},
    {"id": "LinkedInCinematic", "output": "linkedin-cinematic.mp4", "enabled": false}
  ]
}
```

Only compositions with `"enabled": true` will be rendered by the GitHub Action.
