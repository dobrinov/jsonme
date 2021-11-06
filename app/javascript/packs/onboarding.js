import React from 'react'
import ReactDOM from 'react-dom'

function Onboarding() {
  return <div>Hello, React!</div>;
}

document.addEventListener('DOMContentLoaded', () => {
  const rootContainer = document.querySelector('#root');
  ReactDOM.render(<Onboarding {...rootContainer.dataset} />, rootContainer);
});
