import { SmileOutlined, SyncOutlined } from '@ant-design/icons'
import { Timeline } from 'antd'
import styles from './event.module.scss'

const ProjectEvents: React.FC = () => (
  <Timeline
    className={styles.eventsContainer}
    items={[
      {
        color: 'green',
        children: 'Sam uploaded an asset to project xyz',
      },
      {
        color: 'green',
        children: 'Synced github code at 8PM',
        dot: <SyncOutlined />,
      },
      {
        color: 'red',
        children: (
          <>
            <p>Solve initial network problems 1</p>
            <p>Solve initial network problems 2</p>
            <p>Solve initial network problems 3 2015-09-01</p>
          </>
        ),
      },
      {
        children: (
          <>
            <p>Technical testing 1</p>
            <p>Technical testing 2</p>
            <p>Technical testing 3 2015-09-01</p>
          </>
        ),
      },
      {
        color: 'gray',
        children: (
          <>
            <p>Technical testing 1</p>
            <p>Technical testing 2</p>
            <p>Technical testing 3 2015-09-01</p>
          </>
        ),
      },
      {
        color: 'green',
        children: 'Sam uploaded an asset to project xyz',
      },
      {
        color: 'green',
        children: 'Sam uploaded an asset to project xyz',
      },
      {
        color: 'red',
        children: (
          <>
            <p>Solve initial network problems 1</p>
            <p>Solve initial network problems 2</p>
            <p>Solve initial network problems 3 2015-09-01</p>
          </>
        ),
      },
      {
        color: 'gray',
        children: (
          <>
            <p>Technical testing 1</p>
            <p>Technical testing 2</p>
            <p>Technical testing 3 2015-09-01</p>
          </>
        ),
      },
      {
        color: '#00CCFF',
        dot: <SmileOutlined />,
        children: <p>Custom color testing</p>,
      },
      {
        color: 'green',
        children: 'Sam uploaded an asset to project xyz',
      },
      {
        color: 'green',
        children: 'Sam uploaded an asset to project xyz',
      },
      {
        color: 'red',
        children: (
          <>
            <p>Solve initial network problems 1</p>
            <p>Solve initial network problems 2</p>
            <p>Solve initial network problems 3 2015-09-01</p>
          </>
        ),
      },
    ]}
  />
)

export default ProjectEvents
