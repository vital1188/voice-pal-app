// Sleek AI Face with Particle Formation

let sketch = function(p) {
  // Color palette - modern neon colors
  const palette = {
    dark: [23, 26, 33],
    primary: [88, 101, 242], // Discord-inspired blurple
    accent1: [170, 120, 255], // Purple
    accent2: [255, 115, 170], // Pink
    accent3: [87, 242, 135], // Green
    highlight: [255, 255, 255]
  };
  
  // Robot face parameters
  let faceWidth, faceHeight;
  let leftEye, rightEye, mouth;
  let faceParticles = []; // Particles that form the face
  let backgroundParticles = []; // Background particles
  let audioLevel = 0;
  let isListening = false;
  let blinkTimer = 0;
  let mouthMovement = 0;
  let expressionState = 'neutral'; // neutral, happy, thinking, surprised
  let expressionTimer = 0;
  let faceOpacity = 0; // For fade-in effect
  
  // Audio visualization data
  let audioData = [];
  for (let i = 0; i < 30; i++) {
    audioData.push(0);
  }
  
  // Flag to track if robot is in fullscreen mode
  let isFullscreen = false;
  
  // Face outline points for particle formation
  let faceOutlinePoints = [];
  let leftEyePoints = [];
  let rightEyePoints = [];
  let mouthPoints = [];
  
  p.setup = function() {
    // Create canvas that covers the entire window
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-2');
    
    // Calculate face dimensions based on window size
    faceWidth = p.min(p.width * 0.8, 1200);
    faceHeight = p.min(p.height * 0.8, 800);
    
    // Initialize eyes and mouth
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.4;
    const eyeSpacing = faceWidth * 0.25;
    
    // Generate face outline points
    generateFaceOutlinePoints();
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.4,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0, // 0 = open, 1 = closed
      glowIntensity: 0.8
    };
    
    rightEye = {
      x: p.width / 2 + eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.4,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      glowIntensity: 0.8
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.8,
      width: faceWidth * 0.3,
      height: eyeSize * 0.6,
      openAmount: 0.2, // 0 = closed, 1 = fully open
      curveAmount: 0.1, // positive = smile, negative = frown
      glowIntensity: 0.8
    };
    
    // Create particles for face formation
    createFaceParticles();
    
    // Create particles for background effect
    for (let i = 0; i < 80; i++) {
      backgroundParticles.push({
        pos: p.createVector(p.random(p.width), p.random(p.height)),
        vel: p.createVector(p.random(-0.3, 0.3), p.random(-0.3, 0.3)),
        size: p.random(1, 2.5),
        color: p.random([palette.primary, palette.accent1, palette.accent2, palette.accent3]),
        alpha: p.random(40, 100),
        pulse: p.random(0, p.TWO_PI) // For pulsing effect
      });
    }
    
    // Set up drawing parameters
    p.background(palette.dark);
    p.frameRate(60);
    
    // Start with face opacity at 0 for fade-in effect
    faceOpacity = 0;
    
    // Make global function to update audio level
    window.updateRobotAudioLevel = function(level) {
      audioLevel = level;
      isListening = true;
      
      // Update audio data array (simple simulation)
      audioData.shift();
      audioData.push(level * 5);
      
      // Make particles react to audio
      reactParticlesToAudio(level);
    };
    
    // Make global function to set robot expression
    window.setRobotExpression = function(expression) {
      expressionState = expression;
      expressionTimer = 180; // 3 seconds at 60fps
      
      // Update face particles for new expression
      updateFaceParticlesForExpression(expression);
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
      
      // Regenerate face outline points for new dimensions
      generateFaceOutlinePoints();
      
      // Recreate face particles for new dimensions
      faceParticles = [];
      createFaceParticles();
      
      // Add more background particles
      for (let i = 0; i < 40; i++) {
        backgroundParticles.push({
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(p.random(-0.4, 0.4), p.random(-0.4, 0.4)),
          size: p.random(1.5, 3),
          color: p.random([palette.primary, palette.accent1, palette.accent2, palette.accent3]),
          alpha: p.random(40, 100),
          pulse: p.random(0, p.TWO_PI)
        });
      }
      
      // Set a happy expression initially
      setRobotExpression('happy');
    };
  };
  
  // Generate points that outline the face features
  function generateFaceOutlinePoints() {
    // Clear previous points
    faceOutlinePoints = [];
    leftEyePoints = [];
    rightEyePoints = [];
    mouthPoints = [];
    
    // Generate points for left eye (circle)
    const leftEyePointCount = 20;
    for (let i = 0; i < leftEyePointCount; i++) {
      const angle = p.map(i, 0, leftEyePointCount, 0, p.TWO_PI);
      const x = leftEye.x + p.cos(angle) * (leftEye.size / 2);
      const y = leftEye.y + p.sin(angle) * (leftEye.size / 2);
      leftEyePoints.push({x, y});
    }
    
    // Generate points for right eye (circle)
    const rightEyePointCount = 20;
    for (let i = 0; i < rightEyePointCount; i++) {
      const angle = p.map(i, 0, rightEyePointCount, 0, p.TWO_PI);
      const x = rightEye.x + p.cos(angle) * (rightEye.size / 2);
      const y = rightEye.y + p.sin(angle) * (rightEye.size / 2);
      rightEyePoints.push({x, y});
    }
    
    // Generate points for mouth (curved shape)
    const mouthPointCount = 30;
    const mouthHeight = mouth.height * 0.5; // Default open amount
    const curveOffset = mouth.width * 0.1; // Default curve amount
    
    // Top curve of mouth
    for (let i = 0; i <= mouthPointCount/2; i++) {
      const t = p.map(i, 0, mouthPointCount/2, 0, 1);
      const x = p.bezierPoint(
        mouth.x - mouth.width / 2, 
        mouth.x - mouth.width / 4, 
        mouth.x + mouth.width / 4, 
        mouth.x + mouth.width / 2, 
        t
      );
      const y = p.bezierPoint(
        mouth.y - mouthHeight / 2 + curveOffset,
        mouth.y - mouthHeight / 2 - curveOffset,
        mouth.y - mouthHeight / 2 - curveOffset,
        mouth.y - mouthHeight / 2 + curveOffset,
        t
      );
      mouthPoints.push({x, y});
    }
    
    // Bottom curve of mouth (in reverse to connect properly)
    for (let i = mouthPointCount/2; i >= 0; i--) {
      const t = p.map(i, 0, mouthPointCount/2, 0, 1);
      const x = p.bezierPoint(
        mouth.x + mouth.width / 2,
        mouth.x + mouth.width / 4,
        mouth.x - mouth.width / 4,
        mouth.x - mouth.width / 2,
        t
      );
      const y = p.bezierPoint(
        mouth.y + mouthHeight / 2 - curveOffset,
        mouth.y + mouthHeight / 2 + curveOffset,
        mouth.y + mouthHeight / 2 + curveOffset,
        mouth.y + mouthHeight / 2 - curveOffset,
        t
      );
      mouthPoints.push({x, y});
    }
    
    // Combine all points for the face outline
    faceOutlinePoints = [...leftEyePoints, ...rightEyePoints, ...mouthPoints];
  }
  
  // Create particles that will form the face
  function createFaceParticles() {
    // Create particles for each point in the face outline
    for (let point of faceOutlinePoints) {
      // Add some randomness to initial positions
      const randomOffset = 100; // Particles start from random positions and move to their targets
      
      faceParticles.push({
        pos: p.createVector(
          p.random(p.width), 
          p.random(p.height)
        ),
        target: p.createVector(point.x, point.y),
        vel: p.createVector(0, 0),
        size: p.random(2, 3.5),
        color: determineParticleColor(point),
        alpha: p.random(180, 255),
        arrived: false,
        jitter: p.random(0.5, 2), // Random jitter amount
        jitterPhase: p.random(p.TWO_PI) // Random phase for jitter
      });
    }
  }
  
  // Determine particle color based on its position
  function determineParticleColor(point) {
    // Check if point is part of left eye
    if (p.dist(point.x, point.y, leftEye.x, leftEye.y) <= leftEye.size/2 + 5) {
      return palette.primary;
    }
    // Check if point is part of right eye
    else if (p.dist(point.x, point.y, rightEye.x, rightEye.y) <= rightEye.size/2 + 5) {
      return palette.primary;
    }
    // Check if point is part of mouth
    else if (point.y > mouth.y - mouth.height && point.y < mouth.y + mouth.height &&
             point.x > mouth.x - mouth.width/2 && point.x < mouth.x + mouth.width/2) {
      return palette.accent2;
    }
    // Default color
    else {
      return p.random([palette.primary, palette.accent1]);
    }
  }
  
  // Make particles react to audio input
  function reactParticlesToAudio(level) {
    const energyFactor = level * 3; // Scale the effect
    
    // Make face particles react
    for (let particle of faceParticles) {
      // Add some velocity based on audio level
      particle.vel.add(p.createVector(
        p.random(-energyFactor, energyFactor),
        p.random(-energyFactor, energyFactor)
      ));
    }
    
    // Make background particles react too
    for (let particle of backgroundParticles) {
      particle.vel.add(p.createVector(
        p.random(-energyFactor * 0.5, energyFactor * 0.5),
        p.random(-energyFactor * 0.5, energyFactor * 0.5)
      ));
      
      // Increase size temporarily
      particle.size += energyFactor * 0.5;
      // Limit size
      particle.size = p.constrain(particle.size, 1, 5);
    }
  }
  
  // Update face particles for different expressions
  function updateFaceParticlesForExpression(expression) {
    // Different particle behaviors for different expressions
    switch(expression) {
      case 'happy':
        // Make particles more energetic
        for (let particle of faceParticles) {
          particle.jitter *= 1.5;
        }
        break;
      case 'thinking':
        // Make particles move more slowly and deliberately
        for (let particle of faceParticles) {
          particle.jitter *= 0.7;
        }
        break;
      case 'surprised':
        // Make particles scatter briefly then return
        for (let particle of faceParticles) {
          particle.vel.add(p.createVector(
            p.random(-5, 5),
            p.random(-5, 5)
          ));
        }
        break;
    }
  }
  
  p.draw = function() {
    // Create a fade effect
    p.fill(palette.dark[0], palette.dark[1], palette.dark[2], 15);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
    
    // Update and draw background particles
    updateBackgroundParticles();
    
    // Update and draw face particles
    updateFaceParticles();
    
    // Update robot face parameters
    updateRobotFace();
    
    // Gradually increase face opacity for fade-in effect
    if (faceOpacity < 255) {
      faceOpacity += 2;
    }
    
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
        updateFaceParticlesForExpression('neutral');
      }
    }
  };
  
  function updateBackgroundParticles() {
    for (let i = 0; i < backgroundParticles.length; i++) {
      let particle = backgroundParticles[i];
      
      // Update pulse phase
      particle.pulse += 0.02;
      
      // Pulsing size effect
      const pulseFactor = 0.3 * p.sin(particle.pulse) + 1;
      
      // Move particle
      particle.pos.add(particle.vel);
      
      // Add some drag to slow particles down
      particle.vel.mult(0.98);
      
      // Edge wrapping
      if (particle.pos.x < 0) particle.pos.x = p.width;
      if (particle.pos.x > p.width) particle.pos.x = 0;
      if (particle.pos.y < 0) particle.pos.y = p.height;
      if (particle.pos.y > p.height) particle.pos.y = 0;
      
      // Store original size if not already stored
      if (!particle.originalSize) {
        particle.originalSize = particle.size;
      }
      
      // Gradually reduce size back to normal
      if (particle.size > particle.originalSize) {
        particle.size *= 0.95;
      }
      
      // Draw particle with glow effect
      p.noStroke();
      
      // Glow effect
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha * 0.3);
      p.ellipse(particle.pos.x, particle.pos.y, particle.size * 2 * pulseFactor);
      
      // Core
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha);
      p.ellipse(particle.pos.x, particle.pos.y, particle.size * pulseFactor);
    }
  }
  
  function updateFaceParticles() {
    for (let i = 0; i < faceParticles.length; i++) {
      let particle = faceParticles[i];
      
      // Calculate direction to target
      const direction = p5.Vector.sub(particle.target, particle.pos);
      
      // If particle is far from target, move towards it
      if (direction.mag() > 5 && !particle.arrived) {
        direction.normalize();
        direction.mult(0.8); // Speed factor
        particle.vel.add(direction);
        particle.vel.limit(3); // Max speed
      } else {
        particle.arrived = true;
        
        // Add jitter to particles that have arrived
        const time = p.frameCount * 0.05;
        const jitterX = p.cos(time + particle.jitterPhase) * particle.jitter;
        const jitterY = p.sin(time + particle.jitterPhase) * particle.jitter;
        
        particle.vel.x = jitterX * 0.2;
        particle.vel.y = jitterY * 0.2;
        
        // Add audio reactivity
        particle.vel.mult(1 + audioLevel);
      }
      
      // Apply velocity
      particle.pos.add(particle.vel);
      
      // Add some drag
      particle.vel.mult(0.9);
      
      // Draw particle with glow effect
      p.noStroke();
      
      // Glow effect
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha * 0.3 * (faceOpacity/255));
      p.ellipse(particle.pos.x, particle.pos.y, particle.size * 2);
      
      // Core
      p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha * (faceOpacity/255));
      p.ellipse(particle.pos.x, particle.pos.y, particle.size);
    }
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
    drawEye(leftEye, palette.primary);
    drawEye(rightEye, palette.primary);
    
    // Draw mouth
    drawMouth(mouth, palette.accent2);
    
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
    if (mouth.openAmount < 0.2) return;
    
    const visualizerWidth = mouth.width * 0.8;
    const visualizerHeight = mouth.height * mouth.openAmount * 0.8;
    const barWidth = visualizerWidth / audioData.length;
    
    p.push();
    p.noStroke();
    p.fill(255, 255, 255, 150);
    
    for (let i = 0; i < audioData.length; i++) {
      const barHeight = p.map(audioData[i], 0, 5, 2, visualizerHeight);
      const x = mouth.x - visualizerWidth / 2 + i * barWidth;
      const y = mouth.y;
      
      p.rect(x, y - barHeight / 2, barWidth - 1, barHeight);
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
