import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Camera, Trash2 } from "lucide-react";
import "./UserProfile.css";

// Reference public image using the root-relative path
const DEFAULT_AVATAR = "/images/no-profile.png";
const BACKEND_URL = "http://localhost:5000";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [totalPolls, setTotalPolls] = useState(0);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(DEFAULT_AVATAR);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [nameError, setNameError] = useState(""); // for name validation
  const fileInputRef = useRef();

  // Utility to get user and token from localStorage safely
  const getUserAndToken = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return {};
    try {
      const userObj = JSON.parse(userStr);
      return { userObj, token: userObj.token };
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const { userObj } = getUserAndToken();
    setProfilePic(DEFAULT_AVATAR);
    if (userObj) {
      let imagePath = DEFAULT_AVATAR;
      if (userObj.image) {
        if (userObj.image.startsWith("http")) {
          imagePath = userObj.image;
        } else if (userObj.image) {
          imagePath = `${BACKEND_URL}${userObj.image}`;
        }
      }
      setUser(userObj);
      setName(userObj.name || "");
      setEmail(userObj.email || "");
      setProfilePic(imagePath);
    }
  }, []);

  useEffect(() => {
    const { userObj, token } = getUserAndToken();
    if (!userObj || !token) return;

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/users/${userObj._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        let imagePath = DEFAULT_AVATAR;
        if (data.image) {
          if (data.image.startsWith("http")) {
            imagePath = data.image;
          } else if (data.image) {
            imagePath = `${BACKEND_URL}${data.image}`;
          }
        }
        setProfilePic(imagePath);
      } catch (err) {
        toast.error("Error loading user. " + (err?.response?.data?.message || err.message));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const { token } = getUserAndToken();
    if (!token) return;

    const fetchPollStats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/polls/my-polls`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalPolls(res.data.length);
      } catch (err) {
        console.error("Failed to fetch polls", err);
      }
    };

    fetchPollStats();
  }, []);

  // Updated to fetch surveys created by the logged-in user from /api/surveys/mine
  useEffect(() => {
    const { token } = getUserAndToken();
    if (!token) return;

    const fetchSurveyStats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/surveys/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalSurveys(res.data.surveys.length);
      } catch (err) {
        console.error("Failed to fetch surveys", err);
      }
    };

    fetchSurveyStats();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openCameraPermissionPopup = () => {
    setShowPermissionPopup(true);
  };

  const handlePopupConfirm = () => {
    setShowPermissionPopup(false);
    fileInputRef.current.click();
  };

  const handlePopupCancel = () => {
    setShowPermissionPopup(false);
  };

  const handleEditToggle = () => {
    isEditing ? handleSaveProfile() : setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setNameError("");
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleRemoveProfilePic = async () => {
    // Prevent removal if current pic is default
    if (
      (!user?.image && !previewUrl) ||
      profilePic === DEFAULT_AVATAR ||
      (user?.image === "" && !previewUrl)
    ) {
      toast.info("Cannot remove profile picture.");
      return;
    }
    setLoading(true);
    try {
      const { userObj, token } = getUserAndToken();
      if (!userObj || !token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        { removeImage: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = { ...userObj, image: "" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfilePic(DEFAULT_AVATAR);
      setUser(updatedUser);
      setImageFile(null);
      setPreviewUrl("");
      toast.success("Profile picture removed!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove profile picture");
    }
    setLoading(false);
  };

  // Name input validation: allow only alphabets (and spaces)
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setName(value);
      setNameError("");
    } else {
      setNameError("Name can only contain letters and spaces");
    }
  };

  const handleSaveProfile = async () => {
    // Validate name before saving
    if (!/^[A-Za-z\s]+$/.test(name)) {
      setNameError("Name can only contain letters and spaces");
      return;
    }

    setLoading(true);
    try {
      const { userObj, token } = getUserAndToken();
      if (!userObj || !token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      if (name !== user.name) formData.append("name", name);
      if (imageFile) formData.append("image", imageFile);

      const response = await axios.put(`${BACKEND_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...userObj,
        name: response.data.name,
        image: response.data.image,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      let updatedImage = DEFAULT_AVATAR;
      if (response.data.image) {
        if (response.data.image.startsWith("http")) {
          updatedImage = response.data.image;
        } else if (response.data.image) {
          updatedImage = `${BACKEND_URL}${response.data.image}`;
        }
      }

      setProfilePic(`${updatedImage}?cb=${Date.now()}`);
      setUser(updatedUser);
      setIsEditing(false);
      setImageFile(null);
      setPreviewUrl("");
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    }
    setLoading(false);
  };

  // Fallback order: previewUrl, profilePic, then DEFAULT_AVATAR
  const imageSrc = previewUrl || profilePic || DEFAULT_AVATAR;

  return (
    <div className="user-profile-container">
      {showPermissionPopup && (
        <div className="permission-popup">
          <div className="permission-popup-content">
            <h5>File Access Required</h5>
            <p>Do you want to allow access to the files?</p>
            <div className="d-flex justify-content-around mt-4">
              <button className="btn btn-secondary" onClick={handlePopupCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handlePopupConfirm}>
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="user-card text-center">
        <div className="avatar-wrapper">
          <img
            src={imageSrc}
            alt="Profile"
            className="avatar-img"
            onError={(e) => {
              e.currentTarget.onerror = null; // prevent infinite loop
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          {isEditing && (
            <>
              <label
                onClick={openCameraPermissionPopup}
                className="action-btn action-btn-left"
                title="Change Profile Picture"
              >
                <Camera size={18} />
              </label>
              <button
                type="button"
                className="action-btn action-btn-right"
                title="Remove Profile Picture"
                onClick={handleRemoveProfilePic}
                disabled={loading}
              >
                <Trash2 size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="d-none"
              />
            </>
          )}
        </div>

        <div className="mt-3">
          {isEditing ? (
            <>
              <input
                type="text"
                className={`form-control mb-2 ${nameError ? "is-invalid" : ""}`}
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
                maxLength={32}
              />
              {nameError && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {nameError}
                </div>
              )}
            </>
          ) : (
            <h4 className="mb-1">{name}</h4>
          )}
          <p className="text-muted small">{email}</p>
        </div>

        <div className="d-flex justify-content-around border-top border-bottom py-3 mt-3">
          <div>
            <h5 className="mb-0">{totalPolls}</h5>
            <small className="text-muted">Total Polls</small>
          </div>
          <div>
            <h5 className="mb-0">{totalSurveys}</h5>
            <small className="text-muted">Total Surveys</small>
          </div>
        </div>

        {!isEditing ? (
          <button
            className="btn btn-primary mt-4 px-4 py-2 rounded-pill"
            style={{ backgroundColor: "#3d246c", border: "none" }}
            onClick={handleEditToggle}
            disabled={loading}
          >
            Edit Profile
          </button>
        ) : (
          <div className="d-flex mt-4 gap-2 justify-content-center">
            <button
              className="btn btn-primary px-4 py-2 rounded-pill"
              style={{ backgroundColor: "#3d246c", border: "none", minWidth: "120px" }}
              onClick={handleSaveProfile}
              disabled={loading || !!nameError || name.trim() === ""}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
            <button
              className="btn btn-light px-4 py-2 rounded-pill"
              style={{ minWidth: "120px" }}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;