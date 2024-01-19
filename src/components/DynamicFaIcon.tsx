import * as Icons from "react-icons/fa6";
import { type IconBaseProps } from "react-icons/lib";

interface DynamicFaIconProps {
  name: string | null;
  className?: string;
}

/* Your icon name from database data can now be passed as prop */
export function DynamicFaIcon({ name, className }: DynamicFaIconProps) {
  if (!name) {
    // Return a default one
    return <Icons.FaQuestion />;
  }

  const IconComponent = Icons[
    name as keyof typeof Icons
  ] as React.ComponentType<IconBaseProps>;

  if (!IconComponent) {
    // Return a default one
    return <Icons.FaQuestion className={className} />;
  }

  return <IconComponent />;
}
