# Game Settings (Student) Implementation Plan

## Overview
Create a student join page at `app/pages/player/join.vue` that allows students to enter a 6-digit Game PIN and their name to join an existing Stronger Twister game room. The page validates the inputs, verifies that the room exists and is accepting players, registers the student in the room's player list, and navigates to the student lobby at `/lobby/student?pin=<gamePin>` after a successful join.

The implementation requires a player registration API in addition to the join page. The `player-join` branch is stacked on the `admin` branch, so the existing room backend (`server/utils/rooms.ts`, `server/api/rooms/gamepin.post.ts`) is already available as the base and must be reused rather than duplicated.

The join API must be accessible to unauthenticated students, or the application must establish a student session before joining. For the MVP, allow the join-related API endpoint through the existing server authentication middleware while validating all input and room state on the server.

## Route
- Path: `/player/join`
- File: `app/pages/player/join.vue`

## Features
- **Page Title**: Displays "Join a Game" and identifies the application as Stronger Twister.
- **Game PIN Input**: Accepts a 6-digit numeric Game PIN.
- **Student Name Input**: Accepts a student's display name.
- **Input Validation**:
  - Game PIN is required and must contain exactly 6 digits.
  - Student name is required and must not be blank after trimming whitespace.
  - Student names are trimmed before submission.
  - Enforce a reasonable maximum student-name length of 30 characters.
  - Display validation errors next to the relevant fields.
- **Join Game Button**: Submits the PIN and name to the server. It is disabled while a join request is in progress or while required inputs are invalid.
- **Loading State**: Displays a loading indicator or "Joining game..." while the request is in progress and prevents duplicate submissions.
- **Room Validation**: The server verifies that the requested room exists and is still in the `LOBBY` state.
- **Successful Join**: Registers the student in the room's players list and navigates to `/lobby/student?pin=<gamePin>`.
- **Error Handling**: Displays a useful message when:
  - The PIN is invalid or the room does not exist.
  - The room has already started or finished.
  - The student name is invalid.
  - The student cannot be registered.
  - The server is unavailable or the request fails.
- **Responsive Layout**: Uses existing Nuxt UI components such as `UContainer`, `UCard`, `UInput`, and `UButton` where compatible with the installed Nuxt UI version. The form must remain usable on mobile screens.

## Implementation Details

### 1. Join Page

Create `app/pages/player/join.vue`.

The page should:
- Use Vue Composition API and Nuxt conventions already established in the repository.
- Maintain reactive state for the PIN, student name, field validation errors, request status, and server error messages.
- Use a form submission handler to validate the inputs before sending a request.
- Submit the trimmed student name and PIN to the player registration API.
- Prevent multiple submissions while a request is active.
- Navigate to the student lobby only after the server confirms successful registration.
- Preserve the PIN in the destination URL so the student lobby can identify the room.

The join page must not create rooms or generate PINs. Students join rooms created by teachers.

### 2. Player Registration API

The registration endpoint validates the PIN, confirms the room exists and is accepting players, and registers the student in a single request. No separate room-lookup endpoint is required for the MVP: a lookup would add a network round trip and its result could become stale before registration, so all validation stays in this endpoint.

- **Endpoint**: `POST /api/rooms/:pin/players`
- **Purpose**: Validate the room and register a student.
- **Request body**:

```json
{
  "name": "Alex"
}
```

- **Successful response — HTTP 201**:

```json
{
  "pin": "123456",
  "player": "Alex",
  "players": ["Alex", "Sam"]
}
```

- **Server-side behavior**:
  - Validate that the PIN contains exactly 6 digits.
  - Validate that the student name is a string.
  - Trim leading and trailing whitespace from the name.
  - Reject blank names and names longer than 30 characters.
  - Look up the room in `activeRooms`.
  - Return HTTP 404 if the room does not exist.
  - Return HTTP 409 if the room status is not `LOBBY`.
  - Append the validated student name to the room's `players` array.
  - Return HTTP 201 with the room PIN, registered player name, and updated player list.
- **Error responses**:
  - HTTP 400 — Invalid PIN or request body.
  - HTTP 404 — Room not found.
  - HTTP 409 — Room no longer accepts players, or the same name is already registered if duplicate-name rejection is implemented.
  - HTTP 500 — Unexpected server error.

Player registration must be performed on the server. The client must not modify the room's player list directly.

**Duplicate names**: For the MVP, reject a duplicate name within the same room using a case-insensitive comparison of trimmed names. Return HTTP 409 with a clear error message so students can choose another name. This avoids ambiguity when the teacher needs to identify players. A later version can introduce stable player IDs and allow duplicate display names.

### 3. Room Backend Integration

The room backend already exists on the `admin` branch, which is this branch's base, so it must be reused rather than reimplemented.

Existing files inherited from the base:
- `server/api/rooms/gamepin.post.ts`
- `server/utils/rooms.ts`

The room utility defines the shared in-memory room registry and a `GameRoom` structure containing:
- `pin`
- `createdAt`
- `status` (`LOBBY`, `PLAYING`, or `FINISHED`)
- `players` (an array of student names)

The existing `POST /api/rooms/gamepin` endpoint creates a room and returns `{ gameCode }`.

Before implementing the join flow:
- Confirm that `server/utils/rooms.ts` and the room creation endpoint are present in the branch (inherited from `admin`).
- If they are missing, stop and report it rather than creating a second room registry.
- Ensure room creation and player registration both import the same `activeRooms` registry; otherwise, students will not be able to find rooms created by teachers.
- Ensure the room status is checked on the server during registration.

The existing in-memory registry is sufficient for local development and a single server instance. It does not persist rooms across server restarts and is not shared across multiple server instances. Persistent or distributed room storage is out of scope for this implementation.

### 4. Authentication Middleware

The existing `server/middleware/auth.ts` guards `/api/*` routes except `/api/auth` and `/api/health`.

The player registration endpoint must be accessible to students who have not authenticated through a teacher account.

Update the middleware to explicitly allow the required public endpoint:
- `POST /api/rooms/:pin/players`

The exception must be restricted to the intended HTTP method and path. Do not exempt all `/api/rooms/*` routes, because room creation and other administrative operations may require protection.

If the middleware does not support method-specific exceptions directly, implement an explicit path-and-method check before applying the existing authentication guard.

Public access must not bypass server-side validation. The registration endpoint must validate the PIN, verify room status, and enforce the name rules before changing room state.

Teacher authentication and authorization behavior must otherwise remain unchanged.

### 5. Navigation

The join page is available at `/player/join`.

After a successful registration, navigate to:

```
/lobby/student?pin=<gamePin>
```

Use Nuxt's existing navigation conventions, such as `navigateTo()`.

The student lobby currently reads the PIN from `route.query.pin`, but its player list is not yet populated and its Socket.IO wiring is commented out. The join page must successfully register the student with the server before navigating, but it does not need to implement real-time lobby updates.

The lobby may continue to display its existing waiting-room interface. Integrating the lobby's player list with the backend is a separate task.

### 6. UI States

The join page must support the following states:
- **Initial**: Empty PIN and student-name fields, with no error messages.
- **Invalid Input**: Inline validation errors identify missing or malformed fields.
- **Submitting**: Join button is disabled and a loading indicator or "Joining game..." message is displayed.
- **Room Not Found**: Display a message such as "Game not found. Check the PIN and try again."
- **Room Not Accepting Players**: Display a message such as "This game has already started or ended."
- **Duplicate Name**: Display a message such as "That name is already in use in this game. Please choose another."
- **Network or Server Error**: Display a recoverable error such as "Unable to join the game right now. Please try again."
- **Success**: Navigate to the student lobby after receiving confirmation from the server.

When a request fails, restore the form to an interactive state and preserve the user's entered values so they can correct the problem or retry.

Do not navigate to the lobby when registration fails.

## Steps

1. **Confirm the Base Branch and Room Backend**
   - This branch is stacked on `admin`, so the room utility and room-creation endpoint should already be present.
   - Confirm that `server/utils/rooms.ts` and `server/api/rooms/gamepin.post.ts` exist; if they do not, report it instead of creating a duplicate registry.
   - Ensure all room-related endpoints use the same `activeRooms` registry.

2. **Create `app/pages/player/join.vue`**
   - Add the "Join a Game" form.
   - Include PIN and student-name inputs.
   - Implement client-side validation.
   - Add loading and error states.
   - Submit valid input to `POST /api/rooms/:pin/players`.
   - Navigate to `/lobby/student?pin=<gamePin>` after successful registration.

3. **Create `server/api/rooms/[pin]/players.post.ts`**
   - Implement `POST /api/rooms/:pin/players`.
   - Validate the request body and student name.
   - Verify room existence and `LOBBY` status.
   - Reject duplicate names within the room.
   - Append the player to the shared room's `players` array.
   - Return the updated player list and appropriate HTTP status codes.

4. **Update `server/middleware/auth.ts`**
   - Allow only the player registration request to bypass authentication.
   - Keep all other existing authentication protections unchanged.

5. **Verify the Join Flow**
   - Confirm that malformed PINs and blank names are rejected.
   - Confirm that valid input can register a student in an existing room.
   - Confirm that a nonexistent PIN returns an appropriate error.
   - Confirm that rooms in `PLAYING` or `FINISHED` states reject new students.
   - Confirm that duplicate names are rejected case-insensitively.
   - Confirm that the player appears in the shared room's `players` array.
   - Confirm that successful registration navigates to `/lobby/student?pin=<gamePin>`.
   - Confirm that the registration endpoint works without a teacher-authenticated session.
   - Confirm that unrelated protected API routes remain protected.

## Files to Create/Modify
- **Create:** `app/pages/player/join.vue`
- **Create:** `server/api/rooms/[pin]/players.post.ts`
- **Modify:** `server/middleware/auth.ts`
- **Reuse from the base `admin` branch:**
  - `server/utils/rooms.ts`
  - `server/api/rooms/gamepin.post.ts`

## Out of Scope
- Teacher setup page changes or deck selection.
- Question deck creation, editing, or selection.
- Game PIN generation changes.
- Starting, advancing, or ending a game session.
- The student game screen, spinner, questions, answers, or scoring.
- Real-time player-list updates through Socket.IO or another WebSocket system.
- Changes to the existing teacher or student lobby UI beyond the navigation required to reach the student lobby.
- Teacher authentication redesign or student account creation.
- Persistent room storage, distributed sessions, or multi-server synchronization.
- Reconnecting a disconnected student or removing players from a room.
- Rate limiting, abuse prevention beyond basic validation, and broader room-management security hardening.

## Open Decisions
- **Student identity**: The MVP uses the student's display name as their room identity. Stable player IDs and reconnection support are deferred.
- **Duplicate names**: This plan rejects duplicate names within a room, ignoring case. If classroom requirements allow duplicate names, stable player IDs should be introduced before removing this restriction.
- **Room capacity**: No maximum player count is defined in the existing room model. The MVP does not introduce a capacity limit.
- **Lobby synchronization**: The current student lobby does not yet receive live player updates. Successful registration is required for this task, but real-time synchronization is deferred.
- **Authentication model**: This plan assumes student joining is intentionally public and that the registration endpoint is explicitly exempted from the existing authentication middleware. If the application requires authenticated students, a separate student-session design is needed.
