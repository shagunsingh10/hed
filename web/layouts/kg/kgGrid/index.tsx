import { BORDER_COLOR, CHAT_MESSAGE_BG } from '@/constants'
import { globalDateFormatParser } from '@/lib/functions'
import { Kg } from '@/types/kgs'
import {
  CalendarOutlined,
  SwitcherFilled,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Empty, List, Tag, Tooltip, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import styles from './kggrid.module.scss'

type KgGridProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGGrid: FC<KgGridProps> = ({ projectId, kgs, loading }) => {
  const { push } = useRouter()

  const handleProjectClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  return (
    <div className={styles.kgCardsContainer}>
      {kgs.length > 0 ? (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={kgs}
          renderItem={(item) => (
            <List.Item
              style={{
                background: CHAT_MESSAGE_BG,
                border: `1px solid ${BORDER_COLOR}`,
                padding: '1em 2em',
                borderRadius: '0.5em',
                marginBottom: '1em',
              }}
              actions={[
                <Button
                  ghost
                  type="primary"
                  onClick={() => handleProjectClick(item.id)}
                >
                  View
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Typography.Title level={4} className={styles.kgTitle}>
                    <SwitcherFilled />
                    {item.name}
                  </Typography.Title>
                }
                description={
                  <>
                    <div className={styles.kgTags}>
                      {item.tags.map((tag) => (
                        <Tag
                          key={tag}
                          // bordered={false}
                          color="blue"
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <div className={styles.kgInfo}>
                      <UserOutlined />
                      {globalDateFormatParser(new Date(item.createdAt))}
                    </div>
                    <div className={styles.kgInfo}>
                      <CalendarOutlined />
                      {item.createdBy}
                    </div>
                  </>
                }
              />
              <div className={styles.kgDescriptionContainer}>
                <span className={styles.kgDescription}>{item.description}</span>
                <Avatar.Group className={styles.kgMembers} maxCount={4}>
                  {item.members?.map((e) => (
                    <Tooltip title={`${e.name} (${e.role})`}>
                      <Avatar
                        src={<img src={e.image} referrerPolicy="no-referrer" />}
                      />
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

export default KGGrid
