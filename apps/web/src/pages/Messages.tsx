import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (selectedUserId) {
      apiClient.get(`/messages?otherUserId=${selectedUserId}`).then((res: any) => {
        setMessages(res.data.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!user) return;
    const newSocket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('accessToken') }
    });

    newSocket.on('new_message', (message) => {
      if (message.senderId === selectedUserId || message.receiverId === selectedUserId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => { newSocket.disconnect(); };
  }, [user, selectedUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    
    try {
      const res = await apiClient.post('/messages', {
        receiverId: selectedUserId,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-medium">Contacts</div>
        <div className="flex-1 overflow-y-auto">
          {contacts?.map((contact: any) => (
            <div 
              key={contact._id} 
              onClick={() => setSelectedUserId(contact._id)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedUserId === contact._id ? 'bg-blue-50 border-blue-100' : ''}`}
            >
              <div className="font-medium text-slate-900">{contact.firstName} {contact.lastName}</div>
              <div className="text-xs text-slate-500">{contact.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-900 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Type a message..."
                />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
