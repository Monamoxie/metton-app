import Image from "next/image";
import Button from "@mui/material/Button";
import { LayoutProps } from "@/interfaces/layout_props";

export default function IdentityLayout(props: LayoutProps) {
  return <div className="identity">{props.children}</div>;
}
