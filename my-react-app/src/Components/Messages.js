import React, { useState, useEffect } from 'react';
import axios from 'axios';

import "./Messages.css";

var USERTOKEN = '';
console.log(`First load ${USERTOKEN}`);
var USER_ID = '';
var config = '';

export function Messages({ setShowReplies, setRepliesToMsg, id, userName, content, timestamp, replies_count, replyPanel }) {

  // --- Extract Image ----
  const imageUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif)/g;
  const imageUrls = content.match(imageUrlRegex) || [];
  // Remove the image URLs from the content
  content = content.replace(imageUrlRegex, "").trim();

  // --- Emoji ----
  const emojiSet = ["❤️", "👍", "😮", "😢"];

  // Function to handle adding a reaction to a message
  const addReaction = async (emoji) => {
    // Call to API to add reaction to this message
    // TODO:
    console.log(`Add ${emoji} reaction to message`);
    const data = {
      "user_id": USER_ID,
      "emoji": emoji,
      "message_id" : id
    }

    try {
      const response = await axios.post('/api/messages/emoji', data, config);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
    return;
    }

  const handleReplyClick = () => {
    setShowReplies(show => !show)
    setRepliesToMsg(id); // message `id`
  };

  return (
    <div className="messages">
      {/* Message */}
      <div className="messages_info">
        <h4>
          {userName}
          <span className="messages_timestamp">{timestamp}</span>
        </h4>
        <p>{content}</p>
        <p className="messageReplies">Replies: {replies_count}</p>

        {/* Emoji */}
        <div className="reactions">
          {emojiSet.map((emoji, index) => (
            <Reaction key={index} emoji={emoji} messageId={id} addReaction={addReaction} />
          ))}
        </div>

        <div className="images-container">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt="User content"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ))}
        </div>

        {/* Reply pane */}
        {!replyPanel && (
          <button
          className="reply-button"
          onClick={handleReplyClick}
        >
          Reply
        </button>
        )}

      </div>
    </div>
  );
}


function Reaction({ emoji, messageId, addReaction }) {

  const [isHovered, setIsHovered] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(`/api/reactions/users?message_id=${messageId}&emoji=${encodeURIComponent(emoji)}`, config);
      const users_ls = response.data;
      setUsers(users_ls);
    };
    if (isHovered) {
      fetchUsers();
    }
  }, [isHovered, emoji, messageId]); // Re-fetch when emoji is hovered over or changes

  return (
    <div className="reaction-container"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}>
      <button onClick={() => addReaction(emoji)} className="emoji-btn">
        {emoji}
      </button>
      {isHovered && (
        <div className="users-list">
          {users.join(', ')}
        </div>
      )}
    </div>
  );
}

export function PostMessage({channelName, channelId, repliesTo}) {
  const [input, setInput] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const data = {
      "user_id": USER_ID,
      "channel_id": channelId,
      "content" : input,
      "replies_to" : repliesTo || null // repliesTo will be itself or null if falsy
    }

    try {
      const response = await axios.post('/api/messages', data, config);
      setInput("");     // clear input
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
    return;
  }

  return (
    <div className="chatInput">
      <form>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message #${channelName?.toLowerCase()}`}
        />
        <button type="submit" onClick={sendMessage}>
          SEND
        </button>
      </form>
    </div>
  );
}



export function MessagesContainer({ channelId, channelName, setShowReplies, setRepliesToMsg}) {
  // If MessagesContainer manages its own state and fetching logic,
      // it will automatically update based on the passed channelId prop.
      // Assuming messages is initially an empty array or fetched from somewhere
  USERTOKEN = localStorage.getItem('nichada_belay_auth_key');     // set the global var
  USER_ID = localStorage.getItem('userId');
  const [messages, setMessages] = useState([]);
  config = {
    headers: {
      'Content-Type': 'application/json', // Specify the content type
      'Authorization': `Bearer ${USERTOKEN}` // Authorization header, for example, a Bearer token
    }
  };

  useEffect(() => {
    // Fetch messages or set them in some way
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages?channel_id=${channelId}`, config); // Correctly await the promise
        const messages = response.data;
        setMessages(messages); // Assuming messages is the data you want to set
      } catch(error) {
        console.error('Failed to fetch messages:', error);
      }
    }
    // Immediately fetch messages for the current channel
    fetchMessages();

    // Set up an interval to fetch messages every 500ms
    const intervalId = setInterval(() => {
      console.log('Checking for new messages');
      fetchMessages(); // Fetch new messages
    }, 5000);

    // Cleanup function to clear the interval
    return () => clearInterval(intervalId);
  }, [channelId]); // Empty dependency array means this runs once on component mount


  if (!Array.isArray(messages) || messages.length === 0) {
    return <div>No messages.</div>;
  }

  useEffect(() => {
    // Fetch messages or set them in some way
    const fetchRepliesCount = async () => {
      try {
        const response = await axios.get(`/api/messages/replies_to?channel_id=${channelId}&message_id=${messageId}`, config);
        const data = response.data;
        console.log(data.length);
        setReMessages(data.length);
      } catch(error) {
        console.error('Failed to fetch reply count:', error);
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

      {messages.map((message) => (
        <Messages
        key={message.id}
        id={message.id}
        content={message.content}
        timestamp={message.timestamp}
        userName={message.username}
        replies_count = {fetchRepliesCount}
        setShowReplies={setShowReplies}     // Passing setState function
        setRepliesToMsg={setRepliesToMsg}   // Passing setState function
      />
      ))}
      <PostMessage channelId={channelId} channelName={channelName} />
    </div>
  );
}
