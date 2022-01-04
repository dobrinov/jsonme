import React, { useEffect, useRef, useState } from "react";

export function Drilldown() {
  const firstRef = useRef<HTMLUListElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!firstRef.current || !secondRef.current) return;
    firstRef.current.style.position = "relative";
    firstRef.current.style.top = "0";
    firstRef.current.style.marginTop = "0";
    secondRef.current.style.marginTop = `-${secondRef.current.offsetHeight}px`;
  }, [firstRef, secondRef]);

  useEffect(() => {
    if (!firstRef.current || !secondRef.current || level === null) return;

    switch (level) {
      case 0: {
        resetFirstOffset(firstRef.current);
        animateSecondOffset(secondRef.current);
        break;
      }
      case 1: {
        resetSecondOffset(secondRef.current);
        animateFirstOffset(firstRef.current);
        break;
      }
    }
  }, [level]);

  return (
    <div className="panel">
      <div className="foo">
        <div className="second" ref={secondRef}>
          <a
            onClick={() => {
              setLevel(0);
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
              setLevel(1);
            }}
          >
            <strong>Add +</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

async function animateFirstOffset(element: HTMLElement) {
  const target = element.offsetHeight;
  const tick = 100;
  const delta = 15;
  let current = 0;

  let timer = setInterval(() => {
    current += delta;

    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    element.style.top = `${current}px`;
    element.style.marginTop = `-${current}px`;
  }, tick);
}

async function resetFirstOffset(element: HTMLElement) {
  const target = 0;
  const tick = 100;
  const delta = 15;
  let current = element.offsetHeight;

  let timer = setInterval(() => {
    current -= delta;

    if (current <= target) {
      current = target;
      clearInterval(timer);
    }

    element.style.top = `${current}px`;
    element.style.marginTop = `-${current}px`;
  }, tick);
}

async function animateSecondOffset(element: HTMLElement) {
  const target = element.offsetHeight;
  const tick = 100;
  const delta = 15;
  let current = 0;

  let timer = setInterval(() => {
    current += delta;

    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    element.style.marginTop = `-${current}px`;
  }, tick);
}

async function resetSecondOffset(element: HTMLElement) {
  const to = 0;
  const tick = 100;
  const delta = 15;
  let current = element.offsetHeight;

  let timer = setInterval(() => {
    current -= delta;

    if (current <= to) {
      current = to;
      clearInterval(timer);
    }

    element.style.marginTop = `-${current}px`;
  }, tick);
}
