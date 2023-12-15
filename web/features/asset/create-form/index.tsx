import { createAssetApi, getAssetTypesApi } from '@/apis/assets'
import useStore from '@/store'
import { Button, Grid, Group, Loader, Modal } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { FC, useCallback, useEffect, useState } from 'react'
import FilesAssetUploader from './asset-form/File'
import GithubForm from './asset-form/Github'
import { getMetadata, getReaderKwargs } from './asset-form/utils'
import MetadataForm from './Metadata'

type CreateAssetFormProps = {
  projectId: string
  kgId: string
  open: boolean
  onClose: () => void
}

const CreateAssetForm: FC<CreateAssetFormProps> = ({
  projectId,
  kgId,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const addNewAsset = useStore((state) => state.addNewAsset)
  const assetTypes = useStore((state) => state.assetTypes)
  const setAssetType = useStore((state) => state.setAssetTypes)
  const users = useStore((state) => state.users)
  const loadUsers = useStore((state) => state.loadUsers)

  const form = useForm({
    initialValues: {
      assetType: '',
      name: '',
      description: '',
      tags: '',
      authors: '',
      bucketName: '',
      githubUrl: '',
      branch: '',
      githubToken: '',
    },
    validate: {
      assetType: isNotEmpty('Select an asset type'),
      name: isNotEmpty('Enter a name'),
      bucketName: (value, allValues) => {
        if (getAssetTypeFromId(allValues.assetType) === 'files' && !value) {
          return 'Please upload a file'
        } else {
          return undefined
        }
      },
      githubUrl: (value, allValues) => {
        if (getAssetTypeFromId(allValues.assetType) === 'github' && !value) {
          return 'Please enter the github repo url'
        } else {
          return undefined
        }
      },
      githubToken: (value, allValues) => {
        if (getAssetTypeFromId(allValues.assetType) === 'github' && !value) {
          return 'Please enter github pat token'
        } else {
          return undefined
        }
      },
      branch: (value, allValues) => {
        if (getAssetTypeFromId(allValues.assetType) === 'github' && !value) {
          return 'Please enter branch name'
        } else {
          return undefined
        }
      },
    },
  })

  const handleSubmit = async (values: any) => {
    const assetTypeKey = getAssetTypeFromId(values.assetType)
    if (!kgId || !assetTypeKey) return

    setLoading(true)
    createAssetApi(projectId, kgId, {
      assetTypeId: values.assetType,
      knowledgeGroupId: kgId,
      name: values.name,
      description: values.description,
      tags: values.tags,
      readerKwargs: getReaderKwargs(values, assetTypeKey),
      extraMetadata: {
        description: values.description,
        authors: values.authors,
        tags: values.tags,
        assetType: assetTypeKey,
        ...getMetadata(values, assetTypeKey),
      },
    })
      .then((asset) => {
        addNewAsset(asset)
        showNotification({
          message: 'Asset created successfully.',
          color: 'green',
        })
        handleReset()
      })
      .catch((e: Error) => {
        showNotification({ message: e.message.toString(), color: 'red' })
      })
      .finally(() => setLoading(false))
  }

  const handleReset = () => {
    form.reset()
    onClose()
  }

  const getAssetTypeFromId = useCallback(
    (id: string) => {
      return assetTypes.find((e) => e.id === id)?.key
    },
    [assetTypes]
  )

  // useEffects
  useEffect(() => {
    getAssetTypesApi()
      .then((types) => {
        setAssetType(types)
      })
      .catch((e: Error) => {
        showNotification({ message: e.message.toString(), color: 'red' })
      })
  }, [])

  useEffect(() => {
    if (loadUsers) loadUsers()
  }, [loadUsers])

  if (!assetTypes || !users) {
    return <Loader />
  }

  return (
    <Modal
      opened={open}
      size="xl"
      onClose={onClose}
      title="Add Asset"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Grid>
          <Grid.Col span={6}>
            <MetadataForm form={form} assetTypes={assetTypes} users={users} />
          </Grid.Col>
          <Grid.Col span={6}>
            {getAssetTypeFromId(form.values.assetType) === 'files' && (
              <FilesAssetUploader
                kgId={kgId}
                projectId={projectId}
                form={form}
              />
            )}
            {getAssetTypeFromId(form.values.assetType) === 'github' && (
              <GithubForm form={form} />
            )}
          </Grid.Col>
        </Grid>
        <Group mt="lg" justify="flex-end">
          <Button type="submit" loading={loading} size="xs">
            Add
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

export default CreateAssetForm
