import { useEffect, useRef } from "react";

/**
 * Custom hook to detect clicks outside of a referenced element
 * @param callback Function to call when click outside is detected
 * @returns Ref to attach to the container element
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Use capturing phase for reliable detection
    document.addEventListener("mousedown", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [callback]);

  return ref;
}
