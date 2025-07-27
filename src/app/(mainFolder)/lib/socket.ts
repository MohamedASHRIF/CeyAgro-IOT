"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Socket => {
    if (!socket) {
        socket = io("http://localhost:3001", {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
            socket?.emit("join", userId);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};