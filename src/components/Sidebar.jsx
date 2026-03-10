import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{
      width: "220px",
      background: "#1e293b",
      color: "white",
      padding: "20px"
    }}>
      <h2>Student</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <Link to="/student" style={linkStyle}>Dashboard</Link>
        </li>
        <li>
          <Link to="/student/complaints" style={linkStyle}>My Complaints</Link>
        </li>
        <li>
          <Link to="/student/new" style={linkStyle}>Raise Complaint</Link>
        </li>
      </ul>
    </div>
  );
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  display: "block",
  margin: "10px 0"
};

export default Sidebar;