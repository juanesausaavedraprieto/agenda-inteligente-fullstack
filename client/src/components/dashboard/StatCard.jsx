function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 rounded-xl shadow-lg flex items-center gap-3 sm:gap-4 transition active:scale-[0.97]">
      
      {/* Icono (El color viene por props, asumimos que contrasta bien) */}
      <div
        className={`flex items-center justify-center ${color} text-white 
        w-10 h-10 sm:w-12 sm:h-12 rounded-full text-lg sm:text-2xl shadow-sm`}
      >
        {icon}
      </div>

      {/* Texto */}
      <div className="min-w-0">
        {/* Texto gris medio en claro, gris claro en oscuro */}
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate font-medium">
          {title}
        </p>
        {/* Texto casi negro en claro, blanco en oscuro */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default StatCard;