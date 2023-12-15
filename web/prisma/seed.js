/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedData() {
  try {
    const data = [
      { key: 'files', name: 'Files', isActive: true },
      { key: 'github', name: 'Github', isActive: true },
      // { key: 'gsheets', name: 'Gsheets', isActive: true },
      // { key: 'gdocs', name: 'Gdocs', isActive: true },
      // { key: 'jira', name: 'Jira', isActive: true },
      // { key: 'confluence', name: 'Confluence', isActive: true },
    ]

    await prisma.assetType.createMany({
      data: data,
      skipDuplicates: true,
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
