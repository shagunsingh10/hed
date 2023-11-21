import { RefObject, useLayoutEffect, useState } from 'react'

export const useTableHeight = (ref: RefObject<Element>, footer?: boolean) => {
  const [tableHeight, setTableHeight] = useState(600)

  useLayoutEffect(() => {
    let height = window.innerHeight
    const node = ref.current
    const nodeBounds = node?.getBoundingClientRect()
    height -= nodeBounds?.top || 0
    height -= 55 // header
    if (footer) height -= 48 // footer
    setTableHeight(height)
    console.log({ height: height })
  }, [ref, window.innerHeight])

  return tableHeight
}
