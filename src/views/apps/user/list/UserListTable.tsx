'use client'
import '@tanstack/table-core';
// React Imports
import { useEffect, useState, useMemo } from 'react'

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
import { Tooltip } from '@mui/material';

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

interface UserDataPermission {
  menus: {
    menu_name: string;
    checked: boolean;
  }[];
  // other properties...
}

type UserCount = {
  active_count: number;
  inactive_count: number;
  [key: string]: any; // add more properties if needed
};

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

// Vars
const userRoleObj: UserRoleType = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
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
  const [searchData, setSearchData] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<any>(null); // ideally type this
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState<UserCount>({ active_count: 0, inactive_count: 0 });
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
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
              <IconButton size='small' onClick={() => deleteUser(row.original.id, "1")}>
                <i className='ri-loop-left-line text-textSecondary' />
              </IconButton>
            ) : (
              // Normal Active user actions
              <>
                {hasPermission('user-management', 'user-management-edit') && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      localStorage.setItem("selectedUser", JSON.stringify(row.original));
                      setSelectedUser(row.original.id);
                    }}
                  >
                    <Link
                      href={{
                        pathname: getLocalizedUrl('/pages/account-setting-data', locale as Locale),
                      }}
                      className="flex"
                    >
                      <i className="ri-edit-box-line text-textSecondary" />
                    </Link>
                  </IconButton>
                )}

                {hasPermission('user-management', 'user-management-delete') && (
                  <IconButton size='small' onClick={() => deleteUser(row.original.id, "0")}>
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
    [data, permissions]
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
    getFacetedMinMaxValues: getFacetedMinMaxValues()
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

  useEffect(() => {
    fetchUsers()
  }, [role, status, searchData, paginationInfo])

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
      if (response.data.message === "Data not found for this User") {
        toast.error("Data not found for this User")
        setData([])
      }

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
        avatar: '',
        avatarColor: 'primary',
        image: user.image,
        phone: user.phone,
        // ✅ Add all required fields from UsersType
        company: 'N/A',
        country: 'N/A',
        currentPlan: 'enterprise'
      }))

      setTotalRows(response.data) // get total from API if exists
      setData(users)


    } catch (err: any) {
      // toast.error("error")
      return null
    }
    finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number, status: string) => {

    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this user?",
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          visible: true,
          closeModal: true,
        },
        confirm: {
          text: "Yes",
          closeModal: false, // keep popup open until API finishes
        },
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          setLoading(true);

          const formdata = new FormData();
          formdata.append('user_id', id.toString());
          formdata.append('school_id', adminStore?.school_id?.toString() ?? '');
          formdata.append('tenant_id', adminStore?.tenant_id?.toString() ?? '');
          formdata.append('status', status); // use the passed status here

          const response = await api.post('user-status-update', formdata, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (response.data?.status === 200) {
            fetchUsers(); // refresh the list after update
          }

        } catch (error: any) {
          return null
        } finally {
          if (swal && typeof swal.close === 'function') {
            swal.close(); // Close the popup manually
          }

          setLoading(false);
          fetchUsers()
        }
      } else {
        console.log("User canceled.");
      }
    });
  };

  const SyncMicrosoftUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('auth/microsoft/fetch-users/11/myschool');
      // auth/microsoft/fetch-users/{schoolId}/{tenantId}
      console.log("response********", response);
      if (response.data.message === "Users synced successfully.") {
        toast.success("Users synced successfully");
      //    setTotalRows(response.data) // get total from API if exists
      // setData(users)
        fetchUsers();
      } 
    } catch (error: any) {
      toast.error(error.message || "An error occurred while syncing users");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {loading && <Loader />}

      <Grid container spacing={6} className='my-5'>
        <Grid item xs={12} sm={12} md={6} lg={6} component="div">
          <Card>
            <CardContent className="flex justify-between gap-1 items-center">
              <div className="flex flex-col gap-1 flex-grow">
                <Typography color="text.primary">Active Users</Typography>
                <div className="flex items-center gap-2 flex-wrap">
                  <Typography variant="h4">{totalRows.active_count}</Typography>
                  <Typography
                    color='success.main'
                  >
                    {/* {`${item.trend === 'negative' ? '-' : '+'}${item.trendNumber}`} */}
                  </Typography>
                </div>
                <Typography variant="body2">total active user</Typography>
              </div>
              <CustomAvatar color='success' skin="light" variant="rounded" size={62}>
                <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} component="div">
          <Card>
            <CardContent className="flex justify-between gap-1 items-center">
              <div className="flex flex-col gap-1 flex-grow">
                <Typography color="text.primary">Inactive Users</Typography>
                <div className="flex items-center gap-2 flex-wrap">
                  <Typography variant="h4">{totalRows.inactive_count}</Typography>
                  <Typography
                    color='success.main'
                  >
                    {/* {`${item.trend === 'negative' ? '-' : '+'}${item.trendNumber}`} */}
                  </Typography>
                </div>
                <Typography variant="body2">total inactive user</Typography>
              </div>
              <CustomAvatar color='error' skin="light" variant="rounded" size={62}>
                <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>

      </Grid>


      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters role={role} setRole={setRole} status={status} setStatus={setStatus} />
        <Divider />
        <div className='flex  gap-4 p-5 flex-col items-start sm:flex-row sm:items-center justify-end'>

          <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
            <DebouncedInput
              value={searchData ?? ''}
              onChange={value => setSearchData(String(value))}
              placeholder='Search User'
              className='max-sm:is-full'
            />
            {hasPermission('user-management', 'user-management-add') && (
              <Button variant='contained' onClick={() => { setSelectedUser(null); setAddUserOpen(!addUserOpen); }} className='max-sm:is-full'>
                Add New User
              </Button>
            )}
            {statuConnected === 1 && 
              <Tooltip title="Pull user from microsoft azure or microsoft entra" arrow>
                <Button variant='contained' className='max-sm:is-full' onClick={() =>SyncMicrosoftUser()}>
                  Sync with Microsoft
                </Button>
              </Tooltip>
}
          </div>
        </div>
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
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
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
        handleClose={() => setAddUserOpen(!addUserOpen)}
        userData={data}
        user={selectedUser}
        setData={setData}
        fetchUsers={fetchUsers}
      />
    </>
  )
}

export default UserListTable
