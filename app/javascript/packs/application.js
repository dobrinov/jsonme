import Rails from '@rails/ujs'
import 'channels'
import {createRoot} from 'react-dom/client'
import {ResumeParser} from '../resume.tsx'

Rails.start()

const images = require.context('../images', true)
name => images(name, true)

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resume')

  const root = createRoot(container)
  root.render(<ResumeParser json={container.dataset.resume} />)
})
