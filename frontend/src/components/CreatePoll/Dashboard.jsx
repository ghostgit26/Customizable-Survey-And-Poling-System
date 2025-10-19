import React, { useEffect, useState } from "react";
import axios from "axios";
import PollCard from "./PollCard";

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserPolls = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/polls/my-polls", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPolls(res.data);
      } catch (err) {
        setPolls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPolls();
  }, [token]);

  return (
    <div className="container mt-4">
      <h3>My Polls</h3>
      {loading ? (
        <p>Loading...</p>
      ) : polls.length === 0 ? (
        <p>You haven't created any polls yet.</p>
      ) : (
        polls.map((poll) => <PollCard key={poll._id} poll={poll} />)
      )}
    </div>
  );
};

export default Dashboard;
