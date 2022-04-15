import classNames from 'classnames'
import React from 'react'

export function Blank({
  title,
  description,
  style,
  onClick
}: {
  title: string
  description: string
  style?: 'normal' | 'compact'
  onClick?: () => void
}) {
  return (
    <div className={classNames('blank', {'blank--compact': style === 'compact'})} onClick={onClick}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
