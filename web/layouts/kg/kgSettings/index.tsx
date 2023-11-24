import { Kg } from '@/types/kgs'
import { Tag } from 'antd'
import { FC } from 'react'

type IKgSettings = {
  kg: Kg | undefined
}
const KgSettings: FC<IKgSettings> = ({ kg }) => {
  return kg ? (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>{kg.name}</h2>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Description:</strong>
        <p>{kg.description}</p>
      </div>
      <div>
        <strong>Tags:</strong>
        <div style={{ marginTop: 8 }}>
          {kg.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default KgSettings
