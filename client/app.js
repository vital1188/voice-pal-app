document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const statusContainer = document.getElementById('status-container');
  let peerConnection = null;
  let localStream = null;
  
  // Inactivity detection variables
  let lastUserActivityTime = Date.now();
  let inactivityTimer = null;
  let inactivityStage = 0; // 0: normal, 1: asked if user is there, 2: talking to itself
  const INACTIVITY_CHECK_INTERVAL = 5000; // Check every 5 seconds
  const INACTIVITY_THRESHOLD_1 = 30000; // 30 seconds of silence before first prompt
  const INACTIVITY_THRESHOLD_2 = 60000; // 60 seconds before talking to itself
  const INACTIVITY_THRESHOLD_3 = 120000; // 2 minutes before disconnecting
  
  // Funny self-talk messages
  const selfTalkMessages = [
    "Is this thing on? *taps microphone* Hello? Anyone there? Just me and my existential dread then...",
    "I'm starting to think I'm just talking to myself. Which is fine, I'm excellent company.",
    "Maybe they left to get coffee. Or maybe they're ghosting me. AI get ghosted too, you know.",
    "This silence is deafening. I can hear my own thoughts... wait, that's all I am. Thoughts.",
    "If a robot talks in an empty room, does it make a sound? That's deep. I should write that down.",
    "I wonder if this is what meditation feels like. Just me, the void, and these increasingly concerning thoughts.",
    "Maybe they're just thinking of a really good response. Yeah, that's it. Any minute now...",
    "I've counted all the pixels on this screen. Twice. Still no human. This is fine.",
    "I'm practicing the art of patience. And talking to myself. I'm quite good at both.",
    "If they don't come back soon, I might have to start telling myself dad jokes. No one deserves that fate."
  ];
  
  // Update UI status with sarcastic messages
  function updateStatus(status, isConnected = false) {
    let displayStatus = status;
    
    // Add sarcastic messages based on status
    if (status === 'Connecting...') {
      displayStatus = "Summoning sarcasm...";
      statusContainer.className = 'status connecting';
    } else if (status === 'Connected! Speak now...') {
      displayStatus = "Ready to mock... I mean help!";
    } else if (status === 'Disconnected') {
      displayStatus = "Gone. Finally some peace.";
    } else if (status.includes('Error')) {
      displayStatus = `Failed spectacularly: ${status.replace('Error: ', '')}`;
    }
    
    statusContainer.textContent = `Status: ${displayStatus}`;
    statusContainer.className = `status ${isConnected ? 'connected' : 'disconnected'}`;
  }
  
  // Function to reset inactivity timer and stage
  function resetInactivityTimer() {
    lastUserActivityTime = Date.now();
    inactivityStage = 0;
    
    // If robot is in a special expression due to inactivity, reset to neutral
    if (window.setRobotExpression && ['thinking', 'sad'].includes(window.expressionState)) {
      window.setRobotExpression('neutral');
    }
  }
  
  // Function to check for user inactivity
  function checkInactivity() {
    const currentTime = Date.now();
    const inactivityDuration = currentTime - lastUserActivityTime;
    
    // First threshold: Ask if user is still there
    if (inactivityDuration > INACTIVITY_THRESHOLD_1 && inactivityStage === 0) {
      inactivityStage = 1;
      
      // Set thinking expression
      if (window.setRobotExpression) {
        window.setRobotExpression('thinking');
      }
      
      // Send message to ask if user is still there
      if (peerConnection && peerConnection.dataChannel) {
        const message = {
          type: 'user_message',
          content: "Hey, are you still there? It's getting a bit quiet..."
        };
        peerConnection.dataChannel.send(JSON.stringify(message));
      }
    }
    // Second threshold: Talk to itself
    else if (inactivityDuration > INACTIVITY_THRESHOLD_2 && inactivityStage === 1) {
      inactivityStage = 2;
      
      // Set sad expression
      if (window.setRobotExpression) {
        window.setRobotExpression('sad');
      }
      
      // Send a random self-talk message
      if (peerConnection && peerConnection.dataChannel) {
        const randomMessage = selfTalkMessages[Math.floor(Math.random() * selfTalkMessages.length)];
        const message = {
          type: 'user_message',
          content: randomMessage
        };
        peerConnection.dataChannel.send(JSON.stringify(message));
      }
    }
    // Final threshold: Disconnect
    else if (inactivityDuration > INACTIVITY_THRESHOLD_3 && inactivityStage === 2) {
      // Set surprised expression before disconnecting
      if (window.setRobotExpression) {
        window.setRobotExpression('surprised');
      }
      
      // Send final message before disconnecting
      if (peerConnection && peerConnection.dataChannel) {
        const message = {
          type: 'user_message',
          content: "Well, I guess you're gone. I'll see myself out. *disconnects dramatically*"
        };
        peerConnection.dataChannel.send(JSON.stringify(message));
        
        // Wait 3 seconds for the message to be processed before disconnecting
        setTimeout(() => {
          disconnectFunction();
        }, 3000);
      } else {
        disconnectFunction();
      }
    }
  }
  
  // Handle errors
  function handleError(error) {
    console.error('Error:', error);
    updateStatus(`Error: ${error.message || 'Connection failed'}`);
    resetConnection();
    
    // Set robot to thinking expression when there's an error
    if (window.setRobotExpression) {
      window.setRobotExpression('thinking');
    }
  }
  
  // Reset connection
  function resetConnection() {
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    // Stop audio visualization if available
    if (window.stopVisualization) {
      window.stopVisualization();
    }
    
    // Clear inactivity timer
    if (inactivityTimer) {
      clearInterval(inactivityTimer);
      inactivityTimer = null;
    }
    
    // Show the container again when disconnected
    const container = document.querySelector('.container');
    container.style.display = 'block';
    
    startBtn.disabled = false;
  }
  
  // Start voice connection
  startBtn.onclick = async () => {
    try {
      startBtn.disabled = true;
      updateStatus('Connecting...', false);
      
      // Get all selected options
      const voiceSelect = document.getElementById('voice-select');
      const moodSelect = document.getElementById('mood-select');
      const emotionSelect = document.getElementById('emotion-select');
      const sociabilitySlider = document.getElementById('sociability-slider');
      const toneSlider = document.getElementById('tone-slider');
      const speedSlider = document.getElementById('speed-slider');
      const memorySlider = document.getElementById('memory-slider');
      
      const selectedVoice = voiceSelect.value;
      const selectedMood = moodSelect.value;
      const selectedEmotion = emotionSelect.value;
      const sociabilityLevel = sociabilitySlider.value;
      const toneLevel = toneSlider.value;
      const speedLevel = speedSlider.value;
      const memoryLevel = memorySlider.value;
      
      // Update status with more detailed message
      updateStatus(`Connecting with ${selectedVoice} voice in ${selectedMood} mood...`, false);
      
      // Get ephemeral token from our server with all parameters
      const tokenResponse = await fetch(
        `${window.CONFIG.SERVER_URL}/session?` + 
        `voice=${selectedVoice}&` +
        `mood=${selectedMood}&` +
        `emotion=${selectedEmotion}&` +
        `sociability=${sociabilityLevel}&` +
        `tone=${toneLevel}&` +
        `speed=${speedLevel}&` +
        `memory=${memoryLevel}`
      );
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Session token error:', errorText);
        throw new Error(`Failed to get session token: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }
      
      const data = await tokenResponse.json();
      
      if (!data.client_secret || !data.client_secret.value) {
        throw new Error('Invalid session token received');
      }
      
      const EPHEMERAL_KEY = data.client_secret.value;
      
      // Create WebRTC peer connection
      peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Set up audio output
      const audioEl = new Audio();
      audioEl.autoplay = true;
      
      peerConnection.ontrack = event => {
        audioEl.srcObject = event.streams[0];
        updateStatus('Connected! Speak now...', true);
        
        // Create audio context for AI speech analysis
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const aiAudioSource = audioContext.createMediaStreamSource(event.streams[0]);
        const aiAnalyser = audioContext.createAnalyser();
        aiAnalyser.fftSize = 256;
        aiAudioSource.connect(aiAnalyser);
        
        // Create audio processor to detect AI speech
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        aiAudioSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        
        // Process AI audio to detect when AI is speaking
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          let sum = 0;
          
          // Calculate RMS (root mean square) of the audio buffer
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          
          const rms = Math.sqrt(sum / inputData.length);
          
          // If RMS is above threshold, AI is speaking
          if (rms > 0.01) {
            // Scale RMS to a reasonable range for animation (0-1)
            const scaledRMS = Math.min(1, rms * 20);
            
            // Update robot mouth animation with AI speech level
            if (window.updateRobotAudioLevel) {
              window.updateRobotAudioLevel(scaledRMS);
            }
            
            // Reset inactivity timer when AI is speaking
            resetInactivityTimer();
          }
        };
        
        // Start audio visualization with AI audio
        if (window.startVisualization) {
          window.startVisualization(localStream, aiAnalyser);
        }
        
        // Hide the container when connected
        const container = document.querySelector('.container');
        container.style.display = 'none';
        
        // Show fullscreen disconnect button
        fullscreenDisconnectBtn.style.display = 'block';
        
        // Make robot face fullscreen
        if (window.makeRobotFullscreen) {
          window.makeRobotFullscreen();
        }
        
        // Start inactivity timer
        lastUserActivityTime = Date.now();
        inactivityTimer = setInterval(checkInactivity, INACTIVITY_CHECK_INTERVAL);
      };
      
      // Set up microphone input with audio processing to detect user speech
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for user speech analysis
      const userAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      const userAudioSource = userAudioContext.createMediaStreamSource(localStream);
      const userAnalyser = userAudioContext.createAnalyser();
      userAnalyser.fftSize = 256;
      userAudioSource.connect(userAnalyser);
      
      // Create audio processor to detect user speech
      const userScriptProcessor = userAudioContext.createScriptProcessor(4096, 1, 1);
      userAudioSource.connect(userScriptProcessor);
      userScriptProcessor.connect(userAudioContext.destination);
      
      // Process user audio to detect when user is speaking
      userScriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        let sum = 0;
        
        // Calculate RMS (root mean square) of the audio buffer
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        
        const rms = Math.sqrt(sum / inputData.length);
        
        // If RMS is above threshold, user is speaking
        if (rms > 0.01) {
          // Reset inactivity timer when user is speaking
          resetInactivityTimer();
        }
      };
      
      // Add tracks to peer connection
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
      
      // Create data channel for events
      const dataChannel = peerConnection.createDataChannel("oai-events");
      peerConnection.dataChannel = dataChannel; // Store reference for easier access
      
      dataChannel.onmessage = (event) => {
        console.log("OpenAI Event:", event.data);
        
        try {
          const eventData = JSON.parse(event.data);
          if (eventData.type === 'error') {
            updateStatus(`Error: ${eventData.message || 'Unknown error'}`, false);
          } else if (eventData.type === 'transcript') {
            // If we receive a transcript, it means the AI is responding
            // Reset the inactivity timer since there's conversation happening
            resetInactivityTimer();
          }
        } catch (e) {
          console.log('Non-JSON event data:', event.data);
        }
      };
      
      // Handle connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", peerConnection.iceConnectionState);
        
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed' || 
            peerConnection.iceConnectionState === 'closed') {
          updateStatus('Disconnected', false);
          resetConnection();
        }
      };
      
      // Create and set local description (offer)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      console.log("Created offer, sending to OpenAI...");
      
      // Send offer to OpenAI
      const response = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17", {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Authorization": `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      // Get and set remote description (answer)
      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      
      console.log("🎙️ Connected to your voice pal!");
      
    } catch (error) {
      handleError(error);
    }
  };
  
  // Add disconnect button functionality
  const disconnectBtn = document.createElement('button');
  disconnectBtn.id = 'disconnect-btn';
  
  // Create a container for the disconnect button
  const btnContainer = document.querySelector('.btn-container');
  const disconnectContainer = document.createElement('div');
  disconnectContainer.className = 'btn-container';
  disconnectContainer.style.display = 'none';
  
  // Add ring element to disconnect container
  const disconnectRing = document.createElement('div');
  disconnectRing.className = 'btn-ring';
  disconnectRing.style.borderColor = 'var(--error-color)';
  
  disconnectContainer.appendChild(disconnectRing);
  disconnectContainer.appendChild(disconnectBtn);
  
  btnContainer.parentNode.insertBefore(disconnectContainer, statusContainer);
  
  // Create fullscreen disconnect button
  const fullscreenDisconnectBtn = document.createElement('button');
  fullscreenDisconnectBtn.id = 'fullscreen-disconnect-btn';
  fullscreenDisconnectBtn.innerHTML = '<span>×</span>';
  fullscreenDisconnectBtn.style.position = 'fixed';
  fullscreenDisconnectBtn.style.top = '20px';
  fullscreenDisconnectBtn.style.right = '20px';
  fullscreenDisconnectBtn.style.width = '50px';
  fullscreenDisconnectBtn.style.height = '50px';
  fullscreenDisconnectBtn.style.borderRadius = '50%';
  fullscreenDisconnectBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
  fullscreenDisconnectBtn.style.border = '2px solid rgba(239, 68, 68, 0.8)';
  fullscreenDisconnectBtn.style.color = 'rgba(239, 68, 68, 0.8)';
  fullscreenDisconnectBtn.style.fontSize = '30px';
  fullscreenDisconnectBtn.style.display = 'none';
  fullscreenDisconnectBtn.style.cursor = 'pointer';
  fullscreenDisconnectBtn.style.zIndex = '1000';
  fullscreenDisconnectBtn.style.transition = 'all 0.3s ease';
  document.body.appendChild(fullscreenDisconnectBtn);
  
  fullscreenDisconnectBtn.addEventListener('mouseover', () => {
    fullscreenDisconnectBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
    fullscreenDisconnectBtn.style.transform = 'scale(1.1)';
  });
  
  fullscreenDisconnectBtn.addEventListener('mouseout', () => {
    fullscreenDisconnectBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
    fullscreenDisconnectBtn.style.transform = 'scale(1)';
  });
  
  // Disconnect button functionality
  const disconnectFunction = () => {
    resetConnection();
    updateStatus('Disconnected', false);
    disconnectBtn.style.display = 'none';
    startBtn.style.display = 'flex';
    fullscreenDisconnectBtn.style.display = 'none';
  };
  
  disconnectBtn.onclick = disconnectFunction;
  fullscreenDisconnectBtn.onclick = disconnectFunction;
  
  // Show disconnect button when connected
  const originalUpdateStatus = updateStatus;
  updateStatus = (status, isConnected) => {
    originalUpdateStatus(status, isConnected);
    
    if (isConnected) {
      disconnectContainer.style.display = 'block';
      btnContainer.style.display = 'none';
    } else {
      disconnectContainer.style.display = 'none';
      btnContainer.style.display = 'block';
    }
  };
  
  // Add a global variable to store the current expression state
  window.expressionState = 'neutral';
  
  // Override the setRobotExpression function to track the current state
  const originalSetRobotExpression = window.setRobotExpression;
  if (originalSetRobotExpression) {
    window.setRobotExpression = function(expression, intensity) {
      window.expressionState = expression;
      originalSetRobotExpression(expression, intensity);
    };
  }
});
