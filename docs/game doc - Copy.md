# 10-4
# The following is AI-generated documentation from a Figma screenshot. It is not perfect, and is subject to change.
# Update as you see fit, and make this a central document for humans and agents to build with.

Based on the storyboard, here is a structured **game documentation draft** for *Stronger Twister*. I’ve separated the player experience, setup, gameplay loop, and screen requirements so it can also serve as a product/game-spec document.

# Stronger Twister

## 1. Game Overview

**Stronger Twister** is a multiplayer classroom game that combines a color spinner with teacher-created question cards. A teacher creates a game session, students join using a game PIN, and players take turns spinning the wheel and answering questions associated with the selected color/category.

The game is designed to be simple enough for students to play from their own devices while the teacher controls the game session.

### Core Concept

1. The teacher creates a game.
2. A unique **Game PIN** is generated.
3. Students join using the PIN and enter their names.
4. The teacher starts the game.
5. A player spins the color wheel.
6. The selected color determines the question/category.
7. The player sees a question and submits or reveals an answer.
8. The game continues with the next player.

---

# 2. Roles

## Teacher

The teacher is the game host and controls the session.

The teacher can:

* Create a game.
* Configure the available colors/categories.
* Enter or generate questions and answers.
* Receive a unique Game PIN.
* View students who have joined.
* Start the game.
* Control progression between questions/players.
* View answers when appropriate.

## Student

Students participate using their own device.

Students can:

* Join an existing game using the Game PIN.
* Enter their name.
* Wait in the lobby.
* See when the game begins.
* Spin the wheel when it is their turn.
* View their assigned question.
* Tap to reveal the answer.
* Continue when the teacher advances the game.

---

# 3. Game Components

The primary game components are:

### Color Wheel

The main game wheel contains four color sections:

* Yellow
* Blue
* Purple
* Red

The wheel randomly selects one of the four colors when spun.

### Color Categories

Each color represents a question category.

The teacher can define the category associated with each color.

Example:

| Color  | Category    |
| ------ | ----------- |
| Yellow | Mathematics |
| Blue   | Science     |
| Purple | History     |
| Red    | Language    |

The exact categories should be configurable rather than permanently fixed.

### Question Card

A question card displays the question associated with the selected category/color.

### Answer Card

The answer is initially hidden and can be revealed by tapping **"Tap to see answer."**

### Game PIN

A short PIN allows students to join the teacher's game session.

### Player List

The teacher can see the students who have joined the current session.

---

# 4. Game Flow

## Phase 1 — Teacher Creates a Game

The teacher opens Stronger Twister and creates a new game.

The teacher is presented with the game setup screen.

The setup screen contains:

* Color/category configuration
* Question deck
* Game PIN
* Player/session information
* **Start Session!** button

Once the game is created, the system generates a Game PIN.

---

## Phase 2 — Students Join

Students open Stronger Twister on their devices.

They enter the Game PIN supplied by the teacher.

After joining, the student enters their name.

The teacher's lobby updates as students join.

Example:

**Game PIN:** `123456`

**Players**

* Student 1
* Student 2
* Student 3
* Student 4
* Student 5

The student remains on the waiting screen until the teacher starts the game.

---

# 5. Starting the Game

When the teacher is ready, they select:

**Start game!**

All connected students transition from the lobby into the game.

The system determines the initial player.

The current player's name is displayed prominently.

Example:

> **Your Name's Turn**

The other students remain in a waiting state until it is their turn.

---

# 6. Taking a Turn

## Step 1 — Spin

The current player sees the color wheel.

They tap:

**Spin**

The wheel spins and randomly selects one of the four colors.

Example:

> **Purple selected**

The selected color determines which category/question deck is used.

---

## Step 2 — Select Question

The game retrieves a question from the corresponding category.

For example:

> **Purple Category: History**

A question card is displayed.

The player sees the question but not the answer.

---

## Step 3 — Answer

The player considers the question and provides their answer according to the classroom rules.

The interface provides:

**Tap to see answer**

The answer remains hidden until the player/teacher reveals it.

---

## Step 4 — Reveal Answer

When the answer is revealed, the answer card displays the correct answer.

The teacher can determine whether the student's response was correct.

The game then advances to the next turn.

---

# 7. Turn Progression

After a turn is completed, the game selects the next player.

The interface identifies whose turn it is.

Example:

> **Alex's Turn**

Only the active player should be able to initiate the spin.

Other players should see a waiting state such as:

> **Waiting for Alex...**

This prevents multiple players from spinning simultaneously.

---

# 8. Question Deck

The teacher can create a collection of question/answer pairs.

Each question belongs to a color/category.

### Question Structure

Each question should contain:

* ID
* Color/category
* Question text
* Correct answer
* Optional difficulty
* Optional point value

Example:

```text
Category: Purple
Question: Who was the first president of the United States?
Answer: George Washington
```

The game should select an appropriate unused question from the selected category.

---

# 9. Question and Answer Screens

## Question State

The student sees:

**Question**

> Who was the first president of the United States?

And a control:

**Tap to see answer**

The answer is hidden.

## Answer State

After tapping:

**Answer**

> George Washington

The question remains visible so the student can compare their response with the correct answer.

---

# 10. Teacher Game Screen

The teacher's game screen should provide an overview of the current session.

It should display:

* Game PIN
* Current player
* Player list
* Current color/category
* Current question
* Answer/reveal state
* Game progression
* Start/advance controls

The teacher should always be able to determine:

**Who is playing?**

**What category was selected?**

**What question are they answering?**

**What happens next?**

---

# 11. Student Game Screen

The student's interface should be deliberately simpler than the teacher interface.

### Before Their Turn

Display:

> **Waiting for your turn**

and optionally:

> **Alex is currently playing**

### During Their Turn

Display:

> **Your Turn!**

Then show:

* Spin wheel
* Selected color
* Question
* Answer reveal

### After Their Turn

Display:

> **Turn complete**

followed by:

> **Waiting for the next player...**

---

# 12. Game States

The application should support the following major states:

### Lobby

Students are joining.

**Teacher:** Can start the session.

**Student:** Sees waiting screen.

### Ready

Players are connected and the teacher is preparing to begin.

### Player Turn

One player is active.

### Spinning

The wheel is animating and selecting a color.

### Question

A question has been selected.

### Answer

The correct answer is revealed.

### Next Turn

The game advances to the next player.

### Game Complete

The final question has been answered and the game displays the results/end state.

---

# 13. Recommended Game Rules

The teacher should be able to choose the scoring rules.

A simple default ruleset is:

* Correct answer: **1 point**
* Incorrect answer: **0 points**
* Each player receives an equal number of turns.
* The game ends after a predefined number of rounds or when the question deck is exhausted.
* The player with the most points wins.

An optional classroom mode can allow the teacher to determine whether an answer is correct manually.

---

# 14. Important UX Requirements

### Simple Interaction

Students should need as few actions as possible.

The primary student interaction should follow:

**Join → Enter Name → Wait → Spin → Answer → Reveal → Wait**

### Clear Turn Ownership

The active player must always be obvious.

The UI should clearly distinguish:

* **Your turn**
* **Another player's turn**
* **Waiting**
* **Game finished**

### Prevent Accidental Actions

Controls that are unavailable should be disabled rather than allowing students to interact with them.

For example, a student who is not currently playing should not be able to spin the wheel.

### Mobile First

The student experience shown in the storyboard is optimized for a narrow mobile screen.

Important controls should therefore:

* Be large enough to tap easily.
* Remain readable on small screens.
* Avoid unnecessary navigation.
* Keep the question and answer controls visually prominent.

---

# 15. Teacher Setup Flow

```text
Create Game
    ↓
Configure Colors / Categories
    ↓
Create or Load Question Deck
    ↓
Generate Game PIN
    ↓
Students Join
    ↓
Teacher Reviews Player List
    ↓
Start Session
```

# 16. Student Flow

```text
Open Stronger Twister
    ↓
Enter Game PIN
    ↓
Enter Name
    ↓
Join Game
    ↓
Waiting Room
    ↓
Game Starts
    ↓
Wait for Turn
    ↓
Spin
    ↓
Color Selected
    ↓
Question Displayed
    ↓
Answer
    ↓
Reveal Answer
    ↓
Next Turn
```

# 17. Core Screens

The storyboard indicates the following primary screens:

### Desktop / Teacher

1. **Game Setup**

   * Stronger Twister title
   * Color/category controls
   * Spinner preview
   * Game PIN
   * Name/session information
   * Deck control

2. **Deck / Question Management**

   * Category
   * Question
   * Answer
   * Add/edit question controls

3. **Teacher Lobby**

   * Game PIN
   * Joined students
   * Start Game button

4. **Teacher Game View**

   * Current player
   * Spinner
   * Question
   * Answer
   * Game controls

### Mobile / Student

5. **Join Screen**

   * Game PIN
   * Student name

6. **Lobby**

   * Joined/waiting state

7. **Game Screen**

   * Current player
   * Spinner
   * Selected color

8. **Question Screen**

   * Question card
   * Tap to see answer

9. **Answer Screen**

   * Correct answer
   * Continue/wait state

10. **Waiting Screen**

* Current player's turn
* Waiting message

---

# 18. MVP Requirements

The minimum viable version should support:

* Teacher game creation
* Four configurable colors
* Question/answer creation
* Game PIN generation
* Student joining
* Student names
* Lobby/player list
* Teacher starting the game
* Turn management
* Random color spinning
* Category-based question selection
* Question display
* Answer reveal
* Player progression
* Basic scoring
* Game completion

---

# 19. Future Enhancements

Potential later features include:

* Timer per question
* Difficulty levels
* Custom number of rounds
* Automatic scoring
* Leaderboard
* Multiple question decks
* Import/export of question sets
* Teacher-created classes
* Student avatars
* Sound effects and animations
* Game history
* Performance reports
* Team mode
* Accessibility options
* Randomized player order

---

## 20. Product Principle

The central design principle of Stronger Twister should be:

> **The teacher controls the game; students focus on playing.**

The teacher interface should therefore provide configuration and control, while the student interface should provide an extremely focused experience centered on **spin → question → answer → next turn**.