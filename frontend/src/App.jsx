import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatBox from './components/ChatBox';
import { chatAPI } from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        let currentSessionId = localStorage.getItem('support_session_id');

        if (!currentSessionId) {
          // Generate new session if none exists
          currentSessionId = uuidv4();
          localStorage.setItem('support_session_id', currentSessionId);
          setSessionId(currentSessionId);
          setMessages([]);
        } else {
          // Load existing session history
          setSessionId(currentSessionId);
          await loadConversationHistory(currentSessionId);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const loadConversationHistory = async (sid) => {
    try {
      const history = await chatAPI.getConversation(sid);
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      // It's okay if it fails, we just start with an empty chat
    }
  };

  const startNewChat = () => {
    const newSessionId = uuidv4();
    localStorage.setItem('support_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* Main App Container */}
      <div className="w-full h-[85vh] max-h-[900px] z-10 flex">
        <ChatBox
          sessionId={sessionId}
          messages={messages}
          setMessages={setMessages}
          startNewChat={startNewChat}
        />
      </div>
    </div>
  );
}

export default App;
