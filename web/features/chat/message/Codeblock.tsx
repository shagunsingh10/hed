import { CodeHighlight } from '@mantine/code-highlight'
import '@mantine/code-highlight/styles.css'
import styles from './message.module.scss'

const getLanguageFromClassName = (className: string | undefined) => {
  if (!className) return 'text'
  if (className.startsWith('language-')) {
    return className.substring('language-'.length).toLowerCase()
  } else {
    return className.toLowerCase()
  }
}

const Codeblock = (props: any) => {
  const language = getLanguageFromClassName(props.className)
  const hasLang = /language-(\w+)/.exec(props.className || '')

  return hasLang ? (
    <CodeHighlight
      className={styles.codeBlock}
      code={props.children || ' '}
      language={language}
      copyLabel="Copy"
      copiedLabel="Copied!"
    />
  ) : (
    <code className={props.className} {...props} />
  )
}

export default Codeblock
