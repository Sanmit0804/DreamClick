// hooks/useDocumentTitle.ts
import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Your App Name`;
  }, [title]);
};