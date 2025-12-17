export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
