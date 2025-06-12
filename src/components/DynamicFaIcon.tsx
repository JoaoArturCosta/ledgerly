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
    return <Icons.FaQuestion className={className} />;
  }

  // Convert kebab-case to PascalCase for FontAwesome 6 icons
  // e.g., "life-ring" -> "FaLifeRing"
  const convertToPascalCase = (str: string): string => {
    return (
      "Fa" +
      str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    );
  };

  const iconName = convertToPascalCase(name);
  const IconComponent = Icons[
    iconName as keyof typeof Icons
  ] as React.ComponentType<IconBaseProps>;

  if (!IconComponent) {
    // Return a default one
    return <Icons.FaQuestion className={className} />;
  }

  return <IconComponent className={className} />;
}
