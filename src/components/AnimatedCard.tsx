import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className = '' }: Props) {
  const { ref, isVisible } = useIntersectionObserver(0.05);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
