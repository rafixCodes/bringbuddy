import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../services/authService";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Dashboard</h1>

      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Phone:</strong> {user.phone}</p>

      <br />

      <Link to="/notifications">
        <button>View Notifications</button>
      </Link>
    </div>
  );
}

export default Dashboard;