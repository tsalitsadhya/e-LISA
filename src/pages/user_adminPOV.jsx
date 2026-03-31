import React from "react";
import "./usersAdmin.css";
import logo from "../assets/logo.png";
import {
  Bell,
  User,
  Home,
  ClipboardList,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  FileText,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";

const SidebarItem = ({ icon, label, active }) => {
  return (
    <div className={`sidebar-item ${active ? "active" : ""}`}>
      <div className="sidebar-icon">{icon}</div>
      <span>{label}</span>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
};

const Toggle = ({ active }) => {
  return (
    <div className={`toggle ${active ? "toggle-on" : "toggle-off"}`}>
      <div className="toggle-circle" />
    </div>
  );
};

const UsersAdminDashboard = () => {
    const [roleFilter, setRoleFilter] = React.useState("All Roles");
  const users = [
    { email: "operatorEmail@gmail.com", role: "Operator", last: "30 minutes ago", status: false },
    { email: "adminEmail@gmail.com", role: "Admin", last: "90 minutes ago", status: false },
    { email: "adminEmail@gmail.com", role: "Admin", last: "8 minutes ago", status: true },
    { email: "operatorEmail@gmail.com", role: "Operator", last: "15 minutes ago", status: true },
    { email: "adminEmail@gmail.com", role: "Admin", last: "40 minutes ago", status: false },
    { email: "operatorEmail@gmail.com", role: "Operator", last: "5 minutes ago", status: true },
  ];

  return (
    <div className="users-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-box">
            <img src={logo} alt="logo" className="logo-img" />
        </div>

        <div className="menu">
          <SidebarItem icon={<Home size={18} />} label="Dashboard" />
          <SidebarItem icon={<ClipboardList size={18} />} label="Cleaning Management" />
          <SidebarItem icon={<Calendar size={18} />} label="Schedules" />
          <SidebarItem icon={<MapPin size={18} />} label="Room Readiness" />
          <SidebarItem icon={<CheckCircle2 size={18} />} label="QA Verification" />
          <SidebarItem icon={<Users size={18} />} label="Users" active />
          <SidebarItem icon={<FileText size={18} />} label="Audit Trial" />
        </div>

        <div className="logout-section">
          <SidebarItem icon={<LogOut size={18} />} label="Logout" />
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">USERS</div>
            <div className="page-sub">
              Manage user accounts, roles, and access permissions
            </div>
          </div>

          <div className="topbar-right">
            <Bell size={20} />
            <User size={20} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="content-wrapper">
          {/* STATS */}
          <div className="stats-grid">
            <StatCard
              icon={<Users size={18} />}
              title="Total User"
              value="17"
              subtitle="All registered system accounts"
            />

            <StatCard
              icon={<User size={18} />}
              title="Admins"
              value="3"
              subtitle="Full system control & permissions"
            />

            <StatCard
              icon={<Users size={18} />}
              title="Production Staff"
              value="10"
              subtitle="Input cleaning & readiness data"
            />

            <StatCard
              icon={<CheckCircle2 size={18} />}
              title="QA staff"
              value="4"
              subtitle="Verify and approve readiness"
            />
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            <div className="dropdown">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="dropdown-select"
              >
                <option>All Roles</option>
                <option>Operator</option>
                <option>Admin</option>
              </select>
              <ChevronDown size={16} />
            </div>

            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search Users" />
            </div>

            <button className="search-btn">Search Users</button>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <div className="table-header">Users</div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td className="avatar">👤</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.last}</td>
                    <td>
                      <Toggle active={user.status} />
                    </td>
                    <td className="action-buttons">
                      <button className="btn-edit">Edit</button>
                      <button className="btn-deactivate">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div>Showing 1-6 out of 22 total users</div>
              <div className="pagination-buttons">
                <button>1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersAdminDashboard;
