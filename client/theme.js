// Theme and conversation history functionality for Voice Pal app

document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeSwitch = document.getElementById('theme-switch');
  const body = document.body;
  const html = document.documentElement;
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    themeSwitch.checked = true;
  }
  
  // Theme toggle event listener
  themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  });
  
  // Conversation history functionality
  const conversationPanel = document.getElementById('conversation-panel');
  const conversationToggle = document.getElementById('conversation-toggle');
  const conversationList = document.getElementById('conversation-list');
  
  // Initially hide conversation toggle (will show when connected)
  conversationToggle.style.display = 'none';
  
  // Toggle conversation panel
  conversationToggle.addEventListener('click', () => {
    if (conversationPanel.style.display === 'block') {
      conversationPanel.style.display = 'none';
    } else {
      conversationPanel.style.display = 'block';
    }
  });
  
  // Create a global function to add conversation items
  window.addConversationItem = (text, isUser = false) => {
    // Show conversation toggle if it's hidden
    conversationToggle.style.display = 'flex';
    
    // Create new conversation item
    const item = document.createElement('li');
    item.className = isUser ? 'conversation-item user' : 'conversation-item';
    item.textContent = text;
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'conversation-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    timestamp.style.fontSize = '0.7rem';
    timestamp.style.opacity = '0.7';
    timestamp.style.marginTop = '0.3rem';
    item.appendChild(timestamp);
    
    // Add to conversation list
    conversationList.appendChild(item);
    
    // Scroll to bottom
    conversationPanel.scrollTop = conversationPanel.scrollHeight;
    
    // Save conversation to localStorage
    saveConversation();
  };
  
  // Function to save conversation to localStorage
  function saveConversation() {
    const items = conversationList.innerHTML;
    localStorage.setItem('conversation', items);
  }
  
  // Load saved conversation
  function loadConversation() {
    const savedConversation = localStorage.getItem('conversation');
    if (savedConversation) {
      conversationList.innerHTML = savedConversation;
      conversationToggle.style.display = 'flex';
    }
  }
  
  // Load saved conversation on page load
  loadConversation();
  
  // Add clear conversation button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear History';
  clearButton.style.marginTop = '1rem';
  clearButton.style.padding = '0.5rem 1rem';
  clearButton.style.backgroundColor = 'var(--error-color)';
  clearButton.style.color = 'white';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '4px';
  clearButton.style.cursor = 'pointer';
  clearButton.style.fontSize = '0.8rem';
  clearButton.style.fontWeight = 'bold';
  
  clearButton.addEventListener('click', () => {
    conversationList.innerHTML = '';
    localStorage.removeItem('conversation');
    conversationPanel.style.display = 'none';
    conversationToggle.style.display = 'none';
  });
  
  conversationPanel.appendChild(clearButton);
  
  // Speech recognition for hands-free mode
  let recognition;
  
  // Check if browser supports speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Create speech recognition toggle button
    const speechToggle = document.createElement('button');
    speechToggle.className = 'speech-toggle';
    speechToggle.innerHTML = '🎤';
    speechToggle.style.position = 'fixed';
    speechToggle.style.bottom = '20px';
    speechToggle.style.right = '20px';
    speechToggle.style.width = '50px';
    speechToggle.style.height = '50px';
    speechToggle.style.borderRadius = '50%';
    speechToggle.style.backgroundColor = 'var(--primary-color)';
    speechToggle.style.color = 'white';
    speechToggle.style.fontSize = '1.5rem';
    speechToggle.style.border = 'none';
    speechToggle.style.cursor = 'pointer';
    speechToggle.style.zIndex = '100';
    speechToggle.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    speechToggle.style.display = 'none'; // Initially hidden
    
    document.body.appendChild(speechToggle);
    
    // Speech recognition event handlers
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      window.addConversationItem(transcript, true);
      
      // Flash the speech button to indicate recognition
      speechToggle.style.backgroundColor = 'var(--success-color)';
      setTimeout(() => {
        speechToggle.style.backgroundColor = 'var(--primary-color)';
      }, 500);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Flash the speech button red to indicate error
      speechToggle.style.backgroundColor = 'var(--error-color)';
      setTimeout(() => {
        speechToggle.style.backgroundColor = 'var(--primary-color)';
      }, 500);
    };
    
    // Toggle speech recognition
    speechToggle.addEventListener('click', () => {
      try {
        recognition.start();
        
        // Visual feedback
        speechToggle.style.transform = 'scale(1.1)';
        speechToggle.style.backgroundColor = 'var(--info-color)';
        
        // Reset after 2 seconds or on result
        setTimeout(() => {
          speechToggle.style.transform = 'scale(1)';
          speechToggle.style.backgroundColor = 'var(--primary-color)';
        }, 2000);
      } catch (e) {
        console.error('Speech recognition error:', e);
      }
    });
    
    // Show speech button when connected
    const originalUpdateStatus = window.updateStatus;
    if (originalUpdateStatus) {
      window.updateStatus = (status, isConnected) => {
        originalUpdateStatus(status, isConnected);
        
        if (isConnected) {
          speechToggle.style.display = 'flex';
        } else {
          speechToggle.style.display = 'none';
        }
      };
    }
  }
});
