import { AnimatePresence } from 'framer-motion';
import ChatButton from './ChatButton.jsx';
import ChatWindow from './ChatWindow.jsx';
import { useChat } from '../context/ChatContext.jsx';

export default function ChatWidget() {
  const { isOpen, setIsOpen, unreadCount } = useChat();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>{isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}</AnimatePresence>

      <ChatButton isOpen={isOpen} onClick={() => setIsOpen((v) => !v)} unreadCount={unreadCount} />
    </div>
  );
}
