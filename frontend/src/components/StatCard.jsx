function StatCard({
  title,
  value,
  description,
  icon,
  variant = "blue",
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>

        <div className={`stat-icon ${variant}`}>
          {icon}
        </div>
      </div>

      <h3>{value}</h3>

      <p className={description?.includes("↑") ? "positive" : ""}>
        {description}
      </p>
    </div>
  );
}

export default StatCard;