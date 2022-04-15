import React, {useEffect, useRef, useState} from 'react'

const TICK = 10
const DELTA = 15

export function Drilldown() {
  const firstRef = useRef<HTMLUListElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)

  const [level, setLevel] = useState<number | null>(null)

  useEffect(() => {
    if (!firstRef.current || !secondRef.current) return
    firstRef.current.style.position = 'relative'
    firstRef.current.style.top = '0'
    firstRef.current.style.marginTop = '0'
    secondRef.current.style.marginTop = `-${secondRef.current.offsetHeight}px`
  }, [firstRef, secondRef])

  useEffect(() => {
    if (!firstRef.current || !secondRef.current || level === null) return

    switch (level) {
      case 0: {
        resetFirstOffset(firstRef.current)
        animateSecondOffset(secondRef.current)
        break
      }
      case 1: {
        resetSecondOffset(secondRef.current)
        animateFirstOffset(firstRef.current)
        break
      }
    }
  }, [level])

  return (
    <div className="panel">
      <div className="foo">
        <div className="second" ref={secondRef}>
          <a
            onClick={() => {
              setLevel(0)
            }}
          >
            Close
          </a>
        </div>

        <ul ref={firstRef}>
          <li className="persisted">
            <strong>Sofia University</strong>
          </li>
          <li className="persisted">
            <strong>New Bulgarian University</strong>
          </li>
          <li className="persisted">
            <strong>Coursera</strong>
          </li>
          <li className="persisted">
            <strong>Coursera</strong>
          </li>
          <li className="persisted">
            <strong>Coursera</strong>
          </li>
          <li
            className="new"
            onClick={() => {
              setLevel(1)
            }}
          >
            <strong>Add +</strong>
          </li>
        </ul>
      </div>
    </div>
  )
}

function animateFirstOffset(element: HTMLElement) {
  const target = element.offsetHeight
  let current = 0

  let timer = setInterval(() => {
    current += DELTA

    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    element.style.top = `${current}px`
    element.style.marginTop = `-${current}px`
  }, TICK)
}

function resetFirstOffset(element: HTMLElement) {
  const target = 0
  let current = element.offsetHeight

  let timer = setInterval(() => {
    current -= DELTA

    if (current <= target) {
      current = target
      clearInterval(timer)
    }

    element.style.top = `${current}px`
    element.style.marginTop = `-${current}px`
  }, TICK)
}

function animateSecondOffset(element: HTMLElement) {
  const target = element.offsetHeight
  let current = 10

  let timer = setInterval(() => {
    current += DELTA

    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    element.style.marginTop = `-${current}px`
  }, TICK)
}

function resetSecondOffset(element: HTMLElement) {
  const target = 0
  let current = element.offsetHeight

  let timer = setInterval(() => {
    current -= DELTA

    if (current <= target) {
      current = target
      clearInterval(timer)
    }

    element.style.marginTop = `-${current}px`
  }, TICK)
}
