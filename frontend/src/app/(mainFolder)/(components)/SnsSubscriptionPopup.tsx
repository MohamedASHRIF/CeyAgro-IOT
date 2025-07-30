// "use client";

// import { useUser } from "@auth0/nextjs-auth0/client";
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";

// export default function SnsSubscriptionPopup() {
//   const { user } = useUser();
//   const [showPopup, setShowPopup] = useState<boolean>(false);
//   const [popupMessage, setPopupMessage] = useState<string | null>(null);
//   const [popupError, setPopupError] = useState<string | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const hasSentRequest = useRef(false);

//   //If the user is logged out it resets these states
//   useEffect(() => {
//     if (!user) {
//       hasSentRequest.current = false;
//       setShowPopup(false);
//       setPopupMessage(null);
//       setPopupError(null);
//       setErrorMessage(null);
//       console.log("User logged out, resetting state");
//     }
//   }, [user]);

//   //send SNS subscription email based on subscription status
//   useEffect(() => {
//     if (user && !hasSentRequest.current) {
//       hasSentRequest.current = true;
//       const normalizedEmail = user.email?.toLowerCase();
//       console.log("Sending login request:", {
//         email: normalizedEmail,
//         //name: user.name,
//         user_id: user.sub,
//       });

//       if (!normalizedEmail) {
//         console.error("User email is missing");
//         setErrorMessage("User email is missing. Please try logging in again.");
//         return;
//       }

//       axios
//         .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
//           email: normalizedEmail,
//           name: user.name || user.nickname || "Unknown",
//         })
//         .then((response) => {
//           console.log("Login response:", response.data);
//           if (response.data.isSubscribed) {
//             console.log("User is subscribed, no popup shown");
//             setShowPopup(false);
//             setPopupMessage(null);
//           } else {
//             console.log("User not subscribed, showing popup");
//             setShowPopup(true);
//             setPopupMessage(
//               "Please check your inbox (including spam) for an AWS SNS subscription confirmation email, then click Confirm Subscription to activate login notifications."
//             );
//           }
//         })
//         .catch((error) => {
//           console.error("Error processing login:", {
//             message: error.message,
//             status: error.response?.status,
//             data: error.response?.data,
//           });
//           setErrorMessage(
//             "Failed to connect to the server. Please ensure the backend is running and try again."
//           );
//         });
//     }
//   }, [user]);

//   //automatically dismissing error messages after a delay
//   useEffect(() => {
//     if (errorMessage) {
//       const timer = setTimeout(() => {
//         setErrorMessage(null);
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [errorMessage]);

//   //specifically manages the popup-related error message(dismiss after delay)
//   useEffect(() => {
//     if (popupError) {
//       const timer = setTimeout(() => {
//         setPopupError(null);
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [popupError]);

//   // controls when to automatically close the SNS subscription popup after the user has confirmed their subscription.
//   useEffect(() => {
//     if (popupMessage && !popupError && popupMessage.includes("confirmed")) {
//       const timer = setTimeout(() => {
//         setShowPopup(false);
//         setPopupMessage(null);
//         hasSentRequest.current = false;
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [popupMessage, popupError]);

//   //Verifies that the user is logged in.
//   // Sends a confirmation request to the backend with the user’s email.
//   // Updates the UI based on success or failure
//   const handleConfirmSubscription = async () => {
//     if (!user) {
//       setPopupError("You must be logged in to confirm your subscription.");
//       return;
//     }

//     try {
//       const normalizedEmail = user.email?.toLowerCase();
//       console.log(`Sending confirmation request for ${normalizedEmail}`);
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/confirm-subscription`,
//         { email: normalizedEmail }
//       );
//       console.log("Confirmation response:", response.data);
//       setPopupMessage(response.data.message);
//       setPopupError(null);
//       hasSentRequest.current = false;
//     } catch (err) {
//       console.error("Error confirming subscription:", err);
//       setPopupError("Failed to confirm subscription. Please try again.");
//     }
//   };

//   return (
//     <>
//       {errorMessage && (
//         <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
//           {errorMessage}
//         </div>
//       )}
//       {showPopup && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setShowPopup(false)}
//         >
//           <div
//             className="bg-white p-6 rounded-lg max-w-sm w-full text-center"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h3 className="text-lg font-bold mb-4">
//               SNS Subscription Required
//             </h3>
//             {popupMessage && (
//               <p
//                 className={`mb-4 ${
//                   popupMessage.includes("confirmed")
//                     ? "text-green-500"
//                     : "text-black"
//                 }`}
//               >
//                 {popupMessage}
//               </p>
//             )}
//             {popupError && <p className="text-red-500 mb-4">{popupError}</p>}
//             {!popupMessage || !popupMessage.includes("confirmed") ? (
//               <div className="flex justify-center gap-4">
//                 {/* <button
//                   onClick={handleConfirmSubscription}
//                   className="bg-green-400 text-black px-4 py-2 rounded hover:bg-green-500"
//                 >
//                   Confirm Subscription
//                 </button>
//                 <button
//                   onClick={() => setShowPopup(false)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                 >
//                   Dismiss
//                 </button> */}
//               </div>
//             ) : null}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// "use client";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { useEffect, useState } from "react";

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001";

// export const SnsSubscriptionPopup = () => {
//   const { user, isLoading } = useUser();
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     if (isLoading || !user?.email) return;

//     // Use a unique key per user
//     const popupKey = `first-login-popup-shown-${user.email}`;

//     // If already shown, don't show again
//     if (localStorage.getItem(popupKey)) return;

//     const fetchLoginCount = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/user/login-count/${encodeURIComponent(user?.email ?? "")}`);
//         if (!res.ok) throw new Error("Failed to fetch login count");
//         const data = await res.json();
//         if (data.count === 1) {
//           setShowPopup(true);
//           localStorage.setItem(popupKey, "true"); // Mark as shown
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchLoginCount();
//   }, [isLoading, user]);

//   if (!showPopup) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//       <div className="bg-white p-6 rounded shadow-lg">
//         <h2 className="text-xl font-bold mb-2">Welcome!</h2>
//         <p>This is your first login. 🎉</p>
//         <button
//           className="mt-4 px-4 py-2 bg-teal-500 text-white rounded"
//           onClick={() => setShowPopup(false)}
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };
"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001";

export const SnsSubscriptionPopup = () => {
  const { user, isLoading } = useUser();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    console.log("User:", user, "isLoading:", isLoading);
    if (isLoading || !user?.email) return;

    const popupKey = `first-login-popup-shown-${user.email}`;
    if (localStorage.getItem(popupKey)) {
      console.log("Popup already shown for:", user.email);
      return;
    }

    const fetchLoginCount = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/user/login-count/${encodeURIComponent(
            user?.email ?? ""
          )}`
        );
        if (!res.ok) {
          console.error("Fetch failed with status:", res.status);
          throw new Error("Failed to fetch login count");
        }
        const data = await res.json();
        console.log("API Response:", data);
        if (data.count === 1) {
          setShowPopup(true);
          localStorage.setItem(popupKey, "true");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchLoginCount();
  }, [isLoading, user]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-50">
      <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg shadow-xl max-w-md mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Please check your inbox (including spam) for a subscription
            confirmation email, then click the{" "}
            <span className="font-semibold text-blue-600">
              Confirm Subscription
            </span>{" "}
            link to activate login notifications.
          </p>
          <button
            className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors duration-200"
            onClick={() => setShowPopup(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
