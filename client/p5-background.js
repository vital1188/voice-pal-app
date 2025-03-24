// Kubrick-inspired AI Interface using p5.js

let sketch = function(p) {
  // Color palette - Digital neon inspired colors
  const palette = {
    black: [0, 0, 0],
    white: [240, 240, 240],
    neonBlue: [0, 195, 255],
    neonPink: [255, 0, 153],
    neonGreen: [57, 255, 20],
    neonPurple: [187, 41, 255],
    darkBlue: [5, 10, 25],
    gridColor: [20, 40, 80],
    glowColor: [100, 200, 255]
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
    // Draw digital neon grid background
    p.background(palette.darkBlue[0], palette.darkBlue[1], palette.darkBlue[2], 10);
    
    // Draw horizontal grid lines
    const gridSpacing = 40;
    const rows = Math.ceil(p.height / gridSpacing);
    const cols = Math.ceil(p.width / gridSpacing);
    
    // Draw horizontal grid lines
    for (let row = 0; row <= rows; row++) {
      const y = row * gridSpacing;
      const alpha = 30 + Math.sin(time * 0.5 + row * 0.1) * 10;
      p.stroke(palette.gridColor[0], palette.gridColor[1], palette.gridColor[2], alpha);
      p.strokeWeight(1);
      p.line(0, y, p.width, y);
    }
    
    // Draw vertical grid lines
    for (let col = 0; col <= cols; col++) {
      const x = col * gridSpacing;
      const alpha = 30 + Math.sin(time * 0.5 + col * 0.1) * 10;
      p.stroke(palette.gridColor[0], palette.gridColor[1], palette.gridColor[2], alpha);
      p.strokeWeight(1);
      p.line(x, 0, x, p.height);
    }
    
    // Add some random glowing points at grid intersections
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        // Only draw some points (randomly)
        if (Math.random() < 0.03) {
          const x = col * gridSpacing;
          const y = row * gridSpacing;
          
          // Choose a random neon color
          const colors = [palette.neonBlue, palette.neonPink, palette.neonGreen, palette.neonPurple];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          // Draw glowing point
          const pulseSize = 3 + Math.sin(time * 2 + row * col * 0.1) * 2;
          
          // Outer glow
          p.noStroke();
          p.fill(color[0], color[1], color[2], 30);
          p.ellipse(x, y, pulseSize * 3);
          
          // Inner glow
          p.fill(color[0], color[1], color[2], 70);
          p.ellipse(x, y, pulseSize * 1.5);
          
          // Core
          p.fill(color[0], color[1], color[2], 200);
          p.ellipse(x, y, pulseSize * 0.8);
        }
      }
    }
    
    // Add some floating particles
    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(time * 0.5 + i * 1.5) * 0.5 + 0.5) * p.width;
      const y = (Math.cos(time * 0.3 + i * 2.1) * 0.5 + 0.5) * p.height;
      
      // Choose a random neon color
      const colors = [palette.neonBlue, palette.neonPink, palette.neonGreen, palette.neonPurple];
      const color = colors[i % colors.length];
      
      // Draw floating particle with glow
      p.noStroke();
      p.fill(color[0], color[1], color[2], 20);
      p.ellipse(x, y, 30);
      p.fill(color[0], color[1], color[2], 40);
      p.ellipse(x, y, 20);
      p.fill(color[0], color[1], color[2], 100);
      p.ellipse(x, y, 10);
      p.fill(255);
      p.ellipse(x, y, 3);
    }
    
    // Add some horizontal scan lines for digital effect
    for (let i = 0; i < p.height; i += 4) {
      if (Math.random() < 0.7) {
        p.stroke(255, 255, 255, 3);
        p.line(0, i, p.width, i);
      }
    }
  }
  
  function drawMonolith() {
    // Draw digital circuit pattern in the background
    p.push();
    
    // Draw some digital circuit lines
    const lineCount = 15;
    const spacing = p.width / lineCount;
    
    for (let i = 0; i < lineCount; i++) {
      // Choose a random neon color
      const colors = [palette.neonBlue, palette.neonPink, palette.neonGreen, palette.neonPurple];
      const color = colors[i % colors.length];
      
      // Starting position
      const startX = i * spacing;
      let currentX = startX;
      let currentY = 0;
      
      // Draw a path with right angles (circuit-like)
      p.stroke(color[0], color[1], color[2], 40);
      p.strokeWeight(2);
      p.noFill();
      
      p.beginShape();
      p.vertex(currentX, currentY);
      
      // Create a series of right-angle turns
      const segmentCount = Math.floor(Math.random() * 5) + 5;
      for (let j = 0; j < segmentCount; j++) {
        // Decide whether to go horizontal or vertical
        if (j % 2 === 0) {
          // Horizontal movement
          currentX += (Math.random() - 0.5) * spacing * 2;
          currentX = p.constrain(currentX, 0, p.width);
        } else {
          // Vertical movement
          currentY += Math.random() * p.height / segmentCount;
          currentY = p.constrain(currentY, 0, p.height);
        }
        
        p.vertex(currentX, currentY);
      }
      
      // Ensure the path reaches the bottom
      p.vertex(currentX, p.height);
      p.endShape();
      
      // Add some nodes at the vertices
      const nodeSize = 4 + Math.sin(time * 2 + i) * 2;
      p.noStroke();
      p.fill(color[0], color[1], color[2], 100);
      
      currentX = startX;
      currentY = 0;
      p.ellipse(currentX, currentY, nodeSize);
      
      for (let j = 0; j < segmentCount; j++) {
        if (j % 2 === 0) {
          currentX += (Math.random() - 0.5) * spacing * 2;
          currentX = p.constrain(currentX, 0, p.width);
        } else {
          currentY += Math.random() * p.height / segmentCount;
          currentY = p.constrain(currentY, 0, p.height);
        }
        
        // Pulse the nodes
        const pulseSize = nodeSize * (0.8 + Math.sin(time * 3 + i + j) * 0.2);
        
        // Draw node with glow
        p.fill(color[0], color[1], color[2], 30);
        p.ellipse(currentX, currentY, pulseSize * 3);
        p.fill(color[0], color[1], color[2], 70);
        p.ellipse(currentX, currentY, pulseSize * 1.5);
        p.fill(color[0], color[1], color[2], 150);
        p.ellipse(currentX, currentY, pulseSize);
      }
    }
    
    // Add some floating digital particles
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(time * 0.2 + i * 0.5) * 0.5 + 0.5) * p.width;
      const y = (Math.cos(time * 0.3 + i * 0.7) * 0.5 + 0.5) * p.height;
      
      // Choose a random neon color
      const colors = [palette.neonBlue, palette.neonPink, palette.neonGreen, palette.neonPurple];
      const color = colors[i % colors.length];
      
      // Draw digital particle
      p.noStroke();
      p.fill(color[0], color[1], color[2], 50);
      
      // Random shapes for particles
      const shapeType = i % 3;
      if (shapeType === 0) {
        // Circle
        p.ellipse(x, y, 8);
      } else if (shapeType === 1) {
        // Square
        p.rect(x - 4, y - 4, 8, 8);
      } else {
        // Triangle
        p.triangle(
          x, y - 5,
          x - 4, y + 3,
          x + 4, y + 3
        );
      }
    }
    
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
    
    // Draw neon eyes with digital style
    drawMinimalistEye(leftEye, palette.neonBlue);
    drawMinimalistEye(rightEye, palette.neonGreen);
    
    // Draw neon mouth with digital accent
    drawMinimalistMouth(mouth, palette.neonPink);
    
    p.pop();
  }
  
  // Elegant minimalist face elements
  function drawMinimalistEye(eye, color) {
    p.push();
    
    // Create a subtle glow effect
    const glowSize = eye.size * (1 + eye.glowIntensity * 0.3);
    
    // Outer glow - subtle pulsing circle
    p.noStroke();
    const pulseAmount = Math.sin(p.frameCount * 0.02) * 0.1 + 0.9; // Subtle pulse
    p.fill(color[0], color[1], color[2], 20 * eye.glowIntensity * pulseAmount);
    p.ellipse(eye.x, eye.y, glowSize * 1.6 * pulseAmount);
    
    // Middle glow
    p.fill(color[0], color[1], color[2], 30 * eye.glowIntensity);
    p.ellipse(eye.x, eye.y, glowSize * 1.3);
    
    // Eye outline - thin, elegant circle
    p.stroke(color[0], color[1], color[2], 180);
    p.strokeWeight(1.5);
    p.noFill();
    p.ellipse(eye.x, eye.y, eye.size);
    
    // Account for blinking with vertical scaling
    const eyeHeight = eye.size * (1 - eye.blinkState);
    if (eyeHeight > 1) {
      // Inner eye - gradient fill
      p.push();
      const gradientSteps = 5;
      for (let i = gradientSteps; i > 0; i--) {
        const ratio = i / gradientSteps;
        const alpha = 70 * ratio * eye.glowIntensity;
        p.noStroke();
        p.fill(color[0], color[1], color[2], alpha);
        p.ellipse(eye.x, eye.y, eye.size * ratio, eyeHeight * ratio);
      }
      p.pop();
      
      // Pupil - elegant circle with subtle movement
      p.noStroke();
      p.fill(255, 255, 255, 220);
      
      // Add subtle circular motion to pupil
      const orbitRadius = eye.size * 0.05;
      const orbitX = Math.sin(p.frameCount * 0.01) * orbitRadius;
      const orbitY = Math.cos(p.frameCount * 0.01) * orbitRadius;
      
      // Combine orbit with mouse/target tracking
      const finalX = eye.x + eye.pupilOffset.x + orbitX;
      const finalY = eye.y + eye.pupilOffset.y + orbitY;
      
      p.ellipse(finalX, finalY, eye.pupilSize * 0.7);
      
      // Pupil highlight - small offset circle
      p.fill(255, 255, 255, 255);
      p.ellipse(
        finalX - eye.pupilSize * 0.15,
        finalY - eye.pupilSize * 0.15,
        eye.pupilSize * 0.2
      );
      
      // Add subtle iris detail
      p.noFill();
      p.stroke(color[0], color[1], color[2], 60);
      p.strokeWeight(0.5);
      p.ellipse(eye.x, eye.y, eye.size * 0.7);
    }
    
    p.pop();
  }
  
  function drawMinimalistMouth(mouth, color) {
    p.push();
    
    // Calculate mouth dimensions
    const mouthHeight = mouth.height * mouth.openAmount;
    const mouthWidth = mouth.width;
    const curveOffset = mouth.width * mouth.curveAmount;
    
    // Subtle glow behind mouth
    p.noStroke();
    const pulseAmount = Math.sin(p.frameCount * 0.03) * 0.1 + 0.9; // Subtle pulse
    p.fill(color[0], color[1], color[2], 15 * mouth.glowIntensity * pulseAmount);
    p.ellipse(mouth.x, mouth.y, mouthWidth * 1.4, mouthHeight * 2.5);
    
    // Draw mouth outline - elegant curves
    p.stroke(color[0], color[1], color[2], 180);
    p.strokeWeight(1.5);
    p.noFill();
    
    // Top curve
    p.beginShape();
    p.vertex(mouth.x - mouthWidth / 2, mouth.y - mouthHeight / 2 + curveOffset);
    p.bezierVertex(
      mouth.x - mouthWidth / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouthWidth / 4, mouth.y - mouthHeight / 2 - curveOffset,
      mouth.x + mouthWidth / 2, mouth.y - mouthHeight / 2 + curveOffset
    );
    p.endShape();
    
    // Bottom curve
    p.beginShape();
    p.vertex(mouth.x - mouthWidth / 2, mouth.y + mouthHeight / 2 - curveOffset);
    p.bezierVertex(
      mouth.x - mouthWidth / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x + mouthWidth / 4, mouth.y + mouthHeight / 2 + curveOffset,
      mouth.x + mouthWidth / 2, mouth.y + mouthHeight / 2 - curveOffset
    );
    p.endShape();
    
    // Connect the ends with subtle lines
    p.strokeWeight(1);
    p.line(
      mouth.x - mouthWidth / 2, mouth.y - mouthHeight / 2 + curveOffset,
      mouth.x - mouthWidth / 2, mouth.y + mouthHeight / 2 - curveOffset
    );
    p.line(
      mouth.x + mouthWidth / 2, mouth.y - mouthHeight / 2 + curveOffset,
      mouth.x + mouthWidth / 2, mouth.y + mouthHeight / 2 - curveOffset
    );
    
    // Add elegant audio visualization - wave form
    if (mouth.openAmount > 0.1) {
      p.noFill();
      p.stroke(color[0], color[1], color[2], 120);
      p.strokeWeight(1);
      
      // Draw a smooth wave based on audio data
      p.beginShape();
      const wavePoints = 20;
      for (let i = 0; i < wavePoints; i++) {
        const x = p.map(i, 0, wavePoints - 1, mouth.x - mouthWidth * 0.4, mouth.x + mouthWidth * 0.4);
        
        // Get audio data with wraparound
        const dataIndex = i % audioData.length;
        
        // Calculate y position based on audio data
        const amplitude = mouthHeight * 0.3 * audioData[dataIndex] / 5;
        const y = mouth.y + Math.sin(i * 0.5 + p.frameCount * 0.1) * amplitude;
        
        p.vertex(x, y);
      }
      p.endShape();
      
      // Add subtle horizontal center line
      p.stroke(color[0], color[1], color[2], 60);
      p.line(mouth.x - mouthWidth * 0.4, mouth.y, mouth.x + mouthWidth * 0.4, mouth.y);
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
    
    // Digital neon audio visualizer
    
    // Draw visualizer container with neon glow
    p.stroke(palette.neonPink[0], palette.neonPink[1], palette.neonPink[2], 120);
    p.strokeWeight(2);
    p.noFill();
    p.rect(mouth.x - visualizerWidth/2, mouth.y - visualizerHeight/2, 
           visualizerWidth, visualizerHeight);
    
    // Add glow effect to container
    p.noFill();
    p.stroke(palette.neonPink[0], palette.neonPink[1], palette.neonPink[2], 40);
    p.strokeWeight(4);
    p.rect(mouth.x - visualizerWidth/2, mouth.y - visualizerHeight/2, 
           visualizerWidth, visualizerHeight);
    
    // Draw audio bars with digital neon style
    const barCount = 12; // More bars for digital look
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
      
      // Choose alternating neon colors
      const colors = [palette.neonBlue, palette.neonGreen, palette.neonPurple, palette.neonPink];
      const color = colors[i % colors.length];
      
      // Draw bar with neon glow
      // Outer glow
      p.noStroke();
      p.fill(color[0], color[1], color[2], 40);
      p.rect(x - 2, y - 2, barWidth - barSpacing + 4, barHeight + 4, 2);
      
      // Inner bar
      p.fill(color[0], color[1], color[2], 180);
      p.rect(x, y, barWidth - barSpacing, barHeight, 1);
      
      // Add horizontal scan lines for digital effect
      for (let j = 0; j < barHeight; j += 4) {
        if (Math.random() < 0.5) {
          p.stroke(255, 255, 255, 30);
          p.strokeWeight(1);
          p.line(x, y + j, x + barWidth - barSpacing, y + j);
        }
      }
    }
    
    // Add digital data points along the center
    p.stroke(255, 255, 255, 100);
    p.strokeWeight(1);
    p.line(mouth.x - visualizerWidth * 0.4, mouth.y, mouth.x + visualizerWidth * 0.4, mouth.y);
    
    for (let i = 0; i < 8; i++) {
      const x = p.map(i, 0, 7, mouth.x - visualizerWidth * 0.4, mouth.x + visualizerWidth * 0.4);
      
      // Draw data point
      p.noStroke();
      p.fill(255, 255, 255, 150);
      p.ellipse(x, mouth.y, 3, 3);
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
