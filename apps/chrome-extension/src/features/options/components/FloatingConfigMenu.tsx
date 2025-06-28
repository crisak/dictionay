import React, { useState } from 'react'
import {
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  LayoutGrid,
} from 'lucide-react'
import { clsx } from 'clsx'

import MenuItem from './MenuItem'
import UserProfileModal from './UserProfileModal'
import { useGlobalStore } from '../../../store/global'

interface FloatingConfigMenuProps {
  // Sin props adicionales ya que no necesitamos modo claro/oscuro
}

const FloatingConfigMenu: React.FC<FloatingConfigMenuProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false)
  const auth = useGlobalStore((state) => state.auth)

  const toggleMenu = (): void => {
    setIsOpen(!isOpen)
  }

  const openProfileModal = (): void => {
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = (): void => {
    setIsProfileModalOpen(false)
  }

  if (!auth?.isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2 z-50">
        {/* Menú expandido */}
        {isOpen && (
          <div className="bg-secondary/20 rounded-lg shadow-lg p-4 mb-2 transition-all duration-300 ease-in-out border border-gray-800">
            <div className="flex flex-col space-y-4">
              <MenuItem
                icon={<User size={20} />}
                text="Perfil"
                onClick={() => {
                  openProfileModal()
                  setIsOpen(false)
                }}
              />
              <MenuItem
                disabled
                icon={<Bell size={20} />}
                text="Notifications (Coming Soon)"
              />
              <MenuItem
                disabled
                icon={<LayoutGrid size={20} />}
                text="Dashboard (Coming Soon)"
              />
              <MenuItem
                disabled
                icon={<HelpCircle size={20} />}
                text="Help (Coming Soon)"
              />
              <MenuItem
                disabled
                icon={<LogOut size={20} />}
                text="Logout (Coming Soon)"
              />
            </div>
          </div>
        )}

        <button
          onClick={toggleMenu}
          className={clsx(
            'p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out',
            isOpen
              ? 'bg-primary rotate-45'
              : 'bg-primary hover:bg-primary-dark',
          )}
        >
          <Settings size={24} className="text-secondary-dark" />
        </button>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </>
  )
}

export default FloatingConfigMenu
