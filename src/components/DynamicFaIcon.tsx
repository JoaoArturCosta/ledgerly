import * as Icons from "react-icons/fa";
import { type IconBaseProps } from "react-icons/lib";

interface DynamicFaIconProps {
  name: string | null;
  className?: string;
}

/* Your icon name from database data can now be passed as prop */
export function DynamicFaIcon({ name, className }: DynamicFaIconProps) {
  if (!name) {
    // Return a default one
    return <Icons.FaQuestion className={className} />;
  }

  // If the name already starts with 'Fa', use it directly; otherwise, convert to PascalCase
  const getIconName = (str: string): string => {
    if (str.startsWith("Fa")) return str;
    return (
      "Fa" +
      str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    );
  };

  const iconName = getIconName(name);

  const IconComponent = Icons[
    iconName as keyof typeof Icons
  ] as React.ComponentType<IconBaseProps>;

  if (!IconComponent) {
    // Return a default one
    return <Icons.FaQuestion className={className} />;
  }

  return <IconComponent className={className} />;
}
