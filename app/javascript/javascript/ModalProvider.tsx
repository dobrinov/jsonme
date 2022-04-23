import React, {useContext, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'

const invariantViolation = () => {
  throw new Error(
    'Attempted to call useModal outside of modal context. Make sure your app is rendered inside ModalProvider.'
  )
}

interface ModalContext {
  showModal(component: React.ReactNode): void
  hideModal(): void
}

function ModalContainer({children}: {children?: React.ReactNode}) {
  return children
    ? ReactDOM.createPortal(
        <div className="modal">
          <div>
            <div className="modal-overlay"></div>
            <div className="modal-dialog">{children}</div>
          </div>
        </div>,
        document.body
      )
    : null
}

const ModalContext = React.createContext<ModalContext>({
  showModal: invariantViolation,
  hideModal: invariantViolation
})

export function ModalProvider({children}: {children: React.ReactNode}) {
  const [modal, setModal] = useState<React.ReactNode>()
  const showModal = (newModal: React.ReactNode) => setModal(newModal)
  const hideModal = () => setModal(undefined)
  const contextValue: ModalContext = {showModal, hideModal}

  useEffect(() => {
    if (!modal) return

    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = 'fixed'
    return () => {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [!!modal])

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalContainer>{modal}</ModalContainer>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const {showModal, hideModal} = useContext(ModalContext)

  return {
    showModal(component: React.ReactNode) {
      showModal(component)
    },
    hideModal
  }
}
