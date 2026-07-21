import Layout from "../components/Layout";
import {
  FaSuitcase,
  FaBell,
  FaBoxOpen,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Welcome Back 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your BringBuddy account from one place.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500">
                Notifications
              </p>

              <h2 className="text-3xl font-bold mt-2">
                12
              </h2>
            </div>

            <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
              <FaBell size={25} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500">
                Trips
              </p>

              <h2 className="text-3xl font-bold mt-2">
                3
              </h2>
            </div>

            <div className="bg-green-100 text-green-600 p-4 rounded-xl">
              <FaSuitcase size={25} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500">
                Restricted Items
              </p>

              <h2 className="text-3xl font-bold mt-2">
                18
              </h2>
            </div>

            <div className="bg-red-100 text-red-600 p-4 rounded-xl">
              <FaBoxOpen size={25} />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          <Link
            to="/notifications"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center justify-between transition"
          >
            <span>View Notifications</span>

            <FaArrowRight />
          </Link>

          <Link
            to="/restricted-items"
            className="bg-slate-900 hover:bg-black text-white rounded-xl p-5 flex items-center justify-between transition"
          >
            <span>Restricted Items</span>

            <FaArrowRight />
          </Link>

        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-5">
          Recent Activity
        </h2>

        <div className="space-y-4">

          <div className="border rounded-xl p-4">
            User logged in successfully
          </div>

          <div className="border rounded-xl p-4">
            Notification marked as read
          </div>

          <div className="border rounded-xl p-4">
            Restricted item added successfully
          </div>

        </div>
      </div>
    </Layout>
  );
}