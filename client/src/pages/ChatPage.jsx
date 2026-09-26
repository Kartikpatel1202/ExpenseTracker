import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import { createSocket } from "../socket/socket";

import NewChatModal from "../components/NewChatModal";
import VideoCall from "../components/VideoCall";

const API_URL = "http://localhost:5000";

// =====================================================
// CALL HISTORY HELPERS
// =====================================================

const getCallDetails = (message) => {
  if (!message) return null;

  if (message.callDetails) {
    return message.callDetails;
  }

  const rawMessage = message.message || "";

  if (!rawMessage.startsWith("__CALL_LOG__")) {
    return null;
  }

  try {
    return JSON.parse(
      rawMessage.substring("__CALL_LOG__".length)
    );
  } catch (error) {
    console.error("Invalid call log:", error);
    return null;
  }
};

const isCallMessage = (message) => {
  return (
    message?.messageType === "call" ||
    message?.message?.startsWith("__CALL_LOG__") ||
    Boolean(message?.callDetails)
  );
};

const getInboxPreview = (lastMessage) => {
  if (!lastMessage) return "";

  if (typeof lastMessage === "string") {
    if (lastMessage.startsWith("__CALL_LOG__")) {
      try {
        const call = JSON.parse(
          lastMessage.substring("__CALL_LOG__".length)
        );

        return call.callType === "video"
          ? "Video call"
          : "Audio call";
      } catch {
        return "Call";
      }
    }

    return lastMessage;
  }

  if (isCallMessage(lastMessage)) {
    const call = getCallDetails(lastMessage);

    return call?.callType === "video"
      ? "Video call"
      : "Audio call";
  }

  return lastMessage.message || "";
};

const formatCallDuration = (seconds = 0) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  }

  return `${minutes} min ${remainingSeconds} sec`;
};

const formatCallTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMessageTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =====================================================
// WHATSAPP-STYLE CALL HISTORY CARD
// =====================================================

function CallHistoryCard({ call, isMine, createdAt }) {
  const isVideo = call?.callType === "video";
  const isMissed = call?.status === "missed";
  const isCancelled = call?.status === "cancelled";

  const title = isVideo ? "Video call" : "Audio call";

  let statusText;

  if (isMissed) {
    statusText = isMine ? "No answer" : "Missed call";
  } else if (isCancelled) {
    statusText = "Cancelled";
  } else {
    statusText = `${
      isMine ? "Outgoing" : "Incoming"
    } · ${formatCallDuration(call?.duration)}`;
  }

  return (
    <div className="call-history-card">
      <div
        className={`call-history-icon ${
          isMissed ? "call-history-icon-missed" : ""
        }`}
      >
        {isVideo ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="6" width="13" height="12" rx="2" />
            <path d="m16 10 5-3v10l-5-3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.08 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.69A2 2 0 0 1 22 16.92Z" />
          </svg>
        )}
      </div>

      <div className="call-history-info">
        <div className="call-history-title">{title}</div>

        <div
          className={`call-history-status ${
            isMissed ? "missed" : ""
          }`}
        >
          {statusText}
        </div>
      </div>

      <div className="call-history-time">
        {formatCallTime(createdAt)}
      </div>
    </div>
  );
}

// =====================================================
// CHAT PAGE
// =====================================================

export default function ChatPage() {
  // 1. STATES

  const [inbox, setInbox] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [chatType, setChatType] = useState(null);
  // "user" OR "group"

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // REFS
  // Used so Socket.IO doesn't reconnect whenever
  // selected user/group changes.
  // =====================================================

  const selectedUserRef = useRef(null);
  const selectedGroupRef = useRef(null);
  const chatTypeRef = useRef(null);

  // Keep refs updated
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    chatTypeRef.current = chatType;
  }, [chatType]);

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch (error) {
      console.error("Failed to read current user:", error);
      return null;
    }
  };

  // =====================================================
  // NORMALIZE USER ID
  // =====================================================

  const getUserId = (user) => {
    if (!user) return null;

    return String(
      user._id ||
        user.userId ||
        user.id ||
        ""
    );
  };

  // =====================================================
  // LOAD INBOX
  // =====================================================

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
      console.error("Failed to load inbox:", error);
      setError("Failed to load chat inbox.");
    } finally {
      setLoadingInbox(false);
    }
  };

  // =====================================================
  // LOAD GROUPS
  // =====================================================

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);

      const response = await axios.get(
        `${API_URL}/api/groups`,
        getAuthConfig()
      );

      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
      setError("Failed to load groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  // =====================================================
  // LOAD 1-TO-1 CONVERSATION
  // =====================================================

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
      console.error("Failed to load conversation:", error);
      setError("Failed to load conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // =====================================================
  // LOAD GROUP MESSAGES
  // =====================================================

  const fetchGroupMessages = async (groupId) => {
    try {
      setLoadingMessages(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/messages`,
        getAuthConfig()
      );

      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Failed to load group messages:", error);
      setError("Failed to load group messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // =====================================================
  // MARK 1-TO-1 CONVERSATION AS READ
  // =====================================================

  const markConversationAsRead = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/api/messages/${userId}/read`,
        {},
        getAuthConfig()
      );

      console.log("Conversation marked as read:", userId);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchInbox();
    fetchGroups();
  }, []);

  // =====================================================
  // SELECT EXISTING 1-TO-1 USER
  // =====================================================

  const handleSelectUser = async (item) => {
    const userId = item.user._id;

    setChatType("user");
    setSelectedGroup(null);
    setSelectedUser(item.user);
    setMessages([]);
    setMessageText("");
    setError("");

    await fetchConversation(userId);
    await markConversationAsRead(userId);
    await fetchInbox();
  };

  // =====================================================
  // START NEW 1-TO-1 CHAT
  // =====================================================

  const handleStartNewChat = async (user) => {
    setShowNewChat(false);

    setChatType("user");
    setSelectedGroup(null);
    setSelectedUser(user);
    setMessages([]);
    setMessageText("");
    setError("");

    await fetchConversation(user._id);
    await markConversationAsRead(user._id);
    await fetchInbox();
  };

  // =====================================================
  // CREATE GROUP
  // =====================================================

  const handleCreateGroup = async (groupName, selectedUsers) => {
    try {
      setError("");

      const memberIds = selectedUsers.map(
        (user) => user._id
      );

      console.log("Creating group:", {
        groupName,
        memberIds,
      });

      const response = await axios.post(
        `${API_URL}/api/groups`,
        {
          name: groupName,
          memberIds,
        },
        getAuthConfig()
      );

      const createdGroup = response.data.data;

      console.log("Group created:", createdGroup);

      setShowNewChat(false);
      setChatType("group");
      setSelectedUser(null);
      setSelectedGroup(createdGroup);
      setMessages([]);
      setMessageText("");

      await fetchGroups();

      const socket = createSocket();

      if (socket && socket.connected) {
        socket.emit("join_group", createdGroup._id);
      }
    } catch (error) {
      console.error("Failed to create group:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create group."
      );
    }
  };

  // =====================================================
  // OPEN GROUP
  // =====================================================

  const handleSelectGroup = async (group) => {
    setChatType("group");
    setSelectedUser(null);
    setSelectedGroup(group);
    setMessages([]);
    setMessageText("");
    setError("");

    const socket = createSocket();

    if (socket && socket.connected) {
      socket.emit("join_group", group._id);
    }

    await fetchGroupMessages(group._id);
  };

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    const socket = createSocket();

    if (!socket) {
      return;
    }

    // =================================================
    // CONNECTION
    // =================================================

    const handleConnect = () => {
      console.log("Chat Socket connected:", socket.id);

      const currentGroup = selectedGroupRef.current;

      if (currentGroup) {
        socket.emit("join_group", currentGroup._id);
      }
    };

    // =================================================
    // RECEIVE 1-TO-1 MESSAGE
    // =================================================

    const handleNewMessage = async (newMessage) => {
      console.log("New 1-to-1 message:", newMessage);

      const currentUser = getCurrentUser();

      if (!currentUser) {
        return;
      }

      const currentUserId = getUserId(currentUser);
      const senderId = getUserId(newMessage.senderId);
      const receiverId = getUserId(newMessage.receiverId);

      const currentSelectedUser = selectedUserRef.current;

      if (
        chatTypeRef.current === "user" &&
        currentSelectedUser
      ) {
        const selectedUserId = getUserId(currentSelectedUser);

        const belongsToCurrentChat =
          (senderId === currentUserId &&
            receiverId === selectedUserId) ||
          (senderId === selectedUserId &&
            receiverId === currentUserId);

        if (belongsToCurrentChat) {
          setMessages((previousMessages) => {
            const alreadyExists = previousMessages.some(
              (message) => message._id === newMessage._id
            );

            if (alreadyExists) {
              return previousMessages;
            }

            return [...previousMessages, newMessage];
          });

          await markConversationAsRead(selectedUserId);
        }
      }

      await fetchInbox();
    };

    // =================================================
    // MESSAGE SENT
    // =================================================

    const handleMessageSent = async (savedMessage) => {
      console.log("Message sent successfully:", savedMessage);

      const currentUser = getCurrentUser();
      const currentSelectedUser = selectedUserRef.current;

      if (
        !currentUser ||
        !currentSelectedUser ||
        chatTypeRef.current !== "user"
      ) {
        await fetchInbox();
        return;
      }

      const currentUserId = getUserId(currentUser);
      const senderId = getUserId(savedMessage.senderId);
      const receiverId = getUserId(savedMessage.receiverId);
      const selectedUserId = getUserId(currentSelectedUser);

      const belongsToCurrentChat =
        senderId === currentUserId &&
        receiverId === selectedUserId;

      if (belongsToCurrentChat) {
        setMessages((previousMessages) => {
          const alreadyExists = previousMessages.some(
            (message) => message._id === savedMessage._id
          );

          if (alreadyExists) {
            return previousMessages;
          }

          return [...previousMessages, savedMessage];
        });
      }

      await fetchInbox();
    };

    // =================================================
    // RECEIVE GROUP MESSAGE
    // =================================================

    const handleNewGroupMessage = async (newMessage) => {
      console.log("New group message:", newMessage);

      const currentGroup = selectedGroupRef.current;

      if (
        chatTypeRef.current !== "group" ||
        !currentGroup
      ) {
        return;
      }

      const currentGroupId = String(currentGroup._id);
      const messageGroupId = String(newMessage.groupId);

      if (currentGroupId !== messageGroupId) {
        return;
      }

      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (message) => message._id === newMessage._id
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });
    };

    // =================================================
    // MESSAGE ERRORS
    // =================================================

    const handleMessageError = (error) => {
      console.error("Message error:", error);

      setError(
        error?.message ||
          "Failed to send message."
      );
    };

    const handleGroupMessageError = (error) => {
      console.error("Group message error:", error);

      setError(
        error?.message ||
          "Failed to send group message."
      );
    };

    // =================================================
    // SOCKET LISTENERS
    // =================================================

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("new_group_message", handleNewGroupMessage);
    socket.on("message_error", handleMessageError);
    socket.on("group_message_error", handleGroupMessageError);

    // =================================================
    // CLEANUP
    // =================================================

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("new_group_message", handleNewGroupMessage);
      socket.off("message_error", handleMessageError);
      socket.off("group_message_error", handleGroupMessageError);
    };
  }, []);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const socket = createSocket();

    if (!socket) {
      setError("Socket connection is not available.");
      return;
    }

    if (!socket.connected) {
      setError(
        "Socket is not connected. Please wait and try again."
      );
      return;
    }

    // GROUP MESSAGE
    if (chatType === "group" && selectedGroup) {
      console.log("Sending group message:", {
        groupId: selectedGroup._id,
        message: trimmedMessage,
      });

      socket.emit("send_group_message", {
        groupId: selectedGroup._id,
        message: trimmedMessage,
      });

      setMessageText("");
      setError("");
      return;
    }

    // 1-TO-1 MESSAGE
    if (chatType === "user" && selectedUser) {
      console.log("Sending 1-to-1 message:", {
        receiverId: selectedUser._id,
        message: trimmedMessage,
      });

      socket.emit("send_message", {
        receiverId: selectedUser._id,
        message: trimmedMessage,
      });

      setMessageText("");
      setError("");
    }
  };

  // =====================================================
  // CURRENT USER FOR MESSAGE ALIGNMENT
  // =====================================================

  const currentUser = getCurrentUser();
  const currentUserId = getUserId(currentUser);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="chat-page">
      {/* PAGE HEADER */}
      <div className="chat-header">
        <h1>Chat</h1>
        <p>Connect with other users in real time.</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      {/* CHAT CONTAINER */}
      <div className="chat-container">
        {/* LEFT SIDEBAR */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-inbox-title">
              <h2>Inbox</h2>

              <button
                type="button"
                className="new-chat-button"
                onClick={() => setShowNewChat(true)}
              >
                + New Chat
              </button>
            </div>
          </div>

          {/* USER INBOX */}
          {loadingInbox ? (
            <div className="chat-empty">
              Loading chats...
            </div>
          ) : (
            <div className="chat-user-list">
              {/* 1-TO-1 CONVERSATIONS */}
              {inbox.map((item) => (
                <button
                  key={item.user._id}
                  type="button"
                  className={`chat-user ${
                    selectedUser?._id === item.user._id &&
                    chatType === "user"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectUser(item)}
                >
                  <div className="chat-avatar">
                    {item.user.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="chat-user-info">
                    <div className="chat-user-name">
                      {item.user.name}
                    </div>

                    <div className="chat-last-message">
                      {getInboxPreview(item.lastMessage)}
                    </div>
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="chat-unread">
                      {item.unreadCount}
                    </span>
                  )}
                </button>
              ))}

              {/* GROUPS */}
              {loadingGroups ? (
                <div className="chat-group-loading">
                  Loading groups...
                </div>
              ) : groups.length > 0 ? (
                <>
                  <div className="chat-group-section-title">
                    Groups
                  </div>

                  {groups.map((group) => (
                    <button
                      key={group._id}
                      type="button"
                      className={`chat-user ${
                        selectedGroup?._id === group._id &&
                        chatType === "group"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleSelectGroup(group)}
                    >
                      <div className="chat-avatar">G</div>

                      <div className="chat-user-info">
                        <div className="chat-user-name">
                          {group.name}
                        </div>

                        <div className="chat-last-message">
                          {group.members?.length || 0} members
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : null}

              {/* EMPTY INBOX */}
              {inbox.length === 0 && groups.length === 0 && (
                <div className="chat-empty">
                  <p>No conversations yet.</p>

                  <button
                    type="button"
                    className="new-chat-button"
                    onClick={() => setShowNewChat(true)}
                  >
                    + New Chat
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div className="chat-window">
          {!selectedUser && !selectedGroup ? (
            <div className="chat-placeholder">
              <h2>Select a user or group</h2>
              <p>
                Select a conversation from the inbox or start
                a new chat.
              </p>

              <button
                type="button"
                className="new-chat-button"
                onClick={() => setShowNewChat(true)}
              >
                + New Chat
              </button>
            </div>
          ) : (
            <>

{/* CHAT HEADER */}
{chatType === "group" && selectedGroup ? (
  <div className="chat-window-header">
    <div className="chat-avatar">G</div>

    <div className="chat-header-user-info">
      <h2>{selectedGroup.name}</h2>
      <span>
        {selectedGroup.members?.length || 0} members
      </span>
    </div>

    {/* GROUP AUDIO / VIDEO CALL CONTROLS */}
    <VideoCall
      socket={createSocket()}
      groupId={selectedGroup._id}
      groupName={selectedGroup.name}
    />
  </div>
) : (
  <div className="chat-window-header">
    <div className="chat-avatar">
      {selectedUser?.name
        ?.charAt(0)
        .toUpperCase()}
    </div>

    <div className="chat-header-user-info">
      <h2>{selectedUser?.name}</h2>
      <span>{selectedUser?.email}</span>
    </div>

    {/* PERSONAL AUDIO / VIDEO CALL CONTROLS */}
    {selectedUser && (
      <VideoCall
        socket={createSocket()}
        receiverId={selectedUser._id}
        receiverName={selectedUser.name}
      />
    )}
  </div>
)}
              {/* MESSAGES */}
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="chat-empty">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>No messages yet.</p>
                    <span>Start the conversation.</span>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId = getUserId(message.senderId);
                    const isMine = senderId === currentUserId;

                    const callMessage = isCallMessage(message);
                    const callDetails = callMessage
                      ? getCallDetails(message)
                      : null;

                    return (
                      <div
                        key={message._id}
                        className={`message ${
                          isMine
                            ? "message-mine"
                            : "message-other"
                        } ${
                          callMessage ? "message-call" : ""
                        }`}
                      >
                        {/* CALL HISTORY CARD */}
                        {callMessage ? (
                          callDetails ? (
                            <CallHistoryCard
                              call={callDetails}
                              isMine={isMine}
                              createdAt={message.createdAt}
                            />
                          ) : (
                            <div className="call-history-card">
                              <div className="call-history-title">
                                Call
                              </div>
                            </div>
                          )
                        ) : (
                          <>
                            {/* GROUP SENDER NAME */}
                            {chatType === "group" && !isMine ? (
                              <div className="group-message-wrapper">
                                <div className="group-message-sender">
                                  {message.senderId?.name}
                                </div>

                                <div className="message-bubble">
                               <span className="message-text">
                               {message.message}
                              </span>

                              <span className="message-time">
                              {formatMessageTime(message.createdAt)}
                              </span>
                              </div>
                              </div>
                            ) : (
                             <div className="message-bubble">
                            <span className="message-text">
                            {message.message}
                            </span>

                            <span className="message-time">
                            {formatMessageTime(message.createdAt)}
                            </span>
</div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* MESSAGE INPUT */}
              <form
                className="chat-input-area"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onStartChat={handleStartNewChat}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
}