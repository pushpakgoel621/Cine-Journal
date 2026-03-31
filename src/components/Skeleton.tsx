export function Skeleton({
  width,
  height,
  className = "",
  variant = "rect",
}: {
  width?: string;
  height?: string;
  className?: string;
  variant?: "rect" | "circle" | "text";
}) {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton height="280px" variant="rect" />
      <div className="card-skeleton-body">
        <Skeleton width="70%" height="16px" variant="text" />
        <Skeleton width="40%" height="14px" variant="text" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
