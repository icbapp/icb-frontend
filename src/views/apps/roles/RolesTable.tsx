'use client'

import '@tanstack/table-core'
import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import swal from 'sweetalert';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  IconButton,
  TablePagination,
  Skeleton
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
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import { api } from '@/utils/axiosInstance'
import tableStyles from '@core/styles/table.module.css'
import { useSettings } from '@core/hooks/useSettings'
import { RoleType } from '@/types/apps/roleType'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'
import { RootState } from '@/redux-store'
import { saveToken } from '@/utils/tokenManager'
import { useSelector } from 'react-redux'

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

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const RolesTable = () => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const loginStore = useSelector((state: RootState) => state.login);
  const userPermissionStore = useSelector((state: RootState) => state.userPermission);

  const searchParams = useSearchParams()

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
  const hasRefreshedToken = useRef(false);
  const hasPermission = (menuName: string, subMenuName: string) => {
    const menus = (permissions as any).menus;
    const menu = menus?.find((m: any) => m.menu_name === menuName && m.checked);
    return menu?.sub_menus?.some((sub: any) => sub.name === subMenuName && sub.checked);
  };

  const showAddRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-add' && sub.checked)
  );

  const showEditRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-edit' && sub.checked)
  );
  const showDeleteRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-delete' && sub.checked)
  );

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
    columnHelper.accessor('title', {
      header: 'User Count',
      cell: ({ row }) => {
        const count = row.original.user_count;

        if (count === 0) return null;

        const maxVisible = 3; // Show max 3 avatars
        const visibleCount = Math.min(count, maxVisible);
        const extraCount = count - visibleCount;

        return (
          <div className="flex items-center">
            {Array.from({ length: visibleCount }).map((_, i) => (
              <img
                key={i}
                alt={`User ${i + 1}`}
                src={`/images/avatars/${i + 1}.png`}
                className={`w-8 h-8 rounded-full border-2 border-white ${i > 0 ? '-ml-2' : ''}`}
              />
            ))}
            {extraCount > 0 && (
              <div className="-ml-2 w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center border-2 border-white">
                +{extraCount}
              </div>
            )}
          </div>
        );
      }

    }),

    columnHelper.accessor('action', {
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-0.5'>
          {showEditRoleButton &&
            <IconButton
              size='small'
              disabled={['Super Admin', 'default', 'Default'].includes(row.original.title)}
              onClick={() => {
                localStorage.setItem('editRoleData', JSON.stringify(row.original));;
                const redirectURL = searchParams.get('redirectTo') ?? `/apps/roles/add-role?role_id=${encodeURIComponent(row.original.id)}`
                router.replace(getLocalizedUrl(redirectURL, locale as Locale))
              }}
            >
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
          }

          {showDeleteRoleButton && (
            <IconButton size='small'
              disabled={['super admin', 'default'].includes(row.original.title?.toLowerCase())}
              onClick={() => handleDeleteRole(row.original.id, 0)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
          )}
        </div>
      )

    })
  ], [data, filteredData, userPermissionStore])

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

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('roles')

      const users = response.data.data.map((user: {
        id: number;
        name: string;
        permissions: Permissions[];
        roles: { name: string }[];
        user_count: number;
      }) => ({
        id: user.id,
        title: user.name ?? 'No Title',
        permissions: user.permissions ?? [],
        role: user.roles?.[0]?.name ?? '',   // 🟢 ADD THIS LINE
        company: 'N/A',
        country: 'N/A',
        contact: '',
        currentPlan: 'enterprise',
        user_count: user.user_count ?? 0,
      }))

      const uniqueRoles: string[] = Array.from(
        new Set(
          users.map((user: { role: any }) => user.role).filter((role: string | any[]): role is string => typeof role === 'string' && role.length > 0)
        )
      )
      setAvailableRoles(uniqueRoles)
      setData(users)
      setFilteredData(users)
      setLoading(false)

      if (response.data.status === 200 && !hasRefreshedToken.current) {
        hasRefreshedToken.current = true;
        try {
          const res = await api.post('auth/refresh');
          saveToken(res.data.access_token);
        } catch (err) {
          console.error('Token refresh error:', err);
        }
      }

    } catch (err) {
      console.error('Error fetching users:', err)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteRole = async (roleId: number, status: boolean) => {
    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this role?",
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
          const body = {
            role_id: roleId,
            tenant_id: loginStore.tenant_id,
            school_id: loginStore.school_id,
            status: status
          }
          const response = await api.post(`roles-status-update`, body);

          if (response.data.status == 200) {
            setData(prev => prev.filter(user => Number(user.id) !== roleId));
            setFilteredData(prev => prev.filter(user => Number(user.id) !== roleId));
            toast.success(response.data.message);
            fetchUsers()
          }
          else {
            toast.error(response.data.message);
          }
          setLoading(false);

        } catch (error: any) {
          toast.error(error?.response?.data?.message || 'Error deleting role');
          console.error('Error deleting role:', error);

        } finally {
          setLoading(false);
          if (swal && typeof swal.close === 'function') {
            swal.close(); // Close the popup manually
          }
          fetchUsers()
        }
      } else {
        console.log("User canceled.");
      }
    });
  }

  return (
    <Card>
      {/* {loading && <Loader />} */}

      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
        {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />} className='max-sm:is-full'>Export</Button> */}
        <div className='flex flex-col !items-start max-sm:is-full sm:flex-row sm:items-center gap-4'>
           {loading ? (
          <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
        ):(
          <DebouncedInput
            value={globalFilter ?? ''}
            className='max-sm:is-full min-is-[220px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Role'
          />
        )}
        </div>
        {loading ? (
          <Skeleton variant='rectangular' height={40} width={120} className='rounded-md' />
        ) : showAddRoleButton && (
          <Button
            variant='contained'
            size='medium'
            onClick={() => {
              localStorage.removeItem('editRoleData');
              router.replace(getLocalizedUrl('/apps/roles/add-role', locale as Locale));
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
      {loading ? (
        [...Array(5)].map((_, rowIndex) => (
          <tr key={`skeleton-${rowIndex}`}>
            {table.getVisibleFlatColumns().map((column, colIndex) => (
              <td key={`skeleton-cell-${colIndex}`} className="px-4 py-2">
               <div className="h-4 bg-gray-200 rounded animate-pulse w-full my-1" />
              </td>
            ))}
          </tr>
        ))
      ) : table.getFilteredRowModel().rows.length === 0 ? (
        <tr>
          <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
            No data available
          </td>
        </tr>
      ) : (
        table.getRowModel().rows
          .slice(0, table.getState().pagination.pageSize)
          .map(row => (
            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
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
