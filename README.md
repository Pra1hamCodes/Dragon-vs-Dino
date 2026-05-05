
# 🐉 Dragon vs Dino — JavaScript Browser Game

A fun, browser-based endless runner game built with vanilla HTML, CSS, and JavaScript. A dragon and a dinosaur face off in a side-scrolling obstacle-dodge challenge inspired by the classic Chrome offline dinosaur game.

---

## 🎮 Demo

Open `index.html` directly in any modern browser — no build tools, no server, no dependencies required.

---

## 📁 Project Structure

```
javascript-game/
├── index.html          # Main entry point — game canvas and DOM structure
├── script.js           # Core game logic (game loop, physics, collision, scoring)
├── style.css           # Layout, animations, and visual styling
├── images/             # Sprite assets (dragon, dino, backgrounds, etc.)
├── dragon-dino/        # Sub-module or variant build of the game
└── .gitignore
```

### File Breakdown

**`index.html`**
The root HTML file that scaffolds the game. Sets up the game container, links the stylesheet, and loads the main script. All game elements (characters, ground, score display) are rendered here via DOM manipulation or a `<canvas>` element.

**`script.js`**
The brain of the game. Handles:
- The **game loop** (using `requestAnimationFrame` for smooth 60fps rendering)
- **Character physics** — gravity, jump velocity, and landing detection
- **Obstacle generation** — random spawn timing and horizontal scrolling
- **Collision detection** — bounding-box checks between the player and obstacles
- **Score tracking** — increments while the player is alive, resets on game over
- **Game state management** — idle, running, and game-over states

**`style.css`**
Handles all visual presentation:
- Positioning of game elements (absolute/relative layout)
- CSS animations for character sprites (running legs, wing flaps)
- Background scrolling effect to simulate forward movement
- Game over screen overlay styling

**`images/`**
Contains all sprite and background image assets used by the game, including character frames for animation cycles.

**`dragon-dino/`**
A separate folder likely containing an alternate version or a self-contained copy of the game (possibly a refactored or extended build).

---

## 🕹️ How to Play

1. Clone or download the repository.
2. Open `index.html` in a browser.
3. Press **Spacebar** (or tap on mobile) to start the game.
4. The character runs automatically — **press Space / tap** to **jump** over obstacles.
5. Avoid all obstacles. Your score increases the longer you survive.
6. The game ends on collision — press Space to restart.

---

## ⚙️ Core Game Mechanics

### Game Loop
The game uses `requestAnimationFrame` to create a frame-by-frame update cycle. Each frame:
1. Clears/repositions elements
2. Updates positions of the player and all obstacles
3. Checks for collisions
4. Increments the score display
5. Increases game speed over time for added difficulty

### Jump Physics
When the player presses Space (or taps), an upward velocity is applied to the character. Gravity is applied every frame, pulling the character back down. Once the character reaches ground level, the jump state resets.

### Obstacle Spawning
Obstacles are generated at randomised intervals and scroll from right to left across the screen. As the score increases, the scroll speed increases, making the game progressively harder.

### Collision Detection
A bounding-box (AABB) collision system checks whether the player's rectangle overlaps with any obstacle's rectangle each frame. On overlap, the game-over state is triggered.

---

## 🛠️ Technologies Used

| Technology | Role |
|---|---|
| HTML5 | Game structure and DOM layout |
| CSS3 | Sprite animations, positioning, background scroll |
| Vanilla JavaScript | Game loop, physics, collision, scoring |

No frameworks, no libraries, no build step — pure browser-native code.

---

## 🚀 Getting Started

### Prerequisites
Just a modern web browser (Chrome, Firefox, Edge, Safari).

### Run Locally

```bash
# Clone the repo
git clone https://github.com/Pra1hamCodes/javascript-game.git

# Navigate into the project
cd javascript-game

# Open in browser (or just double-click index.html)
open index.html
```

### Run with a Local Dev Server (optional)

```bash
# Using Python
python3 -m http.server 8000
# Then open http://localhost:8000

# Using Node.js (npx)
npx serve .
```

---

## 🧩 Extending the Game

Some ideas to build on this project:

- **High Score Persistence** — save the best score to `localStorage` so it persists across sessions
- **Sound Effects** — add jump, collision, and background audio using the Web Audio API
- **Multiple Obstacle Types** — introduce flying obstacles that require ducking (add a down-arrow mechanic)
- **Mobile Controls** — add on-screen tap buttons for better mobile UX
- **Day/Night Cycle** — cycle the background theme at score milestones (similar to the Chrome dino game)
- **Two-Player Mode** — use different keys to let two players race on the same screen
- **Sprite Sheet Animation** — replace individual image files with a single sprite sheet for better performance

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please keep changes scoped and test in a browser before submitting.

---

## 📄 License

This project does not currently include a license file. All rights are retained by the author unless otherwise stated. If you plan to use or distribute this code, reach out to the repository owner.

---

## 👤 Author

**Pra1hamCodes**
GitHub: [@Pra1hamCodes](https://github.com/Pra1hamCodes)

---

> Built with HTML, CSS & JavaScript — no frameworks, just fundamentals.
