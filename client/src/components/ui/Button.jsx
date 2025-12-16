export function Button({ children, ...props }) {
  return (
    <button
      className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md my-2 hover:bg-indigo-600 transition-colors disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}