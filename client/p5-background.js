// Kubrick-inspired AI Interface using p5.js

let sketch = function(p) {
  // Color palette - Kubrick-inspired stark contrasts
  const palette = {
    black: [0, 0, 0],
    white: [240, 240, 240],
    red: [220, 20, 60],
    blue: [0, 149, 237],
    gold: [212, 175, 55]
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
    // Create a fade effect for space background
    p.fill(palette.black[0], palette.black[1], palette.black[2], 20);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
    
    // Increment time
    time += 0.01;
    
    // Draw stars
    drawStars();
    
    // Draw one-point perspective grid
    drawGrid();
    
    // Draw monolith
    drawMonolith();
    
    // Update HAL 9000 interface
    updateHALInterface();
    
    // Draw HAL 9000 interface
    drawHALInterface();
    
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
  
  function drawHALInterface() {
    p.push();
    
    // Draw geometric eyes with stark colors
    drawGeometricEye(leftEye, palette.red);
    drawGeometricEye(rightEye, palette.red);
    
    // Draw geometric mouth with blue accent
    drawGeometricMouth(mouth, palette.blue);
    
    p.pop();
  }
  
  // New abstract geometric face elements
  function drawGeometricEye(eye, color) {
    p.push();
    
    // Create a geometric eye with concentric squares instead of circles
    const glowSize = eye.size * (1 + eye.glowIntensity * 0.3);
    
    // Outer glow - rotated square
    p.push();
    p.translate(eye.x, eye.y);
    p.rotate(p.frameCount * 0.005); // Slow rotation
    p.noStroke();
    p.fill(color[0], color[1], color[2], 30 * eye.glowIntensity);
    p.rectMode(p.CENTER);
    p.rect(0, 0, glowSize * 1.5, glowSize * 1.5);
    p.pop();
    
    // Middle glow - opposite rotation
    p.push();
    p.translate(eye.x, eye.y);
    p.rotate(-p.frameCount * 0.003); // Opposite rotation
    p.noStroke();
    p.fill(color[0], color[1], color[2], 50 * eye.glowIntensity);
    p.rectMode(p.CENTER);
    p.rect(0, 0, glowSize * 1.2, glowSize * 1.2);
    p.pop();
    
    // Eye socket - precise square
    p.push();
    p.translate(eye.x, eye.y);
    p.stroke(color[0], color[1], color[2]);
    p.strokeWeight(2);
    p.noFill();
    p.rectMode(p.CENTER);
    p.rect(0, 0, eye.size, eye.size);
    p.pop();
    
    // Account for blinking with vertical scaling
    const eyeHeight = eye.size * (1 - eye.blinkState);
    if (eyeHeight > 1) {
      // Inner eye - filled square
      p.push();
      p.translate(eye.x, eye.y);
      p.noStroke();
      p.fill(color[0], color[1], color[2], 100);
      p.rectMode(p.CENTER);
      p.rect(0, 0, eye.size * 0.8, eyeHeight * 0.8);
      p.pop();
      
      // Pupil - smaller square with offset
      p.push();
      p.translate(eye.x + eye.pupilOffset.x, eye.y + eye.pupilOffset.y);
      p.rotate(p.frameCount * 0.01); // Subtle rotation
      p.fill(255);
      p.rectMode(p.CENTER);
      p.rect(0, 0, eye.pupilSize * 0.8, eye.pupilSize * 0.8);
      
      // Pupil highlight - even smaller square
      p.fill(color[0], color[1], color[2], 200);
      p.rect(eye.pupilSize * -0.1, eye.pupilSize * -0.1, eye.pupilSize * 0.3, eye.pupilSize * 0.3);
      p.pop();
      
      // Add crosshair lines for a technical look
      p.stroke(color[0], color[1], color[2], 150);
      p.strokeWeight(1);
      p.line(eye.x - eye.size/2, eye.y, eye.x + eye.size/2, eye.y);
      p.line(eye.x, eye.y - eye.size/2, eye.x, eye.y + eye.size/2);
    }
    
    p.pop();
  }
  
  function drawGeometricMouth(mouth, color) {
    p.push();
    
    // Calculate mouth dimensions based on openAmount
    const mouthHeight = mouth.height * mouth.openAmount;
    const mouthWidth = mouth.width;
    const curveOffset = mouth.width * mouth.curveAmount;
    
    // Outer glow - rectangle
    p.noStroke();
    p.fill(color[0], color[1], color[2], 30 * mouth.glowIntensity);
    p.rectMode(p.CENTER);
    p.rect(mouth.x, mouth.y, mouthWidth + 10, mouthHeight + 10);
    
    // Inner glow
    p.fill(color[0], color[1], color[2], 50 * mouth.glowIntensity);
    p.rect(mouth.x, mouth.y, mouthWidth + 4, mouthHeight + 4);
    
    // Mouth outline - precise geometric shape
    p.stroke(color[0], color[1], color[2]);
    p.strokeWeight(2);
    p.noFill();
    p.rectMode(p.CENTER);
    
    // Draw mouth as a series of horizontal lines that respond to openAmount
    const lineCount = Math.max(3, Math.floor(mouthHeight / 4));
    const lineSpacing = mouthHeight / (lineCount - 1);
    
    for (let i = 0; i < lineCount; i++) {
      // Calculate y position for each line
      const y = mouth.y - mouthHeight/2 + i * lineSpacing;
      
      // Calculate line width based on expression (curveAmount)
      // Center lines are longer for positive curveAmount (smile)
      // Center lines are shorter for negative curveAmount (frown)
      let lineWidthMultiplier;
      
      if (curveOffset > 0) { // Smile
        lineWidthMultiplier = i === 0 || i === lineCount - 1 ? 
          0.7 : // First and last lines are shorter
          1 + (curveOffset / mouthWidth) * Math.sin(Math.PI * i / (lineCount - 1)); // Middle lines are longer
      } else { // Neutral or frown
        lineWidthMultiplier = i === 0 || i === lineCount - 1 ? 
          1 : // First and last lines are full width
          1 + (curveOffset / mouthWidth) * Math.sin(Math.PI * i / (lineCount - 1)); // Middle lines are shorter
      }
      
      const lineWidth = mouthWidth * lineWidthMultiplier;
      
      // Draw the line
      p.stroke(color[0], color[1], color[2], 150 + 105 * (i / lineCount)); // Varying opacity
      p.line(mouth.x - lineWidth/2, y, mouth.x + lineWidth/2, y);
    }
    
    // Add vertical lines at the edges for a more structured look
    if (mouthHeight > 5) {
      p.stroke(color[0], color[1], color[2], 100);
      p.line(mouth.x - mouthWidth/2, mouth.y - mouthHeight/2, mouth.x - mouthWidth/2, mouth.y + mouthHeight/2);
      p.line(mouth.x + mouthWidth/2, mouth.y - mouthHeight/2, mouth.x + mouthWidth/2, mouth.y + mouthHeight/2);
    }
    
    // Add audio level visualization as vertical bars
    if (mouth.openAmount > 0.1) {
      const barCount = 7; // Odd number for symmetry
      const barWidth = mouthWidth / (barCount * 2);
      const maxBarHeight = mouthHeight * 0.7;
      
      p.noStroke();
      p.fill(color[0], color[1], color[2], 180);
      
      for (let i = 0; i < barCount; i++) {
        // Calculate audio level for this bar - center bars are taller
        const centerFactor = 1 - Math.abs((i - (barCount-1)/2) / ((barCount-1)/2));
        const barHeight = maxBarHeight * audioLevel * (0.3 + 0.7 * centerFactor);
        
        // Position bars symmetrically
        const x = mouth.x - (barCount-1)/2 * barWidth * 2 + i * barWidth * 2;
        
        // Draw bar
        p.rectMode(p.CORNER);
        p.rect(x, mouth.y - barHeight/2, barWidth, barHeight);
      }
    }
    
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
