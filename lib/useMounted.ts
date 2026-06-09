import { useSyncExternalStore } from "react";

/** True only after client hydration — avoids SSR/client theme mismatches. */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
