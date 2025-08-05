import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  tip?: string;
}

export function PageTitle({ title, subtitle, tip }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      {tip && <p className="text-gray-500 text-sm italic">Tip: {tip}</p>}
    </div>
  );
}
