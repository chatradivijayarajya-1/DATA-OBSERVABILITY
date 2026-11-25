
import { useState, useEffect } from "react";

import {
  LayoutDashboard, GitBranch, ShieldCheck, Activity, Bell,
  FileText, Settings, Search, CheckCircle, XCircle, Clock,
  AlertTriangle, Database, Menu, Plus, X, Trash2, User,
  ChevronDown
} from "lucide-react";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

import "./index.css";

const API_URL = "/api/pipelines";

const executionData = [
  { day: "Mon", success: 35, failed: 5 },
  { day: "Tue", success: 42, failed: 3 },
  { day: "Wed", success: 38, failed: 7 },
  { day: "Thu", success: 48, failed: 4 },
  { day: "Fri", success: 45, failed: 6 },
  { day: "Sat", success: 52, failed: 2 },
  { day: "Sun", success: 49, failed: 3 }
];

const qualityData = [
  { name: "Missing", count: 12 },
  { name: "Duplicates", count: 8 },
  { name: "Invalid", count: 5 },
  { name: "Inconsistent", count: 4 }
];

const formLabelStyle = {
  display: "block",
  color: "#343b55",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "7px",
  marginTop: "15px"
};

const formInputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #dfe2ed",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  background: "white",
  color: "#202944"
};

function App() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePage, setActivePage] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [newPipeline, setNewPipeline] = useState({
    name: "",
    source: "",
    destination: "",
    status: "SUCCESS"
  });

  // Fetch pipeline records from Spring Boot
  const fetchPipelines = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch pipelines");
      }

      const data = await response.json();
      setPipelines(data);
      setError("");
    } catch (err) {
      console.error("Pipeline fetching error:", err);
      setError("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();

    const interval = setInterval(fetchPipelines, 5000);

    return () => clearInterval(interval);
  }, []);

  // Pipeline counts
  const successfulCount = pipelines.filter(
    p => (p.status || "").toUpperCase() === "SUCCESS"
  ).length;

  const failedPipelines = pipelines.filter(
    p => (p.status || "").toUpperCase() === "FAILED"
  );

  const failedCount = failedPipelines.length;

  const otherCount = pipelines.length - successfulCount - failedCount;

  // Search through pipeline records
  const filteredPipelines = pipelines.filter(pipeline => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      (pipeline.name || "").toLowerCase().includes(search) ||
      (pipeline.source || "").toLowerCase().includes(search) ||
      (pipeline.destination || "").toLowerCase().includes(search) ||
      (pipeline.status || "").toLowerCase().includes(search)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewPipeline(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add pipeline
  const handleAddPipeline = async (e) => {
    e.preventDefault();

    if (
      !newPipeline.name.trim() ||
      !newPipeline.source.trim() ||
      !newPipeline.destination.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPipeline)
      });

      if (!response.ok) {
        throw new Error("Failed to add pipeline");
      }

      await response.json();

      setNewPipeline({
        name: "",
        source: "",
        destination: "",
        status: "SUCCESS"
      });

      setShowForm(false);
      await fetchPipelines();

      alert("Pipeline added successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to add pipeline. Check backend connection.");
    } finally {
      setSaving(false);
    }
  };

  // Delete pipeline
  const handleDeletePipeline = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pipeline?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete pipeline");
      }

      await fetchPipelines();
    } catch (err) {
      console.error(err);
      alert("Unable to delete pipeline.");
    }
  };

  const openPage = (page) => {
    setActivePage(page);
    setShowNotifications(false);
    setShowProfile(false);
  };

  // Dynamic alerts based on actual pipeline records
  const alerts = [
    ...failedPipelines.map(pipeline => ({
      id: `failed-${pipeline.id}`,
      type: "danger",
      title: `${pipeline.name} failed`,
      message: `Source: ${pipeline.source} · Destination: ${pipeline.destination}`,
      time: "Needs attention"
    })),
    {
      id: "quality-warning",
      type: "warning",
      title: "Data quality monitoring",
      message: "Review missing, duplicate, invalid, and inconsistent records.",
      time: "Monitoring"
    },
    {
      id: "monitoring-active",
      type: "info",
      title: "Pipeline monitoring active",
      message: "Monitoring your registered pipeline records.",
      time: "Live"
    }
  ];

  const statusClass = (status) => {
    return (status || "").toLowerCase();
  };

  const renderPipelineTable = (showActions = false) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>PIPELINE NAME</th>
            <th>DATA SOURCE</th>
            <th>DESTINATION</th>
            <th>STATUS</th>
            <th>CREATED AT</th>
            {showActions && <th>ACTION</th>}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={showActions ? 6 : 5}>Loading pipelines...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={showActions ? 6 : 5}>{error}</td>
            </tr>
          ) : filteredPipelines.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 6 : 5}>
                {searchTerm ? "No matching pipelines found." : "No pipelines found."}
              </td>
            </tr>
          ) : (
            filteredPipelines.map(pipeline => (
              <tr key={pipeline.id}>
                <td className="pipeline-name">{pipeline.name}</td>
                <td>{pipeline.source}</td>
                <td>{pipeline.destination}</td>
                <td>
                  <span className={`status ${statusClass(pipeline.status)}`}>
                    <i></i>
                    {pipeline.status}
                  </span>
                </td>
                <td>
                  {pipeline.createdAt
                    ? new Date(pipeline.createdAt).toLocaleString()
                    : "-"}
                </td>

                {showActions && (
                  <td>
                    <button
                      type="button"
                      className="view-button"
                      onClick={() => handleDeletePipeline(pipeline.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAlerts = () => (
    <div className="alert-list">
      {alerts.map(alert => (
        <div className="alert-item" key={alert.id}>
          <div className={`alert-icon ${alert.type}`}>
            {alert.type === "danger" && <XCircle />}
            {alert.type === "warning" && <AlertTriangle />}
            {alert.type === "info" && <Clock />}
          </div>

          <div className="alert-text">
            <strong>{alert.title}</strong>
            <span>{alert.message}</span>
          </div>

          <time>{alert.time}</time>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Activity size={25} />
          </div>

          <div>
            <h2>DataWatch</h2>
            <span>OBSERVABILITY PLATFORM</span>
          </div>
        </div>

        <div className="nav-heading">MAIN MENU</div>

        <nav className="navigation">
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Pipelines", icon: GitBranch },
            { name: "Data Quality", icon: ShieldCheck },
            { name: "Executions", icon: Activity },
            { name: "Alerts", icon: Bell },
            { name: "Reports", icon: FileText }
          ].map(item => {
            const Icon = item.icon;

            return (
              <a
                href="#"
                key={item.name}
                onClick={e => {
                  e.preventDefault();
                  openPage(item.name);
                }}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
              >
                <Icon size={19} />
                {item.name}

                {item.name === "Alerts" && failedCount > 0 && (
                  <span className="nav-count">{failedCount}</span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="nav-heading settings-heading">
          PREFERENCES
        </div>

        <nav className="navigation">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              openPage("Settings");
            }}
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
          >
            <Settings size={19} />
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="database-status">
            <Database size={18} />
            <div>
              <strong>System Status</strong>
              <span>
                <i></i>
                {error ? "Backend disconnected" : "All systems operational"}
              </span>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">CV</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="mobile-brand">
            <Menu size={22} /> DataWatch
          </div>

          <div className="breadcrumb">
            Workspace / <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">

            {/* SEARCH */}
            <div className="search-box" style={{ position: "relative" }}>
              <Search size={17} />

              <input
                type="text"
                placeholder="Search pipelines..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex"
                  }}
                >
                  <X size={15} />
                </button>
              )}

              {searchTerm.trim() && (
                <div style={dropdownStyle}>
                  <strong style={{ fontSize: "12px", color: "#777" }}>
                    SEARCH RESULTS ({filteredPipelines.length})
                  </strong>

                  {filteredPipelines.length === 0 ? (
                    <p style={{ fontSize: "13px" }}>No matching pipelines.</p>
                  ) : (
                    filteredPipelines.slice(0, 5).map(pipeline => (
                      <button
                        key={pipeline.id}
                        type="button"
                        onClick={() => openPage("Pipelines")}
                        style={dropdownItemStyle}
                      >
                        <GitBranch size={15} />
                        <span>
                          <strong>{pipeline.name}</strong>
                          <small>
                            {pipeline.source} → {pipeline.destination}
                          </small>
                        </span>
                      </button>
                    ))
                  )}

                  {filteredPipelines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openPage("Pipelines")}
                      style={dropdownFooterStyle}
                    >
                      View all search results
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="notification-button"
                onClick={() => {
                  setShowNotifications(prev => !prev);
                  setShowProfile(false);
                }}
                title="Notifications"
              >
                <Bell size={20} />

                {failedCount > 0 && (
                  <span></span>
                )}
              </button>

              {showNotifications && (
                <div style={dropdownStyle}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <strong>Notifications</strong>
                    <span style={{ fontSize: "12px", color: "#777" }}>
                      {failedCount} failures
                    </span>
                  </div>

                  {failedCount === 0 ? (
                    <p style={{ fontSize: "13px", color: "#777" }}>
                      No failed pipelines. Your pipeline statuses are clear.
                    </p>
                  ) : (
                    failedPipelines.map(pipeline => (
                      <button
                        key={pipeline.id}
                        type="button"
                        onClick={() => openPage("Alerts")}
                        style={dropdownItemStyle}
                      >
                        <XCircle size={17} color="#ef6464" />
                        <span>
                          <strong>{pipeline.name} failed</strong>
                          <small>Check this pipeline's status.</small>
                        </span>
                      </button>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => openPage("Alerts")}
                    style={dropdownFooterStyle}
                  >
                    Open all alerts
                  </button>
                </div>
              )}
            </div>

            {/* PROFILE MENU */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="top-avatar"
                onClick={() => {
                  setShowProfile(prev => !prev);
                  setShowNotifications(false);
                }}
                title="Account"
                style={{ cursor: "pointer", border: "none" }}
              >
                CV
              </button>

              {showProfile && (
                <div style={dropdownStyle}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #eee"
                  }}>
                    <div className="avatar">CV</div>
                    <div>
                      <strong>Administrator</strong>
                      <small style={{ display: "block", color: "#888" }}>
                        System Admin
                      </small>
                    </div>
                  </div>

                  <div style={{
                    padding: "12px 0",
                    fontSize: "13px",
                    color: "#777"
                  }}>
                    <User size={15} style={{ verticalAlign: "middle" }} /> 
                    &nbsp; Administrator account
                  </div>

                  <div style={{
                    fontSize: "12px",
                    color: "#999",
                    borderTop: "1px solid #eee",
                    paddingTop: "10px"
                  }}>
                    Login authentication is not configured yet.
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <section className="dashboard-content">

            <div className="welcome-row">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Monitor your data pipelines and data quality in one place.</p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  style={addButtonStyle}
                >
                  <Plus size={17} /> Add Pipeline
                </button>

                <div className="date-label">
                  ● Live Monitoring <span>Today</span>
                </div>
              </div>
            </div>

            {/* STATISTICS */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-top">
                  <span>Total Pipelines</span>
                  <div className="stat-icon purple"><GitBranch /></div>
                </div>
                <h2>{pipelines.length}</h2>
                <p className="stat-note">Registered pipelines</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Successful Runs</span>
                  <div className="stat-icon green"><CheckCircle /></div>
                </div>
                <h2>{successfulCount}</h2>
                <p className="stat-note positive">Completed successfully</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Failed Runs</span>
                  <div className="stat-icon red"><XCircle /></div>
                </div>
                <h2>{failedCount}</h2>
                <p className="stat-note negative">Requires attention</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Data Quality Score</span>
                  <div className="stat-icon blue"><ShieldCheck /></div>
                </div>
                <h2>96.8%</h2>
                <p className="stat-note positive">Overall quality</p>
              </div>

            </div>

            {/* CHARTS */}
            <div className="charts-grid">

              <div className="panel execution-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Pipeline Executions</h3>
                    <p>Successful and failed executions over time</p>
                  </div>
                  <span className="panel-period">Last 7 days⌄</span>
                </div>

                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={executionData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#edf0f5"
                      />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="success"
                        name="Successful"
                        stroke="#635bdb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="failed"
                        name="Failed"
                        stroke="#ef6464"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-legend">
                  <span><i className="legend-purple"></i> Successful</span>
                  <span><i className="legend-red"></i> Failed</span>
                </div>
              </div>

              <div className="panel quality-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Data Quality Issues</h3>
                    <p>Issues detected during validation</p>
                  </div>
                </div>

                <div className="quality-score">
                  <div className="score-circle">
                    <strong>96.8%</strong>
                    <span>Quality score</span>
                  </div>
                </div>

                <div className="quality-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={85}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#7168e8"
                        radius={[0, 5, 5, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* RECENT PIPELINE ACTIVITY */}
            <div className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Pipeline Activity</h3>
                  <p>Latest pipeline details from Spring Boot backend</p>
                </div>

                <button className="view-button" onClick={fetchPipelines}>
                  Refresh ↻
                </button>
              </div>

              {renderPipelineTable(false)}
            </div>

            {/* RECENT ALERTS */}
            <div className="panel alerts-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Alerts</h3>
                  <p>Issues that need your attention</p>
                </div>

                <button
                  className="view-button"
                  onClick={() => openPage("Alerts")}
                >
                  View all →
                </button>
              </div>

              {renderAlerts()}
            </div>

            <footer>
              © 2026 DataWatch · Data Pipeline Observability and Data Quality Framework
            </footer>
          </section>
        )}

        {/* PIPELINES PAGE */}
        {activePage === "Pipelines" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>All Pipelines</h1>
                <p>View, search, add, and manage your registered pipelines.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                style={addButtonStyle}
              >
                <Plus size={17} /> Add Pipeline
              </button>
            </div>

            <div className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Pipeline Records</h3>
                  <p>{filteredPipelines.length} pipeline records found</p>
                </div>

                <button className="view-button" onClick={fetchPipelines}>
                  Refresh ↻
                </button>
              </div>

              {renderPipelineTable(true)}
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}

        {/* DATA QUALITY PAGE */}
        {activePage === "Data Quality" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>Data Quality</h1>
                <p>Review data validation metrics and quality issues.</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="panel quality-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Data Quality Score</h3>
                    <p>Current overall quality score</p>
                  </div>
                </div>

                <div className="quality-score">
                  <div className="score-circle">
                    <strong>96.8%</strong>
                    <span>Quality score</span>
                  </div>
                </div>

                <div className="quality-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7168e8" radius={[0, 5, 5, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Validation Summary</h3>
                    <p>Issues detected during validation</p>
                  </div>
                </div>

                {qualityData.map(item => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "16px 8px",
                      borderBottom: "1px solid #edf0f5"
                    }}
                  >
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}

        {/* EXECUTIONS PAGE */}
        {activePage === "Executions" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>Pipeline Executions</h1>
                <p>Monitor successful and failed pipeline statuses.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Pipelines</span>
                <h2>{pipelines.length}</h2>
              </div>
              <div className="stat-card">
                <span>Successful</span>
                <h2>{successfulCount}</h2>
              </div>
              <div className="stat-card">
                <span>Failed</span>
                <h2>{failedCount}</h2>
              </div>
              <div className="stat-card">
                <span>Other statuses</span>
                <h2>{otherCount}</h2>
              </div>
            </div>

            <div className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Execution Records</h3>
                  <p>Current pipeline status from the backend</p>
                </div>
                <button className="view-button" onClick={fetchPipelines}>
                  Refresh ↻
                </button>
              </div>

              {renderPipelineTable(false)}
            </div>

            <div className="panel execution-panel">
              <div className="panel-heading">
                <div>
                  <h3>Execution Trends</h3>
                  <p>Sample successful and failed execution trends</p>
                </div>
              </div>

              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="success" stroke="#635bdb" strokeWidth={3} />
                    <Line dataKey="failed" stroke="#ef6464" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}

        {/* ALERTS PAGE */}
        {activePage === "Alerts" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>Alerts</h1>
                <p>Review pipeline failures and monitoring notifications.</p>
              </div>

              <button className="view-button" onClick={fetchPipelines}>
                Refresh ↻
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Alerts</span>
                <h2>{alerts.length}</h2>
              </div>

              <div className="stat-card">
                <span>Failed Pipelines</span>
                <h2>{failedCount}</h2>
              </div>

              <div className="stat-card">
                <span>Successful Pipelines</span>
                <h2>{successfulCount}</h2>
              </div>

              <div className="stat-card">
                <span>Other Pipelines</span>
                <h2>{otherCount}</h2>
              </div>
            </div>

            <div className="panel alerts-panel">
              <div className="panel-heading">
                <div>
                  <h3>All Recent Alerts</h3>
                  <p>Alerts generated from current pipeline statuses</p>
                </div>
              </div>

              {renderAlerts()}
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}

        {/* REPORTS PAGE */}
        {activePage === "Reports" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>Reports</h1>
                <p>Summary of your current pipeline environment.</p>
              </div>

              <button
                className="view-button"
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Pipelines</span>
                <h2>{pipelines.length}</h2>
              </div>

              <div className="stat-card">
                <span>Successful</span>
                <h2>{successfulCount}</h2>
              </div>

              <div className="stat-card">
                <span>Failed</span>
                <h2>{failedCount}</h2>
              </div>

              <div className="stat-card">
                <span>Other statuses</span>
                <h2>{otherCount}</h2>
              </div>
            </div>

            <div className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Pipeline Report</h3>
                  <p>Current database records</p>
                </div>
              </div>

              {renderPipelineTable(false)}
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}

        {/* SETTINGS PAGE */}
        {activePage === "Settings" && (
          <section className="dashboard-content">
            <div className="welcome-row">
              <div>
                <h1>Settings</h1>
                <p>Application and monitoring configuration.</p>
              </div>
            </div>

            <div className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Application Settings</h3>
                  <p>Current DataWatch configuration</p>
                </div>
              </div>

              <div style={{ padding: "10px 0" }}>
                {[
                  ["Backend API", API_URL],
                  ["Database", "MySQL · data_observability"],
                  ["Auto refresh", "Every 5 seconds"],
                  ["Connection status", error ? "Disconnected" : "Connected"],
                  ["User", "Administrator"]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "15px",
                      padding: "16px 8px",
                      borderBottom: "1px solid #edf0f5",
                      flexWrap: "wrap"
                    }}
                  >
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <footer>© 2026 DataWatch</footer>
          </section>
        )}
      </main>

      {/* ADD PIPELINE MODAL */}
      {showForm && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 20, 45, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "460px",
              borderRadius: "14px",
              padding: "25px",
              boxShadow: "0 15px 50px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <div>
                <h2 style={{ margin: 0, color: "#17203b", fontSize: "21px" }}>
                  Add New Pipeline
                </h2>
                <p style={{ color: "#8992a8", fontSize: "13px", marginTop: "6px" }}>
                  Enter your pipeline details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  border: "none",
                  background: "#f1f2f8",
                  borderRadius: "7px",
                  padding: "7px",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPipeline}>
              <label style={formLabelStyle}>Pipeline Name</label>
              <input
                name="name"
                value={newPipeline.name}
                onChange={handleInputChange}
                placeholder="Enter pipeline name"
                required
                style={formInputStyle}
              />

              <label style={formLabelStyle}>Data Source</label>
              <input
                name="source"
                value={newPipeline.source}
                onChange={handleInputChange}
                placeholder="Example: MySQL"
                required
                style={formInputStyle}
              />

              <label style={formLabelStyle}>Destination</label>
              <input
                name="destination"
                value={newPipeline.destination}
                onChange={handleInputChange}
                placeholder="Example: AWS S3"
                required
                style={formInputStyle}
              />

              <label style={formLabelStyle}>Pipeline Status</label>
              <select
                name="status"
                value={newPipeline.status}
                onChange={handleInputChange}
                style={formInputStyle}
              >
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="RUNNING">RUNNING</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>

              <div style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px"
              }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    background: "#6558e8",
                    color: "white",
                    borderRadius: "8px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    fontWeight: "600"
                  }}
                >
                  {saving ? "Saving..." : "Save Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const addButtonStyle = {
  background: "#6558e8",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "11px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  fontWeight: "600"
};

const dropdownStyle = {
  position: "absolute",
  top: "42px",
  right: 0,
  width: "290px",
  maxWidth: "85vw",
  background: "white",
  border: "1px solid #e5e7ef",
  borderRadius: "10px",
  padding: "14px",
  boxShadow: "0 8px 28px rgba(20, 25, 50, 0.15)",
  zIndex: 2000
};

const dropdownItemStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textAlign: "left",
  padding: "11px 5px",
  background: "white",
  border: "none",
  borderBottom: "1px solid #f0f1f5",
  cursor: "pointer",
  color: "#202944"
};

const dropdownFooterStyle = {
  width: "100%",
  border: "none",
  background: "#f5f3ff",
  color: "#6558e8",
  borderRadius: "6px",
  padding: "10px",
  marginTop: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "12px"
};

export default App;
