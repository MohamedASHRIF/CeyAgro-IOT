// "use client";

// import { useEffect, useState } from "react";
// import { ChatWindow } from "./(components)/ChatWindow";
// import { MessageInput } from "./(components)/MessageInput";
// import { AdminHeader } from "./(components)/AdminHeader";
// import axios from "axios";

// interface Message {
//   _id: string;
//   senderId: string;
//   receiverId: string;
//   content: string;
//   timestamp: string;
//   read?: boolean;
// }

// export default function UserChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [typing, setTyping] = useState(false);
//   const userId = "manual|testacc20011212@gmail.com"; // replace with auth later
//   const adminId = "manual|admin@gmail.com";

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:3001/messages/between/${adminId}/${userId}`
//         );
//         const data = await res.json();
//         setMessages(data);
//       } catch (err) {
//         console.error("Failed to fetch messages", err);
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 3000);
//     return () => clearInterval(interval);
//   }, [userId]);

//   const handleSend = async (content: string) => {
//     try {
//       const msg = {
//         senderId: userId,
//         receiverId: adminId,
//         content,
//       };
//       const res = await axios.post("http://localhost:3001/messages", msg);
//       setMessages((prev) => [...prev, res.data]);
//     } catch (err) {
//       console.error("Failed to send message", err);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4">
//       <AdminHeader />
//       <ChatWindow messages={messages} typing={typing} />
//       <MessageInput onSend={handleSend} setTyping={setTyping} />
//     </div>
//   );
// }
// app/user-chat/page.tsx
// user/UserChatPage.tsx
"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "./(components)/ChatWindow";
import { MessageInput } from "./(components)/MessageInput";
import { AdminHeader } from "./(components)/AdminHeader";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export default function UserChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const adminId = "manual|admin@gmail.com"; // NEW: Replace with dynamic admin ID if multiple admins

  // NEW: Fetch user ID from Auth0 session
  useEffect(() => {
    async function fetchUserId() {
      try {
        const session = await getSession();
        if (session?.user) {
          setUserId(session.user.sub); // Use Auth0 user ID (sub)
        }
      } catch (error) {
        console.error("Error fetching session", error);
      }
    }
    fetchUserId();
  }, []);

  // Fetch initial messages
  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:3001/messages/my/${userId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  const handleSend = async (content: string) => {
    try {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          senderId: userId!,
          receiverId: adminId,
          content,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-10 border border-gray-200">
      <AdminHeader />
      <ChatWindow messages={messages} userId={userId} adminId={adminId} />
      <MessageInput onSend={handleSend} userId={userId} adminId={adminId} />
    </div>
  );
}
