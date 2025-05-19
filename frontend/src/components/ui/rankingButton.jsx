// src/components/ui/button.jsx
export function RankingButton({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white hover:brightness-110 shadow-md transition-all"
      {...props}
    >
      {children}
    </button>
  );
}
