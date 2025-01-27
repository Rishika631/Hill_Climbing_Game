/**
 * Project Description:
 * ---------------------
 * This project is a 2D side-scrolling racing game designed to deliver an engaging experience by combining challenges 
 * such as collecting coins and managing fuel, all while maintaining speed and balance. 
 * The game features immersive animations, smooth controls, and dynamic environments that evolve as players progress 
 * through checkpoints. It's built on HTML5 Canvas for graphics rendering, with JavaScript handling the game logic 
 * and user interactions. 

 * Game Objective:
 * ----------------
 * The objective is to navigate through a rugged terrain by controlling a vehicle. Players must maintain speed, 
 * collect coins to increase their score, and manage their fuel level to avoid running out before reaching 
 * checkpoints. If the player loses balance or runs out of fuel, the game ends.

 * How to Play:
 * ------------
 * 1. Use the arrow keys (↑, ↓, ←, →) to accelerate, decelerate, and control the rotation of the car.
 * 2. Collect coins scattered throughout the terrain to increase your score.
 * 3. Pick up fuel canisters to replenish your fuel level.
 * 4. Keep an eye on the progress bar and reach checkpoints to unlock new themes and earn bonus rewards.
 * 5. Avoid tipping the car over or running out of fuel, as either will result in a game over.

 * Game Features:
 * --------------
 * 1. **Dynamic Terrain:** The game generates terrain using a noise function to create a realistic and unpredictable 
 *    path, making the gameplay more engaging.
 * 2. **Vehicle Physics:** The car's rotation and movement are influenced by terrain slopes and speed, adding a layer 
 *    of realism.
 * 3. **Progression System:**
 *    - Checkpoints: Unlock new background themes and earn rewards as you reach distance milestones.
 *    - Coins and Fuel: Collect coins for score and fuel canisters to stay in the game.
 * 4. **Custom Themes:** Dynamic themes change the game's aesthetic as players progress, providing a fresh experience 
 *    at different stages.
 * 5. **High Score Tracking:** The game stores the player's highest score locally to encourage replayability.Later will be managed by backend.
 * 6. **Sound Effects:** Includes background music, car movement sounds, and effects for collecting coins and fuel.
 * 7. **Responsive Design:** The game adjusts to the screen size dynamically to ensure a seamless experience on 
 *    different devices.

 * Project Structure:
 * ------------------
 * - **Canvas and Context Setup:** The `canvas` element is dynamically sized to fit the screen, and a 2D rendering 
 *   context (`ctx`) is used for drawing all game elements.
 * - **Classes and Components:**
 *   - `modals`: Manages in-game pop-ups, such as game over messages.
 *   - `thisGame`: Handles the game's state, including start, reset, and transition between game screens.
 *   - `background`: Manages the dynamic sky and terrain images, progress bar, and fuel bar. It also handles 
 *     checkpoints and updates the game's theme.
 *   - `play`: Represents the player’s vehicle. It handles physics, rendering, and sound effects for car movement.
 *   - `coin` and `fuel`: Define collectible objects, such as coins and fuel canisters. These elements have their 
 *     own behavior for drawing and collision detection.
 *   - `Wheel`: Manages the vehicle's wheels, including rotation and rendering for enhanced realism.
 * - **Sound Effects:** Background music and effects are managed with `Audio` objects to enhance the player's 
 *   experience.
 * - **Local Storage:** Used to store player progress, such as coins, fuel, and high scores, allowing players to 
 *   track their achievements across sessions.(Later done through backend)
 * - **Game Loop:** A continuous loop that updates the game state, processes inputs, and renders the scene, 
 *   ensuring smooth gameplay.
 * - **Collision Detection:** Ensures that the player can collect coins and fuel by checking for overlap between 
 *   the car and collectibles.
 * -**Animation: The rotating of wheels and head tilt are done to get the animation effect.
 * 
 * Overall, this project combines creative visuals, physics-based mechanics, and engaging gameplay to deliver a 
 * fun and challenging experience.
 */
