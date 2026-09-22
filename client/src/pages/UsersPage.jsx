import { useEffect, useState } from "react";
import axios from "axios";
import { List, Plus, UserRound, Pencil, Trash2, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");

  const [formError, setFormError] = useState("");

  // ==========================================
  // AUTH HEADER HELPER
  // ==========================================
  const getAuthConfig = () => {
    const token = sessionStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // GET ALL USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/users",
        getAuthConfig()
      );

      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("User");

    setSelectedUser(null);
    setIsEditMode(false);
    setFormError("");
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================
  const handleAddUserClick = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================
  const handleEditUser = (user) => {
    setSelectedUser(user);

    setName(user.name || "");
    setEmail(user.email || "");
    setPassword("");
    setRole(user.role || "User");

    setIsEditMode(true);
    setFormError("");
    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE USER
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!isEditMode && !password.trim()) {
      setFormError("Password is required.");
      return;
    }

    try {
      if (isEditMode) {
        const updateData = {
          name: name.trim(),
          email: email.trim(),
          role,
        };

        // Only send password if user entered a new one
        if (password.trim()) {
          updateData.password = password;
        }

        const response = await axios.put(
          `http://localhost:5000/api/users/${selectedUser._id}`,
          updateData,
          getAuthConfig()
        );

        const updatedUser = response.data.data;

        setUsers((previousUsers) =>
          previousUsers.map((user) =>
            user._id === updatedUser._id
              ? updatedUser
              : user
          )
        );
      } else {
        const newUser = {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        };

        const response = await axios.post(
          "http://localhost:5000/api/users",
          newUser,
          getAuthConfig()
        );

        const createdUser = response.data.data;

        setUsers((previousUsers) => [
          createdUser,
          ...previousUsers,
        ]);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("User save failed:", error);

      setFormError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================
  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/users/${userId}`,
        getAuthConfig()
      );

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== userId
        )
      );
    } catch (error) {
      console.error("Delete user failed:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    }
  };

  return (
    <div className="page">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="page-head">
        <div>
          <h1>User Management</h1>
          <p>
            Manage users and their roles
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddUserClick}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {/* ==========================================
          ADD / EDIT FORM
      ========================================== */}
      {showForm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal">

            <div className="modal-head">
              <h2 className="card-title">
                {isEditMode
                  ? "Edit User"
                  : "Add User"}
              </h2>

              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                aria-label="Close form"
              >
                <X size={16} />
              </button>
            </div>

            <form
              className="expense-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}
              <div className="field">
                <label htmlFor="user-name">
                  Name
                </label>

                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter user name"
                />
              </div>

              {/* EMAIL */}
              <div className="field">
                <label htmlFor="user-email">
                  Email
                </label>

                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter email"
                />
              </div>

              {/* PASSWORD */}
              <div className="field">
                <label htmlFor="user-password">
                  {isEditMode
                    ? "New Password (optional)"
                    : "Password"}
                </label>

                <input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={
                    isEditMode
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </div>

              {/* ROLE */}
              <div className="field">
                <label htmlFor="user-role">
                  Role
                </label>

                <select
                  id="user-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                >
                  <option value="User">
                    User
                  </option>

                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Viewer">
                    Viewer
                  </option>
                </select>
              </div>

              {/* FORM ERROR */}
              {formError && (
                <p className="form-error">
                  {formError}
                </p>
              )}

              {/* ACTIONS */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditMode
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          USER LIST
      ========================================== */}
      <section className="card">

        <div className="card-head">
          <h2 className="card-title">
            <List size={16} />
            Users ({users.length})
          </h2>
        </div>

        <div className="card-body">

          {loading ? (
            <div className="empty-state">
              <span>Loading users...</span>
            </div>

          ) : users.length === 0 ? (
            <div className="empty-state">

              <UserRound
                size={30}
                strokeWidth={1.4}
              />

              <strong>
                No users found.
              </strong>

              <span>
                Add your first user to see them here.
              </span>

            </div>

          ) : (

            <div className="table-wrap">

              <table className="expense-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user, index) => (

                    <tr key={user._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {user.name}
                        </strong>
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        {user.role}
                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              handleEditUser(user)
                            }
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDeleteUser(
                                user._id
                              )
                            }
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}