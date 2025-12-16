import pygame
import math
import os

class Shooter:
    """Space science fiction laser gun shooter."""
    
    def __init__(self, x, y, screen_width, screen_height):
        self.base_x = x
        self.base_y = y
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.angle = -90  # Start pointing up
        self.length = 80  # Longer barrel for sci-fi look
        self.aiming = False
        
    def update(self, mouse_pos):
        """Update shooter angle based on mouse position to aim at hanging bubbles."""
        dx = mouse_pos[0] - self.base_x
        dy = mouse_pos[1] - self.base_y
        
        # Handle edge case: if mouse is directly above (dx = 0), aim straight up
        if abs(dx) < 0.1:
            self.angle = -90
            return
        
        # Calculate angle to mouse position
        # atan2(y, x) returns angle in radians from positive x-axis
        # We use -dy because y increases downward in screen coordinates
        # Negative angles point upward (which is what we want)
        angle_rad = math.atan2(-dy, dx)
        angle_deg = math.degrees(angle_rad)
        
        # Ensure we only shoot upward (angles between -180 and 0 degrees)
        # -90 degrees = straight up
        # -180 degrees = left and up  
        # 0 degrees = right and up
        if angle_deg > 0:
            # If angle is positive (pointing right/down), clamp to 0 (right-up)
            self.angle = 0
        elif angle_deg < -180:
            # If angle is less than -180 (pointing left/down), clamp to -180 (left-up)
            self.angle = -180
        else:
            # Angle is in valid range, use it directly
            self.angle = angle_deg
    
    def draw(self, screen):
        """Draw the sci-fi laser gun."""
        # Calculate gun endpoint
        rad_angle = math.radians(self.angle)
        end_x = self.base_x + math.cos(rad_angle) * self.length
        end_y = self.base_y + math.sin(rad_angle) * self.length
        
        # Draw sci-fi gun base platform (larger, more futuristic)
        base_radius = 20
        # Outer glow effect
        for i in range(3):
            alpha = 50 - i * 15
            pygame.draw.circle(screen, (0, 200, 255), (int(self.base_x), int(self.base_y)), base_radius + i, 1)
        
        # Main base circle (dark metallic)
        pygame.draw.circle(screen, (40, 40, 50), (int(self.base_x), int(self.base_y)), base_radius)
        pygame.draw.circle(screen, (60, 60, 70), (int(self.base_x), int(self.base_y)), base_radius - 2)
        
        # Energy core (pulsing cyan/blue)
        core_color = (0, 255, 255)
        pygame.draw.circle(screen, core_color, (int(self.base_x), int(self.base_y)), 10)
        pygame.draw.circle(screen, (255, 255, 255), (int(self.base_x), int(self.base_y)), 6)
        pygame.draw.circle(screen, (0, 150, 255), (int(self.base_x), int(self.base_y)), 3)
        
        # Draw gun barrel (longer, more angular)
        barrel_length = self.length + 20
        barrel_end_x = self.base_x + math.cos(rad_angle) * barrel_length
        barrel_end_y = self.base_y + math.sin(rad_angle) * barrel_length
        
        # Main barrel body (dark with metallic edges)
        barrel_width = 12
        barrel_points = [
            (self.base_x + math.cos(rad_angle) * 15, self.base_y + math.sin(rad_angle) * 15),
            (barrel_end_x + math.cos(rad_angle + math.pi/2) * barrel_width, 
             barrel_end_y + math.sin(rad_angle + math.pi/2) * barrel_width),
            (barrel_end_x + math.cos(rad_angle - math.pi/2) * barrel_width, 
             barrel_end_y + math.sin(rad_angle - math.pi/2) * barrel_width),
            (self.base_x + math.cos(rad_angle - math.pi/2) * 15, self.base_y + math.sin(rad_angle - math.pi/2) * 15)
        ]
        pygame.draw.polygon(screen, (30, 30, 40), barrel_points)
        pygame.draw.polygon(screen, (80, 100, 120), barrel_points, 2)
        
        # Barrel tip (energy emitter)
        tip_size = 8
        tip_points = [
            (barrel_end_x + math.cos(rad_angle) * tip_size, barrel_end_y + math.sin(rad_angle) * tip_size),
            (barrel_end_x + math.cos(rad_angle + math.pi/2) * tip_size, 
             barrel_end_y + math.sin(rad_angle + math.pi/2) * tip_size),
            (barrel_end_x + math.cos(rad_angle - math.pi/2) * tip_size, 
             barrel_end_y + math.sin(rad_angle - math.pi/2) * tip_size)
        ]
        pygame.draw.polygon(screen, (0, 255, 255), tip_points)
        pygame.draw.polygon(screen, (255, 255, 255), tip_points, 1)
        
        # Side fins/energy conduits
        fin_length = 25
        for side in [-1, 1]:
            fin_start_x = self.base_x + math.cos(rad_angle + side * math.pi/2) * 18
            fin_start_y = self.base_y + math.sin(rad_angle + side * math.pi/2) * 18
            fin_end_x = fin_start_x + math.cos(rad_angle) * fin_length
            fin_end_y = fin_start_y + math.sin(rad_angle) * fin_length
            
            pygame.draw.line(screen, (0, 200, 255), 
                           (int(fin_start_x), int(fin_start_y)),
                           (int(fin_end_x), int(fin_end_y)), 3)
            pygame.draw.circle(screen, (0, 255, 255), (int(fin_end_x), int(fin_end_y)), 3)
        
        # Draw aiming line (laser sight)
        if self.aiming:
            aim_color = (255, 255, 0)
            aim_end_x = barrel_end_x + math.cos(rad_angle) * 300
            aim_end_y = barrel_end_y + math.sin(rad_angle) * 300
            
            # Dashed line effect
            dash_length = 10
            dash_gap = 5
            total_length = math.sqrt((aim_end_x - barrel_end_x)**2 + (aim_end_y - barrel_end_y)**2)
            num_dashes = int(total_length / (dash_length + dash_gap))
            
            for i in range(num_dashes):
                start_t = (i * (dash_length + dash_gap)) / total_length
                end_t = ((i * (dash_length + dash_gap) + dash_length) / total_length)
                if end_t > 1:
                    end_t = 1
                
                dash_start_x = barrel_end_x + (aim_end_x - barrel_end_x) * start_t
                dash_start_y = barrel_end_y + (aim_end_y - barrel_end_y) * start_t
                dash_end_x = barrel_end_x + (aim_end_x - barrel_end_x) * end_t
                dash_end_y = barrel_end_y + (aim_end_y - barrel_end_y) * end_t
                
                pygame.draw.line(screen, aim_color, 
                               (int(dash_start_x), int(dash_start_y)),
                               (int(dash_end_x), int(dash_end_y)), 2)
    
    def shoot(self, speed):
        """Create a bubble projectile."""
        rad_angle = math.radians(self.angle)
        velocity_x = math.cos(rad_angle) * speed
        velocity_y = math.sin(rad_angle) * speed
        return velocity_x, velocity_y
    
    def get_shoot_position(self):
        """Get the position where bubbles are shot from."""
        rad_angle = math.radians(self.angle)
        shoot_x = self.base_x + math.cos(rad_angle) * self.length
        shoot_y = self.base_y + math.sin(rad_angle) * self.length
        return shoot_x, shoot_y

