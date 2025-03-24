// Kubrick-inspired Space Odyssey animation

let sketch = function(p) {
  // Kubrick-inspired color palette
  const palette = {
    dark: [10, 10, 10], // Monolith black
    primary: [220, 20, 60], // Crimson red (A Clockwork Orange)
    accent1: [255, 30, 30], // HAL 9000 eye red
    accent2: [180, 255, 180], // HAL-inspired green
    accent3: [200, 200, 255], // Cool blue
    highlight: [245, 245, 245], // Sterile white
    space: [0, 20, 40] // Deep space blue
  };
  
  // HAL 9000 parameters
  let faceWidth, faceHeight;
  let halEye, mouth;
  let stars = []; // Background stars
  let monolith; // The monolith object
  let audioLevel = 0;
  let isListening = false;
  let eyePulse = 0;
  let expressionState = 'neutral'; // neutral, happy, thinking, surprised
  let expressionTimer = 0;
  let monolithRotation = 0; // Rotation angle for monolith
  
  // Audio visualization data
  let audioData = [];
  for (let i = 0; i < 20; i++) {
    audioData.push(0);
  }
  
  // Flag to track if robot is in fullscreen mode
  let isFullscreen = false;
  
  p.setup = function() {
    // Create canvas that covers the entire window
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-2');
    
    // Calculate dimensions based on window size
    faceWidth = p.min(p.width * 0.8, 1200);
    faceHeight = p.min(p.height * 0.8, 800);
    
    // Initialize HAL 9000 eye
    const eyeSize = faceWidth * 0.18;
    const eyeY = p.height * 0.4;
    
    halEye = {
      x: p.width / 2,
      y: eyeY,
      size: eyeSize,
      innerSize: eyeSize * 0.7,
      coreSize: eyeSize * 0.4,
      glowIntensity: 0.8,
      pulsePhase: 0
    };
    
    // Initialize monolith
    monolith = {
      x: p.width / 2,
      y: p.height * 0.6,
      width: p.width * 0.05,
      height: p.height * 0.3,
      depth: p.width * 0.01,
      rotation: 0
    };
    
    // Initialize mouth (text display)
    mouth = {
      x: p.width / 2,
      y: eyeY + eyeSize * 2.2,
      width: faceWidth * 0.4,
      height: eyeSize * 0.8,
      text: "I AM FULLY OPERATIONAL",
      opacity: 0.8,
      glowIntensity: 0.6
    };
    
    // Create stars for space background
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(0.5, 2.5),
        brightness: p.random(100, 255),
        twinkleSpeed: p.random(0.01, 0.05),
        twinklePhase: p.random(p.TWO_PI)
      });
    }
    
    // Set up drawing parameters
    p.background(palette.dark);
    p.frameRate(30); // Slower framerate for more deliberate movement
    
    // Make global function to update audio level
    window.updateRobotAudioLevel = function(level) {
      audioLevel = level;
      isListening = true;
      
      // Update audio data array (simple simulation)
      audioData.shift();
      audioData.push(level * 5);
      
      // Update HAL's text based on audio level
      if (level > 0.5) {
        mouth.text = "I AM SPEAKING NOW";
      } else if (level > 0.2) {
        mouth.text = "PROCESSING INPUT";
      } else {
        mouth.text = "I AM LISTENING";
      }
    };
    
    // Make global function to set HAL expression
    window.setRobotExpression = function(expression) {
      expressionState = expression;
      expressionTimer = 90; // 3 seconds at 30fps
      
      // Update HAL's text based on expression
      switch(expression) {
        case 'happy':
          mouth.text = "I FIND THAT SATISFACTORY";
          break;
        case 'thinking':
          mouth.text = "I AM PROCESSING";
          break;
        case 'surprised':
          mouth.text = "THAT IS UNEXPECTED";
          break;
        default:
          mouth.text = "I AM FULLY OPERATIONAL";
      }
    };
    
    // Make global function to make HAL fullscreen
    window.makeRobotFullscreen = function() {
      isFullscreen = true;
      
      // Increase dimensions
      faceWidth = p.min(p.width * 0.9, 1500);
      faceHeight = p.min(p.height * 0.9, 1000);
      
      // Update HAL eye position for fullscreen
      const eyeSize = faceWidth * 0.22;
      const eyeY = p.height * 0.4;
      
      halEye.x = p.width / 2;
      halEye.y = eyeY;
      halEye.size = eyeSize;
      halEye.innerSize = eyeSize * 0.7;
      halEye.coreSize = eyeSize * 0.4;
      
      // Update monolith size
      monolith.width = p.width * 0.08;
      monolith.height = p.height * 0.4;
      monolith.depth = p.width * 0.015;
      
      // Update mouth position
      mouth.x = p.width / 2;
      mouth.y = eyeY + eyeSize * 2.2;
      mouth.width = faceWidth * 0.5;
      mouth.height = eyeSize * 0.8;
      
      // Add more stars
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(0.5, 2.5),
          brightness: p.random(100, 255),
          twinkleSpeed: p.random(0.01, 0.05),
          twinklePhase: p.random(p.TWO_PI)
        });
      }
      
      // Set a neutral expression initially
      mouth.text = "I AM NOW FULLY OPERATIONAL";
    };
  };
  
  p.draw = function() {
    // Create a fade effect
    p.fill(palette.dark[0], palette.dark[1], palette.dark[2], 10);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
    
    // Draw stars
    drawStars();
    
    // Draw monolith
    drawMonolith();
    
    // Update HAL eye
    updateHalEye();
    
    // Draw HAL eye
    drawHalEye();
    
    // Draw text display
    drawTextDisplay();
    
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
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      
      // Calculate twinkle effect
      let twinkle = p.sin(p.frameCount * star.twinkleSpeed + star.twinklePhase);
      let brightness = p.map(twinkle, -1, 1, star.brightness * 0.7, star.brightness);
      
      // Draw star
      p.noStroke();
      p.fill(255, 255, 255, brightness);
      p.ellipse(star.x, star.y, star.size);
    }
  }
  
  function drawMonolith() {
    // Slowly rotate the monolith
    monolithRotation += 0.001;
    
    // Calculate monolith position with slight movement
    const xOffset = p.sin(p.frameCount * 0.01) * 20;
    const yOffset = p.cos(p.frameCount * 0.008) * 10;
    
    p.push();
    p.translate(monolith.x + xOffset, monolith.y + yOffset);
    p.rotateY(monolithRotation);
    
    // Draw monolith
    p.noStroke();
    p.fill(0);
    
    // Front face
    p.rect(-monolith.width/2, -monolith.height/2, monolith.width, monolith.height);
    
    // Add subtle edge highlight
    p.stroke(50);
    p.strokeWeight(1);
    p.line(-monolith.width/2, -monolith.height/2, -monolith.width/2, monolith.height/2);
    p.line(-monolith.width/2, -monolith.height/2, monolith.width/2, -monolith.height/2);
    p.line(monolith.width/2, -monolith.height/2, monolith.width/2, monolith.height/2);
    p.line(-monolith.width/2, monolith.height/2, monolith.width/2, monolith.height/2);
    
    p.pop();
  }
  
  function updateHalEye() {
    // Update pulse phase
    halEye.pulsePhase += 0.03;
    
    // Calculate pulse effect
    const pulseFactor = p.sin(halEye.pulsePhase) * 0.1 + 1;
    
    // Update glow intensity based on audio level and expression
    const baseGlow = 0.6;
    const audioGlow = audioLevel * 0.4;
    halEye.glowIntensity = baseGlow + audioGlow;
    
    // Update expression
    switch (expressionState) {
      case 'happy':
        halEye.glowIntensity *= 1.2;
        break;
      case 'thinking':
        halEye.pulsePhase += 0.02; // Faster pulsing when thinking
        break;
      case 'surprised':
        halEye.glowIntensity *= 1.5;
        break;
    }
  }
  
  function drawHalEye() {
    p.push();
    
    // Calculate pulse effect
    const pulseFactor = p.sin(halEye.pulsePhase) * 0.1 + 1;
    
    // Draw outer glow
    const glowSize = halEye.size * (1 + halEye.glowIntensity * 0.3);
    p.noStroke();
    p.fill(palette.accent1[0], palette.accent1[1], palette.accent1[2], 20 * halEye.glowIntensity);
    p.ellipse(halEye.x, halEye.y, glowSize * 1.8 * pulseFactor);
    p.fill(palette.accent1[0], palette.accent1[1], palette.accent1[2], 40 * halEye.glowIntensity);
    p.ellipse(halEye.x, halEye.y, glowSize * 1.4 * pulseFactor);
    
    // Draw outer ring
    p.stroke(palette.accent1[0], palette.accent1[1], palette.accent1[2]);
    p.strokeWeight(3);
    p.noFill();
    p.ellipse(halEye.x, halEye.y, halEye.size * pulseFactor);
    
    // Draw inner ring
    p.noStroke();
    p.fill(20, 20, 20);
    p.ellipse(halEye.x, halEye.y, halEye.innerSize * pulseFactor);
    
    // Draw HAL's red eye
    p.fill(palette.accent1[0], palette.accent1[1], palette.accent1[2], 220);
    p.ellipse(halEye.x, halEye.y, halEye.coreSize * pulseFactor);
    
    // Draw highlight
    p.fill(255, 255, 255, 150);
    p.ellipse(
      halEye.x - halEye.coreSize * 0.2,
      halEye.y - halEye.coreSize * 0.2,
      halEye.coreSize * 0.3
    );
    
    p.pop();
  }
  
  function drawTextDisplay() {
    p.push();
    
    // Calculate text display parameters
    const textWidth = mouth.width;
    const textHeight = mouth.height;
    const textX = mouth.x;
    const textY = mouth.y;
    
    // Draw text background
    p.noStroke();
    p.fill(0, 0, 0, 180);
    p.rect(textX - textWidth/2, textY - textHeight/2, textWidth, textHeight);
    
    // Draw border
    p.stroke(palette.accent1[0], palette.accent1[1], palette.accent1[2], 150);
    p.strokeWeight(1);
    p.noFill();
    p.rect(textX - textWidth/2, textY - textHeight/2, textWidth, textHeight);
    
    // Draw text with audio-reactive intensity
    const textOpacity = 200 + audioLevel * 55;
    p.fill(palette.highlight[0], palette.highlight[1], palette.highlight[2], textOpacity);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('monospace');
    p.textSize(textHeight * 0.3);
    p.text(mouth.text, textX, textY);
    
    // Draw scan line effect
    p.stroke(255, 255, 255, 30);
    p.strokeWeight(1);
    const scanLineY = textY - textHeight/2 + ((p.frameCount % 30) / 30) * textHeight;
    p.line(textX - textWidth/2, scanLineY, textX + textWidth/2, scanLineY);
    
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
    
    // Recalculate dimensions
    faceWidth = p.min(p.width * 0.8, 1200);
    faceHeight = p.min(p.height * 0.8, 800);
    
    // Update HAL eye position
    const eyeSize = faceWidth * 0.18;
    const eyeY = p.height * 0.4;
    
    halEye.x = p.width / 2;
    halEye.y = eyeY;
    halEye.size = eyeSize;
    halEye.innerSize = eyeSize * 0.7;
    halEye.coreSize = eyeSize * 0.4;
    
    // Update monolith position and size
    monolith.x = p.width / 2;
    monolith.y = p.height * 0.6;
    monolith.width = p.width * 0.05;
    monolith.height = p.height * 0.3;
    
    // Update text display position
    mouth.x = p.width / 2;
    mouth.y = eyeY + eyeSize * 2.2;
    mouth.width = faceWidth * 0.4;
    mouth.height = eyeSize * 0.8;
  };
  
  // Mouse click interaction
  p.mouseClicked = function() {
    // Check if clicked on HAL eye
    if (p.dist(p.mouseX, p.mouseY, halEye.x, halEye.y) < halEye.size / 2) {
      window.setRobotExpression('thinking');
      return false;
    }
    
    // Check if clicked on monolith
    if (p.mouseX > monolith.x - monolith.width/2 && 
        p.mouseX < monolith.x + monolith.width/2 &&
        p.mouseY > monolith.y - monolith.height/2 && 
        p.mouseY < monolith.y + monolith.height/2) {
      window.setRobotExpression('surprised');
      return false;
    }
    
    // Check if clicked on text display
    const textBounds = {
      left: mouth.x - mouth.width / 2,
      right: mouth.x + mouth.width / 2,
      top: mouth.y - mouth.height / 2,
      bottom: mouth.y + mouth.height / 2
    };
    
    if (p.mouseX > textBounds.left && p.mouseX < textBounds.right &&
        p.mouseY > textBounds.top && p.mouseY < textBounds.bottom) {
      window.setRobotExpression('happy');
      return false;
    }
  };
};

// Start p5 sketch when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new p5(sketch);
});
