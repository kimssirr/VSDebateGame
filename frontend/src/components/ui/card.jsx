// src/components/ui/card.jsx
export function Card({ children }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4">
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}
