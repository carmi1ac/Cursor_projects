import pygame
import json
import math
import random
import os
from bubble import Bubble
from shooter import Shooter

class Game:
    """Main game class managing all game logic."""
    
    def __init__(self, screen_width=1200, screen_height=800):
        pygame.init()
        pygame.mixer.init()
        
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.screen = pygame.display.set_mode((screen_width, screen_height))
        pygame.display.set_caption("Bubble Shooter - Alien Invasion")
        
        self.clock = pygame.time.Clock()
        self.running = True
        self.game_state = "start"  # start, playing, game_over
        
        # Load configurations
        self.load_levels()
        self.load_high_score()
        
        # Game variables
        self.current_level = 1
        self.score = 0
        self.bubbles = []
        self.grid = []
        self.shooter = None
        self.current_bubble = None
        self.next_bubble = None
        self.moving_bubble = None  # Track the bubble that's currently moving
        self.bubble_radius = 30
        
        # Load sound
        self.shoot_sound = None
        sound_path = os.path.join("assets", "sounds", "shot.wav")
        if os.path.exists(sound_path):
            self.shoot_sound = pygame.mixer.Sound(sound_path)
        
        # Load background
        self.background = None
        bg_path = os.path.join("assets", "images", "background.png")
        if os.path.exists(bg_path):
            self.background = pygame.image.load(bg_path)
            self.background = pygame.transform.scale(self.background, (screen_width, screen_height))
        
        # Fonts
        self.font_large = pygame.font.Font(None, 72)
        self.font_medium = pygame.font.Font(None, 48)
        self.font_small = pygame.font.Font(None, 36)
        
        self.init_game()
    
    def load_levels(self):
        """Load level configuration from JSON."""
        with open("levels.json", "r") as f:
            self.level_config = json.load(f)
        self.game_settings = self.level_config["game_settings"]
        self.bubble_radius = self.game_settings["bubble_radius"]
    
    def load_high_score(self):
        """Load high score from file."""
        self.high_score_file = "high_score.json"
        if os.path.exists(self.high_score_file):
            with open(self.high_score_file, "r") as f:
                data = json.load(f)
                self.high_score = data.get("high_score", 0)
        else:
            self.high_score = 0
    
    def save_high_score(self):
        """Save high score to file."""
        if self.score > self.high_score:
            self.high_score = self.score
            with open(self.high_score_file, "w") as f:
                json.dump({"high_score": self.high_score}, f)
    
    def init_game(self):
        """Initialize game for current level."""
        if self.current_level > len(self.level_config["levels"]):
            self.current_level = len(self.level_config["levels"])
        level_data = self.level_config["levels"][self.current_level - 1]
        
        # Initialize shooter
        shooter_x = self.screen_width // 2
        shooter_y = self.screen_height - self.game_settings["shooter_y_offset"]
        self.shooter = Shooter(shooter_x, shooter_y, self.screen_width, self.screen_height)
        
        # Initialize grid
        self.create_bubble_grid(level_data)
        
        # Create current and next bubbles
        self.current_bubble = self.create_random_bubble(shooter_x, shooter_y - 40)
        self.next_bubble = self.create_random_bubble(shooter_x + 60, shooter_y - 40)
        self.moving_bubble = None
    
    def create_bubble_grid(self, level_data):
        """Create the initial bubble grid."""
        rows = level_data["rows"]
        cols = level_data["cols"]
        colors = level_data["colors"]
        
        self.grid = [[None for _ in range(cols)] for _ in range(rows)]
        self.bubbles = []
        
        radius = self.bubble_radius
        
        # Hexagonal grid spacing for snug fit (no overlap) - classic bubble shooter spacing
        # For circles of radius r that touch (center-to-center distance = 2*r):
        # In hexagonal close packing:
        # Horizontal spacing (same row): 2 * radius (circles touch horizontally)
        # Vertical spacing: sqrt(3) * radius (height of equilateral triangle with side 2*r)
        # Odd row horizontal offset: radius (ensures diagonal neighbors also touch at 2*r)
        hex_horizontal = 2 * radius  # Circles touch horizontally: distance = 2*r
        hex_vertical = math.sqrt(3) * radius  # Height of equilateral triangle
        hex_offset = radius  # Offset for odd rows to maintain hexagonal pattern
        
        # Calculate total width of grid to center it
        total_width = hex_horizontal * (cols - 1) + hex_offset  # Last column may have offset
        if rows > 0 and rows % 2 == 1:  # If odd number of rows, account for offset
            total_width = hex_horizontal * cols
        
        # Center the grid horizontally
        offset_x = (self.screen_width - total_width) / 2
        offset_y = self.game_settings["grid_offset_y"]
        
        for row in range(rows):
            for col in range(cols):
                # Hexagonal grid offset
                x_offset = hex_horizontal * col
                if row % 2 == 1:
                    x_offset += hex_offset
                
                x = offset_x + x_offset
                y = offset_y + hex_vertical * row
                
                # Round to exact pixel positions to prevent floating point errors
                x = round(x)
                y = round(y)
                
                # Fill all rows to the top
                color = random.choice(colors)
                bubble = Bubble(x, y, color, radius)
                bubble.grid_row = row
                bubble.grid_col = col
                bubble.is_attached = True
                
                # Verify no overlap before adding (shouldn't happen with correct spacing)
                overlap = False
                for existing_bubble in self.bubbles:
                    if existing_bubble.is_attached:
                        dist = bubble.distance_to(existing_bubble)
                        # Bubbles should be exactly 2*radius apart (touching)
                        if dist < radius * 1.98:  # Strict overlap check
                            overlap = True
                            break
                
                if not overlap:
                    self.grid[row][col] = bubble
                    self.bubbles.append(bubble)
    
    def create_random_bubble(self, x, y):
        """Create a random colored bubble."""
        level_data = self.level_config["levels"][self.current_level - 1]
        colors = level_data["colors"]
        color = random.choice(colors)
        return Bubble(x, y, color, self.bubble_radius)
    
    def find_closest_grid_position(self, bubble):
        """Find the closest grid position for a bubble (classic bubble shooter logic)."""
        min_dist = float('inf')
        best_row = None
        best_col = None
        
        radius = self.bubble_radius
        
        # Hexagonal grid spacing constants (same as create_bubble_grid)
        # For circles that touch: horizontal = 2*r, vertical = sqrt(3)*r, offset = r
        hex_horizontal = 2 * radius
        hex_vertical = math.sqrt(3) * radius
        hex_offset = radius
        
        # Calculate grid center offset (same as in create_bubble_grid)
        rows = len(self.grid)
        cols = len(self.grid[0]) if rows > 0 else 0
        total_width = hex_horizontal * (cols - 1) + hex_offset
        if rows > 0 and rows % 2 == 1:
            total_width = hex_horizontal * cols
        offset_x = (self.screen_width - total_width) / 2
        offset_y = self.game_settings["grid_offset_y"]
        
        # First priority: find position near existing bubbles (where collision occurred)
        # This ensures bounced bubbles attach to correct hexagonal grid positions
        for attached_bubble in self.bubbles:
            if attached_bubble.is_attached and attached_bubble.grid_row is not None:
                # Check if this bubble is the one we collided with (touching)
                dist_to_bubble = bubble.distance_to(attached_bubble)
                if dist_to_bubble < radius * 2.1:  # Close to this bubble (touching or very close)
                    row = attached_bubble.grid_row
                    col = attached_bubble.grid_col
                    
                    # Check hexagonal neighbor positions (6 neighbors in hexagonal grid)
                    if row % 2 == 0:  # Even row
                        neighbors = [
                            (row - 1, col - 1), (row - 1, col),    # Top neighbors
                            (row, col - 1), (row, col + 1),        # Side neighbors
                            (row + 1, col - 1), (row + 1, col)     # Bottom neighbors
                        ]
                    else:  # Odd row
                        neighbors = [
                            (row - 1, col), (row - 1, col + 1),    # Top neighbors
                            (row, col - 1), (row, col + 1),        # Side neighbors
                            (row + 1, col), (row + 1, col + 1)     # Bottom neighbors
                        ]
                    
                    # Find closest empty neighbor position
                    for new_row, new_col in neighbors:
                        # Expand grid if needed
                        while new_row >= rows:
                            self.grid.append([None] * cols)
                            rows += 1
                        while new_col >= cols:
                            for r in self.grid:
                                r.append(None)
                            cols += 1
                        
                        if new_row >= 0 and new_col >= 0 and self.grid[new_row][new_col] is None:
                            # Calculate exact grid position using same spacing as hanging bubbles
                            x_offset = hex_horizontal * new_col
                            if new_row % 2 == 1:
                                x_offset += hex_offset
                            
                            grid_x = offset_x + x_offset
                            grid_y = offset_y + hex_vertical * new_row
                            
                            # Find closest position to where bubble currently is
                            dist = math.sqrt((bubble.x - grid_x)**2 + (bubble.y - grid_y)**2)
                            
                            if dist < min_dist:
                                min_dist = dist
                                best_row = new_row
                                best_col = new_col
        
        # Second priority: if no position found near existing bubbles, check ceiling
        if best_row is None and bubble.y < offset_y + hex_vertical * 2:
            # Try to attach to top row
            for col in range(cols):
                if self.grid[0][col] is None:
                    x_offset = hex_horizontal * col
                    grid_x = offset_x + x_offset
                    grid_y = offset_y
                    
                    dist = math.sqrt((bubble.x - grid_x)**2 + (bubble.y - grid_y)**2)
                    
                    if dist < min_dist and dist < radius * 2:
                        min_dist = dist
                        best_row = 0
                        best_col = col
        
        # Third priority: find closest empty position anywhere
        if best_row is None:
            for row in range(rows):
                for col in range(cols):
                    if self.grid[row][col] is None:
                        x_offset = hex_horizontal * col
                        if row % 2 == 1:
                            x_offset += hex_offset
                        
                        grid_x = offset_x + x_offset
                        grid_y = offset_y + hex_vertical * row
                        
                        dist = math.sqrt((bubble.x - grid_x)**2 + (bubble.y - grid_y)**2)
                        
                        if dist < min_dist:
                            min_dist = dist
                            best_row = row
                            best_col = col
        
        return best_row, best_col
    
    def attach_bubble_to_grid(self, bubble):
        """Attach a bubble to the grid. Always succeeds by expanding grid if needed."""
        row, col = self.find_closest_grid_position(bubble)
        
        # If no position found, expand grid to accommodate
        if row is None or col is None:
            # Find the closest existing bubble to determine where to add
            if self.bubbles:
                closest_bubble = min(self.bubbles, 
                                    key=lambda b: bubble.distance_to(b) if b.is_attached else float('inf'))
                if closest_bubble.is_attached and closest_bubble.grid_row is not None:
                    # Add new row/col near closest bubble
                    row = closest_bubble.grid_row + 1
                    col = closest_bubble.grid_col
                    # Expand grid if needed
                    while row >= len(self.grid):
                        self.grid.append([None] * len(self.grid[0]) if self.grid else [None] * 10)
                    while col >= len(self.grid[0]):
                        for r in self.grid:
                            r.append(None)
            else:
                # No bubbles exist, add at top center
                row = 0
                col = len(self.grid[0]) // 2 if self.grid else 5
        
        # Ensure grid is large enough
        while row >= len(self.grid):
            cols = len(self.grid[0]) if self.grid else 10
            self.grid.append([None] * cols)
        while col >= len(self.grid[row]):
            self.grid[row].append(None)
        
        # Check if position is already occupied - if so, find nearby empty spot
        if self.grid[row][col] is not None:
            # Try to find nearby empty position
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    new_row = row + dr
                    new_col = col + dc
                    if (0 <= new_row < len(self.grid) and 
                        0 <= new_col < len(self.grid[new_row]) and 
                        self.grid[new_row][new_col] is None):
                        row, col = new_row, new_col
                        break
                else:
                    continue
                break
        
        # Now attach the bubble
        radius = self.bubble_radius
        
        # Hexagonal grid spacing (same as create_bubble_grid)
        # For circles that touch: horizontal = 2*r, vertical = sqrt(3)*r, offset = r
        hex_horizontal = 2 * radius
        hex_vertical = math.sqrt(3) * radius
        hex_offset = radius
        
        # Calculate grid center offset (same as in create_bubble_grid)
        rows = len(self.grid)
        cols = len(self.grid[0]) if rows > 0 else 0
        total_width = hex_horizontal * (cols - 1) + hex_offset
        if rows > 0 and rows % 2 == 1:
            total_width = hex_horizontal * cols
        offset_x = (self.screen_width - total_width) / 2
        offset_y = self.game_settings["grid_offset_y"]
        
        x_offset = hex_horizontal * col
        if row % 2 == 1:
            x_offset += hex_offset
        
        grid_x = offset_x + x_offset
        grid_y = offset_y + hex_vertical * row
        
        # Round to exact pixel positions to prevent floating point errors
        grid_x = round(grid_x)
        grid_y = round(grid_y)
        
        # Classic bubble shooter: snap bubble to exact grid position
        # Use exact grid coordinates to prevent any overlap
        bubble.snap_to_grid_position(grid_x, grid_y)
        bubble.grid_row = row
        bubble.grid_col = col
        
        # Ensure grid position is valid and not occupied
        if self.grid[row][col] is None:
            # Strict overlap check: verify bubble doesn't overlap with any existing bubble
            overlap_detected = False
            min_distance = float('inf')
            
            for existing_bubble in self.bubbles:
                if existing_bubble != bubble and existing_bubble.is_attached:
                    dist = bubble.distance_to(existing_bubble)
                    min_distance = min(min_distance, dist)
                    # Bubbles should be exactly 2*radius apart (touching, not overlapping)
                    # Use reasonable threshold: must be at least 2*radius (touching)
                    # Allow small tolerance for floating point precision
                    if dist < radius * 1.95:  # Strict but reasonable - bubbles touching, not overlapping
                        overlap_detected = True
                        break
            
            if not overlap_detected:
                self.grid[row][col] = bubble
                self.bubbles.append(bubble)
                
                # Classic bubble shooter: check for matches after attachment
                # If 3+ same color bubbles are connected, they pop
                self.check_and_remove_matches(bubble)
                return True
            else:
                # Overlap detected - find alternative nearby position
                # Classic bubble shooter: bubble always finds a place to attach
                # Try nearby positions
                for dr in range(-1, 2):
                    for dc in range(-1, 2):
                        if dr == 0 and dc == 0:
                            continue
                        new_row = row + dr
                        new_col = col + dc
                        
                        # Expand grid if needed
                        while new_row >= len(self.grid):
                            cols = len(self.grid[0]) if self.grid else 10
                            self.grid.append([None] * cols)
                        while new_col >= len(self.grid[new_row]):
                            self.grid[new_row].append(None)
                        
                        if new_row >= 0 and new_col >= 0 and self.grid[new_row][new_col] is None:
                            # Try this position
                            x_offset = hex_horizontal * new_col
                            if new_row % 2 == 1:
                                x_offset += hex_offset
                            
                            alt_grid_x = offset_x + x_offset
                            alt_grid_y = offset_y + hex_vertical * new_row
                            alt_grid_x = round(alt_grid_x)
                            alt_grid_y = round(alt_grid_y)
                            
                            # Check overlap at this position
                            temp_x, temp_y = bubble.x, bubble.y
                            bubble.x, bubble.y = alt_grid_x, alt_grid_y
                            
                            overlap_here = False
                            for existing_bubble in self.bubbles:
                                if existing_bubble != bubble and existing_bubble.is_attached:
                                    dist = bubble.distance_to(existing_bubble)
                                    if dist < radius * 1.95:  # Same threshold as main check
                                        overlap_here = True
                                        break
                            
                            bubble.x, bubble.y = temp_x, temp_y
                            
                            if not overlap_here:
                                # Use this position
                                bubble.snap_to_grid_position(alt_grid_x, alt_grid_y)
                                bubble.grid_row = new_row
                                bubble.grid_col = new_col
                                self.grid[new_row][new_col] = bubble
                                self.bubbles.append(bubble)
                                self.check_and_remove_matches(bubble)
                                return True
                
                # If still can't find position, attach anyway (shouldn't happen)
                # Classic bubble shooter: bubble must attach somewhere
                self.grid[row][col] = bubble
                self.bubbles.append(bubble)
                self.check_and_remove_matches(bubble)
                return True
        
        # This should never be reached, but ensure bubble always attaches
        # Classic bubble shooter: bubble always finds a position
        if row is not None and col is not None:
            self.grid[row][col] = bubble
            self.bubbles.append(bubble)
            self.check_and_remove_matches(bubble)
            return True
        
        # Last resort: find any empty position
        for r in range(len(self.grid)):
            for c in range(len(self.grid[r])):
                if self.grid[r][c] is None:
                    hex_horizontal = 2 * radius
                    hex_vertical = math.sqrt(3) * radius
                    hex_offset = radius
                    rows = len(self.grid)
                    cols = len(self.grid[0]) if rows > 0 else 0
                    total_width = hex_horizontal * (cols - 1) + hex_offset
                    if rows > 0 and rows % 2 == 1:
                        total_width = hex_horizontal * cols
                    offset_x = (self.screen_width - total_width) / 2
                    offset_y = self.game_settings["grid_offset_y"]
                    
                    x_offset = hex_horizontal * c
                    if r % 2 == 1:
                        x_offset += hex_offset
                    grid_x = offset_x + x_offset
                    grid_y = offset_y + hex_vertical * r
                    grid_x = round(grid_x)
                    grid_y = round(grid_y)
                    
                    bubble.snap_to_grid_position(grid_x, grid_y)
                    bubble.grid_row = r
                    bubble.grid_col = c
                    self.grid[r][c] = bubble
                    self.bubbles.append(bubble)
                    self.check_and_remove_matches(bubble)
                    return True
        
        # Should never reach here, but ensure function always succeeds
        return True
    
    def check_and_remove_matches(self, start_bubble):
        """Check for matches of 3+ same color bubbles in a connected group and remove them (classic bubble shooter logic)."""
        # Use flood fill to find all connected bubbles of the same color
        visited = set()
        to_check = [start_bubble]
        matched_group = []
        
        # Collect all connected bubbles of the same color
        while to_check:
            bubble = to_check.pop(0)
            if bubble in visited:
                continue
            
            visited.add(bubble)
            matched_group.append(bubble)
            
            # Check all neighbors (regardless of color) to find same-color connected bubbles
            neighbors = self.get_all_neighbors(bubble)
            for neighbor in neighbors:
                if neighbor.color == bubble.color and neighbor not in visited:
                    to_check.append(neighbor)
        
        # Only remove if we have 3 or more connected bubbles of the same color
        if len(matched_group) >= 3:
            # Remove all bubbles in the matched group
            for bubble in matched_group:
                if bubble.grid_row is not None and bubble.grid_col is not None:
                    self.grid[bubble.grid_row][bubble.grid_col] = None
                if bubble in self.bubbles:
                    self.bubbles.remove(bubble)
            
            # Add score
            self.score += len(matched_group) * 10
            
            # Check for floating bubbles (bubbles no longer connected to top)
            self.remove_floating_bubbles()
            
            return True
        
        return False
    
    def get_neighbors(self, bubble):
        """Get neighboring bubbles of the same color (hexagonal grid)."""
        neighbors = []
        if bubble.grid_row is None or bubble.grid_col is None:
            return neighbors
        
        row = bubble.grid_row
        col = bubble.grid_col
        
        # Hexagonal grid neighbors depend on whether row is even or odd
        if row % 2 == 0:  # Even row
            offsets = [
                (-1, -1), (-1, 0),    # Top neighbors
                (0, -1),  (0, 1),      # Side neighbors
                (1, -1),  (1, 0)       # Bottom neighbors
            ]
        else:  # Odd row
            offsets = [
                (-1, 0),  (-1, 1),     # Top neighbors
                (0, -1),  (0, 1),      # Side neighbors
                (1, 0),   (1, 1)       # Bottom neighbors
            ]
        
        for dr, dc in offsets:
            new_row = row + dr
            new_col = col + dc
            
            if 0 <= new_row < len(self.grid) and 0 <= new_col < len(self.grid[0]):
                neighbor = self.grid[new_row][new_col]
                if neighbor and neighbor.color == bubble.color:
                    neighbors.append(neighbor)
        
        return neighbors
    
    def remove_floating_bubbles(self):
        """Remove bubbles that are no longer connected to the top."""
        if not self.bubbles:
            return
        
        # Find all bubbles connected to top row
        connected = set()
        to_check = []
        
        # Start from top row
        for col in range(len(self.grid[0])):
            if self.grid[0][col] is not None:
                to_check.append(self.grid[0][col])
        
        while to_check:
            bubble = to_check.pop(0)
            if bubble in connected:
                continue
            
            connected.add(bubble)
            
            # Add neighbors
            neighbors = self.get_all_neighbors(bubble)
            for neighbor in neighbors:
                if neighbor not in connected:
                    to_check.append(neighbor)
        
        # Remove disconnected bubbles
        to_remove = [b for b in self.bubbles if b not in connected]
        for bubble in to_remove:
            if bubble.grid_row is not None and bubble.grid_col is not None:
                self.grid[bubble.grid_row][bubble.grid_col] = None
            self.bubbles.remove(bubble)
        
        # Add bonus score for floating bubbles
        if to_remove:
            self.score += len(to_remove) * 5
    
    def get_all_neighbors(self, bubble):
        """Get all neighboring bubbles regardless of color (hexagonal grid)."""
        neighbors = []
        if bubble.grid_row is None or bubble.grid_col is None:
            return neighbors
        
        row = bubble.grid_row
        col = bubble.grid_col
        
        # Hexagonal grid neighbors depend on whether row is even or odd
        if row % 2 == 0:  # Even row
            offsets = [
                (-1, -1), (-1, 0),    # Top neighbors
                (0, -1),  (0, 1),      # Side neighbors
                (1, -1),  (1, 0)       # Bottom neighbors
            ]
        else:  # Odd row
            offsets = [
                (-1, 0),  (-1, 1),     # Top neighbors
                (0, -1),  (0, 1),      # Side neighbors
                (1, 0),   (1, 1)       # Bottom neighbors
            ]
        
        for dr, dc in offsets:
            new_row = row + dr
            new_col = col + dc
            
            if 0 <= new_row < len(self.grid) and 0 <= new_col < len(self.grid[0]):
                neighbor = self.grid[new_row][new_col]
                if neighbor:
                    neighbors.append(neighbor)
        
        return neighbors
    
    def check_collision_with_bubbles(self, moving_bubble):
        """Check collision between moving bubble and attached bubbles (classic bubble shooter logic)."""
        for bubble in self.bubbles:
            if bubble.is_attached and bubble != moving_bubble:
                dist = moving_bubble.distance_to(bubble)
                # Classic bubble shooter: bubbles attach when centers are 2*radius apart (touching)
                # Use tight tolerance to ensure immediate attachment on contact
                # This ensures bounced bubbles attach correctly to grid positions
                if dist <= moving_bubble.radius * 2.05:
                    return True  # Collision detected
        return False
    
    def draw_start_screen(self):
        """Draw the start screen."""
        if self.background:
            self.screen.blit(self.background, (0, 0))
        else:
            self.screen.fill((20, 20, 40))
        
        # Title
        title_text = self.font_large.render("BUBBLE SHOOTER", True, (255, 255, 255))
        title_rect = title_text.get_rect(center=(self.screen_width // 2, 150))
        self.screen.blit(title_text, title_rect)
        
        subtitle_text = self.font_medium.render("Alien Invasion", True, (0, 255, 255))
        subtitle_rect = subtitle_text.get_rect(center=(self.screen_width // 2, 220))
        self.screen.blit(subtitle_text, subtitle_rect)
        
        # High score
        if self.high_score > 0:
            hs_text = self.font_small.render(f"High Score: {self.high_score}", True, (255, 255, 0))
            hs_rect = hs_text.get_rect(center=(self.screen_width // 2, 300))
            self.screen.blit(hs_text, hs_rect)
        
        # Start button
        button_width = 200
        button_height = 60
        button_x = self.screen_width // 2 - button_width // 2
        button_y = 400
        
        mouse_pos = pygame.mouse.get_pos()
        mouse_over = (button_x <= mouse_pos[0] <= button_x + button_width and
                     button_y <= mouse_pos[1] <= button_y + button_height)
        
        button_color = (0, 200, 0) if mouse_over else (0, 150, 0)
        pygame.draw.rect(self.screen, button_color, (button_x, button_y, button_width, button_height))
        pygame.draw.rect(self.screen, (255, 255, 255), (button_x, button_y, button_width, button_height), 3)
        
        start_text = self.font_medium.render("START", True, (255, 255, 255))
        start_rect = start_text.get_rect(center=(self.screen_width // 2, button_y + button_height // 2))
        self.screen.blit(start_text, start_rect)
        
        return button_x, button_y, button_width, button_height
    
    def handle_start_screen_click(self, pos):
        """Handle clicks on start screen."""
        button_x, button_y, button_width, button_height = self.draw_start_screen()
        
        if (button_x <= pos[0] <= button_x + button_width and
            button_y <= pos[1] <= button_y + button_height):
            self.game_state = "playing"
            self.score = 0
            self.current_level = 1
            self.init_game()
    
    def draw_game_over_screen(self):
        """Draw game over screen."""
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        game_over_text = self.font_large.render("GAME OVER", True, (255, 0, 0))
        game_over_rect = game_over_text.get_rect(center=(self.screen_width // 2, 200))
        self.screen.blit(game_over_text, game_over_rect)
        
        score_text = self.font_medium.render(f"Score: {self.score}", True, (255, 255, 255))
        score_rect = score_text.get_rect(center=(self.screen_width // 2, 280))
        self.screen.blit(score_text, score_rect)
        
        if self.score >= self.high_score:
            new_record_text = self.font_small.render("NEW HIGH SCORE!", True, (255, 255, 0))
            new_record_rect = new_record_text.get_rect(center=(self.screen_width // 2, 340))
            self.screen.blit(new_record_text, new_record_rect)
        
        restart_text = self.font_small.render("Click anywhere to restart", True, (200, 200, 200))
        restart_rect = restart_text.get_rect(center=(self.screen_width // 2, 400))
        self.screen.blit(restart_text, restart_rect)
        
        # Show high score if not a new record
        if self.score < self.high_score:
            hs_text = self.font_small.render(f"High Score: {self.high_score}", True, (255, 255, 0))
            hs_rect = hs_text.get_rect(center=(self.screen_width // 2, 360))
            self.screen.blit(hs_text, hs_rect)
    
    def update(self, dt):
        """Update game state."""
        if self.game_state != "playing":
            return
        
        # Update shooter
        mouse_pos = pygame.mouse.get_pos()
        self.shooter.update(mouse_pos)
        # Always show aiming line when playing
        self.shooter.aiming = True
        
        # Update moving bubble
        if self.moving_bubble and self.moving_bubble.is_moving:
            self.moving_bubble.update(dt)
            
            # Check if bubble hit ceiling first (highest priority)
            if self.moving_bubble.y - self.moving_bubble.radius <= 0:
                # Stop immediately and attach to ceiling
                self.moving_bubble.velocity_x = 0
                self.moving_bubble.velocity_y = 0
                self.moving_bubble.is_moving = False
                self.moving_bubble.y = self.moving_bubble.radius
                # Attach to ceiling at nearest grid position
                self.attach_bubble_to_grid(self.moving_bubble)
                self.moving_bubble = None
            
            # Check wall collisions - bubbles bounce off walls
            elif self.moving_bubble.check_wall_collision(self.screen_width):
                # Bubble bounces off wall and continues moving
                # Will attach when it touches another bubble
                pass
            
            # Check collision with attached bubbles - classic bubble shooter: attach immediately on touch
            elif self.check_collision_with_bubbles(self.moving_bubble):
                # Classic bubble shooter: stop immediately and attach to nearest grid position
                self.moving_bubble.velocity_x = 0
                self.moving_bubble.velocity_y = 0
                self.moving_bubble.is_moving = False
                # Attach to grid - snaps to nearest valid hexagonal grid position
                # Uses same spacing as hanging bubbles to ensure perfect fit
                # Classic bubble shooter: bubble always finds a position to attach
                self.attach_bubble_to_grid(self.moving_bubble)
                self.moving_bubble = None
            
            # Check if bubble went off screen (below shooter) - game over
            elif self.moving_bubble.y > self.screen_height + 50:
                self.game_state = "game_over"
                self.save_high_score()
                return
        
        # Check if bubbles have reached the laser gun (game over condition - classic bubble shooter)
        shooter_y = self.shooter.base_y
        for bubble in self.bubbles:
            if bubble.is_attached:
                # Check if bubble's bottom edge has reached or passed the shooter
                bubble_bottom = bubble.y + bubble.radius
                if bubble_bottom >= shooter_y - 20:  # Small buffer above shooter
                    # Bubbles reached the laser gun - game over
                    self.game_state = "game_over"
                    self.save_high_score()
                    return
        
        # Check win condition
        if len(self.bubbles) == 0:
            self.current_level += 1
            if self.current_level > len(self.level_config["levels"]):
                # All levels completed
                self.game_state = "game_over"
                self.save_high_score()
            else:
                self.init_game()
    
    def draw(self):
        """Draw everything."""
        # Draw background
        if self.background:
            self.screen.blit(self.background, (0, 0))
        else:
            self.screen.fill((30, 30, 50))
        
        if self.game_state == "start":
            self.draw_start_screen()
        elif self.game_state == "playing":
            # Draw attached bubbles
            for bubble in self.bubbles:
                if bubble.is_attached:
                    bubble.draw(self.screen)
            
            # Draw moving bubble
            if self.moving_bubble:
                self.moving_bubble.draw(self.screen)
            
            # Draw current bubble (ready to shoot)
            if self.current_bubble and not self.moving_bubble:
                self.current_bubble.draw(self.screen)
            
            # Draw next bubble preview
            if self.next_bubble:
                self.next_bubble.draw(self.screen)
            
            # Draw shooter
            self.shooter.draw(self.screen)
            
            # Draw UI with borders (top left corner)
            # Score with border
            score_text = self.font_small.render(f"Score: {self.score}", True, (255, 255, 255))
            score_rect = score_text.get_rect(topleft=(10, 10))
            # Draw semi-transparent background and border for score
            border_rect = pygame.Rect(score_rect.x - 5, score_rect.y - 5, 
                                     score_rect.width + 10, score_rect.height + 10)
            border_surface = pygame.Surface((border_rect.width, border_rect.height))
            border_surface.set_alpha(200)
            border_surface.fill((0, 0, 0))
            self.screen.blit(border_surface, border_rect)
            pygame.draw.rect(self.screen, (255, 255, 255), border_rect, 2)
            self.screen.blit(score_text, score_rect)
            
            # Level with border
            level_text = self.font_small.render(f"Level: {self.current_level}", True, (255, 255, 255))
            level_rect = level_text.get_rect(topleft=(10, 50))
            border_rect = pygame.Rect(level_rect.x - 5, level_rect.y - 5, 
                                     level_rect.width + 10, level_rect.height + 10)
            border_surface = pygame.Surface((border_rect.width, border_rect.height))
            border_surface.set_alpha(200)
            border_surface.fill((0, 0, 0))
            self.screen.blit(border_surface, border_rect)
            pygame.draw.rect(self.screen, (255, 255, 255), border_rect, 2)
            self.screen.blit(level_text, level_rect)
            
            # High score with border
            hs_text = self.font_small.render(f"High Score: {self.high_score}", True, (255, 255, 0))
            hs_rect = hs_text.get_rect(topleft=(10, 90))
            border_rect = pygame.Rect(hs_rect.x - 5, hs_rect.y - 5, 
                                     hs_rect.width + 10, hs_rect.height + 10)
            border_surface = pygame.Surface((border_rect.width, border_rect.height))
            border_surface.set_alpha(200)
            border_surface.fill((0, 0, 0))
            self.screen.blit(border_surface, border_rect)
            pygame.draw.rect(self.screen, (255, 255, 0), border_rect, 2)
            self.screen.blit(hs_text, hs_rect)
        
        elif self.game_state == "game_over":
            # Draw game behind overlay
            for bubble in self.bubbles:
                if bubble.is_attached:
                    bubble.draw(self.screen)
            self.draw_game_over_screen()
    
    def handle_click(self, pos):
        """Handle mouse clicks."""
        if self.game_state == "start":
            self.handle_start_screen_click(pos)
        elif self.game_state == "playing":
            if self.current_bubble and not self.moving_bubble:
                # Shoot bubble
                level_data = self.level_config["levels"][self.current_level - 1]
                speed = level_data["bubble_speed"]
                vx, vy = self.shooter.shoot(speed)
                
                shoot_x, shoot_y = self.shooter.get_shoot_position()
                self.current_bubble.x = shoot_x
                self.current_bubble.y = shoot_y
                self.current_bubble.velocity_x = vx
                self.current_bubble.velocity_y = vy
                self.current_bubble.is_moving = True
                
                # Move bubble to moving_bubble tracker
                self.moving_bubble = self.current_bubble
                
                # Swap bubbles
                self.current_bubble = self.next_bubble
                self.next_bubble = self.create_random_bubble(
                    self.shooter.base_x + 60, self.shooter.base_y - 40
                )
                
                # Play sound
                if self.shoot_sound:
                    self.shoot_sound.play()
        elif self.game_state == "game_over":
            # Restart game
            self.game_state = "start"
            self.score = 0
            self.current_level = 1
    
    def run(self):
        """Main game loop."""
        while self.running:
            dt = self.clock.tick(60) / 1000.0  # Delta time in seconds
            # Cap delta time to prevent large jumps and ensure smooth movement
            dt = min(dt, 0.033)  # Cap at ~30fps minimum
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:  # Left click
                        self.handle_click(event.pos)
                elif event.type == pygame.MOUSEMOTION:
                    if self.game_state == "playing":
                        self.shooter.aiming = True
            
            self.update(dt)
            self.draw()
            pygame.display.flip()
        
        pygame.quit()

