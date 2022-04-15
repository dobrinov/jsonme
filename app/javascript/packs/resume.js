import React from 'react'
import ReactDOM from 'react-dom'
import {parseResume} from '../javascript/resume/Resume'
import {EditResume} from '../javascript/EditResume'

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#resume')
  ReactDOM.render(<EditResume resume={parseResume(root.dataset.resume)} />, root)
})
