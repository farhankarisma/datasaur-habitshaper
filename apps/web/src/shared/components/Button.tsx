import type { ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'quiet' | 'danger';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');

  return <button className={classes} {...props} />;
}
