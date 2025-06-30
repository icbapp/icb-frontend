'use client'
import '@tanstack/table-core';
// React Imports
import { useEffect, useState, useMemo, MouseEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

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
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance';
import Loader from '@/components/Loader'
import { tree } from 'next/dist/build/templates/app-page';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import { Dialog, DialogActions, DialogContent, FormControl, InputLabel, Menu, MenuItem, Select, Skeleton, Tooltip } from '@mui/material';
import DeleteGialog from '@/comman/deleteDialog/DeleteGialog';

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

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

type UserCount = {
  active_count: number;
  inactive_count: number;
  [key: string]: any; // add more properties if needed
};

// interface OptionMenuItemType {
//   text: string;
//   icon?: string;
//   // ...other properties...
//   onClick?: () => void; // Add this line
// }
// Styled Components
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

  useEffect(() => {
    api.get('/ms-auth-token/school-token-valide')
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
  const [totalRows, setTotalRows] = useState<UserCount>({ active_count: 0, inactive_count: 0 });
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })
  const [open, setOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [statusUser, setStatusUser] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
 const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [selectedDeleteIdStatus, setSelectedDeleteStatus] = useState<string | null>(null);

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
              <IconButton size='small' onClick={() => {setDeleteOpen(true); handleOpenDeleteDialog(row.original.id, "1")}}>
                <i className='ri-loop-left-line text-textSecondary' />
              </IconButton>
            ) : (
              // Normal Active user actions
              <>
                {hasPermission('user-management', 'user-management-edit') && (
                  <IconButton
                    size="small"
                    onClick={() => {setAddUserOpen(true); editUser(row.original.id)}}
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
                  <IconButton size='small' onClick={() => {setDeleteOpen(true); handleOpenDeleteDialog(row.original.id, "0")}}>
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
        pageIndex: paginationInfo.page,
        pageSize: paginationInfo.perPage
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

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('user-get', {
        params: {
          role_id: role,
          search: searchData,
          per_page: paginationInfo.perPage,
          page: paginationInfo.page + 1,
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
        setTotalRows(response.data) // get total from API if exists
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
    fetchUsers()
  }, [role, status, searchData, paginationInfo])

  const editUser = async (id:number) => {
    setSelectedUser(id)
    const response = await api.get('user-get', {
        params: {
          id: id || '',
        }
      })
      if(response.data.message === "User fetched successfully"){
        setEditUserData(response.data)
      }
  }

  const handleOpenDeleteDialog = (id: number,status: string) => {
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
      const response = await api.get('auth/microsoft/fetch-users/11/myschool');
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
    }else {
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
    api.post('users/status-toggle-multiple', body)
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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const opens = Boolean(anchorEl)
  
   const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
    }
  
   const handleClose = () => {
    setAnchorEl(null)
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
                    <Typography variant="h4">{totalRows.active_count}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={20} />
                ) : (
                  <Typography variant="body2">Active Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant="circular" width={62} height={62} />
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
                    <Typography variant="h4">{totalRows.inactive_count}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={20} />
                ) : (
                  <Typography variant="body2">Inactive Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant="circular" width={62} height={62} />
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
        <TableFilters role={role} setRole={setRole} status={status} setStatus={setStatus} />
        <Divider />
      <div className='p-5'>
        {loading ? (
          <div className='flex justify-end flex-wrap gap-4'>
            <Skeleton variant="rectangular" height={40} width={250} className="rounded" />
            {hasPermission('user-management', 'user-management-add') && (
              <Skeleton variant="rectangular" height={40} width={160} className="rounded" />
            )}
            {statuConnected === 1 && (
              <Skeleton variant="rectangular" height={40} width={180} className="rounded" />
            )}
            <Skeleton variant="rectangular" height={40} width={120} className="rounded" />

          </div>
        ) : (
          <div className='flex justify-end flex-wrap gap-4 items-center'>
            <DebouncedInput
              value={searchData ?? ''}
              onChange={value => setSearchData(String(value))}
              placeholder='Search User'
              className='w-full sm:w-auto'
            />

            {hasPermission('user-management', 'user-management-add') && (
              <Button
                variant='contained'
                onClick={() => {
                  setSelectedUser(null);
                  setAddUserOpen(true);
                }}
                className='w-full sm:w-auto'
              >
                Add New User
              </Button>
            )}

            {statuConnected === 1 && (
              <Tooltip title="Pull user from Microsoft Azure or Microsoft Entra" arrow>
                <Button variant='contained' onClick={SyncMicrosoftUser} className='w-full sm:w-auto'>
                  Sync with Microsoft
                </Button>
              </Tooltip>
            )}
            <div>
              <Button
                variant='contained'
                aria-haspopup='true'
                onClick={handleClick}
                aria-expanded={opens ? 'true' : undefined}
                // endIcon={<i className='ri-upload-2-line' />}
                aria-controls={opens ? 'user-view-overview-export' : undefined}
              >
                Action
              </Button>
              <Menu open={opens} anchorEl={anchorEl} onClose={handleClose} id='user-view-overview-export'  anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right', // anchor point on the button
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right', // menu aligns from its right side
                }}>
                <MenuItem onClick={() => handleStatusChange('active')}>
                  <CustomAvatar color='success' skin="light" variant="rounded" size={25}>
                    <i className={classnames('ri-user-follow-line', 'text-[16px]')} />
                  </CustomAvatar>
                  Active
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('inactive')}>
                  <CustomAvatar color='error' skin="light" variant="rounded" size={25}>
                    <i className={classnames('ri-user-line', 'text-[16px]')} />
                  </CustomAvatar>
                  Inactive
                </MenuItem>
              </Menu>
            </div>
          </div>
        )}
      </div>


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
          component='div'
          rowsPerPageOptions={[10, 25, 50]}
          className='border-bs'
          count={totalRows.active_count + totalRows.inactive_count}
          page={paginationInfo.page}
          rowsPerPage={paginationInfo.perPage}
          SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
          onPageChange={(_, page) => {
            setPaginationInfo(prev => ({
              ...prev,
              page
            }))
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            const newSize = Number(e.target.value)
            setPaginationInfo({
              page: 0,
              perPage: newSize
            })
            table.setPageSize(newSize)
            table.setPageIndex(0)
          }}
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
        <DeleteGialog open={deleteOpen} setOpen={setDeleteOpen} type={'delete-user'} onConfirm={deleteUser} selectedDeleteStatus={selectedDeleteIdStatus}/>
      )}
    </>
  )
}

export default UserListTable
