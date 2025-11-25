import { useState } from 'react';
import { Sparkles, Bot, User } from 'lucide-react';
import { cn } from '@/utils/cn';
export default function AIChat({ onSendMessage }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hi! I can help you modify your diagram. Try asking me to add nodes, change colors, or restructure the flow.',
      timestamp: new Date(),
    },
    {
      id: 2,
      role: 'assistant',
      content: 'Hi! I can help you modify your diagram.',
      timestamp: new Date(),
      diagram: {
        versionId: 'test123',
        versionNumber: 1,
      }
    },
    {
      id: 3,
      role: 'user',
      content: 'Create a login flowchart',
      timestamp: new Date(),
    }
  ]);

  const handleSend = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    onSendMessage(currentMessage);
  }
  return (
    <div className="h-full flex flex-col bg-white">

      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">AI Assistant</h3>
          <p className="text-xs text-slate-500">Ask me to modify your diagram</p>
        </div>
      </div>

      <div className='flex-1 overflow-auto p-4 space-y-4'>
        {messages.map((msg) =>
        (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === "user" ? 'flex-row-reverse' : 'flex-row'
            )}
          >

            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100'
              )}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-slate-600" />
              ) : (
                <Bot className="w-4 h-4 text-blue-600" />
              )}
            </div>

            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
              )}
            >
              <p className="text-sm leading-6">{msg.content}</p>
              {msg.diagram && (
                <div className="mt-3 pt-3 border-t border-slate-300">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <span className="font-medium">Version {msg.diagram.versionNumber}</span>
                    <span>{msg.timestamp.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      View
                    </button>
                    <button className="px-2 py-1 text-xs font-medium border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        ))}
      </div>

      <div className='p-4 border-t border-slate-200'>
        <div className='flex gap-2'>
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Ask AI to modify the diagram...'
            className='flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm'
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!currentMessage.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      </div>

    </div>
  );
}
