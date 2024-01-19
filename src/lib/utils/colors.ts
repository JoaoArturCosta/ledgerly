export const getColorWithOpacity = (
  index: number,
  colorHex: string,
  numBars: number,
): string => {
  // Calculate opacity value
  const opacityDiff = 0.8 / numBars;
  const opacity = 1 - index * opacityDiff;

  // Build RGBA color string
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
