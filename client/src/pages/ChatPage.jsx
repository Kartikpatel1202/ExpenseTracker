import { useEffect, useState } from "react";
import axios from "axios";
import { createSocket } from "../socket/socket";

const API_URL = "http://localhost:5000";

export default function ChatPage() {
  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // AUTH CONFIG
  // =========================

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  // =========================
  // GET CURRENT LOGGED-IN USER
  // =========================

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("user")
      );

      return user;
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );

      return null;
    }
  };

  // =========================
  // NORMALIZE USER ID
  // =========================

  const getUserId = (user) => {
    if (!user) {
      return null;
    }

    return String(
      user._id ||
        user.userId ||
        user.id ||
        ""
    );
  };

  // =========================
  // LOAD INBOX
  // =========================

  const fetchInbox = async () => {
    try {
      setLoadingInbox(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/messages/inbox`,
        getAuthConfig()
      );

      setInbox(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to load inbox:",
        error
      );

      setError("Failed to load chat inbox.");
    } finally {
      setLoadingInbox(false);
    }
  };

  // =========================
  // LOAD CONVERSATION
  // =========================

  const fetchConversation = async (userId) => {
    try {
      setLoadingMessages(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/messages/${userId}`,
        getAuthConfig()
      );

      setMessages(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );

      setError("Failed to load conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================
  // MARK CONVERSATION AS READ
  // =========================

  const markConversationAsRead = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/api/messages/${userId}/read`,
        {},
        getAuthConfig()
      );

      console.log(
        "Conversation marked as read:",
        userId
      );
    } catch (error) {
      console.error(
        "Failed to mark messages as read:",
        error
      );
    }
  };

  // =========================
  // INITIAL INBOX LOAD
  // =========================

  useEffect(() => {
    fetchInbox();
  }, []);

  // =========================
  // SELECT USER
  // =========================

  const handleSelectUser = async (item) => {
    const userId = item.user._id;

    setSelectedUser(item.user);
    setMessages([]);
    setMessageText("");
    setError("");

    // 1. Load conversation
    await fetchConversation(userId);

    // 2. Mark unread messages as read
    await markConversationAsRead(userId);

    // 3. Refresh inbox
    //    unread badge will disappear
    await fetchInbox();
  };

  // =========================
  // SOCKET.IO
  // REAL-TIME MESSAGES
  // =========================

  useEffect(() => {
    const socket = createSocket();

    if (!socket) {
      return;
    }

    // =========================
    // RECEIVE NEW MESSAGE
    // =========================

    const handleNewMessage = async (newMessage) => {
      console.log(
        "New message received:",
        newMessage
      );

      const currentUser = getCurrentUser();

      if (!currentUser) {
        return;
      }

      const currentUserId =
        getUserId(currentUser);

      const senderId = getUserId(
        newMessage.senderId
      );

      const receiverId = getUserId(
        newMessage.receiverId
      );

      // =========================
      // IF CHAT IS CURRENTLY OPEN
      // =========================

      if (selectedUser) {
        const selectedUserId =
          getUserId(selectedUser);

        const belongsToCurrentChat =
          (senderId === currentUserId &&
            receiverId === selectedUserId) ||
          (senderId === selectedUserId &&
            receiverId === currentUserId);

        if (belongsToCurrentChat) {
          // Add message to current conversation
          setMessages((previousMessages) => {
            // Prevent duplicate message
            const alreadyExists =
              previousMessages.some(
                (message) =>
                  message._id ===
                  newMessage._id
              );

            if (alreadyExists) {
              return previousMessages;
            }

            return [
              ...previousMessages,
              newMessage,
            ];
          });

          // IMPORTANT:
          // Chat is already open,
          // therefore message is immediately seen.
          await markConversationAsRead(
            selectedUserId
          );
        }
      }

      // Refresh inbox after receiving message
      await fetchInbox();
    };

    // =========================
    // MESSAGE SENT
    // =========================

    const handleMessageSent = async (
      savedMessage
    ) => {
      console.log(
        "Message sent successfully:",
        savedMessage
      );

      const currentUser = getCurrentUser();

      if (!currentUser || !selectedUser) {
        return;
      }

      const currentUserId =
        getUserId(currentUser);

      const senderId = getUserId(
        savedMessage.senderId
      );

      const receiverId = getUserId(
        savedMessage.receiverId
      );

      const selectedUserId =
        getUserId(selectedUser);

      // Check whether this message
      // belongs to current conversation

      const belongsToCurrentChat =
        senderId === currentUserId &&
        receiverId === selectedUserId;

      if (belongsToCurrentChat) {
        setMessages((previousMessages) => {
          // Prevent duplicate messages
          const alreadyExists =
            previousMessages.some(
              (message) =>
                message._id ===
                savedMessage._id
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            savedMessage,
          ];
        });
      }

      // Refresh inbox
      await fetchInbox();
    };

    // =========================
    // MESSAGE ERROR
    // =========================

    const handleMessageError = (error) => {
      console.error(
        "Message error:",
        error
      );

      setError(
        error?.message ||
          "Failed to send message."
      );
    };

    // =========================
    // SOCKET LISTENERS
    // =========================

    socket.on(
      "new_message",
      handleNewMessage
    );

    socket.on(
      "message_sent",
      handleMessageSent
    );

    socket.on(
      "message_error",
      handleMessageError
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
      socket.off(
        "new_message",
        handleNewMessage
      );

      socket.off(
        "message_sent",
        handleMessageSent
      );

      socket.off(
        "message_error",
        handleMessageError
      );
    };
  }, [selectedUser]);

  // =========================
  // SEND MESSAGE
  // =========================

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage =
      messageText.trim();

    // Empty message
    if (!trimmedMessage) {
      return;
    }

    // No selected user
    if (!selectedUser) {
      return;
    }

    const socket = createSocket();

    // Socket unavailable
    if (!socket) {
      setError(
        "Socket connection is not available."
      );

      return;
    }

    // Socket not connected
    if (!socket.connected) {
      setError(
        "Socket is not connected. Please wait and try again."
      );

      return;
    }

    console.log(
      "Sending message:",
      {
        receiverId:
          selectedUser._id,
        message:
          trimmedMessage,
      }
    );

    // Send message through Socket.IO
    socket.emit(
      "send_message",
      {
        receiverId:
          selectedUser._id,
        message:
          trimmedMessage,
      }
    );

    // Clear input
    setMessageText("");

    setError("");
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="chat-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="chat-header">
        <h1>Chat</h1>

        <p>
          Connect with other users in real time.
        </p>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      {/* =========================
          CHAT CONTAINER
      ========================= */}

      <div className="chat-container">

        {/* =========================
            LEFT SIDEBAR / INBOX
        ========================= */}

        <div className="chat-sidebar">

          <div className="chat-sidebar-header">
            <h2>Inbox</h2>
          </div>

          {/* Loading */}

          {loadingInbox ? (
            <div className="chat-empty">
              Loading chats...
            </div>

          ) : inbox.length === 0 ? (

            /* No conversations */

            <div className="chat-empty">
              No conversations yet.
            </div>

          ) : (

            /* Conversation list */

            <div className="chat-user-list">

              {inbox.map((item) => (

                <button
                  key={item.user._id}
                  type="button"
                  className={`chat-user ${
                    selectedUser?._id ===
                    item.user._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectUser(item)
                  }
                >

                  {/* Avatar */}

                  <div className="chat-avatar">
                    {item.user.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* User information */}

                  <div className="chat-user-info">

                    <div className="chat-user-name">
                      {item.user.name}
                    </div>

                    <div className="chat-last-message">
                      {item.lastMessage}
                    </div>

                  </div>

                  {/* Unread count */}

                  {item.unreadCount > 0 && (
                    <span className="chat-unread">
                      {item.unreadCount}
                    </span>
                  )}

                </button>

              ))}

            </div>
          )}

        </div>

        {/* =========================
            RIGHT CHAT WINDOW
        ========================= */}

        <div className="chat-window">

          {/* =========================
              NO USER SELECTED
          ========================= */}

          {!selectedUser ? (

            <div className="chat-placeholder">

              <h2>
                Select a user
              </h2>

              <p>
                Select a conversation from
                the inbox to start chatting.
              </p>

            </div>

          ) : (

            <>

              {/* =========================
                  CHAT HEADER
              ========================= */}

              <div className="chat-window-header">

                <div className="chat-avatar">
                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h2>
                    {selectedUser.name}
                  </h2>

                  <span>
                    {selectedUser.email}
                  </span>

                </div>

              </div>

              {/* =========================
                  MESSAGES
              ========================= */}

              <div className="chat-messages">

                {loadingMessages ? (

                  <div className="chat-empty">
                    Loading messages...
                  </div>

                ) : messages.length === 0 ? (

                  <div className="chat-empty">
                    No messages yet. Start
                    the conversation.
                  </div>

                ) : (

                  messages.map((message) => {

                    // Current logged-in user
                    const currentUser =
                      getCurrentUser();

                    // Message sender
                    const senderId =
                      getUserId(
                        message.senderId
                      );

                    // Current logged-in user ID
                    const currentUserId =
                      getUserId(
                        currentUser
                      );

                    /*
                      CURRENT USER MESSAGE
                      ====================
                      senderId === currentUserId
                              ↓
                            RIGHT


                      OTHER USER MESSAGE
                      ==================
                      senderId !== currentUserId
                              ↓
                             LEFT
                    */

                    const isMine =
                      senderId ===
                      currentUserId;

                    return (
                      <div
                        key={message._id}
                        className={`message ${
                          isMine
                            ? "message-mine"
                            : "message-other"
                        }`}
                      >
                        <div className="message-bubble">
                          {message.message}
                        </div>
                      </div>
                    );
                  })

                )}

              </div>

              {/* =========================
                  MESSAGE INPUT
              ========================= */}

              <form
                className="chat-input-area"
                onSubmit={
                  handleSendMessage
                }
              >

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                />

                <button
                  type="submit"
                  disabled={
                    !messageText.trim()
                  }
                >
                  Send
                </button>

              </form>

            </>

          )}

        </div>

      </div>

    </div>
  );
}