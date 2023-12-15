import { Kg } from '@/types/kgs'
import { Badge, Stack, Title } from '@mantine/core'
import { FC } from 'react'

type IKgSettings = {
  kg: Kg | undefined
}
const KgSettings: FC<IKgSettings> = ({ kg }) => {
  return kg ? (
    <Stack>
      <Title order={5}>{kg.name}</Title>
      <strong>Description:</strong>
      <p>{kg.description}</p>
      <strong>Tags:</strong>
      {kg.tags.map((tag: string) => (
        <Badge variant="light">{tag}</Badge>
      ))}
    </Stack>
  ) : (
    <></>
  )
}

export default KgSettings
