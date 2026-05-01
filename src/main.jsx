import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={router} />
    </DndProvider>
  </StrictMode>,
)
