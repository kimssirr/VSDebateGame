// src/components/ui/button.jsx
export function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      {...props}
    >
      {children}
    </button>
  );
}
