import { Button, Result } from 'antd'
import Link from 'next/link'
import React from 'react'

const NotFoundPage = () => {
  return (
    <Result
      style={{ width: '100%' }}
      status="404"
      title="Page not found !"
      subTitle="Sorry, the page you are trying to view does not exist or you don't have access to it."
      extra={
        <Link href="/">
          <Button type="primary">Back to Home</Button>
        </Link>
      }
    />
  )
}

export default NotFoundPage
