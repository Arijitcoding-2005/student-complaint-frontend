const Navbar = () => {
  return (
    <div style={{
      height: "60px",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h3>Student Dashboard</h3>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        style={{
          padding: "6px 12px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;