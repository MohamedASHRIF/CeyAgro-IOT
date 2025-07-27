// "use client";

// import { useState } from "react";

// interface InputProps {
//   onSend: (msg: string) => void;
//   setTyping: (typing: boolean) => void;
// }

// export const MessageInput = ({ onSend, setTyping }: InputProps) => {
//   const [message, setMessage] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim()) return;
//     onSend(message.trim());
//     setMessage("");
//     setTyping(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
//       <input
//         type="text"
//         className="flex-1 px-4 py-2 rounded-lg border border-gray-300"
//         value={message}
//         placeholder="Type your message..."
//         onChange={(e) => {
//           setMessage(e.target.value);
//           setTyping(true);
//         }}
//       />
//       <button
//         type="submit"
//         className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
//       >
//         Send
//       </button>
//     </form>
//   );
// };
// app/user-chat/components/MessageInput.tsx
// "use client";

// import { useState } from "react";

// interface InputProps {
//   onSend: (msg: string) => void;
//   setTyping: (typing: boolean) => void;
// }

// export const MessageInput = ({ onSend, setTyping }: InputProps) => {
//   const [message, setMessage] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim()) return;
//     onSend(message.trim());
//     setMessage("");
//     setTyping(false);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="border-t border-gray-200 bg-white p-4 flex items-center gap-2"
//     >
//       <input
//         type="text"
//         className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
//         value={message}
//         placeholder="Type your message..."
//         onChange={(e) => {
//           setMessage(e.target.value);
//           setTyping(true);
//         }}
//       />
//       <button
//         type="submit"
//         className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
//       >
//         Send
//       </button>
//     </form>
//   );
// };

// user/(components)/MessageInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface InputProps {
  onSend: (msg: string) => void;
  userId: string;
  adminId: string;
}

export const MessageInput = ({ onSend, userId, adminId }: InputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // NEW: Initialize Socket.IO
    socketRef.current = io("http://localhost:3001", {
      query: { userId },
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    // NEW: Emit typing event
    socketRef.current?.emit("typing", {
      senderId: userId,
      receiverId: adminId,
      isTyping,
    });
  }, [isTyping, userId, adminId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // NEW: Send message via Socket.IO
    socketRef.current?.emit("sendMessage", {
      senderId: userId,
      receiverId: adminId,
      content: message.trim(),
    });
    onSend(message.trim());
    setMessage("");
    setIsTyping(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 flex items-center gap-2"
    >
      <input
        type="text"
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        value={message}
        placeholder="Type your message..."
        onChange={(e) => {
          setMessage(e.target.value);
          setIsTyping(!!e.target.value.trim());
        }}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
      >
        Send
      </button>
    </form>
  );
};
