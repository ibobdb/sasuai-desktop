import { Input } from '@/components/ui/input'

interface KeyboardInputProps {
  keySequence: string[]
  isRecording: boolean
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  placeholder: string
  className?: string
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function KeyboardInput({
  keySequence,
  isRecording,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  className = '',
  inputRef
}: KeyboardInputProps) {
  const handleClick = () => {
    if (!isRecording) {
      onFocus()
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !relatedTarget.closest('.keyboard-input-container')) {
      onBlur()
    }
  }

  return (
    <div className="keyboard-input-container">
      <Input
        ref={inputRef}
        value={keySequence.join(' + ')}
        onKeyDown={onKeyDown}
        onClick={handleClick}
        onBlur={handleBlur}
        placeholder={placeholder}
        readOnly
        className={`cursor-pointer ${className} ${
          isRecording
            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50'
            : 'hover:border-gray-400 transition-colors'
        }`}
      />
    </div>
  )
}
