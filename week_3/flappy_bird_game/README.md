# Captain America: Flappy Shield

A Flappy Bird-style game featuring Captain America with shooting mechanics, enemies, and collectibles.

## Features

- **Start Screen**: Click "START" button to begin playing
- **Hero Controls**: 
  - SPACE or LEFT CLICK: Flap upward
  - RIGHT CLICK: Shoot shield projectiles at enemies
- **Gameplay Elements**:
  - Navigate through Captain America themed walls
  - Avoid enemies (Red Skull) that fly toward you
  - Collect shield collectibles for points
  - Shoot enemies with shield projectiles
  - High score tracking

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Game

```bash
python main.py
```

## Game Configuration

Edit `levels.json` to modify:
- Level difficulty settings
- Wall spacing and speed
- Enemy spawn rates
- Gravity and flap strength
- Projectile settings

## High Score

Your high score is automatically saved in `highscore.json` and persists between game sessions.

## Assets

- Hero: `assets/images/cap.png`
- Enemy: `assets/images/red_skull.png`
- Background: `assets/images/map.png`
- Sounds: `assets/sounds/` (flap.wav, enemy.wav, gameover.wav, bg.mp3)

