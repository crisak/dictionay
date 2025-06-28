import React, { useState } from 'react'

export default function ConfigForm() {
  const [config, setConfig] = useState({
    interval: 15,
    enableWhileBrowsing: true,
    disableDuration: '30',
    studyLanguage: '',
    nativeLanguage: '',
    enableNotifications: true,
    interfaceLanguage: '',
    syncSettings: true,
  })

  const handleChange = (field: string, value: string | boolean | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Configuración guardada:', config)
    // Aquí puedes agregar la lógica para guardar la configuración
  }

  const languages = [
    'Español',
    'Inglés',
    'Francés',
    'Alemán',
    'Italiano',
    'Portugués',
    'Chino',
    'Japonés',
  ]

  return (
    <div className="relative z-10 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-lg w-full max-w-2xl border border-white/20 dark:border-white/10 overflow-hidden">
      <div className="relative">
        <div className={`absolute inset-0 bg-[#98CA3F]`}></div>
        <div className="relative z-10 text-[#0e272a] p-6">
          <h2 className="text-3xl font-bold">Configuración de la Extensión</h2>
          <p className="text-[#0e272a] text-opacity-70">
            Personaliza tu experiencia de aprendizaje
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="interval"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Intervalo de visualización (minutos)
            </label>
            <input
              type="number"
              id="interval"
              value={config.interval}
              onChange={(e) =>
                handleChange('interval', parseInt(e.target.value))
              }
              className="bg-gray-50 border border-[#0e272a] text-gray-900 text-sm rounded-lg focus:[#98CA3F]/40 focus:border-blue-500/40 block w-full p-2.5 dark:bg-gray-700/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:[#98CA3F]/40 dark:focus:border-blue-500/40"
              required
            />
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableWhileBrowsing}
                onChange={(e) =>
                  handleChange('enableWhileBrowsing', e.target.checked)
                }
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Habilitar tarjetas mientras navega
              </span>
            </label>
          </div>
          <div>
            <label
              htmlFor="disableDuration"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Duración de deshabilitación de tarjetas
            </label>
            <select
              id="disableDuration"
              value={config.disableDuration}
              onChange={(e) => handleChange('disableDuration', e.target.value)}
              className="bg-gray-50 border border-[#0e272a] text-gray-900 text-sm rounded-lg focus:[#98CA3F]/40 focus:border-blue-500/40 block w-full p-2.5 dark:bg-gray-700/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:[#98CA3F]/40 dark:focus:border-blue-500/40"
            >
              <option value="10">10 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="studyLanguage"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Idioma a estudiar
            </label>
            <select
              id="studyLanguage"
              value={config.studyLanguage}
              onChange={(e) => handleChange('studyLanguage', e.target.value)}
              className="bg-gray-50 border border-[#0e272a] text-gray-900 text-sm rounded-lg focus:[#98CA3F]/40 focus:border-blue-500/40 block w-full p-2.5 dark:bg-gray-700/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:[#98CA3F]/40 dark:focus:border-blue-500/40"
            >
              <option value="">Selecciona un idioma</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="nativeLanguage"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Idioma nativo del usuario
            </label>
            <select
              id="nativeLanguage"
              value={config.nativeLanguage}
              onChange={(e) => handleChange('nativeLanguage', e.target.value)}
              className="bg-gray-50 border border-[#0e272a] text-gray-900 text-sm rounded-lg focus:[#98CA3F]/40 focus:border-blue-500/40 block w-full p-2.5 dark:bg-gray-700/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:[#98CA3F]/40 dark:focus:border-blue-500/40"
            >
              <option value="">Selecciona un idioma</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableNotifications}
                onChange={(e) =>
                  handleChange('enableNotifications', e.target.checked)
                }
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Habilitar notificaciones de recordatorio
              </span>
            </label>
          </div>
          <div>
            <label
              htmlFor="interfaceLanguage"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Idioma de la interfaz de la aplicación
            </label>
            <select
              id="interfaceLanguage"
              value={config.interfaceLanguage}
              onChange={(e) =>
                handleChange('interfaceLanguage', e.target.value)
              }
              className="bg-gray-50 border border-[#0e272a] text-gray-900 text-sm rounded-lg focus:[#98CA3F]/40 focus:border-blue-500/40 block w-full p-2.5 dark:bg-gray-700/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:[#98CA3F]/40 dark:focus:border-blue-500/40"
            >
              <option value="">Selecciona un idioma</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.syncSettings}
                onChange={(e) => handleChange('syncSettings', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Sincronizar configuración entre dispositivos
              </span>
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#98CA3F] text-[#0e272a] font-medium rounded-lg hover:opacity-80  hover:text-[#0e272a] hover:text-opacity-80 focus:outline-none focus:ring focus:ring-[#98CA3F] focus:ring-opacity-50 transition duration-300"
        >
          Guardar Configuración
        </button>
      </form>
    </div>
  )
}
