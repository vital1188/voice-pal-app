// Kubrick-inspired AI Interface using p5.js

let sketch = function(p) {
  // Color palette - 2001: A Space Odyssey inspired colors
  const palette = {
    black: [0, 0, 0],
    white: [240, 240, 240],
    red: [220, 20, 60],
    blue: [0, 149, 237],
    gold: [212, 175, 55],
    // 2001: A Space Odyssey specific colors
    halRed: [255, 30, 30],
    spacecraftWhite: [230, 230, 230],
    computerBlue: [70, 130, 180],
    spaceBlack: [5, 5, 15],
    starlight: [255, 255, 220]
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
    // Draw 2001: A Space Odyssey inspired environment
    
    // First draw the basic one-point perspective grid for the spacecraft interior
    p.stroke(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 30);
    p.strokeWeight(1);
    
    // Draw clean, geometric grid lines
    for (let i = 0; i < grid.length; i++) {
      const line = grid[i];
      p.line(line.x1, line.y1, line.x2, line.y2);
    }
    
    // Draw the iconic white panels with geometric patterns from the spacecraft
    const panelSize = 80; // Size of each panel
    const rows = Math.ceil(p.height / panelSize) + 1;
    const cols = Math.ceil(p.width / panelSize) + 1;
    
    // Calculate perspective scaling factor based on distance from vanishing point
    const vanishingPoint = { x: p.width / 2, y: p.height / 2 };
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate base position of panel
        let x = col * panelSize;
        let y = row * panelSize;
        
        // Calculate distance from vanishing point
        const distX = x - vanishingPoint.x;
        const distY = y - vanishingPoint.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        // Scale size based on distance (perspective effect)
        const perspectiveScale = p.map(dist, 0, p.width, 0.2, 1);
        const scaledSize = panelSize * perspectiveScale;
        
        // Calculate position with perspective (closer to vanishing point)
        const perspectiveX = vanishingPoint.x + distX * perspectiveScale;
        const perspectiveY = vanishingPoint.y + distY * perspectiveScale;
        
        // Draw panel
        p.push();
        p.translate(perspectiveX, perspectiveY);
        
        // Panel background
        p.noStroke();
        p.fill(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 10);
        p.rect(-scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
        
        // Panel border
        p.noFill();
        p.stroke(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 20);
        p.strokeWeight(1);
        p.rect(-scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
        
        // Add geometric details to some panels (like the light panels in the spacecraft)
        if ((row + col) % 4 === 0) {
          // Light panel
          p.noStroke();
          p.fill(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 15);
          p.rect(-scaledSize/3, -scaledSize/3, scaledSize*2/3, scaledSize*2/3);
          
          // Add subtle glow effect
          const glowIntensity = (Math.sin(time * 0.5 + row * 0.2 + col * 0.3) + 1) / 2 * 10 + 5;
          p.fill(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], glowIntensity);
          p.rect(-scaledSize/4, -scaledSize/4, scaledSize/2, scaledSize/2);
        } else if ((row + col) % 4 === 1) {
          // Computer panel with HAL-like details
          p.stroke(palette.computerBlue[0], palette.computerBlue[1], palette.computerBlue[2], 20);
          p.strokeWeight(0.5);
          
          // Draw computer lines
          for (let i = 0; i < 3; i++) {
            const lineY = -scaledSize/3 + (i * scaledSize/3);
            p.line(-scaledSize/3, lineY, scaledSize/3, lineY);
          }
          
          // Add a small HAL-like red dot
          if (Math.random() < 0.3) {
            p.fill(palette.halRed[0], palette.halRed[1], palette.halRed[2], 30);
            p.noStroke();
            p.ellipse(0, 0, scaledSize/10);
          }
        }
        
        p.pop();
      }
    }
    
    // Add circular windows/portals like in the spacecraft
    const portalCount = 3;
    const portalSpacing = p.width / (portalCount + 1);
    const portalRadius = p.width * 0.08;
    
    for (let i = 1; i <= portalCount; i++) {
      const x = i * portalSpacing;
      const distFromCenter = Math.abs(x - p.width / 2);
      const perspectiveScale = p.map(distFromCenter, 0, p.width / 2, 0.7, 1);
      
      // Draw portal frame
      p.noFill();
      p.stroke(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 40);
      p.strokeWeight(3);
      p.ellipse(x, p.height / 2, portalRadius * 2 * perspectiveScale);
      
      // Draw inner portal frame
      p.stroke(palette.spacecraftWhite[0], palette.spacecraftWhite[1], palette.spacecraftWhite[2], 30);
      p.strokeWeight(1);
      p.ellipse(x, p.height / 2, portalRadius * 1.8 * perspectiveScale);
      
      // Draw space through the portal
      p.fill(palette.spaceBlack[0], palette.spaceBlack[1], palette.spaceBlack[2], 40);
      p.noStroke();
      p.ellipse(x, p.height / 2, portalRadius * 1.7 * perspectiveScale);
      
      // Add a few stars in the portal
      for (let j = 0; j < 5; j++) {
        const starAngle = Math.random() * Math.PI * 2;
        const starDist = Math.random() * portalRadius * 0.7 * perspectiveScale;
        const starX = x + Math.cos(starAngle) * starDist;
        const starY = p.height / 2 + Math.sin(starAngle) * starDist;
        
        p.fill(palette.starlight[0], palette.starlight[1], palette.starlight[2], 
               100 + Math.sin(time * 2 + j) * 50);
        p.ellipse(starX, starY, 1 + Math.random());
      }
    }
  }
  
  function drawMonolith() {
    // Draw 2001: A Space Odyssey iconic monolith
    p.push();
    
    // Position in center of screen
    p.translate(p.width / 2, p.height / 2);
    
    // Calculate monolith dimensions using the golden ratio (1:4:9)
    const monolithWidth = p.width * 0.08;
    const monolithHeight = monolithWidth * 4;
    const monolithDepth = monolithWidth / 9;
    
    // Since we're not in WEBGL mode, simulate rotation by adjusting width
    const rotationAmount = Math.sin(time * 0.1) * 0.2;
    const adjustedWidth = monolithWidth * (1 + Math.abs(rotationAmount));
    
    // Draw monolith with perfect black
    p.fill(0, 0, 0);
    p.noStroke();
    p.rect(-adjustedWidth / 2, -monolithHeight / 2, adjustedWidth, monolithHeight);
    
    // Add subtle edge highlight
    p.stroke(255, 255, 255, 20);
    p.strokeWeight(1);
    p.noFill();
    p.rect(-adjustedWidth / 2, -monolithHeight / 2, adjustedWidth, monolithHeight);
    
    // Add mysterious glow effect around the monolith
    const glowSize = 10;
    p.noStroke();
    for (let i = 0; i < glowSize; i++) {
      const alpha = p.map(i, 0, glowSize, 15, 0);
      p.fill(255, 255, 255, alpha);
      p.rect(
        -adjustedWidth / 2 - i, 
        -monolithHeight / 2 - i, 
        adjustedWidth + i * 2, 
        monolithHeight + i * 2
      );
    }
    
    // Add subtle star alignment effect
    if (Math.sin(time * 0.5) > 0.9) {
      // Rare alignment event
      p.stroke(255, 255, 255, 50);
      p.strokeWeight(1);
      p.line(0, -monolithHeight, 0, -p.height);
      
      // Add a bright star at the top
      p.fill(255, 255, 255, 200);
      p.noStroke();
      p.ellipse(0, -p.height * 0.4, 3, 3);
      
      // Add subtle rays
      p.stroke(255, 255, 255, 20);
      p.strokeWeight(0.5);
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const rayLength = 20 + Math.sin(time * 3) * 10;
        p.line(
          0, 
          -p.height * 0.4, 
          Math.cos(angle) * rayLength, 
          -p.height * 0.4 + Math.sin(angle) * rayLength
        );
      }
    }
    
    // Add HAL-like reflection on the monolith
    const reflectionSize = monolithWidth * 0.3;
    const reflectionY = -monolithHeight * 0.1;
    
    // Only show reflection occasionally
    if (Math.sin(time * 0.3) > 0.7) {
      // Red HAL eye reflection
      const reflectionAlpha = p.map(Math.sin(time * 0.3), 0.7, 1, 0, 40);
      p.fill(palette.halRed[0], palette.halRed[1], palette.halRed[2], reflectionAlpha);
      p.noStroke();
      p.ellipse(0, reflectionY, reflectionSize, reflectionSize);
      
      // Inner reflection
      p.fill(255, 255, 255, reflectionAlpha * 0.7);
      p.ellipse(0, reflectionY, reflectionSize * 0.6, reflectionSize * 0.6);
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
    
    // Draw minimalist eyes with elegant style
    drawMinimalistEye(leftEye, palette.red);
    drawMinimalistEye(rightEye, palette.red);
    
    // Draw minimalist mouth with blue accent
    drawMinimalistMouth(mouth, palette.blue);
    
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
