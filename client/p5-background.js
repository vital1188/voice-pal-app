// Optimized Digital AI Face using p5.js - Enhanced for better performance and expressions

let sketch = function(p) {
  // Enhanced color palette with more vibrant tones for better emotional expression
  const palette = {
    black: [5, 5, 10],
    white: [240, 240, 245],
    skin: [20, 20, 30], // Darker for digital look
    highlight: [255, 255, 255],
    shadow: [10, 10, 20],
    iris: [0, 220, 255], // Brighter cyan for more vivid eyes
    accent: [0, 200, 255],
    red: [255, 30, 30],
    blue: [30, 120, 255],
    neonBlue: [0, 170, 255],
    neonPink: [255, 0, 150],
    neonPurple: [200, 0, 255],
    neonGreen: [0, 255, 150],
    neonCyan: [0, 255, 230],
    neonOrange: [255, 100, 0],
    digitalGrid: [0, 100, 180],
    // New colors for enhanced emotional states
    happy: [50, 255, 150],
    sad: [100, 150, 255],
    angry: [255, 50, 50],
    surprised: [255, 200, 0],
    thinking: [180, 180, 255]
  };
  
  // Enhanced robot face parameters
  let faceWidth, faceHeight;
  let leftEye, rightEye, mouth;
  let particles = [];
  let audioLevel = 0;
  let isListening = false;
  let blinkTimer = 0;
  let mouthMovement = 0;
  // Expanded expression states for more emotional range
  let expressionState = 'neutral'; // neutral, happy, thinking, surprised, sad, angry
  let expressionTimer = 0;
  let expressionIntensity = 0; // 0-1 scale for intensity of expression
  let lastExpressionChange = 0;
  
  // Audio visualization data - optimized
  let audioData = new Array(16).fill(0);
  
  // Flag to track if robot is in fullscreen mode
  let isFullscreen = false;
  
  // Kubrick-inspired elements
  let monolith;
  let stars = [];
  let grid = [];
  let time = 0;
  
  // Variables for more responsive eye movements
  let targetEyeX = 0;
  let targetEyeY = 0;
  let lastEyeMovementTime = Date.now();
  let eyeMovementInterval = 1500; // Faster eye movements for more responsiveness
  
  // Performance optimization variables
  let lastFrameTime = 0;
  let deltaTime = 0;
  const FRAME_RATE = 60; // Target frame rate
  
  p.setup = function() {
    // Create canvas that covers the entire window
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-2');
    
    // Calculate face dimensions based on window size - ensure it's centered and visible
    faceWidth = p.min(p.width * 0.7, 1000); // Slightly smaller for better visibility
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Initialize eyes and mouth with HAL 9000 inspired design - centered in viewport
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.45; // Moved down slightly to center in viewport
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6, // Larger pupil for HAL-like appearance
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0, // 0 = open, 1 = closed
      glowIntensity: 0.9, // Increased glow for better visibility
      lastBlink: 0,
      color: [...palette.iris] // Clone the array to avoid reference issues
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
      color: [...palette.iris] // Clone the array to avoid reference issues
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.7, // Moved up slightly for better face proportions
      width: faceWidth * 0.35, // Wider mouth for better expressions
      height: eyeSize * 0.5, // Taller mouth for more expressive capability
      openAmount: 0.2, // 0 = closed, 1 = fully open
      curveAmount: 0, // Neutral expression
      glowIntensity: 0.9, // Increased glow for better visibility
      color: [...palette.accent] // Clone the array to avoid reference issues
    };
    
    // Create monolith - simplified for better performance
    monolith = {
      x: p.width / 2,
      y: p.height * 0.7,
      width: p.width * 0.05,
      height: p.height * 0.3,
      rotation: 0
    };
    
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
    p.background(palette.black[0], palette.black[1], palette.black[2]);
    
    // Draw subtle background elements - optimized
    drawBackgroundElements();
    
    // Increment time with delta time for consistent animation speed
    time += 0.01 * deltaTime;
    
    // Update face parameters
    updateFace();
    
    // Draw the face
    drawFace();
    
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
  };
  
  // Draw subtle background elements - optimized for better performance
  function drawBackgroundElements() {
    // Soft particles - optimized with fewer particles
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
    
    // Subtle grid lines - optimized with fewer lines
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
      lastEyeMovementTime = currentTime;
      eyeMovementInterval = 1000 + Math.random() * 2000; // More natural timing
    }
    
    // Update eye pupil position with natural movement
    const maxPupilOffset = leftEye.size * 0.2;
    const targetXOffset = p.map(p.mouseX, 0, p.width, -maxPupilOffset, maxPupilOffset);
    const targetYOffset = p.map(p.mouseY, 0, p.height, -maxPupilOffset, maxPupilOffset);
    
    leftEye.pupilOffset.x = p.lerp(leftEye.pupilOffset.x, targetXOffset, 0.05);
    leftEye.pupilOffset.y = p.lerp(leftEye.pupilOffset.y, targetYOffset, 0.05);
    rightEye.pupilOffset.x = p.lerp(rightEye.pupilOffset.x, targetXOffset, 0.05);
    rightEye.pupilOffset.y = p.lerp(rightEye.pupilOffset.y, targetYOffset, 0.05);
    
    // Update mouth based on audio level
    const targetOpenAmount = p.map(audioLevel, 0, 1, 0.1, 0.8);
    mouth.openAmount = p.lerp(mouth.openAmount, targetOpenAmount, 0.2);
    
    // Update expression with natural transitions
    switch (expressionState) {
      case 'happy':
        mouth.curveAmount = p.lerp(mouth.curveAmount, 0.5, 0.1);
        break;
      case 'thinking':
        leftEye.pupilOffset.y = p.lerp(leftEye.pupilOffset.y, -maxPupilOffset * 0.5, 0.1);
        rightEye.pupilOffset.y = p.lerp(rightEye.pupilOffset.y, -maxPupilOffset * 0.5, 0.1);
        mouth.curveAmount = p.lerp(mouth.curveAmount, -0.2, 0.1);
        break;
      case 'surprised':
        leftEye.pupilSize = p.lerp(leftEye.pupilSize, leftEye.size * 0.5, 0.1);
        rightEye.pupilSize = p.lerp(rightEye.pupilSize, rightEye.size * 0.5, 0.1);
        mouth.openAmount = p.lerp(mouth.openAmount, 0.7, 0.1);
        mouth.curveAmount = 0;
        break;
      default: // neutral
        mouth.curveAmount = p.lerp(mouth.curveAmount, 0.1, 0.1);
        leftEye.pupilSize = p.lerp(leftEye.pupilSize, leftEye.size * 0.4, 0.1);
        rightEye.pupilSize = p.lerp(rightEye.pupilSize, rightEye.size * 0.4, 0.1);
    }
  }
  
  // Draw the face - enhanced with more expressive features
  function drawFace() {
    // Draw eyes with their current expression colors
    drawEye(leftEye, leftEye.color);
    drawEye(rightEye, rightEye.color);
    
    // Draw mouth with its current expression color
    drawMouth(mouth, mouth.color);
    
    // Draw additional expression indicators based on current state
    if (expressionState === 'thinking') {
      // Draw thought bubble or indicator
      drawThoughtIndicator();
    } else if (expressionState === 'surprised') {
      // Draw surprise indicators
      drawSurpriseIndicator();
    } else if (expressionState === 'happy') {
      // Draw happiness indicators
      drawHappyIndicator();
    }
  }
  
  // Draw thought indicator (small bubbles above head)
  function drawThoughtIndicator() {
    p.noStroke();
    const bubbleY = leftEye.y - leftEye.size * 2;
    const startX = p.width / 2 - leftEye.size * 0.5;
    
    // Draw 3 bubbles of decreasing size
    for (let i = 0; i < 3; i++) {
      const bubbleSize = leftEye.size * (0.2 - i * 0.05);
      const bubbleX = startX - i * (bubbleSize * 1.5);
      const alpha = 150 - i * 30;
      
      p.fill(palette.thinking[0], palette.thinking[1], palette.thinking[2], alpha);
      p.ellipse(bubbleX, bubbleY, bubbleSize);
    }
  }
  
  // Draw surprise indicator (exclamation marks or lines)
  function drawSurpriseIndicator() {
    p.stroke(palette.surprised[0], palette.surprised[1], palette.surprised[2], 180);
    p.strokeWeight(2);
    
    // Draw exclamation-like marks on both sides of the face
    const markX1 = leftEye.x - leftEye.size * 1.5;
    const markX2 = rightEye.x + rightEye.size * 1.5;
    const markY = (leftEye.y + mouth.y) / 2;
    const markHeight = leftEye.size * 0.8;
    
    // Left mark
    p.line(markX1, markY - markHeight/2, markX1, markY + markHeight/2 - 10);
    p.ellipse(markX1, markY + markHeight/2, 4, 4);
    
    // Right mark
    p.line(markX2, markY - markHeight/2, markX2, markY + markHeight/2 - 10);
    p.ellipse(markX2, markY + markHeight/2, 4, 4);
  }
  
  // Draw happy indicator (small sparkles or stars)
  function drawHappyIndicator() {
    p.stroke(palette.happy[0], palette.happy[1], palette.happy[2], 180);
    p.strokeWeight(1.5);
    
    // Draw small sparkles around the face
    for (let i = 0; i < 5; i++) {
      const angle = time * 2 + i * Math.PI * 0.4;
      const radius = faceWidth * 0.4;
      const sparkleX = p.width / 2 + Math.cos(angle) * radius;
      const sparkleY = leftEye.y + Math.sin(angle) * radius;
      const sparkleSize = leftEye.size * 0.2;
      
      // Draw a simple star/sparkle
      p.push();
      p.translate(sparkleX, sparkleY);
      p.rotate(time * 0.5);
      
      p.line(-sparkleSize, 0, sparkleSize, 0);
      p.line(0, -sparkleSize, 0, sparkleSize);
      p.line(-sparkleSize * 0.7, -sparkleSize * 0.7, sparkleSize * 0.7, sparkleSize * 0.7);
      p.line(-sparkleSize * 0.7, sparkleSize * 0.7, sparkleSize * 0.7, -sparkleSize * 0.7);
      
      p.pop();
    }
  }
  
  // Draw eye - enhanced with more expressive features
  function drawEye(eye, color) {
    p.push();
    
    // Calculate eye dimensions with more dynamic expressions
    const eyeWidth = eye.size * 1.1;
    const eyeHeight = eye.size * 0.5 * (1 - eye.blinkState * 0.9);
    
    // Create outer glow - more vibrant based on expression
    const glowIntensity = eye.glowIntensity * 1.5 * (expressionState === 'neutral' ? 1 : 1.2);
    p.noStroke();
    
    // Outer glow layers - more dynamic pulsing
    const pulseAmount = Math.sin(time * 3) * 0.2 + 0.8;
    const expressionPulse = expressionState === 'surprised' ? 
                           Math.sin(time * 8) * 0.1 + 1.1 : // Fast pulse for surprise
                           expressionState === 'thinking' ? 
                           Math.sin(time * 1.5) * 0.15 + 1 : // Slow thoughtful pulse
                           pulseAmount; // Default pulse
    
    // Draw fewer glow layers for better performance
    for (let i = 4; i > 0; i--) {
      const glowSize = eyeWidth * (1.2 + i * 0.15) * expressionPulse;
      const alpha = (5 - i) * 6 * glowIntensity;
      p.fill(color[0], color[1], color[2], alpha);
      p.ellipse(eye.x, eye.y, glowSize, glowSize * 0.6);
    }
    
    // Eye shape - more expressive based on state
    p.fill(10, 10, 15, 200);
    p.stroke(color[0], color[1], color[2], 200);
    p.strokeWeight(2);
    
    // Modify eye shape based on expression
    let modifiedEyeHeight = eyeHeight;
    if (expressionState === 'surprised') {
      modifiedEyeHeight = eyeHeight * 1.3; // Wider eyes when surprised
    } else if (expressionState === 'happy') {
      modifiedEyeHeight = eyeHeight * 0.9; // Slightly squinted when happy
    }
    
    p.ellipse(eye.x, eye.y, eyeWidth, modifiedEyeHeight);
    
    // Iris - more dynamic based on expression
    if (modifiedEyeHeight > eye.size * 0.1) {
      // Adjust iris size based on expression
      const irisSize = expressionState === 'surprised' ? 
                      eye.size * 0.7 : // Larger iris when surprised
                      expressionState === 'thinking' ?
                      eye.size * 0.5 : // Smaller iris when thinking
                      eye.size * 0.6;  // Default size
      
      const irisX = eye.x + eye.pupilOffset.x;
      const irisY = eye.y + eye.pupilOffset.y;
      
      p.noStroke();
      p.fill(color[0], color[1], color[2], 180);
      p.ellipse(irisX, irisY, irisSize, irisSize);
      
      // Pupil - more dynamic based on expression
      const pupilSize = expressionState === 'surprised' ? 
                       irisSize * 0.6 : // Larger pupil when surprised
                       expressionState === 'thinking' ?
                       irisSize * 0.4 : // Smaller pupil when thinking
                       irisSize * 0.5;  // Default size
      
      p.fill(0);
      p.ellipse(irisX, irisY, pupilSize, pupilSize);
      
      // Multiple highlights for more realistic eye
      p.fill(255, 255, 255, 180);
      p.ellipse(irisX - irisSize * 0.2, irisY - irisSize * 0.2, irisSize * 0.15, irisSize * 0.15);
      
      // Second smaller highlight
      p.fill(255, 255, 255, 120);
      p.ellipse(irisX + irisSize * 0.1, irisY - irisSize * 0.1, irisSize * 0.08, irisSize * 0.08);
    }
    
    p.pop();
  }
  
  // Draw mouth - enhanced with more expressive features
  function drawMouth(mouth, color) {
    p.push();
    
    // Calculate mouth dimensions - more dynamic based on expression
    const mouthWidth = mouth.width * (expressionState === 'surprised' ? 1.2 : 1);
    const mouthHeight = mouth.height * mouth.openAmount * 
                       (expressionState === 'surprised' ? 1.5 : 
                        expressionState === 'happy' ? 1.2 : 1);
    
    // Enhanced curve amount based on expression
    let curveAmount = mouth.curveAmount;
    if (expressionState === 'happy') {
      curveAmount = Math.max(curveAmount, 0.4); // Ensure a smile
    } else if (expressionState === 'sad') {
      curveAmount = Math.min(curveAmount, -0.3); // Ensure a frown
    } else if (expressionState === 'surprised') {
      curveAmount = 0; // Neutral curve for surprise (open mouth)
    }
    
    // Outer glow - more vibrant based on expression
    const glowIntensity = mouth.glowIntensity * 1.5 * 
                         (expressionState === 'neutral' ? 1 : 1.2);
    p.noStroke();
    
    // Glow layers - more dynamic pulsing
    const basePulse = Math.sin(time * 2) * 0.2 + 0.8;
    const expressionPulse = expressionState === 'surprised' ? 
                           Math.sin(time * 6) * 0.15 + 1.1 : // Fast pulse for surprise
                           expressionState === 'happy' ? 
                           Math.sin(time * 3) * 0.1 + 1.05 : // Medium pulse for happy
                           basePulse; // Default pulse
    
    // Draw fewer glow layers for better performance
    for (let i = 3; i > 0; i--) {
      const glowSize = mouthWidth * (1.2 + i * 0.1) * expressionPulse;
      const glowHeight = mouthHeight * 2 * (1.2 + i * 0.1) * expressionPulse;
      const alpha = (4 - i) * 8 * glowIntensity;
      p.fill(color[0], color[1], color[2], alpha);
      p.ellipse(mouth.x, mouth.y, glowSize, glowHeight);
    }
    
    // Mouth interior - more detailed based on expression
    if (mouthHeight > 2) {
      p.fill(5, 5, 10, 220);
      p.stroke(color[0], color[1], color[2], 180);
      p.strokeWeight(2);
      
      // More expressive mouth shape based on current state
      p.beginShape();
      
      // Top curve - adjusted for expression
      const topCurveY = expressionState === 'happy' ? 
                       mouth.y - mouthHeight * 0.35 : // Higher top curve for happy
                       mouth.y - mouthHeight * 0.3;   // Default position
      
      p.vertex(mouth.x - mouthWidth * 0.4, topCurveY);
      p.bezierVertex(
        mouth.x - mouthWidth * 0.2, topCurveY - curveAmount * 15,
        mouth.x + mouthWidth * 0.2, topCurveY - curveAmount * 15,
        mouth.x + mouthWidth * 0.4, topCurveY
      );
      
      // Right side
      p.vertex(mouth.x + mouthWidth * 0.4, mouth.y + mouthHeight * 0.3);
      
      // Bottom curve - adjusted for expression
      const bottomCurveY = expressionState === 'sad' ? 
                          mouth.y + mouthHeight * 0.45 : // Lower bottom curve for sad
                          mouth.y + mouthHeight * 0.4;   // Default position
      
      p.bezierVertex(
        mouth.x + mouthWidth * 0.2, bottomCurveY + curveAmount * 15,
        mouth.x - mouthWidth * 0.2, bottomCurveY + curveAmount * 15,
        mouth.x - mouthWidth * 0.4, mouth.y + mouthHeight * 0.3
      );
      
      p.endShape(p.CLOSE);
      
      // Add teeth for surprised expression
      if (expressionState === 'surprised' && mouthHeight > mouth.height * 0.4) {
        p.fill(220, 220, 225, 180);
        p.noStroke();
        
        // Upper teeth
        p.rect(mouth.x - mouthWidth * 0.3, mouth.y - mouthHeight * 0.25, 
              mouthWidth * 0.6, mouthHeight * 0.1, 2);
        
        // Lower teeth
        p.rect(mouth.x - mouthWidth * 0.3, mouth.y + mouthHeight * 0.15, 
              mouthWidth * 0.6, mouthHeight * 0.1, 2);
      }
    }
    
    // Mouth outline - more expressive
    p.noFill();
    p.stroke(color[0], color[1], color[2], 200);
    p.strokeWeight(2);
    
    // Upper lip - adjusted for expression
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    p.bezierVertex(
      mouth.x - mouthWidth/4, mouth.y - mouthHeight/2 - curveAmount * 15,
      mouth.x + mouthWidth/4, mouth.y - mouthHeight/2 - curveAmount * 15,
      mouth.x + mouthWidth/2, mouth.y - mouthHeight/2
    );
    p.endShape();
    
    // Lower lip - adjusted for expression
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    p.bezierVertex(
      mouth.x - mouthWidth/4, mouth.y + mouthHeight/2 + curveAmount * 15,
      mouth.x + mouthWidth/4, mouth.y + mouthHeight/2 + curveAmount * 15,
      mouth.x + mouthWidth/2, mouth.y - mouthHeight/2
    );
    p.endShape();
    
    p.pop();
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
    // Recalculate face dimensions - ensure it's centered
    faceWidth = p.min(p.width * 0.7, 1000); // Slightly smaller for better visibility
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Update eye and mouth positions - centered in viewport
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.45; // Centered vertically
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye.x = p.width / 2 - eyeSpacing / 2;
    leftEye.y = eyeY;
    leftEye.size = eyeSize;
    leftEye.pupilSize = eyeSize * 0.5; // Larger pupils for better visibility
    
    rightEye.x = p.width / 2 + eyeSpacing / 2;
    rightEye.y = eyeY;
    rightEye.size = eyeSize;
    rightEye.pupilSize = eyeSize * 0.5;
    
    mouth.x = p.width / 2;
    mouth.y = eyeY + eyeSize * 1.7; // Better positioning
    mouth.width = faceWidth * 0.35; // Wider for better expressions
    mouth.height = eyeSize * 0.5;
    
    // Reset particles for new window size
    particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        pos: p.createVector(p.random(p.width), p.random(p.height)),
        vel: p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5)),
        size: p.random(1, 3),
        color: p.random([palette.neonBlue, palette.neonPink, palette.neonPurple, palette.neonGreen]),
        alpha: p.random(80, 150)
      });
    }
  };
  
  // Enhanced mouse click interaction with more expressions
  p.mouseClicked = function() {
    // Check if clicked on left eye
    if (p.dist(p.mouseX, p.mouseY, leftEye.x, leftEye.y) < leftEye.size / 2) {
      window.setRobotExpression('thinking', 1.0);
      return false;
    }
    
    // Check if clicked on right eye
    if (p.dist(p.mouseX, p.mouseY, rightEye.x, rightEye.y) < rightEye.size / 2) {
      window.setRobotExpression('surprised', 1.0);
      return false;
    }
    
    // Check if clicked on mouth
    const mouthBounds = {
      left: mouth.x - mouth.width / 2,
      right: mouth.x + mouth.width / 2,
      top: mouth.y - mouth.height,
      bottom: mouth.y + mouth.height
    };
    
    if (p.mouseX > mouthBounds.left && p.mouseX < mouthBounds.right &&
        p.mouseY > mouthBounds.top && p.mouseY < mouthBounds.bottom) {
      window.setRobotExpression('happy', 1.0);
      return false;
    }
    
    // Check if clicked on top of head area (sad expression)
    const headTopY = leftEye.y - leftEye.size * 2;
    const headTopBounds = {
      left: p.width / 2 - faceWidth * 0.25,
      right: p.width / 2 + faceWidth * 0.25,
      top: headTopY - leftEye.size,
      bottom: headTopY + leftEye.size
    };
    
    if (p.mouseX > headTopBounds.left && p.mouseX < headTopBounds.right &&
        p.mouseY > headTopBounds.top && p.mouseY < headTopBounds.bottom) {
      window.setRobotExpression('sad', 1.0);
      return false;
    }
    
    // Check if clicked on bottom of face area (angry expression)
    const faceBottomY = mouth.y + mouth.height * 2;
    const faceBottomBounds = {
      left: p.width / 2 - faceWidth * 0.25,
      right: p.width / 2 + faceWidth * 0.25,
      top: faceBottomY - leftEye.size,
      bottom: faceBottomY + leftEye.size
    };
    
    if (p.mouseX > faceBottomBounds.left && p.mouseX < faceBottomBounds.right &&
        p.mouseY > faceBottomBounds.top && p.mouseY < faceBottomBounds.bottom) {
      window.setRobotExpression('angry', 1.0);
      return false;
    }
  };
};

// Start p5 sketch when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new p5(sketch);
});
