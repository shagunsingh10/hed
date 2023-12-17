import { Group, Loader, Overlay } from '@mantine/core'

const OverlayLoader = () => {
  return (
    <Overlay zIndex={10}>
      <Group h="100vh" w="100vw" display="flex" justify="center" align="center">
        <Loader size={48} />
      </Group>
    </Overlay>
  )
}

export default OverlayLoader
