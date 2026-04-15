import styles from './UI.module.css';

interface ButtonProps {
  variant?: 'default' | 'primary';
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${styles.button} ${variant === 'primary' ? styles.primary : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}