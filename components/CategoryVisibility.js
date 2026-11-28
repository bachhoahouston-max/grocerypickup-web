import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isCategoryModuleVisible } from "@/services/categoryModule";

const CategoryVisibilityContext = createContext(null);

export function CategoryVisibilityProvider({ children }) {
  const { asPath } = useRouter();
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    let request = 0;
    const refreshVisibility = async () => {
      const current = ++request;
      try {
        const next = await isCategoryModuleVisible();
        if (current === request) setVisible(next);
      } catch {
        if (current === request) setVisible((previous) => previous ?? true);
      }
    };

    refreshVisibility();
    window.addEventListener("focus", refreshVisibility);
    return () => {
      request += 1;
      window.removeEventListener("focus", refreshVisibility);
    };
  }, [asPath]);

  return (
    <CategoryVisibilityContext.Provider value={visible}>
      {children}
    </CategoryVisibilityContext.Provider>
  );
}

export function useCategoryVisibility() {
  return useContext(CategoryVisibilityContext);
}
