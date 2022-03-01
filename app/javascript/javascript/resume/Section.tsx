import React, { ReactNode } from "react";

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="section">
      <h2 className="section__heading">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
