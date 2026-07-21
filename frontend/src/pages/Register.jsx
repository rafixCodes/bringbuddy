import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaPlaneDeparture,
} from "react-icons/fa";
import { registerUser } from "../services/authService";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "sender",
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
      const data = await registerUser(formData);

      alert(data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "sender",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Side */}

      <div className="hidden lg:flex bg-blue-700 text-white flex-col justify-center px-20">

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white text-blue-700 p-4 rounded-2xl">
            <FaPlaneDeparture size={34} />
          </div>

          <h1 className="text-5xl font-bold">
            BringBuddy
          </h1>
        </div>

        <h2 className="text-3xl font-semibold mb-6">
          Join Our Community
        </h2>

        <p className="text-lg leading-8 text-blue-100">
          Create an account to start sending parcels or become
          a verified traveler and earn by utilizing your extra
          luggage space.
        </p>

        <div className="mt-12 space-y-4 text-lg">
          <p>🌍 Connect Worldwide</p>
          <p>✈️ Travel Smarter</p>
          <p>📦 Deliver Securely</p>
          <p>🤝 Build Trust</p>
        </div>

      </div>

      {/* Right Side */}

      <div className="flex items-center justify-center bg-slate-100 p-10">

        <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-10">

          <h2 className="text-4xl font-bold text-slate-800 mb-2">
            Create Account
          </h2>

          <p className="text-slate-500 mb-8">
            Register to start using BringBuddy.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="font-medium block mb-2">
                Full Name
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaUser className="text-slate-400 mr-3" />

                <input
                  className="w-full outline-none bg-transparent"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium block mb-2">
                Email
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaEnvelope className="text-slate-400 mr-3" />

                <input
                  className="w-full outline-none bg-transparent"
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
              <label className="font-medium block mb-2">
                Password
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaLock className="text-slate-400 mr-3" />

                <input
                  className="w-full outline-none bg-transparent"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium block mb-2">
                Phone Number
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3 bg-slate-50">
                <FaPhone className="text-slate-400 mr-3" />

                <input
                  className="w-full outline-none bg-transparent"
                  type="text"
                  name="phone"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium block mb-2">
                Register As
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 bg-slate-50 outline-none"
              >
                <option value="sender">
                  Sender
                </option>

                <option value="traveler">
                  Traveler
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold"
            >
              Create Account
            </button>

          </form>

          <p className="text-center mt-8 text-slate-600">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;