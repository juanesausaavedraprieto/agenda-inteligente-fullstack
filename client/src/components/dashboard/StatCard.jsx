function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg flex items-center gap-3 sm:gap-4 transition active:scale-[0.97]">
      
      {/* Icono */}
      <div
        className={`flex items-center justify-center ${color} text-white 
        w-10 h-10 sm:w-12 sm:h-12 rounded-full text-lg sm:text-2xl`}
      >
        {icon}
      </div>

      {/* Texto */}
      <div className="min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm truncate">
          {title}
        </p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default StatCard;
