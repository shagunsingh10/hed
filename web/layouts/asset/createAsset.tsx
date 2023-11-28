import { createAssetApi } from '@/apis/assets'
import { getKgsApi } from '@/apis/kgs'
import Loader from '@/components/Loader'
import Uploader from '@/components/Uploader'
import useStore from '@/store'
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Typography,
} from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import styles from './asset.module.scss'
import GithubForm, { extractUserAndRepo } from './create/github'
import WikipediaForm from './create/wikipedia'

const { Option } = Select

type CreateAssetFormProps = {
  projectId: string
  kgId?: string
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
  const [selecTedAssetType, setSelectedAssetType] = useState<string>('')
  const [uploadId, setUploadId] = useState<string>()
  const [selectedKgId, setSelectedKgId] = useState<string>()
  const formRef: any = useRef(null)

  const addNewAsset = useStore((state) => state.addNewAsset)
  const assetTypes = useStore((state) => state.assetTypes)
  const kgs = useStore((state) => state.kgs)
  const setKgs = useStore((state) => state.setKgs)
  const users = useStore((state) => state.users)
  const loadUsers = useStore((state) => state.loadUsers)

  // functions
  const handleSubmit = async (values: any) => {
    const assetType = assetTypes.find((e) => e.key === selecTedAssetType)
    if (!selectedKgId || !assetType) return

    setLoading(true)
    createAssetApi(projectId, selectedKgId, {
      assetTypeId: assetType.id,
      knowledgeGroupId: selectedKgId,
      name: values.name,
      description: values.description,
      tags: values.tags,
      readerKwargs: getReaderKwargs(values, assetType.key),
      extraMetadata: {
        description: values.description,
        authors: values.authors,
        tags: values.tags,
        assetType: assetType.key,
        ...getMetadata(values, assetType.key),
      },
    })
      .then((asset) => {
        addNewAsset(asset)
        message.info('Asset created and sent for ingestion')
        handleReset()
      })
      .catch((e: Error) => {
        message.error(e.message.toString())
      })
      .finally(() => setLoading(false))
  }

  const getReaderKwargs = (values: any, assetTypeKey: string) => {
    if (assetTypeKey === 'directory') {
      return {
        uploadId: uploadId,
      }
    }

    if (assetTypeKey === 'wikipedia') {
      return {
        pages: [values.wiki_page],
      }
    }

    if (assetTypeKey === 'github') {
      const githubDetails = extractUserAndRepo(values.github_url)
      return {
        owner: githubDetails.owner,
        repo: githubDetails.repo,
        github_token: values.github_token,
        branch: values.branch,
      }
    }

    return {}
  }

  const getMetadata = (values: any, assetTypeKey: string) => {
    if (assetTypeKey === 'wikipedia') {
      return {
        base_url: 'https://www.wikipedia.org/',
        file_path: values.wiki_page,
      }
    }

    if (assetTypeKey === 'github') {
      return { base_url: values.github_url }
    }

    return {}
  }

  const handleReset = () => {
    setSelectedAssetType('')
    formRef.current?.resetFields()
    onClose()
  }

  const handleUploadFailure = () => {
    message.error('Upload failed! Please try again.')
  }

  // useEffects
  useEffect(() => {
    getKgsApi(projectId)
      .then((kgs) => {
        setKgs(kgs)
      })
      .catch((e: Error) => {
        message.error(e.message.toString())
      })
  }, [])

  // if kg id comes from props, set it automatically
  useEffect(() => {
    if (kgId) setSelectedKgId(kgId)
  }, [kgId])

  useEffect(() => {
    if (loadUsers) loadUsers()
  }, [loadUsers])

  if (!assetTypes) {
    return <Loader />
  }

  return (
    <Modal
      open={open}
      destroyOnClose={true}
      footer={false}
      closeIcon={false}
      centered={false}
      width={'70vw'}
    >
      <Card className={styles.newAssetFormContainer}>
        <Form
          onFinish={handleSubmit}
          onReset={handleReset}
          layout="vertical"
          ref={formRef}
        >
          <div className={styles.formItemsContainer}>
            <div className={styles.assetInfoContainer}>
              <Typography.Title level={3}>Asset</Typography.Title>
              {!kgId && (
                <Form.Item
                  label="Knowledge Group"
                  name="kgId"
                  rules={[
                    {
                      required: true,
                      message: 'Please select knowledge group.',
                    },
                  ]}
                >
                  <Select
                    showSearch={true}
                    onChange={(e) => setSelectedKgId(e)}
                  >
                    {kgs.map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                label="Asset Type"
                name="assetType"
                rules={[
                  {
                    required: true,
                    message: 'Please select assetType.',
                  },
                ]}
              >
                <Select
                  showSearch={true}
                  onChange={(e) => setSelectedAssetType(e)}
                >
                  {assetTypes.map((e) => (
                    <Option key={e.id} value={e.key}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {selecTedAssetType && selectedKgId && (
                <>
                  {selecTedAssetType === 'directory' && (
                    <Uploader
                      projectId={projectId}
                      kgId={selectedKgId}
                      onSuccessCallback={(uploadId) => setUploadId(uploadId)}
                      onFailureCallback={handleUploadFailure}
                    />
                  )}
                  {selecTedAssetType === 'github' && <GithubForm />}
                  {selecTedAssetType === 'wikipedia' && <WikipediaForm />}
                  {!['github', 'wikipedia', 'directory'].includes(
                    selecTedAssetType
                  ) && <span>Coming Soon!</span>}
                </>
              )}
            </div>
            <div className={styles.metadataContainer}>
              <Typography.Title level={3}>Metadata</Typography.Title>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter a name for this asset.',
                  },
                ]}
              >
                <Input placeholder="Name is required" />
              </Form.Item>

              <Form.Item label="Asset Description" name="description">
                <Input.TextArea
                  rows={6}
                  placeholder="Please enter a short description for this asset"
                />
              </Form.Item>
              <Form.Item label="Tags" name="tags">
                <Input placeholder="Enter tags asscoiated with this asset (comma-separated)" />
              </Form.Item>
              <Form.Item label="Authors" name="authors">
                <Select
                  mode="multiple"
                  showSearch
                  filterOption={(inputValue, option) =>
                    option?.children
                      ?.toLocaleString()
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()) || false
                  }
                  placeholder="Add authors"
                >
                  {users.map((e) => (
                    <Option key={e.id} value={e.email}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
          <Form.Item>
            <div className={styles.formButtonGroup}>
              <Button color="secondary" htmlType="reset" loading={loading}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={selecTedAssetType === 'directory' && !uploadId}
              >
                Add
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  )
}

export default CreateAssetForm
