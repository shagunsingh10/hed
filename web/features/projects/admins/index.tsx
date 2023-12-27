import {
  getProjectAdminsByIdApi,
  removeAdminFromprojectApi,
} from '@/apis/projects'
import UserAvatar from '@/components/Avatar'
import OverlayLoader from '@/components/Loader'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { User } from '@/types/users'
import { ActionIcon, Button, Group, Input, Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconSearch, IconTrash, IconUserPlus } from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import React, { useEffect, useMemo, useState } from 'react'
import AddUserForm from './addAdminForm'
import styles from './admin.module.scss'

type ProjectAdminsProps = {
  projectId: string
}

const ProjectAdmins: React.FC<ProjectAdminsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false)
  const [openAddUserForm, setOpenAddUserForm] = useState(false)
  const [deleteWarnOpen, setDeleteWarnOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number>()
  const [refresh, setRefresh] = useState<boolean>(false)
  const [filteredAdmins, setFilteredAdmins] = useState<User[]>()
  const admins = useStore((state) => state.selectedProjectAdmins)
  const setAdmins = useStore((state) => state.setSelectedProjectAdmins)

  const handleDeleteButtonClick = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteWarnOpen(true)
  }

  const handleDelete = () => {
    if (!deleteUserId) return
    setLoading(true)
    removeAdminFromprojectApi(projectId, deleteUserId)
      .then(() => {
        showNotification({
          message: 'User removed successfully',
          color: 'green',
        })
        setRefresh((prev) => !prev)
      })
      .catch((e: Error) => {
        showNotification({ message: e.message, color: 'red' })
      })
      .finally(() => {
        setDeleteWarnOpen(false)
        setLoading(false)
      })
  }

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredAdmins(
      admins.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e.email.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  const columns: any = useMemo(
    () => [
      {
        title: 'Name',
        accessor: 'name',
        render: (data: User) => (
          <div className={styles.memberTitle}>
            <UserAvatar userId={data.id} size="xs" />
            <Text>{data.name}</Text>
          </div>
        ),
      },
      {
        title: 'Email',
        accessor: 'email',
        textAlign: 'center',
        render: (data: User) => <Text>{data.email}</Text>,
      },
      {
        title: 'Action',
        accessor: '#',
        textAlign: 'center',
        render: (data: User) => (
          <ActionIcon
            size="xs"
            variant="transparent"
            onClick={() => handleDeleteButtonClick(data.id)}
          >
            <IconTrash size={15} />
          </ActionIcon>
        ),
      },
    ],
    [handleDeleteButtonClick]
  )

  useEffect(() => {
    setLoading(true)
    getProjectAdminsByIdApi(projectId)
      .then((admns) => {
        setAdmins(admns)
      })
      .catch((e: Error) => {
        showNotification({ message: e.message.toString(), color: 'red' })
      })
      .finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => setFilteredAdmins(admins), [admins])

  if (loading) return <OverlayLoader />

  return (
    <div className={styles.adminContainer}>
      <Group justify="space-between" mb="xs">
        <Input
          size="xs"
          rightSection={<IconSearch size={17} />}
          className={styles.search}
          placeholder="Search members"
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          size="xs"
          variant="outline"
          leftSection={<IconUserPlus size={17} />}
          onClick={() => setOpenAddUserForm(true)}
        >
          Add admin
        </Button>
      </Group>
      <div className={styles.adminTable}>
        <DataTable
          classNames={{
            header: styles.headerRow,
          }}
          records={filteredAdmins}
          columns={columns}
          withTableBorder
          borderRadius="sm"
          striped
          highlightOnHover
        />
      </div>
      <DeleteConfirmationModal
        message="Are you sure you want to remove the user as an admin?"
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarnOpen(false)}
        onDelete={handleDelete}
      />
      <AddUserForm
        projectId={projectId}
        open={openAddUserForm}
        onClose={() => setOpenAddUserForm(false)}
      />
    </div>
  )
}

export default ProjectAdmins
