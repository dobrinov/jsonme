import React, { useEffect, useState } from "react";

export function ProfilePicture({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const image = hasError ? "whitenoice.gif" : url;

  return (
    <div className="profile-picture">
      <img src={image} onError={() => setHasError(true)}></img>
    </div>
  );
}
