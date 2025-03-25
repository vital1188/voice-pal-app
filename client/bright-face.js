// Bright Futuristic AI Face using p5.js
let sketch = function(p) {
  // Enhanced color palette with brighter colors
  const palette = {
    black: [5, 5, 10],
    darkBlue: [10, 15, 25],
    iris: [0, 255, 255],  // Brighter cyan
    accent: [50, 220, 255], // Brighter blue
    happy: [80, 255, 150], // Brighter green
    sad: [120, 170, 255], // Brighter blue
    angry: [255, 80, 80], // Brighter red
    surprised: [255, 220, 0], // Brighter yellow
    thinking: [200, 200, 255], // Brighter purple
    hologram: [0, 255, 220, 200] // Brighter teal with higher opacity
  };
  
  // Face parameters
  let faceWidth, faceHeight;
  let leftEye, rightEye, mouth;
  let audioLevel = 0;
  let isListening = false;
  let blinkTimer = 0;
  let expressionState = 'neutral';
  let time = 0;
  
  p.setup = function() {
    // Create canvas
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1'); // Changed from -2 to -1 for better visibility
    
    // Calculate face dimensions
    faceWidth = p.min(p.width * 0.7, 1000);
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Initialize eyes with larger size
    const eyeSize = faceWidth * 0.18; // Larger eyes
    const eyeY = p.height * 0.45;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.7, // Larger pupil
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      color: [...palette.iris]
    };
    
    rightEye = {
      x: p.width / 2 + eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.7, // Larger pupil
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      color: [...palette.iris]
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.7,
      width: faceWidth * 0.4, // Wider mouth
      height: eyeSize * 0.6, // Taller mouth
      openAmount: 0.3, // More open by default
      curveAmount: 0,
      color: [...palette.accent]
    };
    
    // Set up global functions
    window.updateRobotAudioLevel = function(level) {
      audioLevel = Math.min(level * 1.5, 1);
      isListening = true;
    };
    
    window.setRobotExpression = function(expression) {
      expressionState = expression;
      
      // Set colors based on expression
      switch(expression) {
        case 'happy':
          leftEye.color = [...palette.happy];
          rightEye.color = [...palette.happy];
          mouth.color = [...palette.happy];
          mouth.curveAmount = 0.5;
          break;
        case 'thinking':
          leftEye.color = [...palette.thinking];
          rightEye.color = [...palette.thinking];
          mouth.color = [...palette.accent];
          mouth.curveAmount = -0.2;
          break;
        case 'surprised':
          leftEye.color = [...palette.surprised];
          rightEye.color = [...palette.surprised];
          mouth.color = [...palette.surprised];
          mouth.curveAmount = 0;
          break;
        case 'sad':
          leftEye.color = [...palette.sad];
          rightEye.color = [...palette.sad];
          mouth.color = [...palette.sad];
          mouth.curveAmount = -0.5;
          break;
        case 'angry':
          leftEye.color = [...palette.angry];
          rightEye.color = [...palette.angry];
          mouth.color = [...palette.angry];
          mouth.curveAmount = -0.3;
          break;
        default: // neutral
          leftEye.color = [...palette.iris];
          rightEye.color = [...palette.iris];
          mouth.color = [...palette.accent];
          mouth.curveAmount = 0;
      }
    };
    
    // Set initial expression
    window.setRobotExpression('neutral');
  };
  
  p.draw = function() {
    // Draw background
    p.background(palette.black);
    
    // Draw grid lines for tech feel
    drawGrid();
    
    // Update time
    time += 0.01;
    
    // Update face
    updateFace();
    
    // Draw face
    drawFace();
    
    // Reset listening flag
    isListening = false;
  };
  
  function drawGrid() {
    // Draw subtle grid lines for tech feel
    p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 15);
    p.strokeWeight(1);
    
    // Horizontal lines
    for (let y = 0; y < p.height; y += 50) {
      p.line(0, y, p.width, y);
    }
    
    // Vertical lines
    for (let x = 0; x < p.width; x += 50) {
      p.line(x, 0, x, p.height);
    }
  }
  
  function updateFace() {
    // Handle blinking
    blinkTimer++;
    if (blinkTimer > 180 && blinkTimer < 190) {
      leftEye.blinkState = p.map(blinkTimer, 180, 185, 0, 1);
      if (blinkTimer > 185) {
        leftEye.blinkState = p.map(blinkTimer, 185, 190, 1, 0);
      }
      rightEye.blinkState = leftEye.blinkState;
    } else if (blinkTimer > 300) {
      blinkTimer = 0;
    }
    
    // Update eye pupil position based on mouse
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
    
    // Reduce audio level if not actively listening
    if (!isListening) {
      audioLevel *= 0.9;
      if (audioLevel < 0.01) audioLevel = 0;
    }
  }
  
  function drawFace() {
    // Draw face background glow
    p.noStroke();
    for (let i = 5; i > 0; i--) {
      const glowOpacity = 30 / i;
      p.fill(palette.accent[0], palette.accent[1], palette.accent[2], glowOpacity);
      p.ellipse(p.width / 2, p.height / 2, faceWidth * (1 + i * 0.1), faceHeight * (1 + i * 0.1));
    }
    
    // Draw holographic rings with animation
    drawHolographicRings();
    
    // Draw energy particles
    drawEnergyParticles();
    
    // Draw eyes
    drawEye(leftEye);
    drawEye(rightEye);
    
    // Draw mouth
    drawMouth();
    
    // Draw circuit lines
    drawCircuitLines();
  }
  
  function drawHolographicRings() {
    // Draw animated holographic rings
    p.noFill();
    
    for (let i = 0; i < 3; i++) {
      const ringPulse = Math.sin(time * 0.5 + i) * 0.5 + 0.5;
      const ringOpacity = 100 + ringPulse * 100;
      p.stroke(palette.hologram[0], palette.hologram[1], palette.hologram[2], ringOpacity);
      p.strokeWeight(2 + ringPulse);
      
      // Rotate the rings
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(time * (0.1 + i * 0.05));
      const ringSize = faceWidth * (0.8 + i * 0.15);
      p.ellipse(0, 0, ringSize, ringSize * 0.6);
      p.pop();
    }
  }
  
  function drawEnergyParticles() {
    // Draw energy particles orbiting the face
    p.noStroke();
    
    for (let i = 0; i < 20; i++) {
      const angle = time * 0.5 + i * (Math.PI / 10);
      const distance = faceWidth * 0.5 + Math.sin(time * 0.2 + i) * 20;
      const x = p.width / 2 + Math.cos(angle) * distance;
      const y = p.height / 2 + Math.sin(angle) * distance * 0.6;
      
      const particlePulse = Math.sin(time + i) * 0.5 + 0.5;
      const particleSize = 3 + particlePulse * 3;
      
      // Use expression color for particles
      let particleColor;
      switch(expressionState) {
        case 'happy': particleColor = palette.happy; break;
        case 'thinking': particleColor = palette.thinking; break;
        case 'surprised': particleColor = palette.surprised; break;
        case 'sad': particleColor = palette.sad; break;
        case 'angry': particleColor = palette.angry; break;
        default: particleColor = palette.accent;
      }
      
      p.fill(particleColor[0], particleColor[1], particleColor[2], 150 + particlePulse * 100);
      p.ellipse(x, y, particleSize);
      
      // Draw particle trail
      p.fill(particleColor[0], particleColor[1], particleColor[2], 50);
      const trailX = p.width / 2 + Math.cos(angle - 0.1) * distance;
      const trailY = p.height / 2 + Math.sin(angle - 0.1) * distance * 0.6;
      p.ellipse(trailX, trailY, particleSize * 0.7);
    }
  }
  
  function drawCircuitLines() {
    // Draw circuit-like lines
    p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 100);
    p.strokeWeight(1.5);
    
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI * 2 * (i / 8);
      const startX = p.width / 2 + Math.cos(angle) * (faceWidth * 0.3);
      const startY = p.height / 2 + Math.sin(angle) * (faceWidth * 0.3 * 0.6);
      
      const endX = p.width / 2 + Math.cos(angle) * (faceWidth * 0.6);
      const endY = p.height / 2 + Math.sin(angle) * (faceWidth * 0.6 * 0.6);
      
      // Draw segmented line with nodes
      let x = startX;
      let y = startY;
      const segments = 3;
      const segmentLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / segments;
      
      for (let j = 0; j < segments; j++) {
        const nextX = x + Math.cos(angle) * segmentLength;
        const nextY = y + Math.sin(angle) * segmentLength;
        
        // Pulse effect
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        p.stroke(palette.accent[0], palette.accent[1], palette.accent[2], 100 + pulse * 100);
        p.line(x, y, nextX, nextY);
        
        // Draw node
        if (j < segments - 1) {
          p.noStroke();
          p.fill(palette.accent[0], palette.accent[1], palette.accent[2], 150 + pulse * 100);
          p.ellipse(nextX, nextY, 4 + pulse * 2);
        }
        
        x = nextX;
        y = nextY;
      }
    }
  }
  
  function drawEye(eye) {
    // Eye socket glow - brighter and more layers
    p.noStroke();
    for (let i = 5; i > 0; i--) {
      const glowOpacity = 150 / i;
      p.fill(eye.color[0], eye.color[1], eye.color[2], glowOpacity);
      p.ellipse(eye.x, eye.y, eye.size * (1 + i * 0.1), eye.size * (1 + i * 0.1) * 0.6);
    }
    
    // Eye socket
    p.fill(palette.black);
    p.ellipse(eye.x, eye.y, eye.size, eye.size * 0.6);
    
    // Iris with layers
    if (eye.blinkState < 0.9) {
      const irisSize = p.map(eye.blinkState, 0, 0.9, eye.pupilSize, 0);
      
      // Outer iris glow
      p.fill(eye.color[0], eye.color[1], eye.color[2], 100);
      p.ellipse(
        eye.x + eye.pupilOffset.x, 
        eye.y + eye.pupilOffset.y, 
        irisSize * 1.1, 
        irisSize * 1.1 * 0.6
      );
      
      // Main iris
      p.fill(eye.color[0], eye.color[1], eye.color[2], 230);
      p.ellipse(
        eye.x + eye.pupilOffset.x, 
        eye.y + eye.pupilOffset.y, 
        irisSize, 
        irisSize * 0.6
      );
      
      // Iris pattern - concentric circles
      p.noFill();
      p.stroke(eye.color[0], eye.color[1], eye.color[2], 150);
      p.strokeWeight(1);
      for (let i = 1; i < 3; i++) {
        p.ellipse(
          eye.x + eye.pupilOffset.x, 
          eye.y + eye.pupilOffset.y, 
          irisSize * (0.7 - i * 0.15), 
          irisSize * (0.7 - i * 0.15) * 0.6
        );
      }
      
      // Pupil
      p.noStroke();
      p.fill(0, 0, 0, 230);
      p.ellipse(
        eye.x + eye.pupilOffset.x, 
        eye.y + eye.pupilOffset.y, 
        irisSize * 0.5, 
        irisSize * 0.5 * 0.6
      );
      
      // Highlight - main
      p.fill(255, 255, 255, 200);
      p.ellipse(
        eye.x + eye.pupilOffset.x * 0.6 + irisSize * 0.15, 
        eye.y + eye.pupilOffset.y * 0.6 - irisSize * 0.1, 
        irisSize * 0.25, 
        irisSize * 0.25 * 0.6
      );
      
      // Secondary highlight
      p.fill(255, 255, 255, 150);
      p.ellipse(
        eye.x + eye.pupilOffset.x * 0.6 - irisSize * 0.1, 
        eye.y + eye.pupilOffset.y * 0.6 - irisSize * 0.15, 
        irisSize * 0.1, 
        irisSize * 0.1 * 0.6
      );
    }
    
    // Eyelid
    if (eye.blinkState > 0) {
      p.fill(palette.black);
      p.noStroke();
      const lidPos = p.map(eye.blinkState, 0, 1, eye.y - eye.size * 0.3, eye.y);
      p.rect(eye.x - eye.size * 0.6, eye.y - eye.size * 0.3, eye.size * 1.2, lidPos - (eye.y - eye.size * 0.3));
      p.rect(eye.x - eye.size * 0.6, eye.y, eye.size * 1.2, eye.size * 0.3 * eye.blinkState);
    }
  }
  
  function drawMouth() {
    // Mouth glow - brighter and more layers
    p.noStroke();
    for (let i = 5; i > 0; i--) {
      const glowOpacity = 150 / i;
      p.fill(mouth.color[0], mouth.color[1], mouth.color[2], glowOpacity);
      const mouthWidth = mouth.width * (1 + i * 0.1);
      const mouthHeight = mouth.height * mouth.openAmount * (1 + i * 0.1);
      
      p.beginShape();
      p.vertex(mouth.x - mouthWidth / 2, mouth.y);
      p.bezierVertex(
        mouth.x - mouthWidth / 2, mouth.y + mouthHeight * mouth.curveAmount,
        mouth.x + mouthWidth / 2, mouth.y + mouthHeight * mouth.curveAmount,
        mouth.x + mouthWidth / 2, mouth.y
      );
      p.bezierVertex(
        mouth.x + mouthWidth / 2, mouth.y + mouthHeight,
        mouth.x - mouthWidth / 2, mouth.y + mouthHeight,
        mouth.x - mouthWidth / 2, mouth.y
      );
      p.endShape(p.CLOSE);
    }
    
    // Mouth opening
    p.fill(0, 0, 0);
    const mouthOpenHeight = mouth.height * mouth.openAmount;
    
    p.beginShape();
    p.vertex(mouth.x - mouth.width / 2, mouth.y);
    p.bezierVertex(
      mouth.x - mouth.width / 2, mouth.y + mouthOpenHeight * mouth.curveAmount,
      mouth.x + mouth.width / 2, mouth.y + mouthOpenHeight * mouth.curveAmount,
      mouth.x + mouth.width / 2, mouth.y
    );
    p.bezierVertex(
      mouth.x + mouth.width / 2, mouth.y + mouthOpenHeight,
      mouth.x - mouth.width / 2, mouth.y + mouthOpenHeight,
      mouth.x - mouth.width / 2, mouth.y
    );
    p.endShape(p.CLOSE);
    
    // Add teeth when mouth is open enough
    if (mouth.openAmount > 0.3) {
      p.fill(220, 220, 230);
      const teethHeight = mouthOpenHeight * 0.3;
      
      // Top teeth
      p.beginShape();
      p.vertex(mouth.x - mouth.width * 0.4, mouth.y);
      p.vertex(mouth.x + mouth.width * 0.4, mouth.y);
      p.vertex(mouth.x + mouth.width * 0.4, mouth.y + teethHeight);
      p.vertex(mouth.x - mouth.width * 0.4, mouth.y + teethHeight);
      p.endShape(p.CLOSE);
      
      // Bottom teeth
      p.beginShape();
      p.vertex(mouth.x - mouth.width * 0.4, mouth.y + mouthOpenHeight - teethHeight);
      p.vertex(mouth.x + mouth.width * 0.4, mouth.y + mouthOpenHeight - teethHeight);
      p.vertex(mouth.x + mouth.width * 0.4, mouth.y + mouthOpenHeight);
      p.vertex(mouth.x - mouth.width * 0.4, mouth.y + mouthOpenHeight);
      p.endShape(p.CLOSE);
    }
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
    // Recalculate face dimensions
    faceWidth = p.min(p.width * 0.7, 1000);
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Update eye positions
    const eyeSize = faceWidth * 0.18;
    const eyeY = p.height * 0.45;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye.x = p.width / 2 - eyeSpacing / 2;
    leftEye.y = eyeY;
    leftEye.size = eyeSize;
    leftEye.pupilSize = eyeSize * 0.7;
    
    rightEye.x = p.width / 2 + eyeSpacing / 2;
    rightEye.y = eyeY;
    rightEye.size = eyeSize;
    rightEye.pupilSize = eyeSize * 0.7;
    
    mouth.x = p.width / 2;
    mouth.y = eyeY + eyeSize * 1.7;
    mouth.width = faceWidth * 0.4;
    mouth.height = eyeSize * 0.6;
  };
};

// Create p5 instance
new p5(sketch);
