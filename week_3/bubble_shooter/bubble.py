import pygame
import math
import os

class Bubble:
    """Represents a single bubble with physics and collision detection."""
    
    def __init__(self, x, y, color, radius=30):
        self.x = x
        self.y = y
        self.color = color
        self.radius = radius
        self.velocity_x = 0
        self.velocity_y = 0
        self.is_moving = False
        self.is_attached = False
        self.grid_row = None
        self.grid_col = None
        
        # Load the alien head image for this color
        image_path = os.path.join("assets", "images", f"{color}.png")
        if os.path.exists(image_path):
            self.image = pygame.image.load(image_path)
            # Scale image to fit within bubble while maintaining aspect ratio
            img_width, img_height = self.image.get_size()
            scale_factor = min((radius * 1.6) / img_width, (radius * 1.6) / img_height)
            new_width = int(img_width * scale_factor)
            new_height = int(img_height * scale_factor)
            self.image = pygame.transform.scale(self.image, (new_width, new_height))
        else:
            # Fallback: create a colored circle if image not found
            self.image = None
    
    def update(self, dt):
        """Update bubble position based on velocity with smooth movement."""
        if self.is_moving:
            # Smooth movement using delta time for frame-rate independent motion
            # This ensures bubbles sail smoothly regardless of frame rate
            self.x += self.velocity_x * dt
            self.y += self.velocity_y * dt
    
    def draw(self, screen):
        """Draw the bubble on the screen."""
        # Draw bubble outer circle (white border)
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x), int(self.y)), self.radius, 2)
        # Draw bubble inner circle (light gray/white fill)
        pygame.draw.circle(screen, (240, 240, 240), (int(self.x), int(self.y)), self.radius - 2)
        
        # Draw alien head image centered in bubble
        if self.image:
            img_rect = self.image.get_rect(center=(int(self.x), int(self.y)))
            screen.blit(self.image, img_rect)
        else:
            # Fallback colored circle
            color_map = {
                "red": (255, 0, 0),
                "blue": (0, 0, 255),
                "green": (0, 255, 0),
                "purple": (128, 0, 128),
                "yellow": (255, 255, 0),
                "wookie": (139, 69, 19)
            }
            color = color_map.get(self.color, (255, 255, 255))
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), self.radius - 5)
    
    def check_wall_collision(self, screen_width):
        """Check and handle collision with side walls - bubbles bounce off walls."""
        # Classic bubble shooter: bubbles bounce perfectly off walls
        if self.x - self.radius <= 0:
            self.x = self.radius
            self.velocity_x = -self.velocity_x  # Bounce (reverse horizontal velocity)
            return True  # Collision detected
        elif self.x + self.radius >= screen_width:
            self.x = screen_width - self.radius
            self.velocity_x = -self.velocity_x  # Bounce (reverse horizontal velocity)
            return True  # Collision detected
        return False  # No collision
    
    def check_ceiling_collision(self):
        """Check collision with ceiling (classic bubble shooter: attach, don't bounce)."""
        # Note: In classic bubble shooter, ceiling collision is handled in game logic
        # This method is kept for compatibility but ceiling attachment happens in game.update()
        if self.y - self.radius <= 0:
            self.y = self.radius
            # Don't bounce - will be handled by game logic to attach
    
    def distance_to(self, other):
        """Calculate distance to another bubble."""
        dx = self.x - other.x
        dy = self.y - other.y
        return math.sqrt(dx * dx + dy * dy)
    
    def snap_to_grid_position(self, grid_x, grid_y):
        """Snap bubble to grid position."""
        self.x = grid_x
        self.y = grid_y
        self.is_moving = False
        self.is_attached = True
    
    def get_neighbors(self, all_bubbles, grid):
        """Get neighboring bubbles in the grid."""
        neighbors = []
        if self.grid_row is None or self.grid_col is None:
            return neighbors
        
        # Hexagonal grid neighbors
        offsets = [
            (-1, -1), (0, -1), (1, -1),
            (-1, 0),           (1, 0),
            (-1, 1),  (0, 1),  (1, 1)
        ]
        
        for dr, dc in offsets:
            new_row = self.grid_row + dr
            new_col = self.grid_col + dc
            if 0 <= new_row < len(grid) and 0 <= new_col < len(grid[0]):
                if grid[new_row][new_col] is not None:
                    neighbors.append(grid[new_row][new_col])
        
        return neighbors

