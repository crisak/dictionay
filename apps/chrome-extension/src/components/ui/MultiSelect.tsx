/* eslint-disable @typescript-eslint/ban-ts-comment */

import { RefreshCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type MultiSelectOptions = {
  options?: string[]
  onChange: (selectedOptions: string[]) => void
  onInputChange?: (inputValue: string) => void
  isClearable?: boolean
  className?: string
  values?: string[]
  placeholder?: string
}

const MultiSelect = ({
  options = [],
  onChange,
  onInputChange,
  isClearable = true,
  className = '',
  values = [],
  placeholder = 'Select an option',
}: MultiSelectOptions) => {
  console.count('Render <MultiSelect />')

  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const handleOptionClick = (option: string) => {
    const newSelectedOptions = [...values, option] as string[]
    onChange(newSelectedOptions)
    setInputValue('')
    // @ts-ignore
    inputRef?.current?.focus()
  }

  const handleRemoveOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelectedOptions = values.filter((item) => item !== option)
    onChange(newSelectedOptions)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (onInputChange) {
      onInputChange(value)
    }

    const filtered = options.filter(
      (option) =>
        option.toLowerCase().includes(value.toLowerCase()) &&
        !values.includes(option),
    )
    // @ts-ignore
    setFilteredOptions(filtered || [])
    setIsOpen(true)
  }

  const handleCreateOption = () => {
    if (inputValue.trim() !== '' && !values.includes(inputValue)) {
      const newSelectedOptions = [...values, inputValue]

      onChange(newSelectedOptions)
      setInputValue('')
      // @ts-ignore
      inputRef?.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      handleCreateOption()
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    // @ts-ignore
    if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
      setIsOpen(false)
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setFilteredOptions(
      // @ts-ignore
      (options || []).filter((option) => !values?.includes(option)),
    )
  }, [values, options])

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div
        className="flex flex-wrap items-center min-h-[32px] bg-input border border-green-700 rounded px-2 py-1 cursor-text"
        onClick={() => {
          setIsOpen(true)
          // @ts-ignore
          inputRef?.current?.focus()
        }}
      >
        {values.map((option) => (
          <span
            key={option}
            className="bg-green-900 text-gray-200 px-2 py-0.5 rounded text-xs mr-1 mb-1 flex items-center"
          >
            {option}
            <X
              size={12}
              className="ml-1 cursor-pointer"
              onClick={(e) => handleRemoveOption(option, e)}
            />
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-grow outline-none text-sm text-third bg-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ''}
        />
        {isClearable && values.length > 0 && (
          <RefreshCw
            size={16}
            className="ml-1 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={handleClearAll}
          />
        )}
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-green-950 border border-green-700 rounded shadow-lg text-gray-400">
          <div className="py-1 max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-3 py-2 hover:bg-green-900 cursor-pointer text-sm flex items-center"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelect
