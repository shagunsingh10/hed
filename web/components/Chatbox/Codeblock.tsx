import { CopyOutlined } from '@ant-design/icons'
import { Button, Card, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/prism'

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
    <Card
      type="inner"
      bodyStyle={{ padding: 0 }}
      style={{ margin: '1em 0' }}
      title={language}
      extra={
        <Button
          type="primary"
          icon={<CopyOutlined />}
          onClick={handleCopyClick}
          size="small"
          ghost
        >
          {copied ? 'Copied!' : 'Copy code'}
        </Button>
      }
    >
      <SyntaxHighlighter language={language} style={nightOwl}>
        {props.children}
      </SyntaxHighlighter>
    </Card>
  ) : (
    <code className={props.className} {...props} />
  )
}

export default CodeBlock
