import { getUserAvatarApi } from '@/apis/users'
import { USER_IMAGES_LOCALSTORAGE_KEY } from '@/constants'
import { Avatar } from '@mantine/core'
import { useEffect, useState } from 'react'

const UserAvatar = ({
  userId,
  size = 'sm',
}: {
  userId: number
  size?: 'sm' | 'xs' | 'md' | 'lg'
}) => {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let userAvatarSrcObj: any = localStorage.getItem(
      `${USER_IMAGES_LOCALSTORAGE_KEY}_${userId}`
    )
    console.log({ userAvatarSrcObj }, Date.now())
    if (userAvatarSrcObj) userAvatarSrcObj = JSON.parse(userAvatarSrcObj)
    if (!userAvatarSrcObj || userAvatarSrcObj?.expires < Date.now()) {
      getUserAvatarApi(userId)
        .then((avatarSrc) => {
          console.log({ avatarSrc })
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

  return <Avatar size={size} src={src} />
}

export default UserAvatar
