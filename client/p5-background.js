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
  
  // Draw the overall face shape
  function drawFaceShape() {
    p.push();
    
    // Soft glow around the face
    p.noStroke();
    const glowSize = faceWidth * 0.7;
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 10);
    p.ellipse(p.width / 2, p.height * 0.45, glowSize * 1.1, glowSize * 1.3);
    
    // Face shape - slightly elongated oval
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 30);
    p.ellipse(p.width / 2, p.height * 0.45, glowSize * 0.9, glowSize * 1.1);
    
    // Subtle face contours
    p.noFill();
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 20);
    p.strokeWeight(2);
    
    // Left cheek highlight
    p.beginShape();
    p.vertex(p.width / 2 - glowSize * 0.3, p.height * 0.45);
    p.bezierVertex(
      p.width / 2 - glowSize * 0.25, p.height * 0.5,
      p.width / 2 - glowSize * 0.2, p.height * 0.55,
      p.width / 2 - glowSize * 0.15, p.height * 0.6
    );
    p.endShape();
    
    // Right cheek highlight
    p.beginShape();
    p.vertex(p.width / 2 + glowSize * 0.3, p.height * 0.45);
    p.bezierVertex(
      p.width / 2 + glowSize * 0.25, p.height * 0.5,
      p.width / 2 + glowSize * 0.2, p.height * 0.55,
      p.width / 2 + glowSize * 0.15, p.height * 0.6
    );
    p.endShape();
    
    // Chin highlight
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 15);
    p.beginShape();
    p.vertex(p.width / 2 - glowSize * 0.1, p.height * 0.65);
    p.bezierVertex(
      p.width / 2, p.height * 0.67,
      p.width / 2, p.height * 0.67,
      p.width / 2 + glowSize * 0.1, p.height * 0.65
    );
    p.endShape();
    
    p.pop();
  }
  
  // Draw realistic eye with iris, pupil, eyelids, and reflections
  function drawRealisticEye(eye, irisColor) {
    p.push();
    
    // Eye white (sclera)
    const eyeWidth = eye.size * 1.1;
    const eyeHeight = eye.size * 0.5 * (1 - eye.blinkState * 0.9);
    
    // Eye socket shadow
    p.noStroke();
    p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 40);
    p.ellipse(eye.x, eye.y, eyeWidth * 1.2, eyeHeight * 1.5);
    
    if (eyeHeight > eye.size * 0.1) { // Only draw eye details if not mostly closed
      // Eye white
      p.fill(palette.white[0], palette.white[1], palette.white[2], 220);
      p.ellipse(eye.x, eye.y, eyeWidth, eyeHeight);
      
      // Subtle veins in eye white
      p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 10);
      p.strokeWeight(0.5);
      for (let i = 0; i < 3; i++) {
        const angle = p.random(p.PI * 0.7, p.PI * 1.3);
        const length = p.random(eye.size * 0.2, eye.size * 0.4);
        const startX = eye.x - eye.size * 0.3;
        const startY = eye.y;
        p.line(
          startX, 
          startY,
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length
        );
      }
      
      // Iris
      const irisSize = eye.size * 0.5;
      const irisX = eye.x + eye.pupilOffset.x;
      const irisY = eye.y + eye.pupilOffset.y;
      
      // Iris gradient
      for (let i = 0; i < 5; i++) {
        const ratio = (5 - i) / 5;
        p.noStroke();
        p.fill(
          irisColor[0] * ratio, 
          irisColor[1] * ratio, 
          irisColor[2] * ratio, 
          200
        );
        p.ellipse(irisX, irisY, irisSize * ratio);
      }
      
      // Iris detail lines (radial pattern)
      p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 100);
      p.strokeWeight(0.5);
      for (let i = 0; i < 12; i++) {
        const angle = i * p.PI / 6;
        const innerRadius = irisSize * 0.2;
        const outerRadius = irisSize * 0.45;
        p.line(
          irisX + Math.cos(angle) * innerRadius,
          irisY + Math.sin(angle) * innerRadius,
          irisX + Math.cos(angle) * outerRadius,
          irisY + Math.sin(angle) * outerRadius
        );
      }
      
      // Pupil
      p.noStroke();
      p.fill(0, 0, 0, 220);
      const pupilSize = irisSize * 0.6 * (1 + audioLevel * 0.3); // Pupil dilates with audio
      p.ellipse(irisX, irisY, pupilSize);
      
      // Eye reflections (catchlights)
      p.fill(palette.highlight[0], palette.highlight[1], palette.highlight[2], 230);
      
      // Main catchlight
      p.ellipse(
        irisX - irisSize * 0.15,
        irisY - irisSize * 0.1,
        irisSize * 0.2
      );
      
      // Secondary smaller catchlight
      p.ellipse(
        irisX + irisSize * 0.2,
        irisY - irisSize * 0.2,
        irisSize * 0.1
      );
    }
    
    // Upper eyelid
    p.noStroke();
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 150);
    p.beginShape();
    p.vertex(eye.x - eyeWidth * 0.6, eye.y);
    p.bezierVertex(
      eye.x - eyeWidth * 0.3, eye.y - eyeHeight * (0.7 + eye.blinkState * 0.3),
      eye.x + eyeWidth * 0.3, eye.y - eyeHeight * (0.7 + eye.blinkState * 0.3),
      eye.x + eyeWidth * 0.6, eye.y
    );
    p.vertex(eye.x + eyeWidth * 0.6, eye.y - eyeHeight * 0.8);
    p.vertex(eye.x - eyeWidth * 0.6, eye.y - eyeHeight * 0.8);
    p.endShape(p.CLOSE);
    
    // Lower eyelid
    p.fill(palette.skin[0], palette.skin[1], palette.skin[2], 150);
    p.beginShape();
    p.vertex(eye.x - eyeWidth * 0.6, eye.y);
    p.bezierVertex(
      eye.x - eyeWidth * 0.3, eye.y + eyeHeight * (0.5 + eye.blinkState * 0.5),
      eye.x + eyeWidth * 0.3, eye.y + eyeHeight * (0.5 + eye.blinkState * 0.5),
      eye.x + eyeWidth * 0.6, eye.y
    );
    p.vertex(eye.x + eyeWidth * 0.6, eye.y + eyeHeight * 0.6);
    p.vertex(eye.x - eyeWidth * 0.6, eye.y + eyeHeight * 0.6);
    p.endShape(p.CLOSE);
    
    // Eyelid crease
    if (eye.blinkState < 0.5) {
      p.noFill();
      p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 30);
      p.strokeWeight(1);
      p.beginShape();
      p.vertex(eye.x - eyeWidth * 0.5, eye.y - eyeHeight * 0.3);
      p.bezierVertex(
        eye.x - eyeWidth * 0.25, eye.y - eyeHeight * 0.8,
        eye.x + eyeWidth * 0.25, eye.y - eyeHeight * 0.8,
        eye.x + eyeWidth * 0.5, eye.y - eyeHeight * 0.3
      );
      p.endShape();
    }
    
    p.pop();
  }
  
  // Draw eyebrows that respond to expressions
  function drawEyebrows() {
    p.push();
    
    const eyebrowLength = leftEye.size * 1.3;
    const eyebrowHeight = leftEye.size * 0.15;
    const eyebrowY = leftEye.y - leftEye.size * 0.8;
    
    // Determine eyebrow angles based on expression
    let leftAngle = 0;
    let rightAngle = 0;
    
    switch (expressionState) {
      case 'happy':
        leftAngle = -0.1;
        rightAngle = 0.1;
        break;
      case 'thinking':
        leftAngle = 0.2;
        rightAngle = -0.05;
        break;
      case 'surprised':
        leftAngle = -0.15;
        rightAngle = -0.15;
        break;
      default: // neutral
        leftAngle = 0.05;
        rightAngle = -0.05;
    }
    
    // Left eyebrow
    p.noStroke();
    p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 180);
    p.push();
    p.translate(leftEye.x, eyebrowY);
    p.rotate(leftAngle);
    p.ellipse(0, 0, eyebrowLength, eyebrowHeight);
    p.pop();
    
    // Right eyebrow
    p.push();
    p.translate(rightEye.x, eyebrowY);
    p.rotate(rightAngle);
    p.ellipse(0, 0, eyebrowLength, eyebrowHeight);
    p.pop();
    
    p.pop();
  }
  
  // Draw realistic mouth with lips and expressions
  function drawRealisticMouth(mouth, color) {
    p.push();
    
    const mouthWidth = mouth.width;
    const mouthHeight = mouth.height * mouth.openAmount;
    const curveAmount = mouth.curveAmount;
    
    // Mouth opening (dark area)
    if (mouthHeight > 2) {
      p.fill(20, 20, 30, 150);
      p.noStroke();
      p.ellipse(mouth.x, mouth.y, mouthWidth * 0.8 * mouth.openAmount, mouthHeight * 0.7);
      
      // Teeth (when mouth is open enough)
      if (mouthHeight > mouth.height * 0.3) {
        p.fill(palette.white[0], palette.white[1], palette.white[2], 200);
        p.rect(
          mouth.x - mouthWidth * 0.3, 
          mouth.y - mouthHeight * 0.25,
          mouthWidth * 0.6,
          mouthHeight * 0.2,
          4
        );
        
        // Teeth separation lines
        p.stroke(palette.shadow[0], palette.shadow[1], palette.shadow[2], 30);
        p.strokeWeight(1);
        const teethCount = 6;
        const teethWidth = mouthWidth * 0.6 / teethCount;
        for (let i = 1; i < teethCount; i++) {
          const x = mouth.x - mouthWidth * 0.3 + i * teethWidth;
          p.line(
            x, mouth.y - mouthHeight * 0.25,
            x, mouth.y - mouthHeight * 0.05
          );
        }
        
        // Tongue (visible when mouth is very open)
        if (mouthHeight > mouth.height * 0.5) {
          p.noStroke();
          p.fill(200, 100, 100, 150);
          p.ellipse(
            mouth.x, 
            mouth.y + mouthHeight * 0.1,
            mouthWidth * 0.5 * mouth.openAmount,
            mouthHeight * 0.4
          );
        }
      }
      
      // Audio visualization as voice waves
      if (audioLevel > 0.1) {
        p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 100);
        p.strokeWeight(1);
        p.noFill();
        
        const waveHeight = mouthHeight * 0.3 * audioLevel;
        const waveWidth = mouthWidth * 0.6;
        
        p.beginShape();
        for (let i = 0; i < 20; i++) {
          const x = mouth.x - waveWidth/2 + (waveWidth/20) * i;
          const dataIndex = i % audioData.length;
          const y = mouth.y + Math.sin(i * 0.5 + p.frameCount * 0.2) * waveHeight * audioData[dataIndex];
          p.vertex(x, y);
        }
        p.endShape();
      }
    }
    
    // Upper lip
    p.noStroke();
    p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 150);
    p.beginShape();
    // Lip shape with cupid's bow
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    // Left side of upper lip
    p.bezierVertex(
      mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 - curveAmount * 5,
      mouth.x - mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 10,
      mouth.x - mouthWidth/10, mouth.y - mouthHeight/2
    );
    // Center dip (cupid's bow)
    p.bezierVertex(
      mouth.x - mouthWidth/15, mouth.y - mouthHeight/2 + curveAmount * 5,
      mouth.x + mouthWidth/15, mouth.y - mouthHeight/2 + curveAmount * 5,
      mouth.x + mouthWidth/10, mouth.y - mouthHeight/2
    );
    // Right side of upper lip
    p.bezierVertex(
      mouth.x + mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 10,
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 - curveAmount * 5,
      mouth.x + mouthWidth/2, mouth.y - mouthHeight/2
    );
    p.endShape();
    
    // Lower lip
    p.fill(palette.shadow[0], palette.shadow[1], palette.shadow[2], 120);
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2);
    p.bezierVertex(
      mouth.x - mouthWidth/3, mouth.y + mouthHeight/2 + curveAmount * 15,
      mouth.x + mouthWidth/3, mouth.y + mouthHeight/2 + curveAmount * 15,
      mouth.x + mouthWidth/2, mouth.y - mouthHeight/2
    );
    p.endShape();
    
    // Lip highlight
    p.stroke(palette.highlight[0], palette.highlight[1], palette.highlight[2], 100);
    p.strokeWeight(1);
    p.noFill();
    p.beginShape();
    p.vertex(mouth.x - mouthWidth/3, mouth.y - mouthHeight/2 + 2);
    p.bezierVertex(
      mouth.x - mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 5 + 2,
      mouth.x + mouthWidth/6, mouth.y - mouthHeight/2 - curveAmount * 5 + 2,
      mouth.x + mouthWidth/3, mouth.y - mouthHeight/2 + 2
    );
    p.endShape();
    
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
