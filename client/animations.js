// Sleek animations and visual effects for Voice Pal

document.addEventListener('DOMContentLoaded', () => {
  // Create audio visualizer when connected
  let audioContext;
  let analyser;
  let source;
  let animationFrame;
  const visualizerContainer = document.createElement('div');
  visualizerContainer.className = 'visualizer-container';
  visualizerContainer.style.display = 'none';
  document.querySelector('.container').appendChild(visualizerContainer);
  
  // Create visualizer bars - more bars for a finer look
  const barsCount = 40;
  for (let i = 0; i < barsCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    visualizerContainer.appendChild(bar);
  }
  
  // Function to start audio visualization
  window.startVisualization = (userStream, aiAnalyser = null) => {
    if (!userStream) return;
    
    // Stop any existing visualization
    stopVisualization();
    
    // Show visualizer
    visualizerContainer.style.display = 'flex';
    
    // If AI analyser is provided, use it instead of creating one for user audio
    if (aiAnalyser) {
      analyser = aiAnalyser;
    } else {
      // Create audio context and analyser for user audio (fallback)
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Higher resolution for better robot face animation
      
      // Connect the user stream to the analyser
      source = audioContext.createMediaStreamSource(userStream);
      source.connect(analyser);
    }
    
    // Set robot expression to happy when connected
    if (window.setRobotExpression) {
      window.setRobotExpression('happy');
    }
    
    // Start visualization loop
    visualize();
  };
  
  // Function to stop audio visualization
  window.stopVisualization = () => {
    visualizerContainer.style.display = 'none';
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    if (source) {
      source.disconnect();
      source = null;
    }
    
    if (audioContext) {
      audioContext.close().catch(console.error);
      audioContext = null;
    }
    
    analyser = null;
  };
  
  // Visualization loop
  function visualize() {
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average audio level for robot mouth
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength / 255; // Normalize to 0-1
    
    // Update robot face with audio level
    if (window.updateRobotAudioLevel) {
      window.updateRobotAudioLevel(average);
    }
    
    // Get the selected mood
    const moodSelect = document.getElementById('mood-select');
    const selectedMood = moodSelect ? moodSelect.value : 'sarcastic';
    
    // Change robot expressions based on audio intensity and selected mood
    if (average > 0.6) {
      // When AI is speaking loudly
      if (Math.random() < 0.1) {
        if (window.setRobotExpression) {
          // Different expressions based on mood
          switch(selectedMood) {
            case 'excited':
              window.setRobotExpression('happy'); // More happy expressions for excited mood
              break;
            case 'philosophical':
              window.setRobotExpression('thinking'); // More thinking for philosophical mood
              break;
            case 'dramatic':
              window.setRobotExpression('surprised'); // More surprised for dramatic mood
              break;
            case 'deadpan':
              window.setRobotExpression('neutral'); // More neutral for deadpan mood
              break;
            default: // sarcastic
              window.setRobotExpression('surprised');
          }
        }
      }
    } else if (average > 0.4) {
      // When AI is speaking moderately
      if (Math.random() < 0.05) {
        if (window.setRobotExpression) {
          // Different expressions based on mood
          switch(selectedMood) {
            case 'excited':
              window.setRobotExpression('happy'); // Happy for excited mood
              break;
            case 'philosophical':
              Math.random() > 0.5 ? window.setRobotExpression('thinking') : window.setRobotExpression('neutral');
              break;
            case 'dramatic':
              Math.random() > 0.5 ? window.setRobotExpression('happy') : window.setRobotExpression('surprised');
              break;
            case 'deadpan':
              window.setRobotExpression('neutral'); // Always neutral for deadpan
              break;
            default: // sarcastic
              window.setRobotExpression('happy');
          }
        }
      }
    } else if (average < 0.1) {
      // When AI is quiet
      if (Math.random() < 0.01) {
        if (window.setRobotExpression) {
          // Different expressions based on mood
          switch(selectedMood) {
            case 'excited':
              window.setRobotExpression('happy'); // Still happy when quiet for excited mood
              break;
            case 'philosophical':
              window.setRobotExpression('thinking'); // Deep in thought for philosophical
              break;
            case 'dramatic':
              window.setRobotExpression('thinking'); // Contemplative for dramatic
              break;
            case 'deadpan':
              window.setRobotExpression('neutral'); // Always neutral for deadpan
              break;
            default: // sarcastic
              window.setRobotExpression('thinking');
          }
        }
      }
    }
    
    // Update traditional visualizer bars
    const bars = document.querySelectorAll('.visualizer-bar');
    const step = Math.floor(bufferLength / bars.length);
    
    for (let i = 0; i < bars.length; i++) {
      const value = dataArray[i * step];
      // Smoother height calculation with a minimum of 1px
      const height = Math.max(1, value / 5);
      
      bars[i].style.height = `${height}px`;
      
      // Use the primary color with varying opacity based on intensity
      const opacity = Math.min(0.3 + (value / 255) * 0.7, 1);
      bars[i].style.backgroundColor = `rgba(150, 180, 230, ${opacity})`;
    }
    
    animationFrame = requestAnimationFrame(visualize);
  }
  
  // Add subtle line animation to container
  const container = document.querySelector('.container');
  let time = 0;
  
  function lineAnimation() {
    time += 0.01;
    
    // Create a subtle border glow effect
    const glowIntensity = (Math.sin(time) + 1) / 2 * 0.2 + 0.1;
    container.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.15), 0 0 2px rgba(150, 180, 230, ${glowIntensity})`;
    
    requestAnimationFrame(lineAnimation);
  }
  
  lineAnimation();
  
  // Add subtle pulse animation to the button ring
  const btnRings = document.querySelectorAll('.btn-ring');
  btnRings.forEach(ring => {
    let pulseTime = 0; 
    
    function pulseAnimation() {
      pulseTime += 0.02;
      
      // Create a subtle pulse effect
      const opacity = (Math.sin(pulseTime) + 1) / 2 * 0.2 + 0.2;
      ring.style.opacity = opacity.toString();
      
      requestAnimationFrame(pulseAnimation);
    }
    
    pulseAnimation();
  });
  
  // Add voice and mood selector animations
  const voiceSelect = document.getElementById('voice-select');
  const moodSelect = document.getElementById('mood-select');
  
  // Voice selector animation
  if (voiceSelect) {
    // Add change event listener
    voiceSelect.addEventListener('change', function() {
      // Add a subtle flash effect
      this.style.borderColor = 'var(--primary-hover)';
      this.style.backgroundColor = 'rgba(64, 80, 120, 0.4)';
      
      // Reset after animation
      setTimeout(() => {
        this.style.borderColor = 'rgba(150, 180, 230, 0.2)';
        this.style.backgroundColor = 'rgba(30, 40, 60, 0.3)';
      }, 300);
      
      // Update the voice description with a sarcastic message
      const voiceLabel = document.querySelector('.voice-selector label');
      const selectedOption = this.options[this.selectedIndex];
      const voiceName = selectedOption.text.split(' ')[0];
      
      // Sarcastic messages for each voice
      const sarcasticMessages = {
        'Alloy': "Ah, the default. How original.",
        'Echo': "Echo - for when you want that 'stern dad' vibe.",
        'Shimmer': "Shimmer - sounds nice, still judges you.",
        'Ash': "Ash - neutrally unimpressed with you.",
        'Ballad': "Ballad - will sing about your poor life choices.",
        'Coral': "Coral - ocean deep, patience shallow.",
        'Sage': "Sage - wisdom with a side of mockery.",
        'Verse': "Verse - poetically pointing out your flaws."
      };
      
      if (sarcasticMessages[voiceName]) {
        voiceLabel.textContent = sarcasticMessages[voiceName];
        
        // Reset after 3 seconds
        setTimeout(() => {
          voiceLabel.textContent = "Choose AI Voice:";
        }, 3000);
      }
      
      // Set robot expression based on voice
      if (window.setRobotExpression) {
        // Different initial expressions based on voice
        switch(voiceName) {
          case 'Echo':
            window.setRobotExpression('neutral');
            break;
          case 'Shimmer':
            window.setRobotExpression('happy');
            break;
          case 'Ash':
            window.setRobotExpression('thinking');
            break;
          default:
            window.setRobotExpression('neutral');
        }
        
        // Reset after 1 second
        setTimeout(() => {
          window.setRobotExpression('neutral');
        }, 1000);
      }
    });
  }
  
  // Mood selector animation
  if (moodSelect) {
    // Add change event listener
    moodSelect.addEventListener('change', function() {
      // Add a subtle flash effect with mood-specific color
      this.style.borderColor = 'rgba(180, 150, 230, 0.8)';
      this.style.backgroundColor = 'rgba(64, 60, 120, 0.4)';
      
      // Reset after animation
      setTimeout(() => {
        this.style.borderColor = 'rgba(180, 150, 230, 0.2)';
        this.style.backgroundColor = 'rgba(30, 40, 60, 0.3)';
      }, 300);
      
      // Update the mood description with a message
      const moodLabel = document.querySelector('.mood-selector label');
      const selectedMood = this.value;
      
      // Messages for each mood
      const moodMessages = {
        'sarcastic': "Sarcasm: because being nice is overrated.",
        'excited': "Excitement: like caffeine, but more annoying!",
        'philosophical': "Philosophy: making simple things needlessly complex.",
        'dramatic': "Drama: because everything is LITERALLY THE END OF THE WORLD!",
        'deadpan': "Deadpan. It's humor. Supposedly."
      };
      
      if (moodMessages[selectedMood]) {
        moodLabel.textContent = moodMessages[selectedMood];
        
        // Reset after 3 seconds
        setTimeout(() => {
          moodLabel.textContent = "AI Mood:";
        }, 3000);
      }
      
      // Set robot expression based on mood
      if (window.setRobotExpression) {
        // Different expressions based on mood
        switch(selectedMood) {
          case 'sarcastic':
            window.setRobotExpression('happy');
            break;
          case 'excited':
            window.setRobotExpression('surprised');
            break;
          case 'philosophical':
            window.setRobotExpression('thinking');
            break;
          case 'dramatic':
            window.setRobotExpression('surprised');
            break;
          case 'deadpan':
            window.setRobotExpression('neutral');
            break;
        }
        
        // Reset after 1.5 seconds
        setTimeout(() => {
          window.setRobotExpression('neutral');
        }, 1500);
      }
    });
  }
});
