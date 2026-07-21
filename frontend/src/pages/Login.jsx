import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaPlaneDeparture } from "react-icons/fa";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);

      localStorage.setItem("token", data.token);

      alert("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Section */}
      <div className="hidden lg:flex bg-slate-900 text-white flex-col justify-center px-20">

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <FaPlaneDeparture size={35} />
          </div>

          <h1 className="text-5xl font-bold">
            BringBuddy
          </h1>
        </div>

        <h2 className="text-3xl font-semibold mb-6">
          Cross Border Parcel Delivery
        </h2>

        <p className="text-slate-300 text-lg leading-8">
          BringBuddy connects travelers with people who need
          to send parcels or purchase products from abroad.
          Our platform makes international delivery easier,
          more affordable, and more reliable.
        </p>

        <div className="mt-12 space-y-4 text-lg">
          <p>✅ Secure Authentication</p>
          <p>✅ Trusted Travelers</p>
          <p>✅ Fast Parcel Delivery</p>
          <p>✅ Affordable Service</p>
        </div>

      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center bg-slate-100 p-10">

        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10">

          <h2 className="text-4xl font-bold text-slate-800 mb-2">
            Welcome Back
          </h2>

          <p className="text-slate-500 mb-8">
            Login to continue using BringBuddy.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaEnvelope className="text-slate-400 mr-3" />

                <input
                  className="w-full bg-transparent outline-none"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaLock className="text-slate-400 mr-3" />

                <input
                  className="w-full bg-transparent outline-none"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold"
            >
              Login
            </button>

          </form>

          <p className="text-center mt-8 text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;