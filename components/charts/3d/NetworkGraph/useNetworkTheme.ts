import { useTheme } from 'next-themes';

export function useNetworkTheme() {
  const { resolvedTheme } = useTheme();

  const isCyberpunk = resolvedTheme === 'theme-cyberpunk';
  const isCartoon = resolvedTheme === 'theme-cartoon';
  const isProfessional = resolvedTheme === 'theme-professional';
  const isDark = isCyberpunk;

  let bgColor = '#09090b';
  if (isCartoon) bgColor = '#fdf6e3';
  if (isProfessional) bgColor = '#fcfcfc';

  const etfColor = isDark ? '#22d3ee' : '#3b82f6';
  const holdingColor = isDark ? '#f472b6' : '#ec4899';

  const getLinkColor = (isExtremeVolume: boolean) => {
    return isExtremeVolume
      ? isDark
        ? '#333333'
        : '#94a3b8'
      : isDark
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(99, 102, 241, 0.4)';
  };

  return { isDark, bgColor, etfColor, holdingColor, resolvedTheme, getLinkColor };
}
