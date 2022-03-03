import React from "react";

export function Blank({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <div className="blank" onClick={onClick}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
