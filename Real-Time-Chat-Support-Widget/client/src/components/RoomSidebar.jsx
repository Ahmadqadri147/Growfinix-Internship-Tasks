import { useState } from 'react';
import { Hash, MessageSquare, Plus, LogIn, Users } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import CreateRoomModal from './CreateRoomModal.jsx';
import JoinRoomModal from './JoinRoomModal.jsx';

export default function RoomSidebar() {
  const { rooms, allRooms, currentRoomId, switchRoom } = useChat();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');

  return (
    <div className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-display text-sm font-bold text-slate-800">Chats</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            aria-label="Create room"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={() => { setJoinRoomCode(''); setShowJoin(true); }}
            aria-label="Join room"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
          >
            <LogIn size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <MessageSquare size={32} className="mb-2 text-slate-300" />
            <p className="text-xs text-slate-400">No chats yet</p>
            <p className="mt-1 text-[10px] text-slate-300">
              Create or join a room to start chatting
            </p>
          </div>
        )}

        <div className="space-y-0.5 px-2 py-2">
          {rooms.map((room) => (
            <button
              key={room.roomId}
              type="button"
              onClick={() => switchRoom(room.roomId)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                currentRoomId === room.roomId
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  currentRoomId === room.roomId ? 'bg-white/20' : 'bg-slate-100'
                }`}
              >
                {room.type === 'direct' ? (
                  <Users size={14} className={currentRoomId === room.roomId ? 'text-white' : 'text-slate-400'} />
                ) : (
                  <Hash size={14} className={currentRoomId === room.roomId ? 'text-white' : 'text-slate-400'} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={`truncate text-sm font-medium ${currentRoomId === room.roomId ? 'text-white' : ''}`}>
                  {room.name}
                </p>
                <p className={`truncate text-[10px] ${currentRoomId === room.roomId ? 'text-white/70' : 'text-slate-400'}`}>
                  {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {allRooms.length > 0 && (
          <>
            <div className="border-t border-slate-100 px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Available Rooms
              </p>
            </div>
            <div className="space-y-0.5 px-2 pb-2">
              {allRooms
                .filter((r) => !rooms.some((my) => my.roomId === r.roomId))
                .map((room) => (
                  <button
                    key={room.roomId}
                    type="button"
                    onClick={() => { setJoinRoomCode(room.roomId); setShowJoin(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Hash size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{room.name}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} initialRoomCode={joinRoomCode} />}
    </div>
  );
}
