import { useEffect, useMemo, useState } from "react";
import { createContentSession } from "../../../lib/api/notes";
import { referencesProtectedContent } from "./editorText";

export const useEmbeddedAssetSession = (markdown: string): boolean => {
  const needsContentSession = useMemo(() => referencesProtectedContent(markdown), [markdown]);
  const [isReady, setIsReady] = useState(!needsContentSession);

  useEffect(() => {
    let cancelled = false;

    if (!needsContentSession) {
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    setIsReady(false);
    void createContentSession().finally(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [needsContentSession]);

  return isReady;
};
