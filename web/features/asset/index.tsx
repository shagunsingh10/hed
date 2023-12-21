import { getAssetsApi } from '@/apis/assets'
import OverlayLoader from '@/components/Loader'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Asset } from '@/types/assets'
import { Button, Input } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconCubePlus, IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import styles from './asset.module.scss'
import CreateAssetForm from './create-form'
import AssetList from './list'

type IAssetsProps = {
  projectId: string
}

const PAGE_SIZE = 12

const Assets: React.FC<IAssetsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [filteredAsset, setFilteredAsset] = useState<Asset[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [page, setPage] = useState(1)

  const assets = useStore((state) => state.assets)
  const totalAssets = useStore((state) => state.totalAssets)
  const setTotalAssets = useStore((state) => state.setTotalAssets)
  const setAssets = useStore((state) => state.setAssets)

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredAsset(
      assets.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e.description
            ?.toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.createdBy?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  useEffect(() => setFilteredAsset(assets), [assets])

  useEffect(() => {
    const start = PAGE_SIZE * (page - 1)
    const end = PAGE_SIZE * page
    setLoading(true)
    getAssetsApi(projectId, start, end)
      .then((assetsData) => {
        setAssets(assetsData.assets)
        setTotalAssets(assetsData.totalAssets)
      })
      .catch((e: Error) => {
        console.error(e)
        showNotification({
          color: 'red',
          message: 'Some error occurred in fetching assets.',
        })
      })
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <OverlayLoader />

  return (
    <div className={styles.assetContainer}>
      <div className={styles.screenHeader}>
        <Input
          size="xs"
          rightSection={<IconSearch size={17} />}
          className={styles.search}
          placeholder="Search assets by name, tags, description or creator"
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          size="xs"
          leftSection={<IconCubePlus size={15} />}
          onClick={() => setOpen(true)}
        >
          Create new
        </Button>
      </div>
      <AssetList
        projectId={projectId}
        assets={filteredAsset}
        loading={loading}
        page={page}
        onPageChange={(p) => setPage(p)}
        pageSize={PAGE_SIZE}
        totalSize={totalAssets}
      />
      <CreateAssetForm
        projectId={projectId}
        open={open}
        onClose={() => setOpen(false)}
        hideOneOnCreate={totalAssets + 1 > PAGE_SIZE}
      />
    </div>
  )
}

export default Assets
