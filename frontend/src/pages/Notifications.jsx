import { useEffect, useState } from "react";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Notifications
        </h1>

        <p className="text-slate-500 mt-2">
          View and manage your recent notifications.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
          <FaBell className="mx-auto text-5xl text-slate-300 mb-4" />

          <h2 className="text-xl font-semibold">
            No Notifications
          </h2>

          <p className="text-slate-500 mt-2">
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-white rounded-2xl shadow-sm border p-6 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaBell className="text-blue-600" />

                  <h2 className="text-lg font-semibold">
                    {notification.type}
                  </h2>
                </div>

                <p className="text-slate-600">
                  {notification.message}
                </p>

                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                    notification.isRead
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {notification.isRead ? "Read" : "Unread"}
                </span>
              </div>

              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition"
                >
                  <FaCheckCircle />
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Notifications;