document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const statusContainer = document.getElementById('status-container');
  let peerConnection = null;
  let localStream = null;
  
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
      
      // Set up speech recognition for user input
      let userSpeech = '';
      let aiSpeech = '';
      let isSpeaking = false;
      
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
          
          // Mark AI as speaking
          if (!isSpeaking) {
            isSpeaking = true;
            // If we have user speech and AI starts speaking, add user speech to conversation
            if (userSpeech && window.addConversationItem) {
              window.addConversationItem(userSpeech, true);
              userSpeech = '';
            }
          }
          
          // Reset AI speech timeout
          if (aiSpeechTimeout) {
            clearTimeout(aiSpeechTimeout);
          }
          
          // Set timeout to detect when AI stops speaking
          aiSpeechTimeout = setTimeout(() => {
            if (isSpeaking && aiSpeech && window.addConversationItem) {
              window.addConversationItem(aiSpeech);
              aiSpeech = '';
              isSpeaking = false;
            }
          }, 1500);
        }
      };
      
      // Set up WebRTC data channel for transcripts
      let aiSpeechTimeout;
      
      // Create data channel for transcripts
      const transcriptChannel = peerConnection.createDataChannel("oai-transcript");
      transcriptChannel.onmessage = (event) => {
        try {
          const transcriptData = JSON.parse(event.data);
          if (transcriptData.type === 'transcript') {
            // Store AI speech for conversation history
            aiSpeech = transcriptData.text || '';
          }
        } catch (e) {
          console.log('Non-JSON transcript data:', event.data);
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
      };
      
      // Set up microphone input
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
      
      // Create data channel for events
      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannel.onmessage = (event) => {
        console.log("OpenAI Event:", event.data);
        
        try {
          const eventData = JSON.parse(event.data);
          if (eventData.type === 'error') {
            updateStatus(`Error: ${eventData.message || 'Unknown error'}`, false);
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
});
