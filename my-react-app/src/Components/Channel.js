import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessagesContainer } from './Messages';
import { useNavigate, useParams } from 'react-router-dom';
import { ReplyMessages } from './ReplyMessages';
import "./Channel.css";

const userId = localStorage.getItem('userId');
var config = {};

///
/// TODO : REMOVE PLACEHOLDER
///
///

const placeholder_channels = [
  {id: 1, name: "Pan's return waiting room", unread: 2},
  {id: 2, name: "Olive is very fluffy", unread: 3},
  {id: 3, name: "Chess tournament", unread: 1}
]

export const markMessagesAsRead = async (channelId) => {

  try { // Fetch latest message
    const response  = await axios.get('/api/messages', config);
    if (response.data.length > 0) {
        const latestMessage = response.data[response.data.length - 1];  // Get the latest message
        console.log(latestMessage);
    } else {
        console.log('No messages found');
    }
  } catch (error) {
    console.error('Error fetching the latest message:', error);
  }

  // Mark messages as read when visiting a channel
  const latestMessage = 1; // TODO: remove
  await axios.post(`/api/channels/${channelId}/updateLastSeen`, {"channel_id": channelId, "user_id": userId, "last_message_id_seen": latestMessage}, config);

  // Optionally, refetch channels or update state to reflect the new unread count
};

const ChannelsList = () => {
  const [channels, setChannels] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesToMsg, setRepliesToMsg] = useState('');

  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const { channelId } = useParams();
  console.log(channelId);

  // Fetch channels and unread counts

  useEffect(() => {
    async function fetchUnreadCounts() {  // uniquely for this user. Identify user by token in the header
      try {
          const response = await axios.get('/api/messages/unread_counts', config);
          console.log(response.data);
          setChannels(response.data); // Directly set the fetched data to your state
      } catch (error) {
          console.error('Failed to fetch unread counts:', error);
      }
    }
    fetchUnreadCounts(); // Immediately fetch unread counts when page load

    // Set up an interval to fetch messages every 500ms
    const intervalId = setInterval(() => {    // intervalId holds the reference ID returned by setInterval().
      console.log('Checking for unread messages');
      fetchUnreadCounts(); // Fetch new messages
    }, 100000);
    // TODO change to 1000

    // Cleanup function to clear the interval
    return () => clearInterval(intervalId);
  }, []); // The empty array means this effect runs once after the initial render and return when unmount i.e. navigate to different page or page refresh.

  const handleChannelClick = (channelId) => {
    navigate(`/channel/${channelId}`);
  };

  const getChannelNameById = (channelId) => {
    console.log(`Channel ID: ${typeof channelId}`);
    const channel = placeholder_channels.find(channel => channel.id === Number(channelId));
    return channel ? channel.name : undefined;
  }

  return (
    <div className="app-container">
      {/* sidebar */}
      <div className="sidebar-container">
        <h2>Channels</h2>
        <ul>
          {placeholder_channels.map(channel => (
            <li key={channel.id} onClick={() => handleChannelClick(channel.id)}>
            {/* TODO : Fix Invalid Hook Call !!! */}
              {channel.name} - Unread messages: {channel.unread}
            </li>
          ))}
        </ul>
        </div>

      {/* chat */}
      <div className="chat-message-container">
        <MessagesContainer
        channelId={channelId}
        channelName={getChannelNameById(channelId)}
        setShowReplies={setShowReplies}
        setRepliesToMsg={setRepliesToMsg}/>
      </div>

      {/* reply thread */}
      {showReplies && (
        <div className="reply-message-container">
          Reply messages...
          <ReplyMessages channelId={channelId} channelName={getChannelNameById(channelId)} messageId={repliesToMsg}/>
          {/* Reply messages */}
        </div>
      )}
    </div>
  );
}

export default ChannelsList;

// ----------------------------------------------------------------------------


export const ChannelComponent = ({ channelId }) => {
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    // Mark all messages as read when the component mounts or channelId changes
    markMessagesAsRead(channelId);

    // Start checking for new messages every 500ms
    const newIntervalId = setInterval(async () => {
      console.log('Checking for new messages');

      markMessagesAsRead(channelId);
    }, 50000); // TODO change to 500ms
    setIntervalId(newIntervalId);

    // Cleanup function to clear the interval when the component unmounts or channelId changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [channelId]); // Re-run this effect if channelId changes

  return (
    <div>
      {/* Other content */}
      <p>Testtest</p>
      <MessagesContainer channelId={channelId} />
      {/* More content */}
    </div>
  );
};


// TODO : Do message Reply array count and display
// All messages in a room have a Reply button or icon that opens the replies pane
// Parse image URLs that appear in messages and display the images at the end of the message. (Hint: you may use the web to help you find an appropriate regular expression)
// Users can add an emoji reaction to any message or reply. You may choose a limited set of emoji reactions you support.
// Hovering over a reaction displays all the users who had that reaction
