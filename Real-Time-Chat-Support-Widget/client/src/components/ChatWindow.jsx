import ChatMessages from './ChatMessages.jsx';
import ChatInput from './ChatInput.jsx';
import { useChat } from '../context/ChatContext.jsx';
import { useTypingIndicator } from '../hooks/useTypingIndicator.js';

export default function ChatWindow() {
  const { user, messages, connectionStatus, typingUsers, sendMessage } = useChat();
  const { handleTyping, handleStopTyping } = useTypingIndicator();

  return (
    <div className="flex h-full flex-col">
      <ChatMessages messages={messages} typingUsers={typingUsers} currentUserId={user?.username || ''} />
      <ChatInput
        onSend={sendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={connectionStatus === 'disconnected'}
      />
    </div>
  );
}
