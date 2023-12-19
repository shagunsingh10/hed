import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { User } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export const getAllUsers = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<User[]>>
) => {
  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  res.status(200).json({
    success: true,
    data: users,
  })
}

export const getUserByEmailId = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<User>>
) => {
  const email = req.query.email as string
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  })
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    })
  }
  res.status(200).json({
    success: true,
    data: user,
  })
}

export const getUserImageSrc = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) => {
  const id = Number(req.query.id)
  const user = await prisma.user.findFirst({
    where: {
      id: id,
    },
    select: {
      image: true,
    },
  })
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    })
  }
  res.status(200).json({
    success: true,
    data: user.image as string,
  })
}
