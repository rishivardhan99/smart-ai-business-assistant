// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { api, getOrCreateSessionId } from '../api/apiConfig';
import { Send, Bot, User, Mail, X, CheckCircle2 } from 'lucide-react';

export default function Chat() {
  // --- Chat State ---
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi there! How can I help your business today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // --- Email Modal State ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailForm, setEmailForm] = useState({
    sender: '',
    subject: '',
    body: ''
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    // Add user message, and a placeholder for the streaming assistant message
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: userText },
      { role: 'assistant', content: '', isStreaming: true } // Placeholder
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const sessionId = getOrCreateSessionId();
      
      // Use native fetch to read the stream
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userText, 
          session_id: sessionId 
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      // Set up the stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let assistantResponse = "";

      setIsLoading(false); // Hide the "Thinking..." bubble as soon as stream starts

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const data = JSON.parse(dataStr);
                if (data.chunk) {
                  assistantResponse += data.chunk;
                  
                  // Update the LAST message in the array (our placeholder) with the new text
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantResponse;
                    return newMessages;
                  });
                }
              } catch (e) {
                console.warn("Could not parse stream chunk", e);
              }
            }
          }
        }
      }

      // Mark streaming as finished
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].isStreaming = false;
        return newMessages;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "I'm having trouble connecting to the server. Please try again later.";
        newMessages[newMessages.length - 1].isStreaming = false;
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  // --- Handle Automated Email Submission ---
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);
    
    try {
      // Fire the payload directly to our automated webhook!
      await api.post('/automations/webhook/email', emailForm);
      
      setEmailSuccess(true);
      // Close modal and reset after 2.5 seconds
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
        setEmailForm({ sender: '', subject: '', body: '' });
      }, 2500);
    } catch (err) {
      console.error("Failed to send email webhook", err);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh] relative">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <Bot size={28} />
            <div>
              <h2 className="font-bold text-lg">SmartAI Assistant</h2>
              <p className="text-blue-100 text-sm">Online & ready to help</p>
            </div>
          </div>
          
          {/* New Email Support Button */}
          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Mail size={16} />
            Email Support
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-gray-200'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-500 rounded-full py-2 px-4 animate-pulse text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-gray-100 text-gray-800 rounded-full py-3 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        {/* Email Form Overlay Modal */}
        {showEmailModal && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-2xl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
              
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="text-blue-600" size={20} /> Contact Human Support
                </h3>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-700 bg-gray-200/50 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              {emailSuccess ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Message Sent!</h4>
                    <p className="text-sm text-gray-500">Our operations team will review this shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="p-6 space-y-5 bg-white">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="alex@company.com"
                      value={emailForm.sender}
                      onChange={(e) => setEmailForm({...emailForm, sender: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="What do you need help with?"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Message Details</label>
                    <textarea 
                      required
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                      placeholder="Please describe your issue or request..."
                      value={emailForm.body}
                      onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSendingEmail}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm hover:shadow-md"
                  >
                    {isSendingEmail ? (
                      <span className="flex items-center gap-2 animate-pulse">Sending...</span>
                    ) : (
                      <><Send size={18} /> Submit to Operations</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}