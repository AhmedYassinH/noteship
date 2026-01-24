import { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

export const Button = ({ variant = "primary", className = "", ...rest }: Props) => {
  const merged = `${styles.button} ${variantClass[variant]} ${className}`.trim();
  return <button className={merged} {...rest} />;
};

export default Button;
