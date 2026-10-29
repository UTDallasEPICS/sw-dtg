# Game Settings (Student)

## Overview

The student join page lets a player enter a 6-digit Game PIN and a display name to join an existing Stronger Twister room. The server validates the PIN, confirms that the room is still accepting players, registers the student in the room's player list, and the client then navigates to the student lobby. Students do not need an account to join.

The room backend (`server/utils/rooms.ts`, `server/api/rooms/gamepin.post.ts`) is inherited from the `admin` branch and is reused; this feature does not create a second room registry.

## Route

- Path: `/player/join`
- File: `app/pages/player/join.vue`
- API: `POST /api/rooms/:pin/players`

## Features

- **Page Title**: Displays "Join a Game" with the "Stronger Twister" application name.
- **Game PIN Input**: Accepts digits only, capped at 6 characters, with a numeric mobile keyboard (`inputmode="numeric"`).
- **Student Name Input**: Accepts a display name of up to 30 characters.
- **Input Validation**:
  - The Game PIN is required and must contain exactly 6 digits.
  - The student name is required, is trimmed before submission, and must not be blank.
  - Names longer than 30 characters are rejected.
  - Inline errors appear next to the relevant field on blur or submit.
- **Join Game Button**: Submits the form and is disabled while the request is in progress or while the inputs are invalid.
- **Loading State**: The button shows a spinner and "Joining game..." while the request is in progress; duplicate submissions are prevented.
- **Server Error Handling**: A recoverable alert is shown above the form. The entered values are preserved so the student can correct them and retry.
- **Successful Join**: The student is registered in the room and navigated to `/lobby/student?pin=<gamePin>`.

## Components Used

- `UContainer` - Page layout and centering
- `UCard` - Join form container
- `UFormField` - Field labels and inline validation errors
- `UInput` - Game PIN and student name inputs
- `UAlert` - Server-side error messages
- `UButton` - Join action with loading and disabled states

## Implementation Details

### Join Page

`app/pages/player/join.vue` uses the Vue Composition API with `ref` and `computed` state for the PIN, name, field errors, server error, and request status.

The page performs client-side validation before sending anything to the server. On submit it calls:

```text
POST /api/rooms/<pin>/players
{ "name": "<trimmed student name>" }
```

The client only navigates to the lobby after the server returns a successful response. If the request fails, the form stays on the page and remains editable.

### Player Registration API

`server/api/rooms/[pin]/players.post.ts` implements the registration endpoint.

Successful response — HTTP 201:

```json
{
  "pin": "123456",
  "player": "Alex",
  "players": ["Alex", "Sam"]
}
```

Server-side behavior:

1. Validate that the route PIN contains exactly 6 digits.
2. Read and validate the request body; the name must be a string.
3. Trim the name, reject blank names, and reject names longer than 30 characters.
4. Look up the room in the shared `activeRooms` registry.
5. Reject the request if the room does not exist.
6. Reject the request if the room status is not `LOBBY`.
7. Reject duplicate names within the same room using a case-insensitive comparison.
8. Append the validated name to the room's `players` array.
9. Return the PIN, the registered player name, and the updated player list.

The client never modifies room state directly.

### Error Responses

| Status | Code             | Meaning                                     |
| ------ | ---------------- | ------------------------------------------- |
| 400    | `INVALID_PIN`    | The PIN is not exactly 6 digits             |
| 400    | `INVALID_NAME`   | The name is missing, blank, or too long     |
| 404    | `ROOM_NOT_FOUND` | No room exists for the supplied PIN         |
| 409    | `ROOM_CLOSED`    | The room is no longer in the `LOBBY` state  |
| 409    | `DUPLICATE_NAME` | The name is already registered in this room |

The client maps these codes to student-friendly messages such as "Game not found. Check the PIN and try again." and "That name is already in use in this game. Please choose another." Unknown failures fall back to "Unable to join the game right now. Please try again."

### Authentication Middleware

`server/middleware/auth.ts` still guards all `/api/*` routes except the existing `/api/auth` and `/api/health` prefixes. One narrow exception was added: `POST /api/rooms/:pin/players` is public so students can join without a teacher account. The exception is restricted to the POST method and that specific path; room creation and every other room operation remain protected.

`app/middleware/auth.global.ts` also allows signed-out visitors to reach `/player/join` and `/lobby/student`. Without this, the client route guard would redirect students to `/auth` before they could join. Teacher authentication and authorization behavior is otherwise unchanged.

### Room Backend

Rooms live in an in-memory `Map` (`activeRooms`) with the shape:

- `pin`
- `createdAt`
- `status` (`LOBBY`, `PLAYING`, or `FINISHED`)
- `players` (student display names)

Because the registry is in server RAM, rooms are lost when the server restarts and are not shared between multiple server instances. Persistent or distributed room storage is out of scope.

## Navigation

Students reach the page directly at `/player/join`. There is currently no in-app link to it. After a successful join, the page navigates to the student lobby at `/lobby/student?pin=<gamePin>`; the lobby reads the PIN from the `pin` query parameter.

## Out of Scope

- Teacher setup page and deck selection
- Question deck creation, editing, or selection
- Starting, advancing, or ending a game session
- The student game screen, spinner, questions, answers, or scoring
- Real-time lobby updates through Socket.IO or another WebSocket system
- Reconnection, player removal, room capacity limits, and rate limiting
- Persistent or multi-server room storage
