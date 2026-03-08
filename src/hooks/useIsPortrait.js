import { useState, useEffect } from "react";

const query = "(orientation: portrait)";

export default function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsPortrait(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isPortrait;
}
