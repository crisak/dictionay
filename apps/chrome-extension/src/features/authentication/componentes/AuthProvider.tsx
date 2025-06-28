/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Button, Input } from '../../../components/ui'
import { useGlobalStore } from '../../../store/global'
import { useShallow } from 'zustand/shallow'
import { DictionaryApi } from './../../../services/dictionary-api'

type AuthProviderProps = {
  children: React.ReactNode
  redirect?: boolean
  classNames?: {
    containerInvalidKey?: string
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  redirect,
  classNames,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inputKey, setInputKey] = useState('')
  const [error, setError] = useState('')
  const [auth, setAuth] = useGlobalStore(
    useShallow((state) => [state.auth, state.setAuth]),
  )

  useEffect(() => {
    ;(async () => {
      if (auth.apiKey && auth.isAuthenticated) {
        setShowModal(false)
        setLoading(false)
        return
      }

      if (auth.apiKey) {
        const valid = await DictionaryApi.validateApiKey(auth.apiKey)
        setLoading(false)

        if (valid) {
          setShowModal(false)

          setAuth({
            apiKey: auth.apiKey,
            isAuthenticated: true,
          })
          return
        }
      }

      setShowModal(true)
      setLoading(false)
    })()
  }, [auth.apiKey])

  const setApiKey = async (key: string) => {
    setError('')
    const valid = await DictionaryApi.validateApiKey(key)
    if (valid) {
      setAuth({
        apiKey: key,
        isAuthenticated: true,
      })
      setShowModal(false)

      return true
    } else {
      setError('API Key invalid')
      return false
    }
  }

  if (loading) return null

  if (redirect && showModal) {
    return (
      <div className={classNames?.containerInvalidKey}>
        <h2
          style={{
            fontSize: '1.5rem',
          }}
        >
          API Key is required
        </h2>
        <p
          style={{
            fontSize: '1rem',
          }}
        >
          Please set up your API Key in the extension options.
        </p>
      </div>
    )
  }

  return (
    <>
      {showModal && (
        <div className={classNames?.containerInvalidKey}>
          <h2>Set up your API Key</h2>
          <Input
            type="text"
            size="xs"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="API Key"
            autoFocus
          />

          {error && <p className="text-red-500 text-xs mt-2 p-3">{error}</p>}

          <div className="flex justify-end mt-3">
            <Button
              isLoading={loading}
              disabled={Boolean(inputKey.length === 0)}
              type="button"
              size="small"
              className="ml-2 text-green-400 hover:bg-green-400/10 border border-green-950"
              onClick={async () => {
                if (await setApiKey(inputKey)) setInputKey('')
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      )}
      {!showModal && children}
    </>
  )
}
