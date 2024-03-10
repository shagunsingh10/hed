import { uploadFileApi } from '@/apis/uploads'
import { formatBytes } from '@/lib/utils/functions'
import { Button, Card, Group, List, rem, Text, ThemeIcon } from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { UseFormReturnType } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCirclePlus,
  IconCircleX,
  IconCubePlus,
} from '@tabler/icons-react'
import { FC, useCallback, useState } from 'react'
import styles from './assetsform.module.scss'

type UploaderProps = {
  form: UseFormReturnType<any>
  projectId: string
}

const iconMap: any = {
  PENDING: (
    <ThemeIcon color="gray" size={16} radius="xl">
      <IconCirclePlus style={{ width: rem(12), height: rem(12) }} />
    </ThemeIcon>
  ),
  UPLOADING: (
    <ThemeIcon color="blue" size={16} radius="xl">
      <IconCircleDashed style={{ width: rem(12), height: rem(12) }} />
    </ThemeIcon>
  ),
  SUCCESS: (
    <ThemeIcon color="teal" size={16} radius="xl">
      <IconCircleCheck style={{ width: rem(12), height: rem(12) }} />
    </ThemeIcon>
  ),
  ERROR: (
    <ThemeIcon color="red" size={16} radius="xl">
      <IconCircleX style={{ width: rem(12), height: rem(12) }} />
    </ThemeIcon>
  ),
}

const noDuplicateFilenames = (files: FileWithPath[]) => {
  const fileNames = files.map((e) => e.name)
  return fileNames.length === new Set(fileNames).size
}

const FilesAssetUploader: FC<UploaderProps> = ({ form, projectId }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileWithPath[]>()
  const [fileStatus, setFileStatus] = useState<Record<string, string>>({})

  const handleDrop = useCallback(
    (files: FileWithPath[]) => {
      if (!noDuplicateFilenames(files)) {
        showNotification({
          message: 'Duplicate filenames not allowed',
          color: 'red',
        })
        return
      }
      setFiles(files)
      const fileObj: Record<string, string> = {}
      files.forEach((e) => {
        fileObj[e.name] = 'PENDING'
      })
      setFileStatus(fileObj)
    },
    [setFiles]
  )

  const handleStart = useCallback(async () => {
    if (files) {
      // set loading status
      setLoading(true)
      const fileObj: Record<string, string> = {}
      files.forEach((e) => {
        fileObj[e.name] = 'UPLOADING'
      })
      setFileStatus(fileObj)

      try {
        const { bucketName, uploadStatus } = await uploadFileApi(
          files,
          projectId
        )
        setFileStatus(uploadStatus)
        form.setFieldValue('bucketName', bucketName)
      } catch {
        showNotification({
          message: 'Some error occurred during upload.',
          color: 'red',
        })
      } finally {
        setLoading(false)
      }
    } else {
      showNotification({ message: 'Upload atleast one file', color: 'red' })
    }
  }, [files])

  return (
    <div>
      <Card mt="lg">
        <Dropzone onDrop={handleDrop}>
          <Group
            justify="center"
            gap="sm"
            mih={100}
            style={{ cursor: 'pointer' }}
          >
            <Dropzone.Idle>
              <IconCubePlus size={50} />
            </Dropzone.Idle>

            <div>
              <Text size="md" inline>
                Drag assets here or click to select assets
              </Text>
            </div>
          </Group>
        </Dropzone>
        <Button
          onClick={handleStart}
          loading={loading}
          mt="sm"
          size="xs"
          disabled={!files || files.length <= 0}
        >
          {loading ? 'Uploading' : 'Start Upload'}
        </Button>
      </Card>

      {files && (
        <List
          spacing="xs"
          size="xs"
          center
          mt="lg"
          className={styles.uploadedFilesList}
        >
          {files.map((file: FileWithPath) => (
            <List.Item icon={iconMap[fileStatus[file.name]]}>
              <Group gap="xs">
                <Group align="center" gap="sm">
                  <Text size="sm">{file.name}</Text>
                  <Text size="sm" fw={500}>
                    [{formatBytes(file.size)}]
                  </Text>
                </Group>
              </Group>
            </List.Item>
          ))}
        </List>
      )}
    </div>
  )
}

export default FilesAssetUploader
