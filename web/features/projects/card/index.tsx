import UserAvatar from '@/components/Avatar'
import { globalDateFormatParser } from '@/lib/utils/functions'
import { Project } from '@/types/projects'
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Space,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconCalendar, IconHeart, IconUser } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import styles from './projectCard.module.scss'

type IProps = {
  project: Project
}
const ProjectCard: FC<IProps> = ({ project }) => {
  const { push } = useRouter()

  const handleProjectClick = () => {
    push(`/projects/${project.id}`, {
      scroll: false,
    })
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={styles.cardContainer}
    >
      <Card.Section>
        <Image src="/images/no-bg.jpg" height={120} alt="Norway" />
      </Card.Section>

      <Group justify="space-between" mt="xs">
        <Title order={4} fw={500} className={styles.projectName}>
          {project.name}
        </Title>
        <Space>
          {project.tags.slice(0, 2).map((tag) => (
            <Badge color="pink" mr="xs" size="xs" variant="light">
              {tag}
            </Badge>
          ))}
        </Space>
      </Group>

      <Text fw={500} size="xs" mt="xs" className={styles.label}>
        <IconUser size={13} />
        {project.createdBy}
      </Text>
      <Text fw={500} size="xs" className={styles.label}>
        <IconCalendar size={13} />
        {globalDateFormatParser(project.createdAt)}
      </Text>

      <Avatar.Group className={styles.projectMembers} mt="xs">
        {project.members &&
          project.members?.map((e) => (
            <Tooltip label={`${e.name}`}>
              <UserAvatar userId={e.id} />
            </Tooltip>
          ))}
      </Avatar.Group>

      <Group mt="xs" className={styles.btnGroup}>
        <Button radius="md" style={{ flex: 1 }} onClick={handleProjectClick}>
          Show details
        </Button>
        <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={styles.like} stroke={1.5} />
        </ActionIcon>
      </Group>
    </Card>
  )
}

export default ProjectCard
