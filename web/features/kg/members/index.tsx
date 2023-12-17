import { getKgMemebersApi, removeUserFromKgApi } from '@/apis/kgs'
import UserAvatar from '@/components/Avatar'
import OverlayLoader from '@/components/Loader'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { KgMember } from '@/types/kgs'
import { User } from '@/types/users'
import { ActionIcon, Badge, Button, Group, Input, Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconSearch, IconTrash, IconUserPlus } from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import React, { FC, useEffect, useMemo, useState } from 'react'
import AddUserForm from './addUserForm'
import styles from './users.module.scss'

type KgUsersProps = {
  kgId: string
}

const colorMap: any = {
  owner: 'orange',
  contributor: 'violet',
  viewer: 'blue',
}

const KgUsers: FC<KgUsersProps> = ({ kgId }) => {
  const [kgMembers, setKgMembers] = useState<KgMember[]>([])
  const [filteredKgMembers, setFilteredKgMembers] = useState<KgMember[]>([])
  const [openAddUserForm, setOpenAddUserForm] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [refresh, setRefresh] = useState(false)
  const [deleteWarnOpen, setDeleteWarnOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number>()

  const handleDelete = async () => {
    if (!deleteUserId) return
    setLoading(true)
    removeUserFromKgApi(kgId, deleteUserId)
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
        setLoading(false)
        setDeleteWarnOpen(false)
      })
  }

  const handleDeleteButtonClick = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteWarnOpen(true)
  }

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredKgMembers(
      kgMembers.filter(
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
        title: 'Role',
        accessor: 'role',
        textAlign: 'center',
        render: (data: any) => (
          <Badge variant="light" color={colorMap[data.role]}>
            {data?.role}
          </Badge>
        ),
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
    getKgMemebersApi(kgId)
      .then((data) => {
        setKgMembers(data)
      })
      .finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => setFilteredKgMembers(kgMembers), [kgMembers])

  if (loading) return <OverlayLoader />

  return (
    <div className={styles.kgMembersContainer}>
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
          leftSection={<IconUserPlus size={17} />}
          onClick={() => setOpenAddUserForm(true)}
        >
          Add Member
        </Button>
      </Group>
      <div className={styles.membersTable}>
        <DataTable
          classNames={{
            header: styles.headerRow,
          }}
          records={filteredKgMembers}
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
        kgId={kgId}
        open={openAddUserForm}
        onClose={() => setOpenAddUserForm(false)}
      />
    </div>
  )
}

export default KgUsers
