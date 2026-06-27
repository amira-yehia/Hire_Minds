import { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";
import { recruitersAPI, getSession } from "../../api";
import "./HRProfile.css";

export default function HRProfile() {
  const { userId } = getSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // اقرأ الصورة من localStorage فوراً قبل الـ API
    const savedPhoto = localStorage.getItem(`recruiter-photo-${userId}`);
    if (savedPhoto) {
      setUser((prev) => ({ ...(prev || {}), photoUrl: savedPhoto }));
    }

    recruitersAPI
      .getProfile(userId)
      .then((data) => {
        setUser({
          ...data,
          photoUrl: savedPhoto || data?.photoUrl || null,
        });
        setForm({
          fullName: data?.fullName || "",
          phoneNumber: data?.phoneNumber || "",
          address: data?.address || "",
          city: data?.city || "",
          country: data?.country || "",
        });
      })
      .catch(() => {
        setUser((prev) => ({ ...(prev || {}), photoUrl: savedPhoto }));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await recruitersAPI.updateProfile(form);
      const savedPhoto = localStorage.getItem(`recruiter-photo-${userId}`);

      // ← متعمليش getProfile تاني، حدّثي من الـ form مباشرة
      setUser((prev) => ({
        ...prev,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        city: form.city,
        country: form.country,
        photoUrl: savedPhoto || prev?.photoUrl || null,
      }));
      setEditMode(false);
    } catch (err) {
      alert(err.message);
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, photoUrl: previewUrl }));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      localStorage.setItem(`recruiter-photo-${userId}`, base64);
      setUser((prev) => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await recruitersAPI.uploadPhoto(fd);

      console.log("upload response:", response); // ← شوفي إيه اللي بيجي

      // الـ backend بيرجع { isSucceded, message, url }
      const rawUrl = response?.url;
      if (rawUrl) {
        const serverUrl = rawUrl.startsWith("http")
          ? rawUrl
          : `http://recruitermentsystem.runasp.net/${rawUrl}`;

        localStorage.setItem(`recruiter-photo-${userId}`, serverUrl);
        setUser((prev) => ({ ...prev, photoUrl: serverUrl }));
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  const initials = (user?.fullName || "HR")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="candidate-shell">
        <HRSidebar />
        <main className="candidate-main candidate-profile-loading">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-shell">
      <HRSidebar />

      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>
        </header>

        <section className="candidate-view">
          <div className="candidate-dashboard-grid">
            {/* ── Personal Information ── */}
            <article className="candidate-profile-card">
              <h2>Personal Information</h2>

              {/* Avatar + Identity */}
              <div className="hr-profile-row">
                <div className="hr-avatar-wrap">
                  <div className="candidate-avatar">
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt="avatar" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                <div className="hr-profile-identity">
                  <h3>{user?.fullName || "Recruiter"}</h3>
                  <span className="hr-role-badge">
                    <i className="bx bx-briefcase"></i> HR Recruiter
                  </span>
                  <span className="hr-email">{user?.email}</span>
                </div>
              </div>

              {/* Change Photo (edit mode only) */}
              {editMode && (
                <label className="hr-photo-btn">
                  <i className="bx bx-camera"></i>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}

              {/* Contact Details */}
              <p className="hr-section-label">
                <i className="bx bx-user-circle"></i> Contact Details
              </p>

              {!editMode ? (
                <div className="hr-info-chips">
                  {user?.phoneNumber && (
                    <span className="hr-info-chip">
                      <i className="bx bx-phone"></i>
                      {user.phoneNumber}
                    </span>
                  )}
                  {user?.address && (
                    <span className="hr-info-chip">
                      <i className="bx bx-map-pin"></i>
                      {user.address}
                    </span>
                  )}
                  {user?.city && (
                    <span className="hr-info-chip">
                      <i className="bx bx-buildings"></i>
                      {user.city}
                    </span>
                  )}
                  {user?.country && (
                    <span className="hr-info-chip">
                      <i className="bx bx-globe"></i>
                      {user.country}
                    </span>
                  )}
                  {!user?.phoneNumber && !user?.city && !user?.country && (
                    <span style={{ color: "var(--hm-muted)", fontSize: 13 }}>
                      No contact info added yet
                    </span>
                  )}
                </div>
              ) : (
                <div className="hr-form-grid">
                  <div className="hr-field hr-full-col">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="hr-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="+20 1xx xxx xxxx"
                    />
                  </div>
                  <div className="hr-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Cairo"
                    />
                  </div>
                  <div className="hr-field hr-full-col">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="hr-field hr-full-col">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Egypt"
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              {!editMode ? (
                <button
                  type="button"
                  className="hr-btn-edit"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bx bx-edit-alt"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="hr-actions">
                  <button
                    type="button"
                    className="hr-btn-primary"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="hr-btn-danger"
                    onClick={() => {
                      setForm({
                        fullName: user?.fullName || "",
                        phoneNumber: user?.phoneNumber || "",
                        address: user?.address || "",
                        city: user?.city || "",
                        country: user?.country || "",
                      });
                      setEditMode(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </article>

            {/* ── Company Information ── */}
            {user?.companyName && (
              <article className="candidate-profile-card">
                <h2>Company Information</h2>

                <div className="hr-company-row">
                  <div className="hr-company-logo">
                    <i className="bx bx-building-house"></i>
                  </div>
                  <div>
                    <h3>{user.companyName}</h3>
                    <p>{user?.industry || "Recruitment"}</p>
                  </div>
                </div>

                {user?.industry && (
                  <>
                    <p className="hr-section-label">
                      <i className="bx bx-category"></i> Industry
                    </p>
                    <div className="hr-info-chips">
                      <span className="hr-info-chip">
                        <i className="bx bx-briefcase-alt"></i>
                        {user.industry}
                      </span>
                    </div>
                  </>
                )}

                {user?.companyLocation && (
                  <>
                    <p className="hr-section-label">
                      <i className="bx bx-map"></i> Location
                    </p>
                    <div className="hr-info-chips">
                      <span className="hr-info-chip">
                        <i className="bx bx-map-pin"></i>
                        {user.companyLocation}
                      </span>
                    </div>
                  </>
                )}
              </article>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
