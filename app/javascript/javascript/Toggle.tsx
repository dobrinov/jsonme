import React, {useState} from 'react'
import {Switch} from '@headlessui/react'
import classNames from 'classnames'

export function Toggle({on, onChange}: {on?: boolean; onChange: (on: boolean) => void}) {
  const [enabled, setEnabled] = useState(on ?? false)

  return (
    <Switch
      checked={enabled}
      onChange={() => {
        onChange(!enabled)
        setEnabled(current => !current)
      }}
      className={classNames({'toggle--on': enabled}, 'toggle')}
    >
      <span
        aria-hidden="true"
        className={classNames('toggle__handle', {
          'toggle__handle--on': enabled
        })}
      />
    </Switch>
  )
}
