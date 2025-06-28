/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react'
import { X, Mail, LockKeyhole } from 'lucide-react'
import { Input } from '../../../components/ui'
import { DictionaryApi } from './../../../services/dictionary-api'
import { useGlobalStore } from '../../../store/global'
import { useShallow } from 'zustand/shallow'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const userData = {
  name: 'Juan Pérez',
  email: 'juan.perez@ejemplo.com',
  phone: '+34 612 345 678',
  role: 'Desarrollador Frontend',
  joinDate: '15 de marzo, 2023',
  avatarUrl: '/api/placeholder/100/100', // Placeholder para avatar
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [auth, setAuth] = useGlobalStore(
    useShallow((state) => [state.auth, state.setAuth]),
  )

  const [formData, setFormData] = React.useState({
    apiKey: auth.apiKey,
  })

  const onSubmit = async () => {
    const validApiKey = await DictionaryApi.validateApiKey(
      formData.apiKey || '',
    )

    if (validApiKey) {
      onClose()
      setAuth({
        apiKey: formData.apiKey,
        isAuthenticated: true,
      })
    } else {
      alert('Invalid API Key')
    }
  }

  // Efectos para controlar la apertura/cierre del dialog
  React.useEffect(() => {
    const dialogElement = dialogRef.current
    if (dialogElement) {
      if (isOpen && !dialogElement.open) {
        dialogElement.showModal()
      } else if (!isOpen && dialogElement.open) {
        dialogElement.close()
      }
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="bg-card text-third rounded-lg shadow-lg p-0 border border-gray-800 max-w-md w-full backdrop:bg-black/60"
      onClose={onClose}
    >
      <div className="flex flex-col">
        {/* Cabecera */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-primary">
            Perfil de Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-third hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
              <img
                src={userData.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">{userData.name}</h3>
              <p className="text-green-400">{userData.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-primary" />
              <span>{userData.email}</span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <LockKeyhole size={18} className="text-primary" />
                <span>API Key</span>
              </div>
            </div>

            <Input
              name="apiKey"
              type="text"
              placeholder="API Key"
              value={formData.apiKey || ''}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              autoComplete="off"
            />
          </div>
        </div>

        {/* Pie de modal */}
        <div className="p-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onSubmit}
            className="bg-primary hover:bg-primary-dark text-secondary font-medium px-4 py-2 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default UserProfileModal
