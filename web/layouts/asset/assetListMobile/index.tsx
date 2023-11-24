// import useStore from '@/store'
// import {
//   CheckCircleFilled,
//   CloseCircleFilled,
//   DeleteOutlined,
//   ExclamationCircleFilled,
// } from '@ant-design/icons'
// import { Col, message, Row, Tag } from 'antd'
// import { useEffect } from 'react'
// import styles from './assetlist.module.scss'

// type KgListProps = {
//   projectId: string
//   kgId?: string
// }

// const AssetListMobile: React.FC<KgListProps> = ({ projectId, kgId }) => {
//   const assets = useStore((state) => state.assets)
//   const getAssetTypes = useStore((state) => state.getAssetTypes)
//   const assetTypes = useStore((state) => state.assetTypes)
//   const loadAssets = useStore((state) => state.loadAssets)

//   const deleteKg = (kgId: string) => {
//     message.info('Delete feature coming soon...')
//   }

//   const deepDiveAsset = () => {
//     message.info('Deep dive inside an asset coming soon...')
//   }

//   useEffect(() => {
//     if (loadAssets && getAssetTypes) {
//       loadAssets(projectId, kgId)
//       getAssetTypes()
//     }
//   }, [loadAssets, getAssetTypes])

//   const AssetTag = ({ status }: { status: string }) => {
//     let color = 'green'
//     if (status === 'failed') color = 'red'
//     if (status === 'pending') color = 'yellow'
//     return (
//       <Tag color={color} key={status}>
//         {status === 'pending' && <ExclamationCircleFilled />}
//         {status === 'success' && <CheckCircleFilled />}
//         {status === 'failed' && <CloseCircleFilled />}

//         <span style={{ marginLeft: '1em' }}>{status.toUpperCase()}</span>
//       </Tag>
//     )
//   }

//   return (
//     <div className={styles.assetInfoContainer}>
//       {assets.map((asset) => (
//         <Row className={styles.assetInfoCard}>
//           <Col
//             span={15}
//             className={styles.assetInfoTitle}
//             onClick={deepDiveAsset}
//           >
//             {asset.name}
//           </Col>

//           <Col span={7}>
//             <AssetTag status={asset.status} />
//           </Col>
//           <Col span={1}>
//             <DeleteOutlined onClick={() => deleteKg(asset.id)} />
//           </Col>
//           <div className={styles.assetType}>
//             Asset type :{' '}
//             {assetTypes.find((e) => e.id === asset.assetTypeId)?.name}
//           </div>
//           <div className={styles.assetCreatedBy}>
//             Created by {asset.createdBy} at {asset.createdAt}
//           </div>
//         </Row>
//       ))}
//     </div>
//   )
// }

// export default AssetListMobile

import React from 'react'

const index = () => {
  return <div>index</div>
}

export default index
