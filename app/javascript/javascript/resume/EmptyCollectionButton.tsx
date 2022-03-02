import React from "react";

export function EmptyCollectionButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty-collection-button" onClick={onClick}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
