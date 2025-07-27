// "use client";

// import { useEffect, useRef } from "react";

// interface ChatProps {
//   messages: {
//     _id: string;
//     senderId: string;
//     receiverId: string;
//     content: string;
//     timestamp: string;
//     read?: boolean;
//   }[];
//   typing: boolean;
// }

// export const ChatWindow = ({ messages, typing }: ChatProps) => {
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, typing]);

//   return (
//     <div className="h-[500px] overflow-y-auto bg-gray-100 p-4 space-y-2 rounded-b-xl shadow-inner flex flex-col">
//       {messages.map((msg) => (
//         <div
//           key={msg._id}
//           className={`p-2 rounded max-w-[70%] ${
//             msg.senderId === "manual|admin@gmail.com"
//               ? "bg-white self-start"
//               : "bg-green-200 self-end ml-auto"
//           }`}
//         >
//           <p>{msg.content}</p>
//           <p className="text-xs text-right text-gray-500">
//             {new Date(msg.timestamp).toLocaleTimeString()}
//           </p>
//         </div>
//       ))}
//       {typing && (
//         <p className="text-sm italic text-gray-500">Admin is typing...</p>
//       )}
//       <div ref={bottomRef} />
//     </div>
//   );
// };
// app/user-chat/components/ChatWindow.tsx
// "use client";

// import { useEffect, useRef } from "react";

// interface ChatProps {
//   messages: {
//     _id: string;
//     senderId: string;
//     receiverId: string;
//     content: string;
//     timestamp: string;
//     read?: boolean;
//   }[];
//   typing: boolean;
// }

// export const ChatWindow = ({ messages, typing }: ChatProps) => {
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, typing]);

//   return (
//     <div className="h-[500px] overflow-y-auto bg-gray-50 p-6 space-y-4 flex flex-col">
//       {messages.map((msg) => (
//         <div
//           key={msg._id}
//           className={`p-3 rounded-xl max-w-[70%] text-sm shadow-md ${
//             msg.senderId === "manual|admin@gmail.com"
//               ? "bg-white self-start text-gray-800"
//               : "bg-green-100 self-end text-gray-900"
//           }`}
//         >
//           <p className="mb-1">{msg.content}</p>
//           <p className="text-[10px] text-right text-gray-500">
//             {new Date(msg.timestamp).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </p>
//         </div>
//       ))}
//       {typing && (
//         <p className="text-sm italic text-gray-500">Admin is typing...</p>
//       )}
//       <div ref={bottomRef} />
//     </div>
//   );
// };
// user/(components)/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatProps {
  messages: {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read?: boolean;
  }[];
  userId: string;
  adminId: string;
}

export const ChatWindow = ({
  messages: initialMessages,
  userId,
  adminId,
}: ChatProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // NEW: Initialize Socket.IO
    socketRef.current = io("http://localhost:3001", {
      query: { userId },
    });

    socketRef.current.on("newMessage", (message) => {
      if (
        (message.senderId === userId && message.receiverId === adminId) ||
        (message.senderId === adminId && message.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("typing", ({ senderId, isTyping }) => {
      if (senderId === adminId) {
        setTyping(isTyping);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, adminId]);

  useEffect(() => {
    setMessages(initialMessages); // NEW: Update messages when initialMessages change
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="h-[500px] overflow-y-auto bg-gray-50 p-6 space-y-4 flex flex-col">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`p-3 rounded-xl max-w-[70%] text-sm shadow-md ${
            msg.senderId === adminId
              ? "bg-white self-start text-gray-800"
              : "bg-green-100 self-end text-gray-900"
          }`}
        >
          <p className="mb-1">{msg.content}</p>
          <p className="text-[10px] text-right text-gray-500">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
      {typing && (
        <p className="text-sm italic text-gray-500">Admin is typing...</p>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
