'use client'

import '@tanstack/table-core'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Checkbox,
  IconButton,
  TablePagination
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
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
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import api from '@/utils/axiosInstance'
import tableStyles from '@core/styles/table.module.css'
import { useSettings } from '@core/hooks/useSettings'
import { RoleType } from '@/types/apps/roleType'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface SubMenus {
  id: number;
  name: string;
}

interface Permissions {
  menu_id: number;
  menu_name: string;
  sub_menus: SubMenus[]
}



type UsersTypeWithAction = RoleType & { action?: string }
type UserRoleType = { [key: string]: { icon: string; color: string } }
type UserStatusType = { [key: string]: ThemeColor }
type RawUser = {
  id: number
  name: string

  username: string
  roles: { name: string }[]
  status: number
  permissions: Permissions[]
}


const Icon = styled('i')({})
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => { setValue(initialValue) }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

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

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const RolesTable = () => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  console.log("permissions===", permissions);

  const [role, setRole] = useState<UsersType['role']>('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<RoleType[]>([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { lang: locale } = useParams()

  const hasPermission = (menuName: string, subMenuName: string) => {
    const menus = (permissions as any).menus;
    const menu = menus?.find((m: any) => m.menu_name === menuName && m.checked);
    return menu?.sub_menus?.some((sub: any) => sub.name === subMenuName && sub.checked);
  };

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    // Optional: Clear timeout on unmount
    return () => clearTimeout(timeout)
  }, [])

  const handleDeleteRole = async (roleId: number) => {
    try {
      setLoading(true)

      const response = await api.delete(`roles-destroy/${roleId}`)
      if (response.data.success === true) {
        setData(data.filter(user => Number(user.id) !== roleId))
        setFilteredData(filteredData.filter(user => Number(user.id) !== roleId))
        toast.success(response.data.message)
      }


    } catch (error: any) {

      toast.error(error?.response?.data?.message || 'Failed to delete role')

      console.error('Error deleting role:', error)
      // alert(error.response.data.message || error)
    }
    finally {
      setLoading(false)
    }
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(() => [
    // {
    //   id: 'select',
    //   header: ({ table }) => (
    //     <Checkbox {...{
    //       checked: table.getIsAllRowsSelected(),
    //       indeterminate: table.getIsSomeRowsSelected(),
    //       onChange: table.getToggleAllRowsSelectedHandler()
    //     }} />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox {...{
    //       checked: row.getIsSelected(),
    //       disabled: !row.getCanSelect(),
    //       indeterminate: row.getIsSomeSelected(),
    //       onChange: row.getToggleSelectedHandler()
    //     }} />
    //   )
    // },

    columnHelper.accessor('title', {
      header: 'Role Name',
      cell: ({ row }) => (
        <div className='flex flex-col gap-1'>

          {row.original.title ? (
            <Typography variant='body2' color='text.primary' className='font-medium'>{row.original.title}</Typography>
          ) : (
            <Typography variant='body2' color='text.secondary'>No Name</Typography>
          )}
        </div>
      )
    }),

    // columnHelper.accessor('permissions', {
    //   header: 'Permissions',
    //   cell: ({ row }) => (
    //     <div className='flex flex-row gap-1'>
    //       {row.original.permissions.length > 0 ? (
    //         row.original.permissions.map((perm: Permissions, index: number) => (
    //           <div key={index} className='flex items-center gap-2'>
    //             <Typography variant='body2' color='text.primary' className='font-medium'>{perm.menu_name}{index < row.original.permissions.length - 1 && ','}</Typography>
    //             {/* {perm.sub_menus.length > 0 && (
    //               <Chip
    //                 label={`${perm.sub_menus.length} sub-menus`}
    //                 size='small'
    //                 color='primary'
    //                 variant='outlined'
    //               />
    //             )} */}
    //           </div>
    //         ))
    //       ) : (
    //         <Typography variant='body2' color='text.secondary'>No permissions</Typography>
    //       )}
    //     </div>
    //   )
    // }),

    columnHelper.accessor('action', {
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-0.5'>
          {/* {row.original.title?.toLowerCase() !== 'super admin' && ( */}
          <>
            {hasPermission('user-management', 'user-management-delete') && (
              <IconButton size='small' onClick={() => {
                handleDeleteRole(Number(row.original.id))
              }}>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            )}

            {hasPermission('user-management', 'user-management-edit') && (
              <IconButton size='small' onClick={() => {
                localStorage.setItem('editRoleData', JSON.stringify(row.original))
                router.replace(getLocalizedUrl('/apps/roles/add-role', locale as Locale))
              }}>
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            )}
          </>
          {/* )} */}
        </div>
      )

    })
  ], [data, filteredData, permissions])

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = ({ avatar, fullName }: Pick<UsersType, 'avatar' | 'fullName'>) =>
    avatar ? <CustomAvatar src={avatar} size={34} /> : <CustomAvatar>{getInitials(fullName)}</CustomAvatar>



  useEffect(() => {
    const fetchUsers = async () => {

      try {
        setLoading(true)

        const response = await api.get('roles')
        const users = response.data.data.map((user: {
          id: number;
          name: string;
          permissions: Permissions[];
          roles: { name: string }[];
        }) => ({
          id: user.id,
          title: user.name ?? 'No Title',
          permissions: user.permissions ?? [],
          role: user.roles?.[0]?.name ?? '',   // 🟢 ADD THIS LINE
          company: 'N/A',
          country: 'N/A',
          contact: '',
          currentPlan: 'enterprise'
        }))


        const uniqueRoles: string[] = Array.from(
          new Set(
            users.map((user: { role: any }) => user.role).filter((role: string | any[]): role is string => typeof role === 'string' && role.length > 0)
          )
        )
        setAvailableRoles(uniqueRoles)
        setData(users)
        setFilteredData(users)
      } catch (err) {
        console.error('Error fetching users:', err)
      }
      finally {
        setLoading(false)

      }
    }
    fetchUsers()
  }, [])



  return (
    <Card>
      {loading && <Loader />}

      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
        {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />} className='max-sm:is-full'>Export</Button> */}
        <div className='flex flex-col !items-start max-sm:is-full sm:flex-row sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='max-sm:is-full min-is-[220px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
          />
          <FormControl size='small' className='max-sm:is-full'>
            <InputLabel id='roles-app-role-select-label'>Select Role</InputLabel>
            <Select
              value={role}
              onChange={e => setRole(e.target.value)}
              label='Select Role'
              id='roles-app-role-select'
              labelId='roles-app-role-select-label'
              className='min-is-[150px]'
            >
              <MenuItem value=''>All Roles</MenuItem>
              {availableRoles.map(role => (
                <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
              ))}
            </Select>

          </FormControl>

        </div>
        {hasPermission('user-management', 'user-management-add') && (
          <Button
            variant='contained'
            size='medium'
            onClick={() => {
              localStorage.removeItem('editRoleData');
              router.replace(getLocalizedUrl('/apps/roles/add-role', locale as Locale))
            }}
          >
            Add Role
          </Button>
        )}
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {!header.isPlaceholder && (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: <i className='ri-arrow-up-s-line text-xl' />, desc: <i className='ri-arrow-down-s-line text-xl' /> }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tr><td colSpan={table.getVisibleFlatColumns().length} className='text-center'>No data available</td></tr>
            ) : (
              table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default RolesTable
