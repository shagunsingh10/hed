import { prisma } from '../prisma'

// Projects
const hasOwnerAccessToProject = async (projectId: string, userId: number) => {
  const isAllowed = await prisma.project.findFirst({
    where: {
      id: projectId,
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

const hasContributorAccessToProject = async (
  projectId: string,
  userId: number
) => {
  const isAllowed = await prisma.project.findFirst({
    where: {
      id: projectId,
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

const hasViewerAccessToProject = async (projectId: string, userId: number) => {
  const isAllowed = await prisma.project.findFirst({
    where: {
      id: projectId,
      UserRole: {
        some: {
          userId: userId,
        },
      },
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
  hasContributorAccessToKg,
  hasContributorAccessToProject,
  hasOwnerAccessToKg,
  hasOwnerAccessToProject,
  hasViewerAccessToKg,
  hasViewerAccessToProject,
}
