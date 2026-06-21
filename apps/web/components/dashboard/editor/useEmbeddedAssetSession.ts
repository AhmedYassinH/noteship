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

    // Do not unmount an EditorContent that ProseMirror already owns. Uploads add the
    // first protected URL after mount, and tearing down during that transaction can
    // make React and ProseMirror remove the same DOM node.
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
