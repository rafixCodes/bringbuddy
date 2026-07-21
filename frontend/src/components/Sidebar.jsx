import {
  FaHome,
  FaBell,
  FaSuitcase,
  FaBoxOpen,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

  const menu = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      name: "Notifications",
      icon: <FaBell />,
      path: "/notifications",
    },
    {
      name: "Restricted Items",
      icon: <FaBoxOpen />,
      path: "/restricted-items",
    },
    {
      name: "Trips",
      icon: <FaSuitcase />,
      path: "/trips",
    },
    {
      name: "Profile",
      icon: <FaUser />,
      path: "/profile",
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">
      <div className="p-8 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-blue-400">
          BringBuddy
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Cross Border Delivery
        </p>
      </div>

      <nav className="flex-1 p-5 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span>

            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-5 border-t border-slate-700">
        <button
  onClick={handleLogout}
  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-xl transition"
>
  <FaSignOutAlt />
  Logout
</button>
      </div>
    </aside>
  );
}