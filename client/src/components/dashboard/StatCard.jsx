function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-lg flex items-center gap-4">
      <div className={`p-4 rounded-full ${color} text-white text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

export default StatCard;