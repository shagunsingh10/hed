import { Button, Container, Text, Title } from '@mantine/core'
import { IconZoomCancel } from '@tabler/icons-react'

const NotFoundPage = () => {
  return (
    <Container size="md" style={{ textAlign: 'center', marginTop: '100px' }}>
      <IconZoomCancel size={100} />
      <Title order={1} mb="lg">
        404 - Not Found
      </Title>
      <Text mb="lg">
        Oops! The page you are looking for might be in another universe.
      </Text>
      <Button component="a" href="/" color="blue" mt="lg">
        Go Home
      </Button>
    </Container>
  )
}

export default NotFoundPage
