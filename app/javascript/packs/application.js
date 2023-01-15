import Rails from '@rails/ujs'
import 'channels'
import React from 'react'
import {createRoot} from 'react-dom/client'
import {Application} from '../application.tsx'

Rails.start()

const images = require.context('../images', true)
name => images(name, true)

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('application')

  const root = createRoot(container)
  root.render(<Application product={container.dataset.product} username={container.dataset.username} />)
})
