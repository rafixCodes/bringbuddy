import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {" | "}
        <Link to="/login">Login</Link>
        {" | "}
        <Link to="/register">Register</Link>
      </nav>

      <h1>BringBuddy</h1>
      <p>Cross-Border Traveler Marketplace</p>
    </div>
  );
}

export default Home;