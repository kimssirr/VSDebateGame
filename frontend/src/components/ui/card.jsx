// src/components/ui/card.jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-md rounded-xl p-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-1 ${className}`}>{children}</div>;
}
