import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import { recruitersAPI, getSession } from "../../api";
import "./HRProfile.css";

export default function HRDashboard() {
  const { userId } = getSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // اقرأ الصورة من localStorage فوراً
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
      })
      .catch(() => {
        setUser((prev) => ({ ...(prev || {}), photoUrl: savedPhoto }));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="candidate-shell">
      <HRSidebar />
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>
              Welcome back, {user?.fullName?.split(" ")[0] || "Recruiter"}
            </h1>
            <p>Manage jobs and candidates</p>
          </div>
        </header>

        <section className="candidate-view">
          <div className="candidate-dashboard-grid">
            {/* Profile */}
            <article className="candidate-profile-card">
              <h2>Your Profile</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="candidate-profile-row">
                    {/*<div className="candidate-avatar">
                      {user?.photoUrl ? (
                        <img src={user.photoUrl} alt="avatar" />
                      ) : (
                        (user?.fullName || "HR")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>*/}
                    <div className="hr-avatar-wrap">
                      <div className="candidate-avatar">
                        {user?.photoUrl ? (
                          <img src={user.photoUrl} alt="avatar" />
                        ) : (
                          (user?.fullName || "HR")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                    </div>
                    <div>
                      <h3>{user?.fullName || "Recruiter"}</h3>
                      <p>HR Recruiter</p>
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  {user?.companyName && (
                    <>
                      <p className="candidate-card-label">Company</p>
                      <div className="candidate-skill-list">
                        <span>{user.companyName}</span>
                        {user.companyLocation && (
                          <span>{user.companyLocation}</span>
                        )}
                        {user.industry && <span>{user.industry}</span>}
                      </div>
                    </>
                  )}

                  <Link
                    to="/hr-dashboard/profile"
                    className="candidate-wide-button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      marginTop: "20px",
                    }}
                  >
                    Edit Profile
                  </Link>
                </>
              )}
            </article>

            {/* Actions */}
            <div className="candidate-actions">
              <article className="candidate-action-card">
                <div className="candidate-action-copy">
                  <span>
                    <i className="bx bx-plus-circle"></i>
                  </span>
                  <div>
                    <h3>Create Job Post</h3>
                    <p>Create a new opportunity</p>
                  </div>
                </div>
                <Link to="/hr-dashboard/create-job">Create</Link>
              </article>

              <article className="candidate-action-card">
                <div className="candidate-action-copy">
                  <span>
                    <i className="bx bx-group"></i>
                  </span>
                  <div>
                    <h3>Candidates</h3>
                    <p>View applicants and reports</p>
                  </div>
                </div>
                <Link to="/hr-dashboard/candidates">View</Link>
              </article>

              <article className="candidate-action-card">
                <div className="candidate-action-copy">
                  <span>
                    <i className="bx bx-bar-chart-alt"></i>
                  </span>
                  <div>
                    <h3>Reports</h3>
                    <p>AI scores and interview results</p>
                  </div>
                </div>
                <Link to="/hr-dashboard/reports">Open</Link>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import HRSidebar from "./HRSidebar";
// import { recruitersAPI, getSession } from "../../api";

// export default function HRDashboard() {
//   const { userId } = getSession();

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }

//     recruitersAPI
//       .getProfile(userId)
//       .then(setUser)
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, [userId]);
//   useEffect(() => {
//     recruitersAPI.getProfile(userId).then((data) => {
//       const savedPhoto = localStorage.getItem(`recruiter-photo-${userId}`);

//       setUser({
//         ...data,
//         photoUrl: data?.photoUrl || savedPhoto,
//       });
//     });
//   }, [userId]);
//   return (
//     <div className="candidate-shell">
//       <HRSidebar />

//       <main className="candidate-main">
//         <header className="candidate-topbar">
//           <div>
//             <h1>Welcome back, Recruiter</h1>
//             <p>Manage jobs and candidates</p>
//           </div>
//         </header>

//         <section className="candidate-view">
//           <div className="candidate-dashboard-grid">
//             {/* Profile */}
//             <article className="candidate-profile-card">
//               <h2>Your Profile</h2>

//               {loading ? (
//                 <p>Loading...</p>
//               ) : (
//                 <>
//                   <div className="candidate-profile-row">
//                     <div className="candidate-avatar">
//                       {user?.photoUrl ? (
//                         <img
//                           src={user.photoUrl}
//                           alt="avatar"
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             borderRadius: "50%",
//                             objectFit: "cover",
//                             objectPosition: "center 15%",
//                           }}
//                         />
//                       ) : (
//                         (user?.fullName || "HR")
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")
//                           .slice(0, 2)
//                           .toUpperCase()
//                       )}
//                     </div>

//                     <div>
//                       <h3>{user?.fullName || "Recruiter"}</h3>
//                       <p>HR Recruiter</p>
//                       <span>{user?.email}</span>
//                     </div>
//                   </div>

//                   {user?.companyName && (
//                     <>
//                       <p className="candidate-card-label">Company</p>

//                       <div className="candidate-skill-list">
//                         <span>{user.companyName}</span>

//                         {user.companyLocation && (
//                           <span>{user.companyLocation}</span>
//                         )}

//                         {user.industry && <span>{user.industry}</span>}
//                       </div>
//                     </>
//                   )}

//                   <Link
//                     to="/hr-dashboard/profile"
//                     className="candidate-wide-button"
//                     style={{
//                       display: "inline-flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       textDecoration: "none",
//                       marginTop: "20px",
//                     }}
//                   >
//                     Edit Profile
//                   </Link>
//                 </>
//               )}
//             </article>

//             {/* Actions */}
//             <div className="candidate-actions">
//               <article className="candidate-action-card">
//                 <div className="candidate-action-copy">
//                   <span>
//                     <i className="bx bx-plus-circle"></i>
//                   </span>

//                   <div>
//                     <h3>Create Job Post</h3>
//                     <p>Create a new opportunity</p>
//                   </div>
//                 </div>

//                 <Link to="/hr-dashboard/create-job">Create</Link>
//               </article>

//               <article className="candidate-action-card">
//                 <div className="candidate-action-copy">
//                   <span>
//                     <i className="bx bx-group"></i>
//                   </span>

//                   <div>
//                     <h3>Candidates</h3>
//                     <p>View applicants and reports</p>
//                   </div>
//                 </div>

//                 <Link to="/hr-dashboard/candidates">View</Link>
//               </article>

//               <article className="candidate-action-card">
//                 <div className="candidate-action-copy">
//                   <span>
//                     <i className="bx bx-bar-chart-alt"></i>
//                   </span>

//                   <div>
//                     <h3>Reports</h3>
//                     <p>AI scores and interview results</p>
//                   </div>
//                 </div>

//                 <Link to="/hr-dashboard/reports">Open</Link>
//               </article>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }
