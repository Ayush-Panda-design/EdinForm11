"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_DASHBOARD_TEMPLATE,
  DASHBOARD_TEMPLATE_STORAGE_KEY,
  type DashboardTemplateId,
} from "~/lib/dashboard-templates";

interface DashboardTemplateContextType {
  template: DashboardTemplateId;
  setTemplate: (id: DashboardTemplateId) => void;
  mounted: boolean;
}

const DashboardTemplateContext = createContext<DashboardTemplateContextType>({
  template: DEFAULT_DASHBOARD_TEMPLATE,
  setTemplate: () => {},
  mounted: false,
});

function isValidTemplate(value: string | null): value is DashboardTemplateId {
  return (
    value === "edinform" ||
    value === "studio" ||
    value === "vintage" ||
    value === "web3" ||
    value === "restaurant" ||
    value === "analytics"
  );
}

function applyTemplateToDom(id: DashboardTemplateId) {
  document.documentElement.setAttribute("data-dashboard-template", id);
}

export function DashboardTemplateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [template, setTemplateState] = useState<DashboardTemplateId>(
    DEFAULT_DASHBOARD_TEMPLATE
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DASHBOARD_TEMPLATE_STORAGE_KEY);
    const initial = isValidTemplate(saved) ? saved : DEFAULT_DASHBOARD_TEMPLATE;
    setTemplateState(initial);
    applyTemplateToDom(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTemplateToDom(template);
    }
  }, [template, mounted]);

  function setTemplate(id: DashboardTemplateId) {
    setTemplateState(id);
    localStorage.setItem(DASHBOARD_TEMPLATE_STORAGE_KEY, id);
    applyTemplateToDom(id);
  }

  return (
    <DashboardTemplateContext.Provider value={{ template, setTemplate, mounted }}>
      {children}
    </DashboardTemplateContext.Provider>
  );
}

export function useDashboardTemplate() {
  return useContext(DashboardTemplateContext);
}
