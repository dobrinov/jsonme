import React, {useEffect, useState} from 'react'

export function Avatar({url}: {url?: string}) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    url && setHasError(false)
  }, [url])

  if (!url) return null

  const image = hasError ? 'whitenoice.gif' : url

  return (
    <div className="avatar">
      <img src={image} onError={() => setHasError(true)}></img>
    </div>
  )
}
