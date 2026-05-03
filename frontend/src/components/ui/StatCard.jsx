const StatCard = ({ title, value, subtext, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    green: "bg-green-50 text-green-800 border-green-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    red: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm ${colorClasses[color] || colorClasses.blue}`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtext && <p className="mt-1 text-sm">{subtext}</p>}
    </div>
  );
};

export default StatCard;
