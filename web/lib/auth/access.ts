import { prisma } from '../prisma'

// Projects
const isProjectAdmin = async (projectId: string, userId: number) => {
  const isAllowed = await prisma.projectAdmin.findFirst({
    where: {
      projectId: projectId,
      userId: userId,
    },
  })
  return isAllowed != null
}

// Knowledge Groups

const hasOwnerAccessToKg = async (kgId: string, userId: number) => {
  const isAllowed = await prisma.knowledgeGroup.findFirst({
    where: {
      id: kgId,
      UserRole: {
        some: {
          AND: [
            { userId: userId },
            {
              role: {
                equals: 'owner',
              },
            },
          ],
        },
      },
    },
  })
  return isAllowed != null
}

const hasContributorAccessToKg = async (kgId: string, userId: number) => {
  const isAllowed = await prisma.knowledgeGroup.findFirst({
    where: {
      id: kgId,
      UserRole: {
        some: {
          AND: [
            { userId: userId },
            {
              OR: [
                {
                  role: {
                    equals: 'owner',
                  },
                },
                {
                  role: {
                    equals: 'contributor',
                  },
                },
              ],
            },
          ],
        },
      },
    },
  })
  return isAllowed != null
}

const hasViewerAccessToKg = async (kgId: string, userId: number) => {
  const isAllowed = await prisma.knowledgeGroup.findFirst({
    where: {
      id: kgId,
      UserRole: {
        some: {
          userId: userId,
        },
      },
    },
  })
  return isAllowed != null
}

export {
  isProjectAdmin,
  hasContributorAccessToKg,
  hasOwnerAccessToKg,
  hasViewerAccessToKg,
}
