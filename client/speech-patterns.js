// Speech-reactive patterns using p5.js noise functions
// This module generates dynamic visual patterns based on speech content and audio levels

let speechPatterns = function(p) {
  // Configuration for speech patterns
  const config = {
    enabled: false,           // Whether patterns are currently active
    transitionSpeed: 0.05,    // Speed of transition between face and patterns
    transitionState: 0,       // 0 = face, 1 = patterns
    noiseScale: 0.01,         // Base scale for noise
    noiseSpeed: 0.005,        // Speed of noise animation
    patternComplexity: 3,     // Number of octaves for noise
    colorVariation: 0.3,      // How much colors vary based on content
    patternType: 'flow',      // Current pattern type: 'flow', 'particles', 'waves', 'grid'
    keywords: [],             // Keywords detected in speech
    sentiment: 0,             // Sentiment score: -1 (negative) to 1 (positive)
    audioLevel: 0,            // Current audio level
    time: 0                   // Animation time
  };
  
  // Color palettes for different speech themes
  const palettes = {
    technology: [
      [0, 180, 255],    // Cyan
      [0, 100, 200],    // Blue
      [100, 0, 255],    // Purple
      [0, 255, 200]     // Teal
    ],
    nature: [
      [0, 200, 100],    // Green
      [100, 255, 0],    // Lime
      [0, 150, 100],    // Forest
      [200, 255, 100]   // Light green
    ],
    emotion: [
      [255, 100, 200],  // Pink
      [255, 50, 50],    // Red
      [255, 150, 0],    // Orange
      [255, 200, 0]     // Yellow
    ],
    abstract: [
      [200, 100, 255],  // Purple
      [100, 200, 255],  // Light blue
      [255, 100, 100],  // Light red
      [200, 200, 255]   // Lavender
    ],
    default: [
      [0, 180, 255],    // Cyan
      [0, 255, 200],    // Teal
      [100, 200, 255],  // Light blue
      [0, 100, 200]     // Blue
    ]
  };
  
  // Current active palette
  let currentPalette = palettes.default;
  
  // Noise seed for consistency
  let noiseSeed = Math.random() * 1000;
  
  // Initialize the module
  function init() {
    // Set noise seed for consistency
    p.noiseSeed(noiseSeed);
  }
  
  // Update pattern based on speech content
  function updateWithSpeech(text, audioLevel) {
    // Update audio level
    config.audioLevel = audioLevel;
    
    // Simple keyword detection
    const techKeywords = ['technology', 'computer', 'digital', 'ai', 'robot', 'code', 'algorithm', 'data'];
    const natureKeywords = ['nature', 'tree', 'forest', 'ocean', 'mountain', 'animal', 'plant', 'green'];
    const emotionKeywords = ['happy', 'sad', 'angry', 'love', 'fear', 'emotion', 'feeling', 'heart'];
    const abstractKeywords = ['concept', 'idea', 'philosophy', 'abstract', 'theory', 'thought', 'mind'];
    
    // Convert text to lowercase for matching
    const lowerText = text.toLowerCase();
    
    // Check for keywords in each category
    let techCount = 0;
    let natureCount = 0;
    let emotionCount = 0;
    let abstractCount = 0;
    
    // Count keyword occurrences
    techKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) techCount++;
    });
    
    natureKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) natureCount++;
    });
    
    emotionKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) emotionCount++;
    });
    
    abstractKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) abstractCount++;
    });
    
    // Determine dominant theme
    const counts = [
      { theme: 'technology', count: techCount },
      { theme: 'nature', count: natureCount },
      { theme: 'emotion', count: emotionCount },
      { theme: 'abstract', count: abstractCount }
    ];
    
    // Sort by count
    counts.sort((a, b) => b.count - a.count);
    
    // If we have a dominant theme with at least one keyword, use that palette
    if (counts[0].count > 0) {
      currentPalette = palettes[counts[0].theme];
      
      // Set pattern type based on theme
      if (counts[0].theme === 'technology') {
        config.patternType = 'grid';
        config.noiseScale = 0.02;
        config.patternComplexity = 2;
      } else if (counts[0].theme === 'nature') {
        config.patternType = 'flow';
        config.noiseScale = 0.01;
        config.patternComplexity = 4;
      } else if (counts[0].theme === 'emotion') {
        config.patternType = 'particles';
        config.noiseScale = 0.015;
        config.patternComplexity = 3;
      } else if (counts[0].theme === 'abstract') {
        config.patternType = 'waves';
        config.noiseScale = 0.008;
        config.patternComplexity = 5;
      }
    } else {
      // Default to technology theme if no keywords found
      currentPalette = palettes.default;
      config.patternType = 'flow';
    }
    
    // Extract keywords for visualization
    config.keywords = [];
    [].concat(techKeywords, natureKeywords, emotionKeywords, abstractKeywords).forEach(keyword => {
      if (lowerText.includes(keyword)) {
        config.keywords.push(keyword);
      }
    });
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'happy', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'angry', 'fear'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    // Calculate sentiment score between -1 and 1
    if (positiveCount > 0 || negativeCount > 0) {
      config.sentiment = (positiveCount - negativeCount) / (positiveCount + negativeCount);
    } else {
      config.sentiment = 0;
    }
    
    // Enable patterns when audio level is high enough
    if (audioLevel > 0.3) {
      enablePatterns();
    } else if (audioLevel < 0.1) {
      disablePatterns();
    }
  }
  
  // Enable pattern mode
  function enablePatterns() {
    config.enabled = true;
  }
  
  // Disable pattern mode
  function disablePatterns() {
    config.enabled = false;
  }
  
  // Update animation state
  function update(deltaTime) {
    // Update time
    config.time += deltaTime * 0.01;
    
    // Update transition state
    if (config.enabled) {
      config.transitionState = Math.min(1, config.transitionState + config.transitionSpeed * deltaTime);
    } else {
      config.transitionState = Math.max(0, config.transitionState - config.transitionSpeed * deltaTime);
    }
  }
  
  // Draw the current pattern
  function draw() {
    // Only draw if we're in transition or fully in pattern mode
    if (config.transitionState <= 0) return;
    
    // Apply transition opacity
    const opacity = config.transitionState * 255;
    
    // Choose pattern based on current type
    switch (config.patternType) {
      case 'flow':
        drawFlowField(opacity);
        break;
      case 'particles':
        drawParticles(opacity);
        break;
      case 'waves':
        drawWaves(opacity);
        break;
      case 'grid':
        drawGrid(opacity);
        break;
      default:
        drawFlowField(opacity);
    }
  }
  
  // Draw a flow field pattern using Perlin noise
  function drawFlowField(opacity) {
    const scale = config.noiseScale * (1 + config.audioLevel);
    const resolution = Math.floor(20 * (1 + config.audioLevel));
    const cellSize = Math.max(p.width, p.height) / resolution;
    
    p.noFill();
    
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const xPos = x * cellSize;
        const yPos = y * cellSize;
        
        // Get noise value
        const noiseVal = p.noise(
          x * scale + config.time, 
          y * scale + config.time, 
          config.time * 0.5
        );
        
        // Map noise to angle
        const angle = noiseVal * p.TWO_PI * 2;
        
        // Calculate line endpoints
        const length = cellSize * 0.8 * (0.5 + config.audioLevel);
        const x2 = xPos + Math.cos(angle) * length;
        const y2 = yPos + Math.sin(angle) * length;
        
        // Choose color based on position and noise
        const colorIndex = Math.floor(noiseVal * currentPalette.length);
        const color = currentPalette[colorIndex];
        
        // Draw line with varying thickness based on audio
        p.stroke(color[0], color[1], color[2], opacity);
        p.strokeWeight(1 + config.audioLevel * 3);
        p.line(xPos, yPos, x2, y2);
      }
    }
  }
  
  // Draw particle system
  function drawParticles(opacity) {
    const particleCount = Math.floor(100 * (1 + config.audioLevel));
    const scale = config.noiseScale;
    
    p.noStroke();
    
    for (let i = 0; i < particleCount; i++) {
      // Use noise to determine position
      const nx = p.noise(i * 0.1, config.time * 0.5);
      const ny = p.noise(i * 0.1 + 100, config.time * 0.5);
      
      const x = p.width * nx;
      const y = p.height * ny;
      
      // Size based on audio and noise
      const size = (5 + config.audioLevel * 15) * p.noise(i * 0.2, config.time);
      
      // Color based on position
      const colorIndex = Math.floor(p.noise(nx, ny, config.time) * currentPalette.length);
      const color = currentPalette[colorIndex];
      
      // Draw particle
      p.fill(color[0], color[1], color[2], opacity * 0.8);
      p.ellipse(x, y, size);
    }
  }
  
  // Draw wave pattern
  function drawWaves(opacity) {
    const waveCount = 5 + Math.floor(config.audioLevel * 10);
    const amplitude = p.height * 0.1 * (1 + config.audioLevel);
    
    p.noFill();
    
    for (let i = 0; i < waveCount; i++) {
      // Choose color
      const colorIndex = i % currentPalette.length;
      const color = currentPalette[colorIndex];
      
      p.stroke(color[0], color[1], color[2], opacity * 0.7);
      p.strokeWeight(2 + config.audioLevel * 3);
      
      // Draw wave
      p.beginShape();
      for (let x = 0; x < p.width; x += 10) {
        const noiseFactor = p.noise(
          x * config.noiseScale * 0.1, 
          i * 0.3, 
          config.time
        );
        
        const y = p.height * 0.5 + 
                 Math.sin(x * 0.01 + config.time + i) * amplitude * noiseFactor;
        
        p.vertex(x, y);
      }
      p.endShape();
    }
  }
  
  // Draw grid pattern
  function drawGrid(opacity) {
    const gridSize = 10 + Math.floor(config.audioLevel * 20);
    const cellWidth = p.width / gridSize;
    const cellHeight = p.height / gridSize;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const xPos = x * cellWidth;
        const yPos = y * cellHeight;
        
        // Get noise value
        const noiseVal = p.noise(
          x * config.noiseScale * 2, 
          y * config.noiseScale * 2, 
          config.time * 0.2
        );
        
        // Skip some cells based on noise for interesting pattern
        if (noiseVal < 0.4 - config.audioLevel * 0.2) continue;
        
        // Choose color based on position
        const colorIndex = Math.floor((x + y) % currentPalette.length);
        const color = currentPalette[colorIndex];
        
        // Size based on noise and audio
        const size = cellWidth * 0.8 * noiseVal * (0.5 + config.audioLevel * 0.5);
        
        // Draw cell
        p.noStroke();
        p.fill(color[0], color[1], color[2], opacity * noiseVal);
        
        // Shape based on noise
        if (noiseVal > 0.7) {
          // Rectangle
          p.rect(xPos + cellWidth * 0.1, yPos + cellHeight * 0.1, size, size);
        } else {
          // Circle
          p.ellipse(xPos + cellWidth * 0.5, yPos + cellHeight * 0.5, size);
        }
      }
    }
  }
  
  // Return public interface
  return {
    init,
    update,
    draw,
    updateWithSpeech,
    enablePatterns,
    disablePatterns,
    getTransitionState: () => config.transitionState
  };
};

// Export the module
window.createSpeechPatterns = function(p) {
  return speechPatterns(p);
};
