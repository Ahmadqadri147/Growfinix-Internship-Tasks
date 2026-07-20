import { ChatProvider, useChat } from './context/ChatContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import MainLayout from './components/MainLayout.jsx';

function AppContent() {
  const { isAuthenticated } = useChat();
  return isAuthenticated ? <MainLayout /> : <AuthPage />;
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
