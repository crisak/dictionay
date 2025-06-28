import { Toaster } from 'sonner'
import { AuthProvider } from '../features/authentication/componentes'
import List from '../features/options/components/List'

import FloatingConfigMenu from '../features/options/components/FloatingConfigMenu'

const OptionsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 fixed inset-0 w-full h-full">
      <div className="bg-[url('/bg-shape.webp')] bg-cover bg-center bg-no-repeat absolute inset-0 opacity-50"></div>

      <div className="relative z-10 bg-third/5 backdrop-blur-3xl rounded-lg w-full h-[700px] max-w-2xl border border-white/20 dark:border-white/10 overflow-auto">
        <AuthProvider
          classNames={{
            containerInvalidKey: 'px-4',
          }}
        >
          <List />
          <FloatingConfigMenu />
        </AuthProvider>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}

export default OptionsPage
