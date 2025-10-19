import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/HomePage/Navbar";
import Footer from "./components/HomePage/Footer";
import HomePage from "./components/HomePage/HomePage";
import SigninSignup from "./components/SigninSignupPage/SigninSignup";
import Dashboard from "./components/Dashboard/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PollingApp from "./components/CreatePoll/PollingApp";
import UserProfile from "./components/UserProfile/UserProfile";
import SurveyDashboard from "./components/CreateSurvey/SurveyDashboard";
import TakePoll from "./components/TakePoll/TakePoll";
import TakeSurvey from "./components/TakeSurvey/TakeSurvey";
import FormPage from "./components/TakeSurvey/FormPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Sync with localStorage
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      {showLogin && (
        <SigninSignup setShowLogin={setShowLogin} onLogin={handleLogin} />
      )}

      <div className="d-flex flex-column min-vh-100">
        <Navbar
          setShowLogin={setShowLogin}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage setShowLogin={setShowLogin} isLoggedIn={isLoggedIn} />
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/takesurvey" element={<TakeSurvey />} />
            <Route path="/takesurvey/:id" element={<FormPage />} />
            <Route path="/takepoll" element={<TakePoll />} />
            <Route path="/create-survey" element={<SurveyDashboard />} />
            <Route path="/create-poll" element={<PollingApp />} />
            <Route path="/userprofile" element={<UserProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer theme="dark" autoClose={1500} position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
