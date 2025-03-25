// Simple Futuristic AI Face using p5.js
let sketch = function(p) {
  // Color palette
  const palette = {
    black: [5, 5, 10],
    darkBlue: [10, 15, 25],
    iris: [0, 230, 255],
    accent: [0, 200, 255],
    happy: [50, 255, 150],
    sad: [100, 150, 255],
    angry: [255, 50, 50],
    surprised: [255, 200, 0],
    thinking: [180, 180, 255],
    hologram: [0, 255, 200, 150]
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
    canvas.style('z-index', '-2');
    
    // Calculate face dimensions
    faceWidth = p.min(p.width * 0.7, 1000);
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Initialize eyes
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.45;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye = {
      x: p.width / 2 - eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      color: [...palette.iris]
    };
    
    rightEye = {
      x: p.width / 2 + eyeSpacing / 2,
      y: eyeY,
      size: eyeSize,
      pupilSize: eyeSize * 0.6,
      pupilOffset: { x: 0, y: 0 },
      blinkState: 0,
      color: [...palette.iris]
    };
    
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 1.7,
      width: faceWidth * 0.35,
      height: eyeSize * 0.5,
      openAmount: 0.2,
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
  };
  
  p.draw = function() {
    // Draw background
    p.background(palette.black);
    
    // Update time
    time += 0.01;
    
    // Update face
    updateFace();
    
    // Draw face
    drawFace();
    
    // Reset listening flag
    isListening = false;
  };
  
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
    // Draw holographic rings
    p.noFill();
    p.stroke(palette.hologram[0], palette.hologram[1], palette.hologram[2], 50);
    p.strokeWeight(2);
    p.ellipse(p.width / 2, p.height / 2, faceWidth * 0.8, faceWidth * 0.8 * 0.6);
    p.ellipse(p.width / 2, p.height / 2, faceWidth * 1.1, faceWidth * 1.1 * 0.6);
    
    // Draw eyes
    drawEye(leftEye);
    drawEye(rightEye);
    
    // Draw mouth
    drawMouth();
  }
  
  function drawEye(eye) {
    // Eye socket glow
    p.noStroke();
    for (let i = 3; i > 0; i--) {
      const glowOpacity = 100 / i;
      p.fill(eye.color[0], eye.color[1], eye.color[2], glowOpacity);
      p.ellipse(eye.x, eye.y, eye.size * (1 + i * 0.1), eye.size * (1 + i * 0.1) * 0.6);
    }
    
    // Eye socket
    p.fill(palette.black);
    p.ellipse(eye.x, eye.y, eye.size, eye.size * 0.6);
    
    // Iris
    if (eye.blinkState < 0.9) {
      const irisSize = p.map(eye.blinkState, 0, 0.9, eye.pupilSize, 0);
      p.fill(eye.color[0], eye.color[1], eye.color[2], 200);
      p.ellipse(
        eye.x + eye.pupilOffset.x, 
        eye.y + eye.pupilOffset.y, 
        irisSize, 
        irisSize * 0.6
      );
      
      // Pupil
      p.fill(0, 0, 0, 200);
      p.ellipse(
        eye.x + eye.pupilOffset.x, 
        eye.y + eye.pupilOffset.y, 
        irisSize * 0.5, 
        irisSize * 0.5 * 0.6
      );
      
      // Highlight
      p.fill(255, 255, 255, 150);
      p.ellipse(
        eye.x + eye.pupilOffset.x * 0.6 + irisSize * 0.15, 
        eye.y + eye.pupilOffset.y * 0.6 - irisSize * 0.1, 
        irisSize * 0.2, 
        irisSize * 0.2 * 0.6
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
    // Mouth glow
    p.noStroke();
    for (let i = 3; i > 0; i--) {
      const glowOpacity = 100 / i;
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
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
    // Recalculate face dimensions
    faceWidth = p.min(p.width * 0.7, 1000);
    faceHeight = p.min(p.height * 0.7, 700);
    
    // Update eye positions
    const eyeSize = faceWidth * 0.15;
    const eyeY = p.height * 0.45;
    const eyeSpacing = faceWidth * 0.25;
    
    leftEye.x = p.width / 2 - eyeSpacing / 2;
    leftEye.y = eyeY;
    leftEye.size = eyeSize;
    leftEye.pupilSize = eyeSize * 0.6;
    
    rightEye.x = p.width / 2 + eyeSpacing / 2;
    rightEye.y = eyeY;
    rightEye.size = eyeSize;
    rightEye.pupilSize = eyeSize * 0.6;
    
    mouth.x = p.width / 2;
    mouth.y = eyeY + eyeSize * 1.7;
    mouth.width = faceWidth * 0.35;
    mouth.height = eyeSize * 0.5;
  };
};

// Create p5 instance
new p5(sketch);
