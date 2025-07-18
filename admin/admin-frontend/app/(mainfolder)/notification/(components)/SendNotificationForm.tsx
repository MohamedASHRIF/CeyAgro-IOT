'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SendNotificationFormProps {
  onNotificationSent: () => void;
}

export function SendNotificationForm({
  onNotificationSent,
}: SendNotificationFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send data to backend
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            message,
            date: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      // Reset form after sending the notification
      setTitle('');
      setMessage('');

      // Call the parent function to refresh the notifications
      onNotificationSent();

      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  return (
    <Card className="max-w-4xl h-80 mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Send Notification to Users</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-2xl">Title</label>
            <Input
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-2xl">Message</label>
            <Textarea
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#09a37d] hover:bg-gray-800"
          >
            Send Notification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
