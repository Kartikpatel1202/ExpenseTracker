import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function NewChatModal({
  onClose,
  onStartChat,
  onCreateGroup,
}) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] =
    useState([]);

  const [groupName, setGroupName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "token"
      )}`,
    },
  });

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("user")
      );
    } catch {
      return null;
    }
  };

  // =========================
  // LOAD USERS
  // =========================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${API_URL}/api/users`,
            getAuthConfig()
          );

        const currentUser =
          getCurrentUser();

        const currentUserId = String(
          currentUser?._id ||
            currentUser?.userId ||
            currentUser?.id ||
            ""
        );

        const allUsers =
          response.data.data || [];

        const otherUsers =
          allUsers.filter(
            (user) =>
              String(user._id) !==
              currentUserId
          );

        setUsers(otherUsers);
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );

        setError(
          "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredUsers =
    users.filter((user) => {
      const searchText =
        search.toLowerCase();

      return (
        user.name
          ?.toLowerCase()
          .includes(searchText) ||
        user.email
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // =========================
  // SELECT / UNSELECT
  // =========================

  const handleSelectUser = (user) => {
    setSelectedUsers(
      (previous) => {
        const exists =
          previous.some(
            (selected) =>
              selected._id ===
              user._id
          );

        if (exists) {
          return previous.filter(
            (selected) =>
              selected._id !==
              user._id
          );
        }

        return [
          ...previous,
          user,
        ];
      }
    );
  };

  // =========================
  // START CHAT / CREATE GROUP
  // =========================

  const handleContinue = () => {
    if (
      selectedUsers.length === 0
    ) {
      return;
    }

    // One user = 1-to-1 chat
    if (
      selectedUsers.length === 1
    ) {
      onStartChat(
        selectedUsers[0]
      );

      return;
    }

    // Multiple users = group
    if (!groupName.trim()) {
      setError(
        "Please enter a group name."
      );

      return;
    }

    onCreateGroup(
      groupName.trim(),
      selectedUsers
    );
  };

  return (
    <div
      className="new-chat-overlay"
      onClick={onClose}
    >
      <div
        className="new-chat-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="new-chat-header">

          <div>
            <h2>
              {selectedUsers.length > 1
                ? "Create Group"
                : "New Chat"}
            </h2>

            <p>
              {selectedUsers.length > 1
                ? "Select members for your group"
                : "Search and select users"}
            </p>
          </div>

          <button
            type="button"
            className="new-chat-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* GROUP NAME */}

        {selectedUsers.length > 1 && (
          <div className="new-chat-group-name">
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(event) =>
                setGroupName(
                  event.target.value
                )
              }
            />
          </div>
        )}

        {/* SEARCH */}

        <div className="new-chat-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        {/* ERROR */}

        {error && (
          <div className="new-chat-modal-error">
            {error}
          </div>
        )}

        {/* SELECTED COUNT */}

        {selectedUsers.length > 0 && (
          <div className="new-chat-selected">
            {selectedUsers.length} user
            {selectedUsers.length > 1
              ? "s"
              : ""}{" "}
            selected
          </div>
        )}

        {/* USERS */}

        <div className="new-chat-users">

          {loading ? (
            <div className="new-chat-status">
              Loading users...
            </div>

          ) : filteredUsers.length === 0 ? (
            <div className="new-chat-status">
              No users found.
            </div>

          ) : (
            filteredUsers.map(
              (user) => {

                const isSelected =
                  selectedUsers.some(
                    (selected) =>
                      selected._id ===
                      user._id
                  );

                return (
                  <button
                    key={user._id}
                    type="button"
                    className={`new-chat-user ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectUser(
                        user
                      )
                    }
                  >

                    <div className="new-chat-avatar">
                      {user.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="new-chat-user-info">

                      <div className="new-chat-user-name">
                        {user.name}
                      </div>

                      <div className="new-chat-user-email">
                        {user.email}
                      </div>

                    </div>

                    <div
                      className={`new-chat-checkbox ${
                        isSelected
                          ? "checked"
                          : ""
                      }`}
                    >
                      {isSelected
                        ? "✓"
                        : ""}
                    </div>

                  </button>
                );
              }
            )
          )}

        </div>

        {/* FOOTER */}

        <div className="new-chat-footer">

          <span>
            {selectedUsers.length ===
            0
              ? "Select users"
              : `${selectedUsers.length} selected`}
          </span>

          <button
            type="button"
            className="new-chat-start"
            disabled={
              selectedUsers.length ===
              0
            }
            onClick={
              handleContinue
            }
          >
            {selectedUsers.length >
            1
              ? "Create Group"
              : "Start Chat"}
          </button>

        </div>

      </div>
    </div>
  );
}