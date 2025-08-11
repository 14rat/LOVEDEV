import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Memoize onChange function to prevent unnecessary re-listeners
    const onChange = React.useCallback(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, []);

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Memoize return value to prevent unnecessary updates
  return React.useMemo(() => !!isMobile, [isMobile]);
}
