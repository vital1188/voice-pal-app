// Advanced Futuristic AI Face using p5.js - Enhanced with speech-reactive patterns

let sketch = function(p) {
  // Enhanced color palette with more vibrant and futuristic tones
  const palette = {
    black: [5, 5, 10],
    darkBlue: [10, 15, 25],
    white: [240, 240, 245],
    skin: [20, 20, 30], // Darker for digital look
    highlight: [255, 255, 255],
    shadow: [10, 10, 20],
    // Mesmerizing eye colors with more depth
    iris: [0, 230, 255], // Brighter cyan for more vivid eyes
    irisGlow: [0, 180, 255, 100], // Subtle glow for depth
    irisHighlight: [150, 255, 255], // Bright highlight for reflections
    accent: [0, 200, 255],
    // Enhanced neon colors for futuristic look
    neonBlue: [0, 170, 255],
    neonPink: [255, 0, 150],
    neonPurple: [200, 0, 255],
    neonGreen: [0, 255, 150],
    neonCyan: [0, 255, 230],
    neonOrange: [255, 100, 0],
    digitalGrid: [0, 100, 180],
    // Enhanced emotional state colors
    happy: [50, 255, 150],
    sad: [100, 150, 255],
    angry: [255, 50, 50],
    surprised: [255, 200, 0],
    thinking: [180, 180, 255],
    // New futuristic accent colors
    hologram: [0, 255, 200, 150],
    energyCore: [0, 200, 255, 200],
    techLines: [0, 150, 255, 100]
  };
  
  // Enhanced robot face parameters
  let faceWidth, faceHeight;
  let leftEye, rightEye, mouth;
  let particles = [];
  let energyParticles = []; // New energy particles for futuristic effect
  let audioLevel = 0;
  let isListening = false;
  let blinkTimer = 0;
  let mouthMovement = 0;
  // Expanded expression states for more emotional range
  let expressionState = 'neutral'; // neutral, happy, thinking, surprised, sad, angry
  let expressionTimer = 0;
  let expressionIntensity = 0; // 0-1 scale for intensity of expression
  let lastExpressionChange = 0;
  
  // Speech patterns module
  let speechPatternsModule = null;
  
  // Audio visualization data - optimized
  let audioData = new Array(16).fill(0);
  
  // Flag to track if robot is in fullscreen mode
  let isFullscreen = false;
  
  // Futuristic elements
  let circuitLines = []; // Circuit-like lines for tech aesthetic
  let energyCore; // Central energy core
  let holoRings = []; // Holographic rings
  let stars = [];
  let grid = [];
  let time = 0;
  
  // Variables for more responsive eye movements
  let targetEyeX = 0;
  let targetEyeY = 0;
  let lastEyeMovementTime = Date.now();
  let eyeMovementInterval = 1500; // Faster eye movements for more responsiveness
  
  // Eye reflection and depth variables
  let reflectionAngle = 0;
  let reflectionIntensity = 0.8;
  let eyeDepthLayers = 5; // Number of depth layers for eyes
  
  // Performance optimization variables
  let lastFrameTime = 0;
  let deltaTime = 0;
  const FRAME_RATE = 60; // Target frame rate
  
  p.setup = function() {
    // Create canvas that covers the entire window
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-2');
    
    // Initialize speech patterns module
    if (window.createSpeechPatterns) {
      speechPatternsModule = window.createSpeechPatterns(p);
      speechPatternsModule.init();
      
      // Make it globally accessible
      window.speechPatterns = speechPatternsModule;
    }
    
    // Calculate face dimensions based on window size - ensure it's centered and visible
    faceWidth = p.min(p.width * 0.7, 1000); // Slightly smaller for better visibility
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Initialize eyes with enhanced futuristic design - centered in viewport
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.45; // Moved down slightly to center in viewport
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6, // Larger pupil for mesmerizing appearance
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0, // 0 = open, 1 = closed
      glowIntensity: 0.9, // Increased glow for better visibility
      lastBlink: 0,
      color: [...palette.iris], // Clone the array to avoid reference issues
      // New properties for enhanced eyes
      irisRotation: 0,
      irisLayers: 4,
      reflections: [
        { x: 0.2, y: -0.2, size: 0.15, opacity: 0.9 },
        { x: -0.1, y: -0.1, size: 0.08, opacity: 0.7 }
      ],
      depthEffect: 0.85 // Depth effect intensity (0-1)
    };
    
    rightEye = {
      x: p.width / 2 + eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      glowIntensity: 0.9, // Increased glow for better visibility
      lastBlink: 0,
      color: [...palette.iris], // Clone the array to avoid reference issues
      // New properties for enhanced eyes
      irisRotation: 0,
      irisLayers: 4,
      reflections: [
        { x: 0.2, y: -0.2, size: 0.15, opacity: 0.9 },
        { x: -0.1, y: -0.1, size: 0.08, opacity: 0.7 }
      ],
      depthEffect: 0.85 // Depth effect intensity (0-1)
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.7, // Moved up slightly for better face proportions
      width: faceWidth * 0.35, // Wider mouth for better expressions
      height: eyeSize * 0.5, // Taller mouth for more expressive capability
      openAmount: 0.2, // 0 = closed, 1 = fully open
      curveAmount: 0, // Neutral expression
      glowIntensity: 0.9, // Increased glow for better visibility
      color: [...palette.accent], // Clone the array to avoid reference issues
      // New properties for enhanced mouth
      lipThickness: 2.5, // Thickness of lips
      teethVisible: false,
      teethBrightness: 0.9, // Brightness of teeth (0-1)
      lipDefinition: 0.8 // Definition of lips (0-1)
    };
    
    // Create energy core - new futuristic element
    energyCore = {
      x: p.width / 2,
      y: p.height * 0.45,
      size: faceWidth * 0.08,
      pulseRate: 0.02,
      intensity: 0.8,
      color: [...palette.energyCore]
    };
    
    // Create holographic rings - new futuristic element
    for (let i = 0; i < 3; i++) {
      holoRings.push({
        radius: faceWidth * (0.4 + i * 0.15),
        thickness: 2 + i * 0.5,
        rotationSpeed: 0.001 * (i + 1),
        rotation: p.random(p.TWO_PI),
        opacity: 0.2 - i * 0.05,
        color: [...palette.hologram]
      });
    }
    
    // Create circuit lines - new futuristic element
    for (let i = 0; i < 12; i++) {
      const angle = p.random(p.TWO_PI);
      const length = p.random(faceWidth * 0.3, faceWidth * 0.6);
      const segments = Math.floor(p.random(3, 7));
      
      circuitLines.push({
        startX: p.width / 2 + Math.cos(angle) * (faceWidth * 0.2),
        startY: p.height / 2 + Math.sin(angle) * (faceWidth * 0.2),
        angle: angle,
        length: length,
        segments: segments,
        pulseSpeed: p.random(0.01, 0.03),
        pulseOffset: p.random(p.TWO_PI),
        thickness: p.random(1, 2.5),
        color: [...palette.techLines]
      });
    }
    
    // Create stars for space background - reduced count for better performance
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, 3),
        brightness: p.random(100, 255),
        twinkleSpeed: p.random(0.01, 0.05)
      });
    }
    
    // Create grid for one-point perspective - optimized with fewer lines
    const gridSize = 12; // Reduced from 20 for better performance
    const gridSpacing = p.width / gridSize;
    
    for (let i = 0; i <= gridSize; i++) {
      // Only add lines that will be visible
      if (i % 2 === 0) { // Only add every other line for better performance
        grid.push({
          x1: i * gridSpacing,
          y1: 0,
          x2: p.width / 2,
          y2: p.height / 2
        });
        
        grid.push({
          x1: 0,
          y1: i * gridSpacing,
          x2: p.width / 2,
          y2: p.height / 2
        });
        
        grid.push({
          x1: p.width,
          y1: i * gridSpacing,
          x2: p.width / 2,
          y2: p.height / 2
        });
      }
    }
    
    // Create energy particles for futuristic effect
    for (let i = 0; i < 40; i++) {
      energyParticles.push({
        angle: p.random(p.TWO_PI),
        distance: p.random(faceWidth * 0.2, faceWidth * 0.5),
        speed: p.random(0.005, 0.02),
        size: p.random(1.5, 4),
        pulseRate: p.random(0.02, 0.05),
        color: p.random([
          palette.neonBlue, 
          palette.neonCyan, 
          palette.hologram, 
          palette.energyCore
        ])
      });
    }
    
    // Set up drawing parameters - optimized for better performance
    p.background(palette.black);
    p.frameRate(FRAME_RATE);
    
    // Create initial particles for background
    for (let i = 0; i < 30; i++) {
      particles.push({
        pos: p.createVector(p.random(p.width), p.random(p.height)),
        vel: p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5)),
        size: p.random(1, 3),
        color: p.random([palette.neonBlue, palette.neonPink, palette.neonPurple, palette.neonGreen]),
        alpha: p.random(80, 150)
      });
    }
    
    // Make global function to update audio level - more responsive
    window.updateRobotAudioLevel = function(level) {
      // Scale up the level for more pronounced mouth movements
      audioLevel = Math.min(level * 1.5, 1);
      isListening = true;
      
      // Update audio data array with smoother transitions
      audioData.shift();
      audioData.push(level * 5);
      
      // Randomly trigger expressions based on audio level for more liveliness
      if (level > 0.7 && Math.random() > 0.8 && Date.now() - lastExpressionChange > 2000) {
        const expressions = ['surprised', 'thinking', 'happy'];
        window.setRobotExpression(expressions[Math.floor(Math.random() * expressions.length)]);
        lastExpressionChange = Date.now();
      }
    };
    
    // Make global function to set robot expression - enhanced with intensity
    window.setRobotExpression = function(expression, intensity = 1.0) {
      expressionState = expression;
      expressionIntensity = p.constrain(intensity, 0, 1);
      expressionTimer = 180; // 3 seconds at 60fps
      lastExpressionChange = Date.now();
      
      // Set eye colors based on expression for more visual feedback
      switch(expression) {
        case 'happy':
          leftEye.color = [...palette.happy];
          rightEye.color = [...palette.happy];
          mouth.color = [...palette.happy];
          break;
        case 'thinking':
          leftEye.color = [...palette.thinking];
          rightEye.color = [...palette.thinking];
          mouth.color = [...palette.accent];
          break;
        case 'surprised':
          leftEye.color = [...palette.surprised];
          rightEye.color = [...palette.surprised];
          mouth.color = [...palette.surprised];
          break;
        case 'sad':
          leftEye.color = [...palette.sad];
          rightEye.color = [...palette.sad];
          mouth.color = [...palette.sad];
          break;
        case 'angry':
          leftEye.color = [...palette.angry];
          rightEye.color = [...palette.angry];
          mouth.color = [...palette.angry];
          break;
        default: // neutral
          leftEye.color = [...palette.iris];
          rightEye.color = [...palette.iris];
          mouth.color = [...palette.accent];
      }
    };
    
    // Make global function to make robot fullscreen - enhanced for better centering
    window.makeRobotFullscreen = function() {
      isFullscreen = true;
      
      // Increase face dimensions - ensure it's centered
      faceWidth = p.min(p.width * 0.85, 1300);
      faceHeight = p.min(p.height * 0.85, 900);
      
      // Update eye and mouth positions for fullscreen - centered in viewport
      const eyeSize = faceWidth * 0.18;
      const eyeY = p.height * 0.45; // Centered vertically
      const eyeSpacing = faceWidth * 0.3;
      
      leftEye.x = p.width / 2 - eyeSpacing / 2;
      leftEye.y = eyeY;
      leftEye.size = eyeSize;
      leftEye.pupilSize = eyeSize * 0.5; // Larger pupils for better visibility
      leftEye.glowIntensity = 1.0; // Increased glow
      
      rightEye.x = p.width / 2 + eyeSpacing / 2;
      rightEye.y = eyeY;
      rightEye.size = eyeSize;
      rightEye.pupilSize = eyeSize * 0.5;
      rightEye.glowIntensity = 1.0;
      
      mouth.x = p.width / 2;
      mouth.y = eyeY + eyeSize * 1.7; // Better positioning
      mouth.width = faceWidth * 0.4; // Wider for better expressions
      mouth.height = eyeSize * 0.8; // Taller for better visibility
      mouth.glowIntensity = 1.0;
      
      // Update energy core position and size
      energyCore.x = p.width / 2;
      energyCore.y = p.height * 0.45;
      energyCore.size = faceWidth * 0.1;
      
      // Update holographic rings
      for (let i = 0; i < holoRings.length; i++) {
        holoRings[i].radius = faceWidth * (0.4 + i * 0.15);
      }
      
      // Add more particles for a more dynamic background
      for (let i = 0; i < 40; i++) {
        particles.push({
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(p.random(-0.6, 0.6), p.random(-0.6, 0.6)),
          size: p.random(1, 4),
          color: p.random([palette.neonBlue, palette.neonPink, palette.neonPurple, palette.neonGreen]),
          alpha: p.random(100, 200)
        });
      }
      
      // Set a happy expression initially with high intensity
      window.setRobotExpression('happy', 1.0);
    };
  };
  
  p.draw = function() {
    // Calculate delta time for smooth animations regardless of frame rate
    const currentTime = Date.now();
    deltaTime = (currentTime - lastFrameTime) / (1000 / FRAME_RATE);
    lastFrameTime = currentTime;
    
    // Create a smooth gradient background
    drawFuturisticBackground();
    
    // Increment time with delta time for consistent animation speed
    time += 0.01 * deltaTime;
    
    // Update face parameters
    updateFace();
    
    // Update speech patterns if available
    if (speechPatternsModule) {
      speechPatternsModule.update(deltaTime);
    }
    
    // Draw futuristic elements
    drawFuturisticElements();
    
    // Get pattern transition state
    const patternTransition = speechPatternsModule ? 
                             speechPatternsModule.getTransitionState() : 0;
    
    // Draw the face with opacity based on pattern transition
    if (patternTransition < 1) {
      // Adjust face opacity based on pattern transition
      const faceOpacity = 1 - patternTransition;
      drawFace(faceOpacity);
    }
    
    // Draw speech patterns if available
    if (speechPatternsModule) {
      speechPatternsModule.draw();
    }
    
    // Gradually reduce audio level if not actively listening - smoother decay
    if (!isListening) {
      audioLevel *= 0.9; // Faster decay for more responsiveness
      if (audioLevel < 0.01) audioLevel = 0;
    }
    isListening = false;
    
    // Update expression timer with delta time for consistent timing
    if (expressionTimer > 0) {
      expressionTimer -= deltaTime;
      if (expressionTimer <= 0) {
        expressionTimer = 0;
        // Smooth transition back to neutral
        window.setRobotExpression('neutral', 0.8);
      }
    }
    
    // Update eye reflection angle
    reflectionAngle += 0.01 * deltaTime;
  };
  
  // Draw futuristic background with depth and atmosphere
  function drawFuturisticBackground() {
    // Create a gradient background with depth
    const gradientTop = palette.black;
    const gradientBottom = palette.darkBlue;
    
    for (let y = 0; y < p.height; y++) {
      const inter = p.map(y, 0, p.height, 0, 1);
      const c = p.lerpColor(
        p.color(gradientTop[0], gradientTop[1], gradientTop[2]),
        p.color(gradientBottom[0], gradientBottom[1], gradientBottom[2]),
        inter
      );
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
    
    // Draw stars with twinkling effect
    p.noStroke();
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.5 + 0.5;
      p.fill(255, 255, 255, star.brightness * twinkle);
      p.ellipse(star.x, star.y, star.size * twinkle);
    }
    
    // Draw subtle grid lines for tech feel
    p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 8);
    p.strokeWeight(0.5);
    
    // Draw fewer grid lines for better performance
    // Horizontal lines - only draw every 80px
    for (let y = 0; y < p.height; y += 80) {
      p.line(0, y, p.width, y);
    }
    
    // Vertical lines - only draw every 80px
    for (let x = 0; x < p.width; x += 80) {
      p.line(x, 0, x, p.height);
    }
    
    // Draw soft particles - optimized with fewer particles
    p.noStroke();
    
    // Draw only a subset of particles each frame for better performance
    const particleCount = Math.min(30, Math.floor(50 / deltaTime));
    for (let i = 0; i < particleCount; i++) {
      const idx = i % 30; // Cycle through particles
      const x = (p.width / 2) + Math.cos(time * 0.3 + idx * 0.2) * (faceWidth * 0.6);
      const y = (p.height / 2) + Math.sin(time * 0.3 + idx * 0.2) * (faceHeight * 0.6);
      const size = 2 + Math.sin(time + idx) * 1;
      const alpha = 50 + Math.sin(time * 0.2 + idx * 0.3) * 20;
      
      // Use current expression color for particles
      const particleColor = expressionState === 'neutral' ? 
        palette.accent : 
        (expressionState === 'happy' ? palette.happy : 
         expressionState === 'thinking' ? palette.thinking : 
         expressionState === 'surprised' ? palette.surprised : palette.accent);
      
      p.fill(particleColor[0], particleColor[1], particleColor[2], alpha);
      p.ellipse(x, y, size);
    }
    
    // Update and draw existing particles
    for (let i = 0; i < particles.length; i++) {
      const p2 = particles[i];
      p2.pos.add(p2.vel);
      
      // Wrap particles around screen
      if (p2.pos.x < 0) p2.pos.x = p.width;
      if (p2.pos.x > p.width) p2.pos.x = 0;
      if (p2.pos.y < 0) p2.pos.y = p.height;
      if (p2.pos.y > p.height) p2.pos.y = 0;
      
      p.fill(p2.color[0], p2.color[1], p2.color[2], p2.alpha);
      p.ellipse(p2.pos.x, p2.pos.y, p2.size);
    }
  }
  
  // Draw futuristic elements around the face
  function drawFuturisticElements() {
    // Get pattern transition state
    const patternTransition = speechPatternsModule ? 
                             speechPatternsModule.getTransitionState() : 0;
    
    // Adjust element opacity based on pattern transition
    const elementOpacity = 1 - patternTransition * 0.7; // Keep some elements visible
    
    // Draw holographic rings
    for (let ring of holoRings) {
      ring.rotation += ring.rotationSpeed * deltaTime;
      
      p.noFill();
      p.stroke(ring.color[0], ring.color[1], ring.color[2], 
               ring.opacity * 255 * (0.7 + Math.sin(time * 0.5) * 0.3) * elementOpacity);
      p.strokeWeight(ring.thickness);
      
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(ring.rotation);
      p.ellipse(0, 0, ring.radius * 2, ring.radius * 1.2);
      p.pop();
    }
    
    // Draw circuit lines
    for (let line of circuitLines) {
      const pulse = Math.sin(time * line.pulseSpeed + line.pulseOffset) * 0.5 + 0.5;
      p.stroke(line.color[0], line.color[1], line.color[2], 
               line.color[3] * pulse * elementOpacity);
      p.strokeWeight(line.thickness * pulse);
      
      let x = line.startX;
      let y = line.startY;
      let angle = line.angle;
      const segmentLength = line.length / line.segments;
      
      for (let i = 0; i < line.segments; i++) {
        const nextX = x + Math.cos(angle) * segmentLength;
        const nextY = y + Math.sin(angle) * segmentLength;
        
        p.line(x, y, nextX, nextY);
        
        // Add small node at segment joints
        if (i < line.segments - 1) {
          p.noStroke();
          p.fill(line.color[0], line.color[1], line.color[2], 
                 line.color[3] * pulse * 1.5 * elementOpacity);
          p.ellipse(nextX, nextY, line.thickness * 2 * pulse);
        }
        
        x = nextX;
        y = nextY;
        
        // Add some randomness to angle for next segment
        angle += p.random(-0.5, 0.5);
      }
    }
    
    // Draw energy particles
    for (let i = 0; i < energyParticles.length; i++) {
      const particle = energyParticles[i];
      
      // Update particle position
      particle.angle += particle.speed * deltaTime;
      
      // Calculate position
      const x = p.width / 2 + Math.cos(particle.angle) * particle.distance;
      const y = p.height / 2 + Math.sin(particle.angle) * particle.distance * 0.6;
      
      // Calculate pulse effect
      const pulse = Math.sin(time * particle.pulseRate + i) * 0.5 + 0.5;
      
      // Draw particle
      p.noStroke();
      p.fill(particle.color[0], particle.color[1], particle.color[2], 
             (particle.color[3] || 200) * pulse * elementOpacity);
      p.ellipse(x, y, particle.size * pulse);
      
      // Draw trail
      p.stroke(particle.color[0], particle.color[1], particle.color[2], 
               (particle.color[3] || 100) * pulse * 0.5 * elementOpacity);
      p.strokeWeight(particle.size * 0.5 * pulse);
      
      const trailX = p.width / 2 + Math.cos(particle.angle - particle.speed * 10) * particle.distance;
      const trailY = p.height / 2 + Math.sin(particle.angle - particle.speed * 10) * particle.distance * 0.6;
      
      p.line(x, y, trailX, trailY);
    }
    
    // Draw energy core
    const corePulse = Math.sin(time * energyCore.pulseRate) * 0.3 + 0.7;
    
    // Core glow
    for (let i = 4; i > 0; i--) {
      p.noStroke();
      p.fill(energyCore.color[0], energyCore.color[1], energyCore.color[2], 
             (energyCore.color[3] || 150) * corePulse * (1 / i) * elementOpacity);
      p.ellipse(energyCore.x, energyCore.y, 
                energyCore.size * (1 + i * 0.5) * corePulse,
                energyCore.size * (1 + i * 0.5) * corePulse * 0.6);
    }
    
    // Core center
    p.fill(255, 255, 255, 200 * corePulse * elementOpacity);
    p.ellipse(energyCore.x, energyCore.y, 
              energyCore.size * 0.5 * corePulse,
              energyCore.size * 0.3 * corePulse);
  }
  
  // Update face parameters
  function updateFace() {
    // Update blink timer with natural randomness
    blinkTimer++;
    const blinkThreshold = 180 + Math.random() * 120; // Blink every 3-5 seconds
    
    if (blinkTimer > blinkThreshold) {
      if (blinkTimer < blinkThreshold + 10) {
        leftEye.blinkState = p.map(blinkTimer, blinkThreshold, blinkThreshold + 5, 0, 1);
        if (blinkTimer > blinkThreshold + 5) {
          leftEye.blinkState = p.map(blinkTimer, blinkThreshold + 5, blinkThreshold + 10, 1, 0);
        }
        rightEye.blinkState = leftEye.blinkState;
      } else if (blinkTimer > blinkThreshold + 120) {
        blinkTimer = 0;
      }
    }
    
    // Natural eye movements
    const currentTime = Date.now();
    if (currentTime - lastEyeMovementTime > eyeMovementInterval) {
      targetEyeX = Math.random() * p.width;
      targetEyeY = Math.random() * p.height;
      lastE
