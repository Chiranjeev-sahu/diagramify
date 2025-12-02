import { useEffect, useRef } from 'react';
import { Sparkles, Bot, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/useChatStore';
import { useDiagramStore } from '@/store/useDiagramStore';
import { Spinner } from '@/components/ui/LoadingStates';

export default function AIChat() {
  const { currentChat, isLoading: chatLoading, fetchChatHistory } = useChatStore();
  const { currentDiagram, repromptDiagram, isGenerating } = useDiagramStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');

    if (!message?.trim() || !currentDiagram) return;

    // Reprompt the diagram with the new message
    await repromptDiagram(currentDiagram._id, message.trim());

    // Refresh chat to see new messages
    await fetchChatHistory(currentDiagram.chatId);

    // Clear input
    e.target.reset();
  };

  const handleViewVersion = (diagramId) => {
    // TODO: Load specific diagram version
    console.log('View diagram:', diagramId);
  };

  if (!currentDiagram) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Diagram Selected</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Select a diagram from the sidebar or create a new one to start chatting with AI
        </p>
      </div>
    );
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
        {chatLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : !currentChat?.messages || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-slate-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          currentChat.messages.map((msg, index) => (
            <div
              key={index}
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
                {msg.resultingDiagramId && (
                  <div className="mt-3 pt-3 border-t border-slate-300">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span className="font-medium">New Version Created</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewVersion(msg.resultingDiagramId)}
                        className="flex-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className='p-4 border-t border-slate-200'>
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <input
            type="text"
            name="message"
            placeholder='Ask AI to modify the diagram...'
            disabled={isGenerating}
            className='flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
