// Realistic Digital AI Face using p5.js

let sketch = function(p) {
  // Color palette - Modern tech with realistic tones
  const palette = {
    black: [15, 15, 20],
    white: [240, 240, 245],
    skin: [220, 220, 235],
    highlight: [255, 255, 255],
    shadow: [180, 180, 200],
    iris: [70, 130, 180],
    accent: [0, 120, 255]
  };
  
  // Robot face parameters
  let faceWidth, faceHeight;
  let leftEye, rightEye, mouth;
  let particles = [];
  let audioLevel = 0;
  let isListening = false;
  let blinkTimer = 0;
  let mouthMovement = 0;
  let expressionState = 'neutral'; // neutral, happy, thinking, surprised
  let expressionTimer = 0;
  
  // Audio visualization data
  let audioData = [];
  for (let i = 0; i < 20; i++) {
    audioData.push(0);
  }
  
  // Flag to track if robot is in fullscreen mode
  let isFullscreen = false;
  
  // Kubrick-inspired elements
  let monolith;
  let stars = [];
  let grid = [];
  let time = 0;
  
  p.setup = function() {
    // Create canvas that covers the entire window
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-2');
    
    // Calculate face dimensions based on window size
    faceWidth = p.min(p.width * 0.8, 1200);
    faceHeight = p.min(p.height * 0.8, 800);
    
    // Initialize eyes and mouth with HAL 9000 inspired design
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.4;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6, // Larger pupil for HAL-like appearance
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0, // 0 = open, 1 = closed
      glowIntensity: 0.8
    };
    
    rightEye = {
      x: p.width / 2 + eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      glowIntensity: 0.8
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.8,
      width: faceWidth * 0.3,
      height: eyeSize * 0.4, // Thinner mouth for more precise look
      openAmount: 0.2, // 0 = closed, 1 = fully open
      curveAmount: 0, // Neutral expression
      glowIntensity: 0.8
    };
    
    // Create monolith
    monolith = {
      x: p.width / 2,
      y: p.height * 0.7,
      width: p.width * 0.05,
      height: p.height * 0.3,
      rotation: 0
    };
    
    // Create stars for space background
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, 3),
        brightness: p.random(100, 255),
        twinkleSpeed: p.random(0.01, 0.05)
      });
    }
    
    // Create grid for one-point perspective
    const gridSize = 20;
    const gridSpacing = p.width / gridSize;
    
    for (let i = 0; i <= gridSize; i++) {
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
    
    // Set up drawing parameters
    p.background(palette.black);
    p.frameRate(60);
    
    // Make global function to update audio level
    window.updateRobotAudioLevel = function(level) {
      audioLevel = level;
      isListening = true;
      
      // Update audio data array (simple simulation)
      audioData.shift();
      audioData.push(level * 5);
    };
    
    // Make global function to set robot expression
    window.setRobotExpression = function(expression) {
      expressionState = expression;
      expressionTimer = 180; // 3 seconds at 60fps
    };
    
    // Make global function to make robot fullscreen
    window.makeRobotFullscreen = function() {
      isFullscreen = true;
      
      // Increase face dimensions
      faceWidth = p.min(p.width * 0.9, 1500);
      faceHeight = p.min(p.height * 0.9, 1000);
      
      // Update eye and mouth positions for fullscreen
      const eyeSize = faceWidth * 0.18;
      const eyeY = p.height * 0.45;
      const eyeSpacing = faceWidth * 0.3;
      
      leftEye.x = p.width / 2 - eyeSpacing / 2;
      leftEye.y = eyeY;
      leftEye.size = eyeSize;
      leftEye.pupilSize = eyeSize * 0.4;
      
      rightEye.x = p.width / 2 + eyeSpacing / 2;
      rightEye.y = eyeY;
      rightEye.size = eyeSize;
      rightEye.pupilSize = eyeSize * 0.4;
      
      mouth.x = p.width / 2;
      mouth.y = eyeY + eyeSize * 1.8;
      mouth.width = faceWidth * 0.35;
      mouth.height = eyeSize * 0.7;
      
      // Add more particles for a more dynamic background
      for (let i = 0; i < 50; i++) {
        particles.push({
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(p.random(-0.8, 0.8), p.random(-0.8, 0.8)),
          size: p.random(1, 4),
          color: p.random([palette.neonBlue, palette.neonPink, palette.neonPurple, palette.neonGreen]),
          alpha: p.random(100, 200)
        });
      }
      
      // Set a happy expression initially
      setRobotExpression('happy');
    };
  };
  
  p.draw = function() {
    // Create a smooth gradient background
    p.background(palette.black[0], palette.black[1], palette.black[2]);
    
    // Draw subtle background elements
    drawBackgroundElements();
    
    // Increment time
    time += 0.01;
    
    // Update face parameters
    updateRealisticFace();
    
    // Draw the realistic face
    drawRealisticFace();
    
    // Gradually reduce audio level if not actively listening
    if (!isListening) {
      audioLevel *= 0.95;
      if (audioLevel < 0.01) audioLevel = 0;
    }
    isListening = false;
    
    // Update expression timer
    if (expressionTimer > 0) {
      expressionTimer--;
      if (expressionTimer === 0) {
        expressionState = 'neutral';
      }
    }
  };
  
  // Draw subtle background elements
  function drawBackgroundElements() {
    // Soft particles
    p.noStroke();
    for (let i = 0; i < 50; i++) {
      const x = (p.width / 2) + Math.cos(time * 0.5 + i * 0.2) * (faceWidth * 0.6);
      const y = (p.height / 2) + Math.sin(time * 0.5 + i * 0.2) * (faceHeight * 0.6);
      const size = 2 + Math.sin(time + i) * 1;
      const alpha = 50 + Math.sin(time * 0.3 + i * 0.5) * 20;
      
      p.fill(palette.accent[0], palette.accent[1], palette.accent[2], alpha);
      p.ellipse(x, y, size);
    }
    
    // Subtle grid lines
    p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 10);
    p.strokeWeight(0.5);
    
    // Horizontal lines
    for (let y = 0; y < p.height; y += 40) {
      p.line(0, y, p.width, y);
    }
    
    // Vertical lines
    for (let x = 0; x < p.width; x += 40) {
      p.line(x, 0, x, p.height);
    }
  }
  
  // Update face parameters for realistic face
  function updateRealisticFace() {
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
  
  function drawStars() {
    p.noStroke();
    
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      
      // Calculate twinkling effect
      const brightness = star.brightness * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed * 10));
      
      // Draw star
      p.fill(brightness);
      p.ellipse(star.x, star.y, star.size);
    }
  }
  
  function drawGrid() {
    // Draw one-point perspective grid lines
    p.stroke(palette.white[0], palette.white[1], palette.white[2], 20);
    p.strokeWeight(1);
    
    for (let i = 0; i < grid.length; i++) {
      const line = grid[i];
      p.line(line.x1, line.y1, line.x2, line.y2);
    }
  }
  
  function drawMonolith() {
    // Draw monolith with slight rotation based on time
    p.push();
    p.translate(monolith.x, monolith.y);
    p.rotate(Math.sin(time * 0.2) * 0.05);
    
    // Black rectangle with white outline
    p.fill(0);
    p.stroke(palette.white[0], palette.white[1], palette.white[2], 100);
    p.strokeWeight(2);
    p.rect(-monolith.width / 2, -monolith.height / 2, monolith.width, monolith.height);
    
    p.pop();
  }
  
  function updateHALInterface() {
    // This replaces the updateRobotFace function
    // Update blink timer with some randomness
    blinkTimer++;
    const blinkThreshold = isFullscreen ? 120 + Math.random() * 60 : 180;
    
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
    
    // Slow, deliberate eye movements (more mechanical)
    const currentTime = Date.now();
    if (currentTime - lastEyeMovementTime > eyeMovementInterval) {
      targetEyeX = Math.random() * p.width;
      targetEyeY = Math.random() * p.height;
      lastEyeMovementTime = currentTime;
      eyeMovementInterval = 2000 + Math.random() * 4000; // Slower movements
    }
    
    // Update eye pupil position with slower, more deliberate movement
    const maxPupilOffset = leftEye.size * 0.15;
    const targetXOffset = p.map(p.mouseX, 0, p.width, -maxPupilOffset, maxPupilOffset);
    const targetYOffset = p.map(p.mouseY, 0, p.height, -maxPupilOffset, maxPupilOffset);
    
    leftEye.pupilOffset.x = p.lerp(leftEye.pupilOffset.x, targetXOffset, 0.02);
    leftEye.pupilOffset.y = p.lerp(leftEye.pupilOffset.y, targetYOffset, 0.02);
    rightEye.pupilOffset.x = p.lerp(rightEye.pupilOffset.x, targetXOffset, 0.02);
    rightEye.pupilOffset.y = p.lerp(rightEye.pupilOffset.y, targetYOffset, 0.02);
    
    // Update mouth based on audio level with more precise control
    const targetOpenAmount = p.map(audioLevel, 0, 1, 0.05, 0.6);
    mouth.openAmount = p.lerp(mouth.openAmount, targetOpenAmount, 0.1);
    
    // Update expression with more subtle changes
    switch (expressionState) {
      case 'happy':
        mouth.curveAmount = p.lerp(mouth.curveAmount, 0.3, 0.05);
        break;
      case 'thinking':
        leftEye.pupilOffset.y = p.lerp(leftEye.pupilOffset.y, -maxPupilOffset * 0.7, 0.05);
        rightEye.pupilOffset.y = p.lerp(rightEye.pupilOffset.y, -maxPupilOffset * 0.7, 0.05);
        mouth.curveAmount = p.lerp(mouth.curveAmount, -0.1, 0.05);
        break;
      case 'surprised':
        leftEye.pupilSize = p.lerp(leftEye.pupilSize, leftEye.size * 0.7, 0.05);
        rightEye.pupilSize = p.lerp(rightEye.pupilSize, rightEye.size * 0.7, 0.05);
        mouth.openAmount = p.lerp(mouth.openAmount, 0.5, 0.05);
        mouth.curveAmount = 0;
        break;
      default: // neutral
        mouth.curveAmount = p.lerp(mouth.curveAmount, 0, 0.05);
        leftEye.pupilSize = p.lerp(leftEye.pupilSize, leftEye.size * 0.6, 0.05);
        rightEye.pupilSize = p.lerp(rightEye.pupilSize, rightEye.size * 0.6, 0.05);
    }
    
    // Update glow intensity based on audio level
    const baseGlow = 0.7;
    const audioGlow = audioLevel * 0.3;
    leftEye.glowIntensity = baseGlow + audioGlow;
    rightEye.glowIntensity = baseGlow + audioGlow;
    mouth.glowIntensity = baseGlow + audioGlow;
  }
  
  function drawRealisticFace() {
    p.push();
    
    // Draw face shape
    drawFaceShape();
    
    // Draw realistic eyes
    drawRealisticEye(leftEye, palette.iris);
    drawRealisticEye(rightEye, palette.iris);
    
    // Draw realistic mouth
    drawRealisticMouth(mouth, palette.accent);
    
    // Draw eyebrows
    drawEyebrows();
    
    p.pop();
  }
  
  // Draw the overall face shape with improved proportions and details
  function drawFaceShape() {
    p.push();
    
    // Calculate face dimensions based on golden ratio
    const faceCenter = p.height * 0.45;
    const glowSize = faceWidth * 0.7;
    const faceHeight = glowSize * 1.3; // More natural face proportion
    const faceWidth = glowSize * 0.9;
    const jawWidth = faceWidth * 0.85;
    
    // Soft ambient glow around the face
    p.noStroke();
    const glowGradient = p.drawingContext.createRadialGradient(
      p.width / 2, faceCenter, 0,
      p.width / 2, faceCenter, glowSize * 0.7
    );
    glowGradient.addColorStop(0, `rgba(${palette.skin[0]}, ${palette.skin[1]}, ${palette.skin[2]}, 0.15)`);
    glowGradient.addColorStop(1, `rgba(${palette.skin[0]}, ${palette.skin[1]}, ${palette.skin[2]}, 0)`);
    p.drawingContext.fillStyle = glowGradient;
    p.ellipse(p.width / 2, faceCenter, glowSize * 1.2, glowSize * 1.4);
    
    // Face shape - more realistic oval with jaw
    p.noStroke();
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 40);
    
    // Draw face using bezier curves for more natural shape
    p.beginShape();
    // Top of head
    p.vertex(p.width / 2 - faceWidth/2, faceCenter - faceHeight * 0.35);
    p.bezierVertex(
      p.width / 2 - faceWidth/2, faceCenter - faceHeight * 0.5,
      p.width / 2 + faceWidth/2, faceCenter - faceHeight * 0.5,
      p.width / 2 + faceWidth/2, faceCenter - faceHeight * 0.35
    );
    
    // Right side of face
    p.bezierVertex(
      p.width / 2 + faceWidth/2, faceCenter,
      p.width / 2 + jawWidth/2, faceCenter + faceHeight * 0.3,
      p.width / 2 + jawWidth/2 * 0.8, faceCenter + faceHeight * 0.45
    );
    
    // Jaw and chin
    p.bezierVertex(
      p.width / 2 + jawWidth/2 * 0.4, faceCenter + faceHeight * 0.5,
      p.width / 2 - jawWidth/2 * 0.4, faceCenter + faceHeight * 0.5,
      p.width / 2 - jawWidth/2 * 0.8, faceCenter + faceHeight * 0.45
    );
    
    // Left side of face
    p.bezierVertex(
      p.width / 2 - jawWidth/2, faceCenter + faceHeight * 0.3,
      p.width / 2 - faceWidth/2, faceCenter,
      p.width / 2 - faceWidth/2, faceCenter - faceHeight * 0.35
    );
    
    p.endShape(p.CLOSE);
    
    // Subtle face contours and highlights for more dimension
    p.noFill();
    
    // Cheekbone highlights
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 25);
    p.strokeWeight(3);
    p.drawingContext.filter = 'blur(4px)';
    
    // Left cheekbone highlight
    p.beginShape();
    p.vertex(p.width / 2 - faceWidth * 0.35, faceCenter - faceHeight * 0.05);
    p.bezierVertex(
      p.width / 2 - faceWidth * 0.3, faceCenter + faceHeight * 0.05,
      p.width / 2 - faceWidth * 0.2, faceCenter + faceHeight * 0.1,
      p.width / 2 - faceWidth * 0.1, faceCenter + faceHeight * 0.15
    );
    p.endShape();
    
    // Right cheekbone highlight
    p.beginShape();
    p.vertex(p.width / 2 + faceWidth * 0.35, faceCenter - faceHeight * 0.05);
    p.bezierVertex(
      p.width / 2 + faceWidth * 0.3, faceCenter + faceHeight * 0.05,
      p.width / 2 + faceWidth * 0.2, faceCenter + faceHeight * 0.1,
      p.width / 2 + faceWidth * 0.1, faceCenter + faceHeight * 0.15
    );
    p.endShape();
    
    // Chin and jaw highlights
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 20);
    p.beginShape();
    p.vertex(p.width / 2 - jawWidth * 0.2, faceCenter + faceHeight * 0.4);
    p.bezierVertex(
      p.width / 2 - jawWidth * 0.1, faceCenter + faceHeight * 0.45,
      p.width / 2 + jawWidth * 0.1, faceCenter + faceHeight * 0.45,
      p.width / 2 + jawWidth * 0.2, faceCenter + faceHeight * 0.4
    );
    p.endShape();
    
    // Forehead subtle highlight
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 15);
    p.beginShape();
    p.vertex(p.width / 2 - faceWidth * 0.25, faceCenter - faceHeight * 0.3);
    p.bezierVertex(
      p.width / 2 - faceWidth * 0.1, faceCenter - faceHeight * 0.35,
      p.width / 2 + faceWidth * 0.1, faceCenter - faceHeight * 0.35,
      p.width / 2 + faceWidth * 0.25, faceCenter - faceHeight * 0.3
    );
    p.endShape();
    
    // Reset blur filter
    p.drawingContext.filter = 'none';
    
    p.pop();
  }
  
  // Draw highly realistic eye with detailed iris, pupil, eyelids, and reflections
  function drawRealisticEye(eye, irisColor) {
    p.push();
    
    // Perfect eye proportions based on human anatomy
    const eyeWidth = eye.size * 1.1;
    const eyeHeight = eye.size * 0.45 * (1 - eye.blinkState * 0.9); // More natural eye height ratio
    
    // Eye socket and shadow with soft gradient
    p.noStroke();
    p.drawingContext.shadowBlur = 10;
    p.drawingContext.shadowColor = `rgba(${palette.shadow[0]}, ${palette.shadow[1]}, ${palette.shadow[2]}, 0.3)`;
    p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 40);
    p.ellipse(eye.x, eye.y, eyeWidth * 1.2, eyeHeight * 1.5);
    p.drawingContext.shadowBlur = 0;
    
    if (eyeHeight > eye.size * 0.1) { // Only draw eye details if not mostly closed
      // Create eye white (sclera) with subtle gradient for depth
      const scleraGradient = p.drawingContext.createRadialGradient(
        eye.x, eye.y, 0,
        eye.x, eye.y, eyeWidth/2
      );
      scleraGradient.addColorStop(0, `rgba(${palette.white[0]}, ${palette.white[1]}, ${palette.white[2]}, 0.95)`);
      scleraGradient.addColorStop(0.8, `rgba(${palette.white[0] - 5}, ${palette.white[1] - 5}, ${palette.white[2] - 5}, 0.9)`);
      scleraGradient.addColorStop(1, `rgba(${palette.white[0] - 10}, ${palette.white[1] - 10}, ${palette.white[2] - 10}, 0.85)`);
      p.drawingContext.fillStyle = scleraGradient;
      p.ellipse(eye.x, eye.y, eyeWidth, eyeHeight);
      
      // Subtle veins in eye white for realism
      p.stroke(200, 100, 100, 8); // Very subtle red for veins
      p.strokeWeight(0.7);
      p.drawingContext.filter = 'blur(1px)';
      
      // Create a more natural vein pattern
      const veinCount = 5;
      for (let i = 0; i < veinCount; i++) {
        const angle = p.random(p.PI * 0.5, p.PI * 1.5); // Veins mostly on sides
        const length = p.random(eye.size * 0.3, eye.size * 0.5);
        const startX = eye.x - eye.size * 0.4 + p.random(-0.1, 0.1) * eye.size;
        const startY = eye.y + p.random(-0.2, 0.2) * eyeHeight;
        
        // Draw branching veins
        p.beginShape();
        p.vertex(startX, startY);
        
        // Main vein
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        
        // Add some curve to the vein
        const ctrlX = startX + Math.cos(angle) * length * 0.5 + p.random(-10, 10);
        const ctrlY = startY + Math.sin(angle) * length * 0.5 + p.random(-5, 5);
        
        p.bezierVertex(
          startX + Math.cos(angle) * length * 0.3,
          startY + Math.sin(angle) * length * 0.3,
          ctrlX, ctrlY,
          endX, endY
        );
        p.endShape();
        
        // Add 1-2 branches to some veins
        if (i % 2 === 0) {
          const branchStartX = startX + Math.cos(angle) * length * 0.6;
          const branchStartY = startY + Math.sin(angle) * length * 0.6;
          const branchAngle = angle + p.random(-0.5, 0.5);
          const branchLength = length * 0.4;
          
          p.line(
            branchStartX, branchStartY,
            branchStartX + Math.cos(branchAngle) * branchLength,
            branchStartY + Math.sin(branchAngle) * branchLength
          );
        }
      }
      
      p.drawingContext.filter = 'none';
      
      // Iris with detailed gradient and texture
      const irisSize = eye.size * 0.45; // Slightly smaller for better proportion
      const irisX = eye.x + eye.pupilOffset.x;
      const irisY = eye.y + eye.pupilOffset.y;
      
      // Create realistic iris gradient
      const irisGradient = p.drawingContext.createRadialGradient(
        irisX, irisY, 0,
        irisX, irisY, irisSize/2
      );
      
      // Outer darker ring
      irisGradient.addColorStop(0.7, `rgba(${irisColor[0] * 0.7}, ${irisColor[1] * 0.7}, ${irisColor[2] * 0.7}, 0.95)`);
      // Middle tone
      irisGradient.addColorStop(0.4, `rgba(${irisColor[0]}, ${irisColor[1]}, ${irisColor[2]}, 0.9)`);
      // Inner lighter area
      irisGradient.addColorStop(0, `rgba(${irisColor[0] * 1.2}, ${irisColor[1] * 1.2}, ${irisColor[2] * 1.2}, 0.85)`);
      
      p.noStroke();
      p.drawingContext.fillStyle = irisGradient;
      p.ellipse(irisX, irisY, irisSize, irisSize);
      
      // Iris texture - detailed radial pattern
      p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 60);
      p.strokeWeight(0.4);
      
      // Draw more natural iris fibers
      const fiberCount = 60; // More fibers for realism
      for (let i = 0; i < fiberCount; i++) {
        const angle = i * p.TWO_PI / fiberCount;
        const innerRadius = irisSize * 0.2;
        const outerRadius = irisSize * 0.48;
        
        // Add slight variation to each fiber
        const radiusVariation = p.random(0.95, 1.05);
        
        // Draw fiber with slight curve
        p.beginShape();
        p.vertex(
          irisX + Math.cos(angle) * innerRadius,
          irisY + Math.sin(angle) * innerRadius
        );
        
        // Add control points for curve
        const ctrlDist = innerRadius + (outerRadius - innerRadius) * 0.5;
        const ctrlAngleOffset = p.random(-0.05, 0.05);
        
        p.bezierVertex(
          irisX + Math.cos(angle + ctrlAngleOffset) * ctrlDist,
          irisY + Math.sin(angle + ctrlAngleOffset) * ctrlDist,
          irisX + Math.cos(angle + ctrlAngleOffset * 2) * ctrlDist * 1.5,
          irisY + Math.sin(angle + ctrlAngleOffset * 2) * ctrlDist * 1.5,
          irisX + Math.cos(angle) * outerRadius * radiusVariation,
          irisY + Math.sin(angle) * outerRadius * radiusVariation
        );
        p.endShape();
      }
      
      // Iris outer ring - darker edge
      p.noFill();
      p.stroke(irisColor[0] * 0.6, irisColor[1] * 0.6, irisColor[2] * 0.6, 100);
      p.strokeWeight(1.5);
      p.ellipse(irisX, irisY, irisSize * 0.98);
      
      // Pupil with soft edge
      p.noStroke();
      const pupilGradient = p.drawingContext.createRadialGradient(
        irisX, irisY, 0,
        irisX, irisY, irisSize * 0.3
      );
      pupilGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      pupilGradient.addColorStop(0.85, 'rgba(0, 0, 0, 1)');
      pupilGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      
      p.drawingContext.fillStyle = pupilGradient;
      const pupilSize = irisSize * 0.55 * (1 + audioLevel * 0.4); // Pupil dilates with audio
      p.ellipse(irisX, irisY, pupilSize);
      
      // Eye reflections (catchlights) - more natural with multiple highlights
      p.fill(palette.highlight[0], palette.highlight[1], palette.highlight[2], 230);
      
      // Main catchlight - window reflection
      p.ellipse(
        irisX - irisSize * 0.15,
        irisY - irisSize * 0.1,
        irisSize * 0.18
      );
      
      // Secondary smaller catchlight - second light source
      p.fill(palette.highlight[0], palette.highlight[1], palette.highlight[2], 180);
      p.ellipse(
        irisX + irisSize * 0.2,
        irisY - irisSize * 0.2,
        irisSize * 0.08
      );
      
      // Tiny tertiary catchlight
      p.fill(palette.highlight[0], palette.highlight[1], palette.highlight[2], 150);
      p.ellipse(
        irisX + irisSize * 0.1,
        irisY + irisSize * 0.25,
        irisSize * 0.05
      );
    }
    
    // Upper eyelid with more natural curve and shadow
    p.noStroke();
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 180);
    
    // Add subtle eyelid shadow
    p.drawingContext.shadowBlur = 5;
    p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
    p.drawingContext.shadowOffsetY = 1;
    
    p.beginShape();
    // Left corner
    p.vertex(eye.x - eyeWidth * 0.6, eye.y);
    
    // Upper lid curve - more natural shape
    p.bezierVertex(
      eye.x - eyeWidth * 0.4, eye.y - eyeHeight * (0.8 + eye.blinkState * 0.3),
      eye.x, eye.y - eyeHeight * (1.0 + eye.blinkState * 0.3),
      eye.x + eyeWidth * 0.4, eye.y - eyeHeight * (0.8 + eye.blinkState * 0.3)
    );
    
    // Right corner
    p.vertex(eye.x + eyeWidth * 0.6, eye.y);
    
    // Complete the shape
    p.vertex(eye.x + eyeWidth * 0.6, eye.y - eyeHeight * 0.9);
    p.vertex(eye.x - eyeWidth * 0.6, eye.y - eyeHeight * 0.9);
    p.endShape(p.CLOSE);
    
    // Reset shadow
    p.drawingContext.shadowBlur = 0;
    p.drawingContext.shadowOffsetY = 0;
    
    // Lower eyelid with more natural curve
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 160);
    p.beginShape();
    // Left corner
    p.vertex(eye.x - eyeWidth * 0.6, eye.y);
    
    // Lower lid curve - more subtle
    p.bezierVertex(
      eye.x - eyeWidth * 0.3, eye.y + eyeHeight * (0.4 + eye.blinkState * 0.6),
      eye.x + eyeWidth * 0.3, eye.y + eyeHeight * (0.4 + eye.blinkState * 0.6),
      eye.x + eyeWidth * 0.6, eye.y
    );
    
    // Complete the shape
    p.vertex(eye.x + eyeWidth * 0.6, eye.y + eyeHeight * 0.7);
    p.vertex(eye.x - eyeWidth * 0.6, eye.y + eyeHeight * 0.7);
    p.endShape(p.CLOSE);
    
    // Eyelid crease - more subtle and natural
    if (eye.blinkState < 0.5) {
      p.noFill();
      p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 25);
      p.strokeWeight(1);
      p.drawingContext.filter = 'blur(1px)';
      
      p.beginShape();
      p.vertex(eye.x - eyeWidth * 0.45, eye.y - eyeHeight * 0.3);
      p.bezierVertex(
        eye.x - eyeWidth * 0.2, eye.y - eyeHeight * 0.9,
        eye.x + eyeWidth * 0.2, eye.y - eyeHeight * 0.9,
        eye.x + eyeWidth * 0.45, eye.y - eyeHeight * 0.3
      );
      p.endShape();
      
      p.drawingContext.filter = 'none';
    }
    
    // Eyelashes for added realism (when eye is open enough)
    if (eye.blinkState < 0.3) {
      p.stroke(palette.shadow[0] * 0.5, palette.shadow[1] * 0.5, palette.shadow[2] * 0.5, 150);
      p.strokeWeight(1);
      
      // Upper lashes
      const lashCount = 7;
      const lashLength = eyeHeight * 0.25;
      
      for (let i = 0; i < lashCount; i++) {
        const x = p.map(i, 0, lashCount - 1, eye.x - eyeWidth * 0.4, eye.x + eyeWidth * 0.4);
        const y = eye.y - eyeHeight * 0.7;
        const angle = p.map(i, 0, lashCount - 1, -p.PI * 0.7, -p.PI * 0.3);
        
        // Draw curved lash
        p.beginShape();
        p.vertex(x, y);
        p.bezierVertex(
          x + Math.cos(angle) * lashLength * 0.5,
          y + Math.sin(angle) * lashLength * 0.5,
          x + Math.cos(angle) * lashLength * 0.8,
          y + Math.sin(angle) * lashLength * 0.8,
          x + Math.cos(angle) * lashLength,
          y + Math.sin(angle) * lashLength
        );
        p.endShape();
      }
      
      // Few lower lashes
      const lowerLashCount = 4;
      const lowerLashLength = eyeHeight * 0.15;
      
      for (let i = 0; i < lowerLashCount; i++) {
        const x = p.map(i, 0, lowerLashCount - 1, eye.x - eyeWidth * 0.3, eye.x + eyeWidth * 0.3);
        const y = eye.y + eyeHeight * 0.4;
        const angle = p.map(i, 0, lowerLashCount - 1, p.PI * 0.6, p.PI * 0.4);
        
        p.line(
          x, y,
          x + Math.cos(angle) * lowerLashLength,
          y + Math.sin(angle) * lowerLashLength
        );
      }
    }
    
    p.pop();
  }
  
  // Draw realistic eyebrows with detailed shape and natural expressions
  function drawEyebrows() {
    p.push();
    
    const eyebrowLength = leftEye.size * 1.4; // Slightly longer for better proportion
    const eyebrowHeight = leftEye.size * 0.18; // Slightly thicker for more presence
    const eyebrowY = leftEye.y - leftEye.size * 0.85; // Position slightly higher
    
    // Determine eyebrow positions and shapes based on expression
    let leftAngle = 0;
    let rightAngle = 0;
    let leftYOffset = 0;
    let rightYOffset = 0;
    let leftCurve = 0;
    let rightCurve = 0;
    let leftThickness = 1;
    let rightThickness = 1;
    
    // More nuanced expression mapping
    switch (expressionState) {
      case 'happy':
        // Raised outer edges for happiness
        leftAngle = -0.12;
        rightAngle = 0.12;
        leftYOffset = -5;
        rightYOffset = -5;
        leftCurve = 0.2;
        rightCurve = 0.2;
        break;
      case 'thinking':
        // One raised eyebrow, one slightly lowered for thinking/questioning
        leftAngle = 0.25; // Raised eyebrow
        rightAngle = -0.05; // Slightly lowered
        leftYOffset = -8; // Raised position
        rightYOffset = 2; // Slightly lowered
        leftCurve = -0.1; // Straighter
        rightCurve = 0.15; // More curved
        leftThickness = 1.1; // Slightly thicker for emphasis
        break;
      case 'surprised':
        // Both eyebrows raised high for surprise
        leftAngle = -0.1;
        rightAngle = -0.1;
        leftYOffset = -12; // Raised significantly
        rightYOffset = -12; // Raised significantly
        leftCurve = 0.3; // More curved
        rightCurve = 0.3; // More curved
        break;
      default: // neutral
        // Slightly asymmetrical for natural look
        leftAngle = 0.04;
        rightAngle = -0.04;
        leftCurve = 0.1;
        rightCurve = 0.1;
    }
    
    // Add subtle shadow under eyebrows
    p.drawingContext.shadowBlur = 4;
    p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
    p.drawingContext.shadowOffsetY = 2;
    
    // Draw eyebrows with bezier curves for more natural shape
    
    // Left eyebrow
    p.noStroke();
    p.fill(palette.shadow[0] * 0.7, palette.shadow[1] * 0.7, palette.shadow[2] * 0.7, 200);
    
    p.push();
    p.translate(leftEye.x, eyebrowY + leftYOffset);
    p.rotate(leftAngle);
    
    // Draw with bezier curve for more natural shape
    p.beginShape();
    // Bottom edge
    p.vertex(-eyebrowLength/2, 0);
    p.bezierVertex(
      -eyebrowLength/4, eyebrowHeight * leftCurve,
      eyebrowLength/4, eyebrowHeight * leftCurve,
      eyebrowLength/2, 0
    );
    
    // Top edge - thinner at ends, thicker in middle
    p.bezierVertex(
      eyebrowLength/4, -eyebrowHeight * leftThickness,
      -eyebrowLength/4, -eyebrowHeight * leftThickness,
      -eyebrowLength/2, 0
    );
    p.endShape(p.CLOSE);
    
    // Add eyebrow texture - subtle hair strokes
    p.stroke(palette.shadow[0] * 0.6, palette.shadow[1] * 0.6, palette.shadow[2] * 0.6, 100);
    p.strokeWeight(0.8);
    
    const hairCount = 12;
    for (let i = 0; i < hairCount; i++) {
      const x = p.map(i, 0, hairCount-1, -eyebrowLength/2 + 5, eyebrowLength/2 - 5);
      const baseY = p.map(
        Math.abs(x), 
        0, eyebrowLength/2, 
        -eyebrowHeight * 0.7 * leftThickness, 
        -eyebrowHeight * 0.2
      );
      
      // Vary hair length and angle slightly
      const length = eyebrowHeight * p.random(0.8, 1.2);
      const angle = p.PI/2 + p.random(-0.2, 0.2);
      
      p.line(
        x, baseY,
        x + Math.cos(angle) * length,
        baseY + Math.sin(angle) * length
      );
    }
    
    p.pop();
    
    // Right eyebrow
    p.fill(palette.shadow[0] * 0.7, palette.shadow[1] * 0.7, palette.shadow[2] * 0.7, 200);
    
    p.push();
    p.translate(rightEye.x, eyebrowY + rightYOffset);
    p.rotate(rightAngle);
    
    // Draw with bezier curve for more natural shape
    p.beginShape();
    // Bottom edge
    p.vertex(-eyebrowLength/2, 0);
    p.bezierVertex(
      -eyebrowLength/4, eyebrowHeight * rightCurve,
      eyebrowLength/4, eyebrowHeight * rightCurve,
      eyebrowLength/2, 0
    );
    
    // Top edge - thinner at ends, thicker in middle
    p.bezierVertex(
      eyebrowLength/4, -eyebrowHeight * rightThickness,
      -eyebrowLength/4, -eyebrowHeight * rightThickness,
      -eyebrowLength/2, 0
    );
    p.endShape(p.CLOSE);
    
    // Add eyebrow texture - subtle hair strokes
    p.stroke(palette.shadow[0] * 0.6, palette.shadow[1] * 0.6, palette.shadow[2] * 0.6, 100);
    p.strokeWeight(0.8);
    
    for (let i = 0; i < hairCount; i++) {
      const x = p.map(i, 0, hairCount-1, -eyebrowLength/2 + 5, eyebrowLength/2 - 5);
      const baseY = p.map(
        Math.abs(x), 
        0, eyebrowLength/2, 
        -eyebrowHeight * 0.7 * rightThickness, 
        -eyebrowHeight * 0.2
      );
      
      // Vary hair length and angle slightly
      const length = eyebrowHeight * p.random(0.8, 1.2);
      const angle = p.PI/2 + p.random(-0.2, 0.2);
      
      p.line(
        x, baseY,
        x + Math.cos(angle) * length,
        baseY + Math.sin(angle) * length
      );
    }
    
    p.pop();
    
    // Reset shadow
    p.drawingContext.shadowBlur = 0;
    p.drawingContext.shadowOffsetY = 0;
    
    p.pop();
  }
  
  // Draw highly realistic mouth with detailed lips, teeth, and expressions
  function drawRealisticMouth(mouth, color) {
    p.push();
    
    const mouthWidth = mouth.width;
    const mouthHeight = mouth.height * mouth.openAmount;
    const curveAmount = mouth.curveAmount;
    
    // Add subtle shadow around mouth
    p.drawingContext.shadowBlur = 8;
    p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
    
    // Mouth opening (dark area) with gradient for depth
    if (mouthHeight > 2) {
      // Create gradient for mouth interior
      const mouthGradient = p.drawingContext.createLinearGradient(
        mouth.x, mouth.y - mouthHeight * 0.3,
        mouth.x, mouth.y + mouthHeight * 0.5
      );
      mouthGradient.addColorStop(0, 'rgba(20, 20, 30, 0.9)');
      mouthGradient.addColorStop(0.7, 'rgba(40, 30, 50, 0.8)');
      mouthGradient.addColorStop(1, 'rgba(20, 10, 20, 0.9)');
      
      p.drawingContext.fillStyle = mouthGradient;
      p.noStroke();
      
      // More natural mouth opening shape
      p.beginShape();
      // Top curve
      p.vertex(mouth.x - mouthWidth * 0.4, mouth.y - mouthHeight * 0.3);
      p.bezierVertex(
        mouth.x - mouthWidth * 0.2, mouth.y - mouthHeight * 0.4,
        mouth.x + mouthWidth * 0.2, mouth.y - mouthHeight * 0.4,
        mouth.x + mouthWidth * 0.4, mouth.y - mouthHeight * 0.3
      );
      
      // Right side
      p.bezierVertex(
        mouth.x + mouthWidth * 0.45, mouth.y - mouthHeight * 0.1,
        mouth.x + mouthWidth * 0.45, mouth.y + mouthHeight * 0.3,
        mouth.x + mouthWidth * 0.4, mouth.y + mouthHeight * 0.4
      );
      
      // Bottom curve
      p.bezierVertex(
        mouth.x + mouthWidth * 0.2, mouth.y + mouthHeight * 0.5,
        mouth.x - mouthWidth * 0.2, mouth.y + mouthHeight * 0.5,
        mouth.x - mouthWidth * 0.4, mouth.y + mouthHeight * 0.4
      );
      
      // Left side
      p.bezierVertex(
        mouth.x - mouthWidth * 0.45, mouth.y + mouthHeight * 0.3,
        mouth.x - mouthWidth * 0.45, mouth.y - mouthHeight * 0.1,
        mouth.x - mouthWidth * 0.4, mouth.y - mouthHeight * 0.3
      );
      
      p.endShape(p.CLOSE);
      
      // Teeth (when mouth is open enough) with improved realism
      if (mouthHeight > mouth.height * 0.3) {
        // Upper teeth with slight curve
        p.fill(palette.white[0], palette.white[1], palette.white[2], 220);
        p.beginShape();
        p.vertex(mouth.x - mouthWidth * 0.35, mouth.y - mouthHeight * 0.25);
        p.bezierVertex(
          mouth.x - mouthWidth * 0.2, mouth.y - mouthHeight * 0.28,
          mouth.x + mouthWidth * 0.2, mouth.y - mouthHeight * 0.28,
          mouth.x + mouthWidth * 0.35, mouth.y - mouthHeight * 0.25
        );
        p.vertex(mouth.x + mouthWidth * 0.35, mouth.y - mouthHeight * 0.05);
        p.vertex(mouth.x - mouthWidth * 0.35, mouth.y - mouthHeight * 0.05);
        p.endShape(p.CLOSE);
        
        // Add subtle shadow to bottom of upper teeth
        p.noStroke();
        p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 30);
        p.rect(
          mouth.x - mouthWidth * 0.35, 
          mouth.y - mouthHeight * 0.08,
          mouthWidth * 0.7,
          mouthHeight * 0.03
        );
        
        // Lower teeth (visible when mouth is more open)
        if (mouthHeight > mouth.height * 0.4) {
          p.fill(palette.white[0], palette.white[1], palette.white[2], 220);
          p.beginShape();
          p.vertex(mouth.x - mouthWidth * 0.35, mouth.y + mouthHeight * 0.05);
          p.vertex(mouth.x + mouthWidth * 0.35, mouth.y + mouthHeight * 0.05);
          p.bezierVertex(
            mouth.x + mouthWidth * 0.2, mouth.y + mouthHeight * 0.08,
            mouth.x - mouthWidth * 0.2, mouth.y + mouthHeight * 0.08,
            mouth.x - mouthWidth * 0.35, mouth.y + mouthHeight * 0.05
          );
          p.endShape(p.CLOSE);
        }
        
        // Teeth separation lines - more natural with slight variations
        p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 25);
        p.strokeWeight(0.8);
        const teethCount = 8; // More teeth for realism
        const teethWidth = mouthWidth * 0.7 / teethCount;
        
        // Upper teeth separations
        for (let i = 1; i < teethCount; i++) {
          const x = mouth.x - mouthWidth * 0.35 + i * teethWidth;
          // Add slight variation to each line
          const heightVariation = p.random(-0.02, 0.02) * mouthHeight;
          
          p.line(
            x, mouth.y - mouthHeight * 0.25 + heightVariation,
            x, mouth.y - mouthHeight * 0.05
          );
        }
        
        // Lower teeth separations (when visible)
        if (mouthHeight > mouth.height * 0.4) {
          for (let i = 1; i < teethCount; i++) {
            const x = mouth.x - mouthWidth * 0.35 + i * teethWidth;
            const heightVariation = p.random(-0.01, 0.01) * mouthHeight;
            
            p.line(
              x, mouth.y + mouthHeight * 0.05,
              x, mouth.y + mouthHeight * 0.08 + heightVariation
            );
          }
        }
        
        // Tongue (visible when mouth is very open) with more realistic shape and texture
        if (mouthHeight > mouth.height * 0.5) {
          // Create tongue gradient for more realism
          const tongueGradient = p.drawingContext.createRadialGradient(
            mouth.x, mouth.y + mouthHeight * 0.2, 0,
            mouth.x, mouth.y + mouthHeight * 0.2, mouthWidth * 0.3
          );
          tongueGradient.addColorStop(0, 'rgba(220, 100, 100, 0.9)');
          tongueGradient.addColorStop(0.7, 'rgba(200, 80, 80, 0.85)');
          tongueGradient.addColorStop(1, 'rgba(180, 70, 70, 0.8)');
          
          p.noStroke();
          p.drawingContext.fillStyle = tongueGradient;
          
          // Draw tongue with more natural shape
          p.beginShape();
          p.vertex(mouth.x - mouthWidth * 0.25, mouth.y + mouthHeight * 0.05);
          p.bezierVertex(
            mouth.x - mouthWidth * 0.2, mouth.y + mouthHeight * 0.1,
            mouth.x - mouthWidth * 0.15, mouth.y + mouthHeight * 0.25,
            mouth.x, mouth.y + mouthHeight * 0.3
          );
          p.bezierVertex(
            mouth.x + mouthWidth * 0.15, mouth.y + mouthHeight * 0.25,
            mouth.x + mouthWidth * 0.2, mouth.y + mouthHeight * 0.1,
            mouth.x + mouthWidth * 0.25, mouth.y + mouthHeight * 0.05
          );
          p.endShape(p.CLOSE);
          
          // Add tongue texture - subtle center line
          p.stroke(180, 70, 70, 40);
          p.strokeWeight(1);
          p.line(
            mouth.x, mouth.y + mouthHeight * 0.05,
            mouth.x, mouth.y + mouthHeight * 0.3
          );
          
          // Add subtle tongue surface texture
          p.noStroke();
          p.fill(230, 120, 120, 30);
          for (let i = 0; i < 15; i++) {
            const tx = mouth.x + p.random(-0.2, 0.2) * mouthWidth;
            const ty = mouth.y + mouthHeight * (0.1 + p.random(0, 0.15));
            const tSize = p.random(2, 4);
            p.ellipse(tx, ty, tSize, tSize * 0.7);
          }
        }
      }
      
      // Audio visualization as voice waves - more organic and responsive
      if (audioLevel > 0.1) {
        p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 80);
        p.strokeWeight(1.2);
        p.noFill();
        
        const waveHeight = mouthHeight * 0.35 * audioLevel;
        const waveWidth = mouthWidth * 0.65;
        
        // Draw multiple wave layers for more depth
        for (let layer = 0; layer < 3; layer++) {
          const layerOpacity = 100 - layer * 20;
          p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], layerOpacity);
          
          p.beginShape();
          for (let i = 0; i < 20; i++) {
            const x = mouth.x - waveWidth/2 + (waveWidth/20) * i;
            const dataIndex = i % audioData.length;
            // Add variation between layers
            const phaseOffset = layer * 0.3;
            const y = mouth.y + Math.sin(i * 0.5 + p.frameCount * 0.2 + phaseOffset) * 
                      waveHeight * audioData[dataIndex] * (1 - layer * 0.2);
            p.vertex(x, y);
          }
          p.endShape();
        }
      }
    }
    
    // Reset shadow for lips
    p.drawingContext.shadowBlur = 3;
    p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.15)';
    
    // Upper lip with more natural shape and subtle volume
    p.noStroke();
    // Slightly darker color for upper lip (shadow effect)
    p.fill(palette.shadow[0] * 0.95, palette.shadow[1] * 0.95, palette.shadow[2] * 0.95, 180);
    
    p.beginShape();
    // Lip shape with more defined cupid's bow
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    
    // Left side of upper lip with more volume
    p.bezierVertex(
      mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 - curveAmount * 6,
      mouth.x - mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 12,
      mouth.x - mouthWidth/10, mouth.y - mouthHeight/2
    );
    
    // Center dip (cupid's bow) - more pronounced
    p.bezierVertex(
      mouth.x - mouthWidth/15, mouth.y - mouthHeight/2 + curveAmount * 7,
      mouth.x, mouth.y - mouthHeight/2 + curveAmount * 8, // Deeper center dip
      mouth.x + mouthWidth/15, mouth.y - mouthHeight/2 + curveAmount * 7
    );
    
    // Right side of upper lip with more volume
    p.bezierVertex(
      mouth.x + mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 12,
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 - curveAmount * 6,
      mouth.x + mouthWidth/2, mouth.y - mouthHeight/2
    );
    
    // Complete the shape by adding volume to the lip
    p.bezierVertex(
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 + mouthHeight * 0.15,
      mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 + mouthHeight * 0.15,
      mouth.x - mouthWidth/2, mouth.y - mouthHeight/2
    );
    
    p.endShape(p.CLOSE);
    
    // Lower lip - fuller and more natural
    // Slightly lighter color for lower lip (catches more light)
    p.fill(palette.shadow[0] * 1.05, palette.shadow[1] * 1.05, palette.shadow[2] * 1.05, 160);
    
    p.beginShape();
    // Start at left corner
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    
    // Full curve of lower lip
    p.bezierVertex(
      mouth.x - mouthWidth/3, mouth.y + mouthHeight/2 + curveAmount * 18,
      mouth.x, mouth.y + mouthHeight/2 + curveAmount * 20, // More pronounced center
      mouth.x + mouthWidth/3, mouth.y + mouthHeight/2 + curveAmount * 18
    );
    
    // End at right corner
    p.vertex(mouth.x + mouthWidth/2, mouth.y - mouthHeight/2);
    
    // Complete the shape with volume
    p.bezierVertex(
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 + mouthHeight * 0.1,
      mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 + mouthHeight * 0.1,
      mouth.x - mouthWidth/2, mouth.y - mouthHeight/2
    );
    
    p.endShape(p.CLOSE);
    
    // Lip highlights for dimension - upper lip
    p.noFill();
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 120);
    p.strokeWeight(1);
    p.drawingContext.filter = 'blur(1px)';
    
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 + 2);
    p.bezierVertex(
      mouth.x - mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 5 + 2,
      mouth.x + mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 5 + 2,
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 + 2
    );
    p.endShape();
    
    // Lower lip highlight - more subtle
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 150);
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/4, mouth.y + mouthHeight/4);
    p.bezierVertex(
      mouth.x - mouthWidth/8, mouth.y + mouthHeight/3 + curveAmount * 5,
      mouth.x + mouthWidth/8, mouth.y + mouthHeight/3 + curveAmount * 5,
      mouth.x + mouthWidth/4, mouth.y + mouthHeight/4
    );
    p.endShape();
    
    // Reset filters
    p.drawingContext.filter = 'none';
    p.drawingContext.shadowBlur = 0;
    
    // Add subtle lip corners - where upper and lower lips meet
    p.noStroke();
    p.fill(palette.shadow[0] * 0.9, palette.shadow[1] * 0.9, palette.shadow[2] * 0.9, 100);
    
    // Left corner
    p.ellipse(
      mouth.x - mouthWidth/2, 
      mouth.y - mouthHeight/2,
      mouthWidth * 0.06,
      mouthHeight * 0.15
    );
    
    // Right corner
    p.ellipse(
      mouth.x + mouthWidth/2, 
      mouth.y - mouthHeight/2,
      mouthWidth * 0.06,
      mouthHeight * 0.15
    );
    
    p.pop();
  }
  
  // Variables for random eye movements
  let targetEyeX = 0;
  let targetEyeY = 0;
  let lastEyeMovementTime = 0;
  let eyeMovementInterval = 2000; // milliseconds between random eye movements
  
  function updateRobotFace() {
    // Update blink timer with some randomness
    blinkTimer++;
    const blinkThreshold = isFullscreen ? 120 + Math.random() * 60 : 180; // More frequent blinking in fullscreen
    
    if (blinkTimer > blinkThreshold) {
      if (blinkTimer < blinkThreshold + 10) { // Blink duration
        leftEye.blinkState = p.map(blinkTimer, blinkThreshold, blinkThreshold + 5, 0, 1);
        if (blinkTimer > blinkThreshold + 5) {
          leftEye.blinkState = p.map(blinkTimer, blinkThreshold + 5, blinkThreshold + 10, 1, 0);
        }
        rightEye.blinkState = leftEye.blinkState;
      } else if (blinkTimer > blinkThreshold + 120) { // Reset blink timer
        blinkTimer = 0;
      }
    }
    
    // Random eye movements to make the robot look more alive
    const currentTime = Date.now();
    if (currentTime - lastEyeMovementTime > eyeMovementInterval) {
      // Set new random target for eyes to look at
      targetEyeX = Math.random() * p.width;
      targetEyeY = Math.random() * p.height;
      lastEyeMovementTime = currentTime;
      eyeMovementInterval = 1000 + Math.random() * 3000; // Random interval between 1-4 seconds
    }
    
    // Combine mouse position with random target position
    const mouseWeight = 0.7; // How much the mouse influences eye position vs random movement
    const targetX = p.mouseX * mouseWeight + targetEyeX * (1 - mouseWeight);
    const targetY = p.mouseY * mouseWeight + targetEyeY * (1 - mouseWeight);
    
    // Update eye pupil position
    const maxPupilOffset = leftEye.size * 0.2;
    const targetXOffset = p.map(targetX, 0, p.width, -maxPupilOffset, maxPupilOffset);
    const targetYOffset = p.map(targetY, 0, p.height, -maxPupilOffset, maxPupilOffset);
    
    leftEye.pupilOffset.x = p.lerp(leftEye.pupilOffset.x, targetXOffset, 0.05);
    leftEye.pupilOffset.y = p.lerp(leftEye.pupilOffset.y, targetYOffset, 0.05);
    rightEye.pupilOffset.x = p.lerp(rightEye.pupilOffset.x, targetXOffset, 0.05);
    rightEye.pupilOffset.y = p.lerp(rightEye.pupilOffset.y, targetYOffset, 0.05);
    
    // Update mouth based on audio level and expression
    const targetOpenAmount = p.map(audioLevel, 0, 1, 0.1, 0.8);
    mouth.openAmount = p.lerp(mouth.openAmount, targetOpenAmount, 0.2);
    
    // Update expression
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
    
    // Update glow intensity based on audio level
    const baseGlow = 0.6;
    const audioGlow = audioLevel * 0.4;
    leftEye.glowIntensity = baseGlow + audioGlow;
    rightEye.glowIntensity = baseGlow + audioGlow;
    mouth.glowIntensity = baseGlow + audioGlow;
  }
  
  function drawRobotFace() {
    p.push();
    
    // Draw eyes
    drawEye(leftEye, palette.neonBlue);
    drawEye(rightEye, palette.neonBlue);
    
    // Draw mouth
    drawMouth(mouth, palette.neonPink);
    
    // Draw audio visualizer inside mouth
    drawAudioVisualizer();
    
    p.pop();
  }
  
  function drawEye(eye, color) {
    // Draw eye glow
    const glowSize = eye.size * (1 + eye.glowIntensity * 0.3);
    p.noStroke();
    p.fill(color[0], color[1], color[2], 30 * eye.glowIntensity);
    p.ellipse(eye.x, eye.y, glowSize * 1.5);
    p.fill(color[0], color[1], color[2], 50 * eye.glowIntensity);
    p.ellipse(eye.x, eye.y, glowSize * 1.2);
    
    // Draw eye socket
    p.stroke(color[0], color[1], color[2]);
    p.strokeWeight(2);
    p.noFill();
    p.ellipse(eye.x, eye.y, eye.size);
    
    // Draw eye (accounting for blink)
    const eyeHeight = eye.size * (1 - eye.blinkState);
    if (eyeHeight > 1) {
      p.noStroke();
      p.fill(color[0], color[1], color[2], 100);
      p.ellipse(eye.x, eye.y, eye.size, eyeHeight);
      
      // Draw pupil
      p.fill(255);
      p.ellipse(
        eye.x + eye.pupilOffset.x,
        eye.y + eye.pupilOffset.y,
        eye.pupilSize
      );
      
      // Draw pupil highlight
      p.fill(255, 255, 255, 200);
      p.ellipse(
        eye.x + eye.pupilOffset.x - eye.pupilSize * 0.2,
        eye.y + eye.pupilOffset.y - eye.pupilSize * 0.2,
        eye.pupilSize * 0.3
      );
    }
  }
  
  function drawMouth(mouth, color) {
    p.push();
    
    // Draw mouth glow
    p.noStroke();
    p.fill(color[0], color[1], color[2], 30 * mouth.glowIntensity);
    p.ellipse(mouth.x, mouth.y, mouth.width * 1.3, mouth.height * 2 * mouth.openAmount * 1.3);
    p.fill(color[0], color[1], color[2], 50 * mouth.glowIntensity);
    p.ellipse(mouth.x, mouth.y, mouth.width * 1.1, mouth.height * 2 * mouth.openAmount * 1.1);
    
    // Draw mouth outline
    p.stroke(color[0], color[1], color[2]);
    p.strokeWeight(2);
    p.noFill();
    
    // Calculate mouth curve based on curveAmount
    const mouthHeight = mouth.height * mouth.openAmount;
    const curveOffset = mouth.width * mouth.curveAmount;
    
    p.beginShape();
    p.vertex(mouth.x - mouth.width / 2, mouth.y - mouthHeight / 2 + curveOffset);
    p.bezierVertex(
      mouth.x - mouth.width / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouth.width / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouth.width / 2, mouth.y - mouthHeight / 2 + curveOffset
    );
    p.endShape();
    
    p.beginShape();
    p.vertex(mouth.x - mouth.width / 2, mouth.y + mouthHeight / 2 - curveOffset);
    p.bezierVertex(
      mouth.x - mouth.width / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x + mouth.width / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x + mouth.width / 2, mouth.y + mouthHeight / 2 - curveOffset
    );
    p.endShape();
    
    // Fill mouth
    p.fill(color[0], color[1], color[2], 50);
    p.beginShape();
    p.vertex(mouth.x - mouth.width / 2, mouth.y - mouthHeight / 2 + curveOffset);
    p.bezierVertex(
      mouth.x - mouth.width / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouth.width / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouth.width / 2, mouth.y - mouthHeight / 2 + curveOffset
    );
    p.vertex(mouth.x + mouth.width / 2, mouth.y + mouthHeight / 2 - curveOffset);
    p.bezierVertex(
      mouth.x + mouth.width / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x - mouth.width / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x - mouth.width / 2, mouth.y + mouthHeight / 2 - curveOffset
    );
    p.endShape(p.CLOSE);
    
    p.pop();
  }
  
  function drawAudioVisualizer() {
    if (mouth.openAmount < 0.1) return;
    
    const visualizerWidth = mouth.width * 0.9;
    const visualizerHeight = mouth.height * mouth.openAmount * 0.7;
    
    p.push();
    
    // Kubrick-inspired symmetrical audio visualizer
    // Using sharp geometric shapes and stark contrasts
    
    // Draw visualizer container
    p.stroke(palette.white[0], palette.white[1], palette.white[2], 80);
    p.strokeWeight(1);
    p.noFill();
    p.rect(mouth.x - visualizerWidth/2, mouth.y - visualizerHeight/2, 
           visualizerWidth, visualizerHeight);
    
    // Draw audio bars with precise geometric style
    const barCount = 10; // Fewer, more precise bars
    const barWidth = visualizerWidth / barCount;
    const barSpacing = 2;
    
    for (let i = 0; i < barCount; i++) {
      // Calculate height based on audio data
      // Use symmetrical pattern from center
      const dataIndex = Math.floor(i * (audioData.length / barCount));
      const mirroredIndex = audioData.length - dataIndex - 1;
      
      // Average the mirrored values for perfect symmetry
      const value = (audioData[dataIndex] + audioData[mirroredIndex]) / 2;
      
      // Map to bar height with minimum size
      const barHeight = p.map(value, 0, 5, visualizerHeight * 0.2, visualizerHeight * 0.9);
      
      // Calculate position
      const x = mouth.x - visualizerWidth/2 + i * barWidth + barSpacing/2;
      const y = mouth.y - barHeight/2;
      
      // Draw bar with HAL-inspired color
      if (i % 2 === 0) {
        p.fill(palette.red[0], palette.red[1], palette.red[2], 180);
      } else {
        p.fill(palette.blue[0], palette.blue[1], palette.blue[2], 180);
      }
      p.noStroke();
      p.rect(x, y, barWidth - barSpacing, barHeight);
      
      // Add horizontal line for computer-like appearance
      p.stroke(palette.white[0], palette.white[1], palette.white[2], 100);
      p.strokeWeight(1);
      p.line(x, mouth.y, x + barWidth - barSpacing, mouth.y);
    }
    
    p.pop();
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
    // Recalculate face dimensions
    faceWidth = p.min(p.width * 0.8, 1200);
    faceHeight = p.min(p.height * 0.8, 800);
    
    // Update eye and mouth positions
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.4;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye.x = p.width / 2 - eyeSpacing / 2;
    leftEye.y = eyeY;
    leftEye.size = eyeSize;
    leftEye.pupilSize = eyeSize * 0.4;
    
    rightEye.x = p.width / 2 + eyeSpacing / 2;
    rightEye.y = eyeY;
    rightEye.size = eyeSize;
    rightEye.pupilSize = eyeSize * 0.4;
    
    mouth.x = p.width / 2;
    mouth.y = eyeY + eyeSize * 1.8;
    mouth.width = faceWidth * 0.3;
    mouth.height = eyeSize * 0.6;
  };
  
  // Mouse click interaction
  p.mouseClicked = function() {
    // Check if clicked on left eye
    if (p.dist(p.mouseX, p.mouseY, leftEye.x, leftEye.y) < leftEye.size / 2) {
      window.setRobotExpression('thinking');
      return false;
    }
    
    // Check if clicked on right eye
    if (p.dist(p.mouseX, p.mouseY, rightEye.x, rightEye.y) < rightEye.size / 2) {
      window.setRobotExpression('surprised');
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
      window.setRobotExpression('happy');
      return false;
    }
  };
};

// Start p5 sketch when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new p5(sketch);
});
