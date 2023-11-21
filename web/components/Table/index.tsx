import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { Table } from 'antd'
import { RefTable } from 'antd/es/table/interface'
import { useLayoutEffect, useRef, useState } from 'react'

const CustomTable: RefTable = (props) => {
  const [tableHeight, setTableHeight] = useState(600)
  const ref = useRef<HTMLDivElement>(null)

  const setHeight = useDebouncedCallback(() => {
    let height = window.innerHeight
    console.log({ height })
    const node = ref.current
    const nodeBounds = node?.getBoundingClientRect()
    height -= nodeBounds?.top || 0
    height -= 55 // header
    if (props.footer) height -= 48 // footer
    setTableHeight(height)
  }, 100)

  useLayoutEffect(() => {
    setHeight()
  }, [ref])

  return <Table ref={ref} scroll={{ y: tableHeight }} {...props} />
}

export default CustomTable
