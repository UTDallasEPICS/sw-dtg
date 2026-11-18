# Game Settings (Teacher)

## Overview
The teacher setup page is the entry point for starting a game session. When a teacher opens the page, a game room code (PIN) is generated automatically on the server and displayed, and the teacher can launch the session once the code is ready. Deck selection is planned but not yet implemented.

## Route
- Path: `/admin/setup`
- File: `app/pages/admin/setup.vue`

## Features
- **Page Title**: Displays "Set up Page"
- **Game Room Code**: On page load, a 6-digit game code is requested from the server and shown under the label "Game Room Code:"
- **Error Handling**: If the code cannot be generated, an error message is displayed ("Failed to generate PIN. Please refresh the page.")
- **Deck Selection**: Shows a "Choose a Deck" label with an empty placeholder box; deck components are not implemented yet
- **Start Session Button**: Navigates to `/lobby?pin=<gamePin>` and is disabled while no game code has been generated

## Components Used
- `NuxtLink` - Wraps the Start Session button and carries the generated PIN to the lobby
- Plain HTML elements (`div`, `h1`, `p`, `button`) - Layout, labels, code display, and action button
- No Nuxt UI components are used on this page

## Implementation Details
The page calls the server route `POST /api/rooms/gamepin` inside `generateGamePin()`, which runs automatically via `onMounted()`. The server generates a random 6-digit code, ensures it does not collide with an existing room, stores the room in the in-memory `activeRooms` registry (`server/utils/rooms.ts`) with status `LOBBY` and an empty players list, and returns `{ gameCode }`.

The component accepts either `data.gameCode` or `data.pin` as the response field, so it stays compatible with either naming. The resulting value is stored in the `gamePin` ref, which drives both the on-screen code and the enabled state of the Start Session button.

Because rooms live in server RAM, the registry is cleared when the server restarts, and it is not shared between multiple server instances.

## Navigation
There is currently no in-app link to this page; it is reached directly at `/admin/setup`. Choosing "Start Session" navigates to the teacher lobby at `/lobby?pin=<gamePin>`, which reads the `pin` query parameter to show the room code and the list of joined players.
