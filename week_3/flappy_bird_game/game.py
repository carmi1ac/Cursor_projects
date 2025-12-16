import pygame
import random
import math
import json
import os

# Load level configuration
def load_level_config():
    with open('levels.json', 'r') as f:
        return json.load(f)

class Player:
    def __init__(self, x, y, size, config):
        self.x = x
        self.y = y
        self.size = size
        self.velocity_y = 0
        self.gravity = config['gravity']
        self.flap_strength = config['flap_strength']
        self.has_flapped = False  # Track if player has flapped at least once
        self.image = None
        self.rect = None
        self.load_image()
        
    def load_image(self):
        try:
            img = pygame.image.load('assets/images/cap.png').convert_alpha()
            self.image = pygame.transform.scale(img, (self.size, self.size))
            self.rect = self.image.get_rect(center=(self.x, self.y))
        except:
            # Fallback if image doesn't load
            self.image = None
            self.rect = pygame.Rect(self.x - self.size//2, self.y - self.size//2, 
                                   self.size, self.size)
    
    def flap(self):
        self.velocity_y = self.flap_strength
        self.has_flapped = True  # Mark that player has started playing
    
    def update(self):
        # Only apply gravity after player has flapped (prevents initial fall)
        if self.has_flapped:
            self.velocity_y += self.gravity
        self.y += self.velocity_y
        if self.image:
            self.rect.center = (self.x, self.y)
        else:
            self.rect.center = (self.x, self.y)
    
    def draw(self, screen):
        if self.image:
            screen.blit(self.image, self.rect)
        else:
            pygame.draw.rect(screen, (255, 0, 0), self.rect)

class Enemy:
    def __init__(self, x, y, size, speed, player):
        self.x = x
        self.y = y
        self.size = size
        self.speed = speed
        self.player = player
        self.active = True
        self.image = None
        self.rect = None
        self.load_image()
        
    def load_image(self):
        try:
            img = pygame.image.load('assets/images/red_skull.png').convert_alpha()
            self.image = pygame.transform.scale(img, (self.size, self.size))
            self.rect = self.image.get_rect(center=(self.x, self.y))
        except:
            self.image = None
            self.rect = pygame.Rect(self.x - self.size//2, self.y - self.size//2,
                                   self.size, self.size)
    
    def update(self):
        if not self.active:
            return
            
        # Move toward player
        dx = self.player.x - self.x
        dy = self.player.y - self.y
        distance = math.sqrt(dx*dx + dy*dy)
        
        if distance > 0:
            self.x += (dx / distance) * self.speed
            self.y += (dy / distance) * self.speed
        
        if self.image:
            self.rect.center = (self.x, self.y)
        else:
            self.rect.center = (self.x, self.y)
    
    def draw(self, screen):
        if self.active:
            if self.image:
                screen.blit(self.image, self.rect)
            else:
                pygame.draw.rect(screen, (200, 0, 0), self.rect)

class Wall:
    def __init__(self, x, gap_y, gap_size, screen_height, speed):
        self.x = x
        self.gap_y = gap_y
        self.gap_size = gap_size
        self.screen_height = screen_height
        self.speed = speed
        self.width = 80
        self.passed = False
        
        # Create top and bottom wall rects
        self.top_rect = pygame.Rect(x, 0, self.width, gap_y)
        self.bottom_rect = pygame.Rect(x, gap_y + gap_size, self.width, 
                                       screen_height - (gap_y + gap_size))
    
    def update(self):
        self.x -= self.speed
        self.top_rect.x = self.x
        self.bottom_rect.x = self.x
    
    def draw(self, screen):
        # Captain America themed colors - red, white, blue (static pattern)
        colors = [(200, 0, 0), (255, 255, 255), (0, 0, 200)]
        
        # Draw with static comic book style stripes
        stripe_width = 10
        for i in range(0, self.width, stripe_width):
            color = colors[(i // stripe_width) % 3]
            pygame.draw.rect(screen, color, 
                           (self.x + i, self.top_rect.y, stripe_width, self.top_rect.height))
            pygame.draw.rect(screen, color,
                           (self.x + i, self.bottom_rect.y, stripe_width, self.bottom_rect.height))
        
        # Add border
        pygame.draw.rect(screen, (0, 0, 0), self.top_rect, 3)
        pygame.draw.rect(screen, (0, 0, 0), self.bottom_rect, 3)
    
    def check_collision(self, rect):
        return self.top_rect.colliderect(rect) or self.bottom_rect.colliderect(rect)

class Collectible:
    def __init__(self, x, y, size):
        self.x = x
        self.y = y
        self.size = size
        self.collected = False
        self.rect = pygame.Rect(x - size//2, y - size//2, size, size)
        self.rotation = 0
    
    def update(self, speed):
        self.x -= speed
        self.rect.x = self.x - self.size//2
        self.rotation += 3
    
    def draw(self, screen):
        if not self.collected:
            # Draw yellow star collectible
            star_points = []
            outer_radius = self.size // 2
            inner_radius = outer_radius // 2
            
            # Create 5-pointed star
            for i in range(10):  # 10 points total (5 outer, 5 inner)
                angle = (self.rotation + i * 36) * math.pi / 180
                if i % 2 == 0:
                    # Outer points
                    radius = outer_radius
                else:
                    # Inner points
                    radius = inner_radius
                px = int(self.x + math.cos(angle) * radius)
                py = int(self.y + math.sin(angle) * radius)
                star_points.append((px, py))
            
            # Draw filled yellow star
            pygame.draw.polygon(screen, (255, 215, 0), star_points)
            # Draw outline for better visibility
            pygame.draw.polygon(screen, (255, 200, 0), star_points, 2)

class Projectile:
    def __init__(self, x, y, target_x, target_y, speed, size):
        self.x = x
        self.y = y
        self.speed = speed
        self.size = size
        self.active = True
        
        # Calculate direction toward target
        dx = target_x - x
        dy = target_y - y
        distance = math.sqrt(dx*dx + dy*dy)
        if distance > 0:
            self.velocity_x = (dx / distance) * speed
            self.velocity_y = (dy / distance) * speed
        else:
            self.velocity_x = speed
            self.velocity_y = 0
        
        self.rect = pygame.Rect(x - size//2, y - size//2, size, size)
    
    def update(self):
        if self.active:
            self.x += self.velocity_x
            self.y += self.velocity_y
            self.rect.center = (self.x, self.y)
    
    def draw(self, screen):
        if self.active:
            # Draw shield projectile
            pygame.draw.circle(screen, (200, 0, 0), (int(self.x), int(self.y)), self.size//2)
            pygame.draw.circle(screen, (255, 255, 255), (int(self.x), int(self.y)), self.size//2 - 2)
            pygame.draw.circle(screen, (0, 0, 200), (int(self.x), int(self.y)), self.size//2 - 4)

class Game:
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.config = load_level_config()
        self.current_level_config = self.config['levels'][0]
        self.score = 0
        self.high_score = self.load_high_score()
        
        # Initialize player
        player_size = self.config['hero_size']
        self.player = Player(150, screen_height // 2, player_size, self.current_level_config)
        
        # Game objects
        self.walls = []
        self.enemies = []
        self.collectibles = []
        self.projectiles = []
        
        # Game state
        self.game_over = False
        self.game_started = False
        self.last_wall_x = screen_width
        
        # Timing
        self.last_projectile_time = 0
        self.projectile_cooldown = self.current_level_config['projectile_cooldown']
        
        # Load background
        self.background = None
        self.load_background()
        
        # Load sounds
        self.sounds = {}
        self.load_sounds()
        
    def load_background(self):
        try:
            bg_img = pygame.image.load('assets/images/map.png').convert()
            self.background = pygame.transform.scale(bg_img, (self.screen_width, self.screen_height))
        except:
            self.background = None
    
    def load_sounds(self):
        try:
            pygame.mixer.init()
            self.sounds['flap'] = pygame.mixer.Sound('assets/sounds/flap.wav')
            self.sounds['enemy'] = pygame.mixer.Sound('assets/sounds/enemy.wav')
            self.sounds['gameover'] = pygame.mixer.Sound('assets/sounds/gameover.wav')
            self.sounds['bg'] = pygame.mixer.music
            self.sounds['bg'].load('assets/sounds/bg.mp3')
        except Exception as e:
            print(f"Warning: Could not load some sounds: {e}")
    
    def load_high_score(self):
        try:
            if os.path.exists('highscore.json'):
                with open('highscore.json', 'r') as f:
                    data = json.load(f)
                    return data.get('high_score', 0)
        except:
            pass
        return 0
    
    def save_high_score(self):
        try:
            with open('highscore.json', 'w') as f:
                json.dump({'high_score': self.high_score}, f)
        except:
            pass
    
    def start_game(self):
        self.game_started = True
        self.game_over = False
        self.score = 0
        
        # Reset player
        player_size = self.config['hero_size']
        self.player = Player(150, self.screen_height // 2, player_size, self.current_level_config)
        
        # Clear all objects
        self.walls = []
        self.enemies = []
        self.collectibles = []
        self.projectiles = []
        # Start walls further away to give player time
        self.last_wall_x = self.screen_width + 200
        
        # Play background music
        try:
            self.sounds['bg'].play(-1)  # Loop background music
        except:
            pass
    
    def spawn_wall(self):
        gap_size = self.current_level_config['wall_gap_size']
        gap_y = random.randint(100, self.screen_height - gap_size - 100)
        wall = Wall(self.screen_width, gap_y, gap_size, self.screen_height,
                   self.current_level_config['wall_speed'])
        self.walls.append(wall)
        self.last_wall_x = self.screen_width
    
    def spawn_enemy(self):
        if random.random() < self.current_level_config['enemy_spawn_rate']:
            enemy_size = self.config['enemy_size']
            # Spawn from right side, random Y
            y = random.randint(50, self.screen_height - 50)
            enemy = Enemy(self.screen_width + 50, y, enemy_size,
                         self.current_level_config['enemy_speed'], self.player)
            self.enemies.append(enemy)
    
    def spawn_collectible(self):
        if random.random() < self.current_level_config['collectible_spawn_rate']:
            collectible_size = self.config['collectible_size']
            # Spawn in safe area (middle third of screen)
            y = random.randint(self.screen_height // 3, 2 * self.screen_height // 3)
            collectible = Collectible(self.screen_width + 50, y, collectible_size)
            self.collectibles.append(collectible)
    
    def shoot_projectile(self, mouse_x, mouse_y):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_projectile_time >= self.projectile_cooldown:
            projectile_size = self.config['projectile_size']
            projectile = Projectile(self.player.x, self.player.y, mouse_x, mouse_y,
                                  self.current_level_config['projectile_speed'],
                                  projectile_size)
            self.projectiles.append(projectile)
            self.last_projectile_time = current_time
    
    def update(self):
        if not self.game_started or self.game_over:
            return
        
        # Update player
        self.player.update()
        
        # Check boundaries
        if self.player.y < 0 or self.player.y > self.screen_height:
            self.end_game()
            return
        
        # Spawn walls with proper spacing
        wall_spacing = self.current_level_config['wall_spacing']
        # Check if we need to spawn a new wall
        should_spawn = False
        if len(self.walls) == 0:
            # Spawn first wall if none exist
            if self.last_wall_x >= self.screen_width:
                should_spawn = True
        else:
            # Check if the last wall is far enough to the left to spawn a new one
            last_wall_x = max([w.x for w in self.walls])
            if last_wall_x < self.screen_width - wall_spacing:
                should_spawn = True
        
        if should_spawn:
            self.spawn_wall()
        
        # Update walls
        for wall in self.walls[:]:
            wall.update()
            if wall.x + wall.width < 0:
                if not wall.passed:
                    wall.passed = True
                    self.score += 10
                self.walls.remove(wall)
            elif wall.check_collision(self.player.rect):
                self.end_game()
                return
        
        # Spawn enemies
        self.spawn_enemy()
        
        # Update enemies
        for enemy in self.enemies[:]:
            if not enemy.active:
                self.enemies.remove(enemy)
                continue
            enemy.update()
            if enemy.x < -50:
                self.enemies.remove(enemy)
            elif enemy.active and enemy.rect.colliderect(self.player.rect):
                self.end_game()
                return
        
        # Spawn collectibles
        self.spawn_collectible()
        
        # Update collectibles
        for collectible in self.collectibles[:]:
            collectible.update(self.current_level_config['wall_speed'])
            if collectible.x < -50:
                self.collectibles.remove(collectible)
            elif not collectible.collected and collectible.rect.colliderect(self.player.rect):
                collectible.collected = True
                self.score += 50
                self.collectibles.remove(collectible)
        
        # Update projectiles
        for projectile in self.projectiles[:]:
            projectile.update()
            if (projectile.x < 0 or projectile.x > self.screen_width or
                projectile.y < 0 or projectile.y > self.screen_height):
                self.projectiles.remove(projectile)
                continue
            
            # Check collision with enemies
            for enemy in self.enemies[:]:
                if enemy.active and projectile.active and projectile.rect.colliderect(enemy.rect):
                    enemy.active = False
                    projectile.active = False
                    self.score += 25
                    try:
                        self.sounds['enemy'].play()
                    except:
                        pass
                    if projectile in self.projectiles:
                        self.projectiles.remove(projectile)
                    break
    
    def end_game(self):
        self.game_over = True
        try:
            self.sounds['bg'].stop()
            self.sounds['gameover'].play()
        except:
            pass
        
        if self.score > self.high_score:
            self.high_score = self.score
            self.save_high_score()
    
    def draw(self, screen):
        # Draw background
        if self.background:
            screen.blit(self.background, (0, 0))
        else:
            screen.fill((135, 206, 235))  # Sky blue
        
        if not self.game_started:
            return
        
        # Draw walls
        for wall in self.walls:
            wall.draw(screen)
        
        # Draw collectibles
        for collectible in self.collectibles:
            collectible.draw(screen)
        
        # Draw enemies
        for enemy in self.enemies:
            enemy.draw(screen)
        
        # Draw projectiles
        for projectile in self.projectiles:
            projectile.draw(screen)
        
        # Draw player
        self.player.draw(screen)
        
        # Draw UI
        font = pygame.font.Font(None, 36)
        score_text = font.render(f"Score: {self.score}", True, (255, 255, 255))
        screen.blit(score_text, (10, 10))
        
        high_score_text = font.render(f"High Score: {self.high_score}", True, (255, 255, 255))
        screen.blit(high_score_text, (10, 50))
        
        if self.game_over:
            # Draw game over overlay
            overlay = pygame.Surface((self.screen_width, self.screen_height))
            overlay.set_alpha(180)
            overlay.fill((0, 0, 0))
            screen.blit(overlay, (0, 0))
            
            game_over_font = pygame.font.Font(None, 72)
            game_over_text = game_over_font.render("GAME OVER", True, (255, 0, 0))
            text_rect = game_over_text.get_rect(center=(self.screen_width//2, self.screen_height//2 - 50))
            screen.blit(game_over_text, text_rect)
            
            restart_font = pygame.font.Font(None, 36)
            restart_text = restart_font.render("Press SPACE or Click to Restart", True, (255, 255, 255))
            restart_rect = restart_text.get_rect(center=(self.screen_width//2, self.screen_height//2 + 50))
            screen.blit(restart_text, restart_rect)

