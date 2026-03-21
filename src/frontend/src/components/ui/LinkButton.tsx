"use client";

import Link from "next/link";
import Button, { ButtonProps } from "./Button";

interface LinkButtonProps extends Omit<ButtonProps, "component" | "href"> {
  href: string;
}

export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}

export default LinkButton;
