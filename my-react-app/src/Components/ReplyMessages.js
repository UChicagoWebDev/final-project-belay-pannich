import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {PostMessage} from "./Messages";
import {Messages} from "./Messages";

var USERTOKEN = '';
var USER_ID = '';
var USER_NAME = '';
var config = {};

export function ReplyMessages ({ channelId, channelName, messageId }) {
  // If MessagesContainer manages its own state and fetching logic,
      // it will automatically update based on the passed channelId prop.
      // Assuming messages is initially an empty array or fetched from somewhere
  USERTOKEN = localStorage.getItem('nichada_belay_auth_key');     // set the global var
  USER_ID = localStorage.getItem('userId');
  USER_NAME = localStorage.getItem('userName');
  const [replyPanel, setReplyPanel] = useState(true)
  const [reMessages, setReMessages] = useState([]);
  config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

  useEffect(() => {
    // Fetch messages or set them in some way
    const fetchReplies = async () => {
      try {
        const response = await axios.get(`/api/messages/replies_to?channel_id=${channelId}&message_id=${messageId}`, config);
        const data = response.data;
        console.log(data.length);
        if (Array.isArray(data) && data.length !== 0) {
          setReMessages(data);
          console.log(data)
        }
      } catch(error) {
        console.error('Failed to fetch messages:', error);
      }
    }
    // Immediately fetch messages for the current channel
    fetchReplies();

    // Set up an interval to fetch messages every 500ms
    const intervalId = setInterval(() => {
      console.log('Checking for new replies');
      fetchReplies(); // Fetch new messages
    }, 5000);

    // Cleanup function to clear the interval
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on component mount

  return (  // This is creating components
    <div className="chat">

      {reMessages.map((message, index) => (
        <Messages
        key={index}
        id={message.id}
        content={message.content}
        timestamp={message.timestamp}
        userName={message.username}
        replyPanel={replyPanel}
      />
      ))}
      <PostMessage channelId={channelId} channelName={channelName} repliesTo={messageId}/>
    </div>
  );
}