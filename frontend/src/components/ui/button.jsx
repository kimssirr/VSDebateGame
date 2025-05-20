// src/components/ui/button.jsx
export function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110 shadow-md transition-all"
      {...props}
    >
      {children}
    </button>
  );
}

export function Button2({ children, ...props }) {
  return (
    <button
      className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-4 py-2 rounded-lg transition-all"
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonVS1({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 shadow-md transition-all"
      {...props}
    >
      {children}
    </button>
  );
}
export function ButtonVS2({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 shadow-md transition-all"
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonResult({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md transition-all"
      {...props}
    >
      {children}
    </button>
  );
}
