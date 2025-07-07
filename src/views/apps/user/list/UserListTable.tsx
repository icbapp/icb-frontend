'use client'
import '@tanstack/table-core';
// React Imports
import { useEffect, useState, useMemo, MouseEvent } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { toast } from 'react-toastify';
import { Dialog, DialogActions, DialogContent, Menu, MenuItem, Skeleton, Stack, Tooltip } from '@mui/material';
import DeleteGialog from '@/comman/dialog/DeleteDialog';
import ConfirmDialog from '@/comman/dialog/ConfirmDialog';
import { api } from '@/utils/axiosInstance';
import endPointApi from '@/utils/endPointApi';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UsersTypeWithAction = UsersType & {
  action?: string
  fullName: string;
  name: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {

  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const adminStore = useSelector((state: RootState) => state.admin)
  const [statuConnected, setStatusConnected] = useState(0);
  const [roleName, setRoleName] = useState<{ id: string | number; name: string }[]>([]);

  useEffect(() => {
    api.get(`${endPointApi.microsoftAuthTokenValide}`)
      .then((response) => {
        setStatusConnected(response.data.satus);
      })
  }, []);

  const hasPermission = (menuName: string, subMenuName: string) => {
    const menus = (permissions as any).menus;
    const menu = menus?.find((m: any) => m.menu_name === menuName && m.checked);
    return menu?.sub_menus?.some((sub: any) => sub.name === subMenuName && sub.checked);
  };

  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [role, setRole] = useState<UsersType['role']>('')
  const [status, setStatus] = useState<UsersType['status']>('')
  const [data, setData] = useState<UsersType[]>([])
  const [editUserData, setEditUserData] = useState<UsersType | undefined>(undefined)
  const [searchData, setSearchData] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<any>(null); // ideally type this
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0);
  const [totalUser, setTotalUser] = useState<{ active_count: number; inactive_count: number }>({
    active_count: 0,
    inactive_count: 0
  })

  // const [paginationInfo, setPaginationInfo] = useState({
  //   page: 0,
  //   perPage: 10
  // })

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage); // pageIndex will trigger useEffect to fetch
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const [open, setOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [statusUser, setStatusUser] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [selectedDeleteIdStatus, setSelectedDeleteStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      // Alt + A to toggle select all visible
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()

        const allVisibleIds = table.getFilteredRowModel().rows.map(row => row.original.id)
        const allSelected = allVisibleIds.every(id => selectedUserIds.includes(id))

        setSelectedUserIds(prev => {
          return allSelected
            ? prev.filter(id => !allVisibleIds.includes(id)) // unselect visible
            : Array.from(new Set([...prev, ...allVisibleIds])) // select visible
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedUserIds])
  
  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          const allVisibleIds = table.getFilteredRowModel().rows.map(row => row.original.id);
          const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedUserIds.includes(id));
          const someSelected = allVisibleIds.some(id => selectedUserIds.includes(id));

          return (
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectedUserIds(prev =>
                  checked
                    ? Array.from(new Set([...prev, ...allVisibleIds]))
                    : prev.filter((id: any) => !allVisibleIds.includes(id))
                );
              }}
            />
          );
        },
        cell: ({ row }) => {
          const id = row.original.id;
          const isChecked = selectedUserIds.includes(id);

          return (
            <Checkbox
              checked={isChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectedUserIds(prev => {
                  if (checked) {
                    return Array.from(new Set([...prev, id])); // prevent duplicates
                  } else {
                    return prev.filter(_id => _id !== id);
                  }
                });
              }}
            />
          );
        }
      },
      columnHelper.accessor('fullName', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.image, fullName: row.original.fullName })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.fullName}
              </Typography>
              <Typography variant='body2'>{row.original.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => {
          const roleData = row.original.role;

          const roles = Array.isArray(roleData) ? roleData : [];

          return (
            <div className='flex items-center gap-2'>
              {/* <Icon
              className={classnames('text-[22px]', userRoleObj[row.original.role].icon)}
              sx={{ color: `var(--mui-palette-${userRoleObj[row.original.role].color}-main)` }}
            /> */}
              <i className="ri-user-3-line mui-qsdg36"></i>
              {roles.length === 0 ? (
                <Typography className='capitalize' color='text.primary'>
                  {typeof roleData === 'string' ? roleData : '-'}
                </Typography>
              ) : (
                roles.map((user_role: { name: string }, index: number) => (
                  <Typography key={index} className='capitalize' color='text.primary'>
                    {user_role.name.toLowerCase()}
                    {index < roles.length - 1 && ','}
                  </Typography>
                ))
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              sx={{ fontWeight: 'bold' }}
              label={row.original.status}
              size='small'
              color={row.original.status === 'inactive' ? 'error' : userStatusObj[row.original.status]}
              className='capitalize'
            />
          </div>
        )
      })
      ,
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            {row.original.status === 'inactive' ? (
              // Show Restore button
              <IconButton size='small' onClick={() => { setDeleteOpen(true); handleOpenDeleteDialog(row.original.id, "1") }}>
                <i className='ri-loop-left-line text-textSecondary' />
              </IconButton>
            ) : (
              // Normal Active user actions
              <>
                {hasPermission('user-management', 'user-management-edit') && (
                  <IconButton
                    size="small"
                    onClick={() => { setAddUserOpen(true); editUser(row.original.id) }}
                  >
                    {/* <Link
                      href={{
                        pathname: getLocalizedUrl('/pages/account-setting-data', locale as Locale),
                      }}
                      className="flex"
                    > */}
                    <i className="ri-edit-box-line text-textSecondary" />
                    {/* </Link> */}
                  </IconButton>
                )}

                {hasPermission('user-management', 'user-management-delete') && (
                  <IconButton size='small' onClick={() => { setDeleteOpen(true); handleOpenDeleteDialog(row.original.id, "0") }}>
                    <i className='ri-delete-bin-7-line text-textSecondary' />
                  </IconButton>
                )}
              </>
            )}
          </div>
        ),
        enableSorting: false
      })

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, permissions, selectedUserIds]
  )

  const table = useReactTable({
    data: data as UsersType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchData,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage
      }
    },
    manualPagination: true,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchData,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (row) => row.id
  })

  const getAvatar = (params: Pick<UsersType, 'avatar' | 'fullName'>) => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName as string)}
        </CustomAvatar>
      )
    }
  }

  const fetchUsers = async (pageIndex = 0, perPage = 10) => {
    try {
      setLoading(true)
      const response = await api.get(`${endPointApi.getUser}`, {
        params: {
          role_id: role,
          search: searchData,
          per_page: perPage,
          page: pageIndex + 1,
          status: status || '',
          id: '',
        }
      })
      const users = response.data.users.data.map((user: {
        id: number;
        full_name: string;
        name: string;
        email: string;
        username: string;
        roles: { name: string }[];
        status: number;
        image: string;
        phone: string
      }) => ({
        id: user.id,
        fullName: user.full_name ?? '',
        name: user.name ?? '',
        email: user.email ?? '',
        username: user.username ?? '',
        role: user.roles ?? [],
        status: user.status === 1 ? 'active' : 'inactive',
        phone: user.phone,
        currentPlan: 'enterprise'
      }))

      setTotalRows(response.data.users.total)
      setTotalUser(response.data)
      setData(users)

      if (response.data.message === "Data not found for this User") {
        toast.error("Data not found for this User")
        setData([])
      }

    } catch (err: any) {
      // toast.error("error")
      return null
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page, rowsPerPage)
  }, [role, status, searchData, page, rowsPerPage])

  const editUser = async (id: number) => {
    setSelectedUser(id)
    const response = await api.get(`${endPointApi.getUser}`, {
      params: {
        id: id || '',
      }
    })
    if (response.data.message === "User fetched successfully") {
      setEditUserData(response.data)
    }
  }

  const handleOpenDeleteDialog = (id: number, status: string) => {
    setSelectedDeleteId(id);
    setSelectedDeleteStatus(status)
  };

  const deleteUser = async () => {
    try {
      const formdata = new FormData();
      formdata.append('user_id', selectedDeleteId?.toString() ?? '');
      formdata.append('school_id', adminStore?.school_id?.toString() ?? '');
      formdata.append('tenant_id', adminStore?.tenant_id?.toString() ?? '');
      formdata.append('status', selectedDeleteIdStatus ?? '');

      const response = await api.post('user-status-update', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.status === 200) {
        fetchUsers(); // refresh the list after update
        setSelectedUserIds([])
      }

    } catch (error: any) {
      return null
    } finally {
      setSelectedUserIds([]);
      setStatusUser('');
    }
  };

  const SyncMicrosoftUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${endPointApi.microsoftFetchUsers}/${adminStore?.school_id?.toString()}/${adminStore?.tenant_id?.toString()}`);
      if (response.data.status === 200) {
        toast.success("Users synced successfully");
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while syncing users");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (value: 'active' | 'inactive') => {
    setStatusUser(value); // Update UI dropdown
    if (selectedUserIds.length === 0) {
      toast.warning("Please select at least one user.");
      setStatusUser('')
    } else {
      setOpen(true)
    }
  };

  const handleConfirmation = () => {
    const statusCode = statusUser === 'active' ? 1 : 0;
    const body = {
      user_ids: selectedUserIds,
      school_id: adminStore?.school_id?.toString() ?? '',
      tenant_id: adminStore?.tenant_id?.toString() ?? '',
      status: statusCode ?? ''
    };
    api.post(`${endPointApi.postMultipleStatusChange}`, body)
      .then((response) => {
        if (response.data.status === 200) {
          setOpen(false);
          toast.success(statusUser === 'active' ? "Users activated successfully" : "Users deactivated successfully");
          fetchUsers();
          setSelectedUserIds([]);
          setStatusUser('')
        }
      })
      .catch((error) => {
        setOpen(false);
        toast.error(error.response?.data?.message || "An error occurred while updating users");
        setStatusUser('')
      });
  };

  const handleOpenMultipleRoleDialog = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("Please select at least one user.");
      setRoleName([])
      return
    } else {
      setRoleConfirmOpen(true)
    }

  };
  const multipleRoleChange = async () => {
    const selectedRole = roleName.map((role: { id: string | number; name: string }) => role.id);
    try {
      const body = {
        user_ids: selectedUserIds,
        roles_ids: selectedRole,
        school_id: adminStore?.school_id?.toString() ?? '',
        tenant_id: adminStore?.tenant_id?.toString() ?? ''
      }

      const response = await api.post(`${endPointApi.postMultipleRoleChange}`, body);

      if (response.data?.status === 200) {
        fetchUsers(); // refresh the list after update
        setSelectedUserIds([])
        setRoleName([])
        setRoleConfirmOpen(false)

        toast.success("Roles updated successfully!")
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message);
      return null
    }
  }
  return (
    <>
      {/* {loading && <Loader />} */}
      <Grid container spacing={6} sx={{ mt: 0, mb: 5 }}>
        {/* Active Users */}
        <Grid item xs={12} sm={12} md={6} lg={6} className='pt-0'>
          <Card>
            <CardContent className="flex justify-between gap-1 items-center">
              <div className="flex flex-col gap-1 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4">{totalUser.active_count}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={15} />
                ) : (
                  <Typography variant="body2">Active Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant="rectangular" sx={{ borderRadius: '12px' }}  width={62} height={62} />
              ) : (
                <CustomAvatar color='success' skin="light" variant="rounded" size={62}>
                  <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
                </CustomAvatar>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Users */}
        <Grid item xs={12} sm={12} md={6} lg={6} className='pt-0'>
          <Card>
            <CardContent className="flex justify-between gap-1 items-center">
              <div className="flex flex-col gap-1 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4">{totalUser.inactive_count}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={20} />
                ) : (
                  <Typography variant="body2">Inactive Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant="rectangular" sx={{ borderRadius: '12px' }} width={62} height={62} />
              ) : (
                <CustomAvatar color='error' skin="light" variant="rounded" size={62}>
                  <i className={classnames('ri-user-line', 'text-[26px]')} />
                </CustomAvatar>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        {/* <CardHeader title='Filters' className='pbe-4' /> */}
        <TableFilters
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
          handleOpenMultipleRoleDialog={() => handleOpenMultipleRoleDialog()}
          selectedUserIds={selectedUserIds}
          roleName={roleName}
          setRoleName={setRoleName}
        />
        <Divider />
        <>
          <div className="p-5">
            <div className="flex flex-wrap justify-between items-center gap-4">
              {/* Left side: Selected count */}
              {selectedUserIds.length > 0 && (
                <Typography variant="body2" className='font-bold'>
                  {selectedUserIds.length} users selected
                </Typography>
              )}

              {/* Right side: Search, Add User, Menu */}
              {loading ? (
                <div className="flex justify-end flex-wrap gap-4 ml-auto">
                  <Skeleton variant="rectangular" height={40} width={250} className="rounded" />
                  {hasPermission('user-management', 'user-management-add') && (
                    <Skeleton variant="rectangular" height={40} width={160} className="rounded" />
                  )}
                  <Stack spacing={0.5} alignItems="center" justifyContent="center" height={40}>
                    <Skeleton variant="circular" width={6} height={6} />
                    <Skeleton variant="circular" width={6} height={6} />
                    <Skeleton variant="circular" width={6} height={6} />
                  </Stack>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 items-center ml-auto">
                  <DebouncedInput
                    value={searchData ?? ''}
                    onChange={(value) => setSearchData(String(value))}
                    placeholder="Search User"
                    className="w-full sm:w-auto"
                  />

                  {hasPermission('user-management', 'user-management-add') && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setSelectedUser(null)
                        setAddUserOpen(true)
                      }}
                      className="w-full sm:w-auto"
                      startIcon={<i className="ri-add-line" />}
                    >
                      Add User
                    </Button>
                  )}

                  <CardHeader
                    sx={{ p: 0 }}
                    action={
                      <StatusOptionMenu
                        onChange={handleStatusChange}
                        onSync={SyncMicrosoftUser}
                        statuConnected={statuConnected}
                      />
                    }
                  />
                </div>
              )}
            </div>
          </div>

        </>
        {loading ? (
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(5)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant="text" height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(5)].map((_, colIndex) => (
                      <td key={colIndex}>
                        <Skeleton variant="text" height={50} width="100%" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Your real table goes here when loading = false
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='ri-arrow-up-s-line text-xl' />,
                                desc: <i className='ri-arrow-down-s-line text-xl' />
                              }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
        )}
        <TablePagination
          component="div"
          count={totalRows} // total: 14
          page={page} // 0-based index
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(false)}
        editUserData={editUserData}
        fetchUsers={fetchUsers}
        selectedUser={selectedUser}
      />

      {open && (
        <>
          <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
            <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
              <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
              <Typography variant='h4'>
                Are you sure {statusUser === 'active' ? 'Activate' : 'Inactivate'} user?
              </Typography>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
              <Button variant='contained' onClick={handleConfirmation}>
                Yes, {statusUser === 'active' ? 'Activate' : 'Inactivate'} User!
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  setOpen(false)
                  setSelectedUserIds([]);
                  setStatusUser('')
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {deleteOpen && (
        <DeleteGialog open={deleteOpen} setOpen={setDeleteOpen} type={'delete-user'} onConfirm={deleteUser} selectedDeleteStatus={selectedDeleteIdStatus} />
      )}
      {roleConfirmOpen && (
        <ConfirmDialog
          open={roleConfirmOpen}
          setOpen={setRoleConfirmOpen}
          type={'role-change'}
          onConfirm={multipleRoleChange}
          setRoleName={setRoleName}
          setSelectedUserIds={setSelectedUserIds}
        />
      )}
    </>
  )
}

export default UserListTable

interface StatusOptionMenuProps {
  onChange?: (status: 'active' | 'inactive') => void
  onSync?: () => void
  statuConnected: Number
}

const StatusOptionMenu: React.FC<StatusOptionMenuProps> = ({ onChange, onSync, statuConnected }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleStatusChange = (status: 'active' | 'inactive') => {
    if (onChange) onChange(status)
    handleClose()
  }

  const handleSync = () => {
    if (onSync) onSync()
    handleClose()
  }

  return (
    <>
      <Tooltip title="Action">
        <IconButton
          aria-label='more'
          aria-controls={open ? 'status-options-menu' : undefined}
          aria-haspopup='true'
          onClick={handleClick}
        >
          <i className='ri-more-2-fill text-xl' />
        </IconButton>
      </Tooltip>
      <Menu
        id='status-options-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleStatusChange('active')}>
          <CustomAvatar color='success' skin='light' variant='rounded' size={25}>
            <i className={classnames('ri-user-follow-line', 'text-[16px]')} />
          </CustomAvatar>
          Active
        </MenuItem>

        <MenuItem onClick={() => handleStatusChange('inactive')}>
          <CustomAvatar color='error' skin='light' variant='rounded' size={25}>
            <i className={classnames('ri-user-line', 'text-[16px]')} />
          </CustomAvatar>
          Inactive
        </MenuItem>

        {statuConnected === 1 && (
          <MenuItem onClick={handleSync}>
            <CustomAvatar skin='light' variant='rounded' size={25}>
              <img src='/images/logos/Microsoft-Icon.png' alt='Microsoft' className='w-[17px] h-[17px]' />
            </CustomAvatar>
            Sync With Microsoft
          </MenuItem>
        )}
      </Menu>

    </>
  )
}
