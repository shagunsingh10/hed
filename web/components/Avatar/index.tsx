import { getUserAvatarApi } from '@/apis/users'
import { USER_IMAGES_LOCALSTORAGE_KEY } from '@/constants'
import { Avatar } from 'antd'
import { useEffect, useState } from 'react'

const UserAvatar = ({
  userId,
  size = 'small',
}: {
  userId: number
  size?: 'small' | 'default' | 'large'
}) => {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let userAvatarSrcObj: any = localStorage.getItem(
      `${USER_IMAGES_LOCALSTORAGE_KEY}_${userId}`
    )
    if (userAvatarSrcObj) userAvatarSrcObj = JSON.parse(userAvatarSrcObj)
    if (!userAvatarSrcObj || userAvatarSrcObj?.expires > Date.now()) {
      getUserAvatarApi(userId)
        .then((avatarSrc) => {
          setSrc(avatarSrc)
          localStorage.setItem(
            `${USER_IMAGES_LOCALSTORAGE_KEY}_${userId}`,
            JSON.stringify({
              imgSrc: avatarSrc,
              expires: Date.now() + 60 * 60 * 1000,
            })
          )
        })
        .catch((e) => console.log(e))
    } else {
      setSrc(userAvatarSrcObj.imgSrc)
    }
  }, [])

  console.log({ src })
  return (
    <Avatar size={size} src={<img src={src} referrerPolicy="no-referrer" />} />
  )
}

export default UserAvatar
