import React from "react";

interface CustomBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  sx?: {
    [key: string]: string | number;
  };
  component?: React.ElementType;
}

const CustomBox: React.FC<CustomBoxProps> = ({
  children,
  sx = {},
  component: Component = "div",
  ...props
}) => {
  const styles = {
    ...sx,
    display: sx.display || "block",
    boxSizing: "border-box",
  };

  return (
    <Component style={styles} {...props}>
      {children}
    </Component>
  );
};

export default CustomBox;
