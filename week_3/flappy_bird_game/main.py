import pygame
import sys
import json

from game import Game, load_level_config

# Initialize Pygame
pygame.init()

# Load configuration
config = load_level_config()
SCREEN_WIDTH = config['screen_width']
SCREEN_HEIGHT = config['screen_height']

# Set up the display
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Captain America: Flappy Shield")
clock = pygame.time.Clock()

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (200, 0, 0)
BLUE = (0, 0, 200)
GOLD = (255, 215, 0)

class StartScreen:
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.start_button_rect = pygame.Rect(screen_width//2 - 100, screen_height//2 + 50, 200, 60)
        
    def draw(self, screen, high_score):
        # Draw background
        try:
            bg_img = pygame.image.load('assets/images/map.png').convert()
            bg_img = pygame.transform.scale(bg_img, (self.screen_width, self.screen_height))
            screen.blit(bg_img, (0, 0))
        except:
            screen.fill((135, 206, 235))
        
        # Draw title
        title_font = pygame.font.Font(None, 72)
        title_text = title_font.render("CAPTAIN AMERICA", True, RED)
        title_rect = title_text.get_rect(center=(self.screen_width//2, self.screen_height//2 - 150))
        screen.blit(title_text, title_rect)
        
        subtitle_font = pygame.font.Font(None, 48)
        subtitle_text = subtitle_font.render("Flappy Shield", True, BLUE)
        subtitle_rect = subtitle_text.get_rect(center=(self.screen_width//2, self.screen_height//2 - 100))
        screen.blit(subtitle_text, subtitle_rect)
        
        # Draw start button
        pygame.draw.rect(screen, RED, self.start_button_rect)
        pygame.draw.rect(screen, BLACK, self.start_button_rect, 3)
        
        button_font = pygame.font.Font(None, 48)
        button_text = button_font.render("START", True, WHITE)
        button_text_rect = button_text.get_rect(center=self.start_button_rect.center)
        screen.blit(button_text, button_text_rect)
        
        # Draw instructions
        instruction_font = pygame.font.Font(None, 28)
        instructions = [
            "SPACE or LEFT CLICK: Flap",
            "RIGHT CLICK: Shoot Shield",
            "Avoid walls and enemies!",
            "Collect shields for points!"
        ]
        
        y_offset = self.screen_height//2 + 150
        for instruction in instructions:
            inst_text = instruction_font.render(instruction, True, WHITE)
            inst_rect = inst_text.get_rect(center=(self.screen_width//2, y_offset))
            screen.blit(inst_text, inst_rect)
            y_offset += 35
        
        # Draw high score
        if high_score > 0:
            hs_font = pygame.font.Font(None, 36)
            hs_text = hs_font.render(f"High Score: {high_score}", True, GOLD)
            hs_rect = hs_text.get_rect(center=(self.screen_width//2, 50))
            screen.blit(hs_text, hs_rect)
    
    def check_click(self, pos):
        return self.start_button_rect.collidepoint(pos)

def main():
    game = Game(SCREEN_WIDTH, SCREEN_HEIGHT)
    start_screen = StartScreen(SCREEN_WIDTH, SCREEN_HEIGHT)
    
    running = True
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if not game.game_started:
                    # Check if start button is clicked
                    if start_screen.check_click(event.pos):
                        game.start_game()
                elif not game.game_over:
                    # Left click to flap
                    if event.button == 1:
                        game.player.flap()
                        try:
                            game.sounds['flap'].play()
                        except:
                            pass
                    # Right click to shoot
                    elif event.button == 3:
                        mouse_x, mouse_y = event.pos
                        game.shoot_projectile(mouse_x, mouse_y)
                else:
                    # Restart game
                    game.start_game()
            
            elif event.type == pygame.KEYDOWN:
                if not game.game_started:
                    if event.key == pygame.K_SPACE:
                        game.start_game()
                elif not game.game_over:
                    # Space to flap
                    if event.key == pygame.K_SPACE:
                        game.player.flap()
                        try:
                            game.sounds['flap'].play()
                        except:
                            pass
                else:
                    # Space to restart
                    if event.key == pygame.K_SPACE:
                        game.start_game()
        
        # Update game
        if game.game_started:
            game.update()
        
        # Draw everything
        screen.fill(BLACK)
        
        if not game.game_started:
            start_screen.draw(screen, game.high_score)
        else:
            game.draw(screen)
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()

