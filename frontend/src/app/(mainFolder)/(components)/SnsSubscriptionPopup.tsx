"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function SnsSubscriptionPopup() {
  const { user } = useUser();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupError, setPopupError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasSentRequest = useRef(false);

  //If the user is logged out it resets these states
  useEffect(() => {
    if (!user) {
      hasSentRequest.current = false;
      setShowPopup(false);
      setPopupMessage(null);
      setPopupError(null);
      setErrorMessage(null);
      console.log("User logged out, resetting state");
    }
  }, [user]);

  //send SNS subscription email based on subscription status
  useEffect(() => {
    if (user && !hasSentRequest.current) {
      hasSentRequest.current = true;
      const normalizedEmail = user.email?.toLowerCase();
      console.log("Sending login request:", {
        email: normalizedEmail,
        name: user.name,
        user_id: user.sub,
      });

      if (!normalizedEmail) {
        console.error("User email is missing");
        setErrorMessage("User email is missing. Please try logging in again.");
        return;
      }

      axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
          email: normalizedEmail,
          name: user.name || user.nickname || "Unknown",
        })
        .then((response) => {
          console.log("Login response:", response.data);
          if (response.data.isSubscribed) {
            console.log("User is subscribed, no popup shown");
            setShowPopup(false);
            setPopupMessage(null);
          } else {
            console.log("User not subscribed, showing popup");
            setShowPopup(true);
            setPopupMessage(
              "Please check your inbox (including spam) for an AWS SNS subscription confirmation email, then click Confirm Subscription to activate login notifications."
            );
          }
        })
        .catch((error) => {
          console.error("Error processing login:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          setErrorMessage(
            "Failed to connect to the server. Please ensure the backend is running and try again."
          );
        });
    }
  }, [user]);

  //automatically dismissing error messages after a delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  //specifically manages the popup-related error message(dismiss after delay)
  useEffect(() => {
    if (popupError) {
      const timer = setTimeout(() => {
        setPopupError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupError]);

  // controls when to automatically close the SNS subscription popup after the user has confirmed their subscription.
  useEffect(() => {
    if (popupMessage && !popupError && popupMessage.includes("confirmed")) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        setPopupMessage(null);
        hasSentRequest.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage, popupError]);

  //Verifies that the user is logged in.
  // Sends a confirmation request to the backend with the user’s email.
  // Updates the UI based on success or failure
  const handleConfirmSubscription = async () => {
    if (!user) {
      setPopupError("You must be logged in to confirm your subscription.");
      return;
    }

    try {
      const normalizedEmail = user.email?.toLowerCase();
      console.log(`Sending confirmation request for ${normalizedEmail}`);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/confirm-subscription`,
        { email: normalizedEmail }
      );
      console.log("Confirmation response:", response.data);
      setPopupMessage(response.data.message);
      setPopupError(null);
      hasSentRequest.current = false;
    } catch (err) {
      console.error("Error confirming subscription:", err);
      setPopupError("Failed to confirm subscription. Please try again.");
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {errorMessage}
        </div>
      )}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              SNS Subscription Required
            </h3>
            {popupMessage && (
              <p
                className={`mb-4 ${
                  popupMessage.includes("confirmed")
                    ? "text-green-500"
                    : "text-black"
                }`}
              >
                {popupMessage}
              </p>
            )}
            {popupError && <p className="text-red-500 mb-4">{popupError}</p>}
            {!popupMessage || !popupMessage.includes("confirmed") ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmSubscription}
                  className="bg-green-400 text-black px-4 py-2 rounded hover:bg-green-500"
                >
                  Confirm Subscription
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
