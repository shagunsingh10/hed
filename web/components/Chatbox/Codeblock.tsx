import { CopyFilled, CopyOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import styles from './chat.module.scss'

const getLanguageFromClassName = (className: string | undefined) => {
  if (!className) return 'text'
  if (className.startsWith('language-')) {
    return className.substring('language-'.length).toLowerCase()
  } else {
    return className.toLowerCase()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = (props: any) => {
  const language = getLanguageFromClassName(props.className)
  const hasLang = /language-(\w+)/.exec(props.className || '')

  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const codeContainerRef = useRef(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(props.children)
    setCopied(true)
    message.success('Text copied to clipboard')
  }

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  return hasLang ? (
    <div
      className={styles.codeBlockContainer}
      ref={codeContainerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <Button
          icon={copied ? <CopyFilled /> : <CopyOutlined />}
          onClick={handleCopyClick}
          className={styles.copyButton}
        />
      )}
      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        customStyle={{ borderRadius: '0.5em' }}
      >
        {props.children}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={props.className} {...props} />
  )
}

export default CodeBlock
