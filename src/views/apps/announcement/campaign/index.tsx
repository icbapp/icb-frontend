'use client'
import '@tanstack/table-core'
// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance'
import { Button, Typography, Skeleton, Tooltip, CardContent, TextField, TextFieldProps } from '@mui/material'
import endPointApi from '@/utils/endPointApi'
import ReactTable from '@/comman/table/ReactTable'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { toast } from 'react-toastify'
import { useSettings } from '@/@core/hooks/useSettings'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface UsersTypeWithAction {
  id: number | string
  action?: string
  campaign_status?: string
  frequency_type?: string
  campaign_date?: string  // e.g., '2025-07-22'
  formatted_campaign_time?: string // e.g., '10:00 AM'
  frequency_count?: number
  schedule?: 'now' | 'schedule'
  publish_mode?: 'one_time' | 'recurring'
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

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
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const CampaignListPage = ({ tableData }: { tableData?: UsersType[] }) => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const searchParams = useSearchParams()
  const ids = searchParams.get('id')

  const [data, setData] = useState<UsersType[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null) // ideally type this
  const [loaderMain, setloaderMain] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')

  const openPopUp = (id: number) => {
    const selectedData = data.find(item => item.id === id)
    if (selectedData) {
      setSelectedUser(selectedData.attachments)
    }
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('campaign_status', {
        header: 'note',
        cell: ({ row }) => <Typography>{row.original.campaign_status}</Typography>
      }),
      columnHelper.accessor('campaign_status', {
        header: 'Campaign Status',
        cell: ({ row }) => <Typography>{row.original.campaign_status}</Typography>
      }),
      columnHelper.accessor('frequency_type', {
        header: 'frequency Type',
        cell: ({ row }) => <Typography>{row.original.frequency_type}</Typography>
      }),
      columnHelper.accessor('campaign_date', {
        header: 'campaign date',
        cell: ({ row }) => <Typography>{row.original.campaign_date}</Typography>
      }),
      columnHelper.accessor('formatted_campaign_time', {
        header: 'campaign time',
        cell: ({ row }) => <Typography>{row.original.formatted_campaign_time}</Typography>
      }),
      columnHelper.accessor('frequency_count', {
        header: 'Repeat',
        cell: ({ row }) => <Typography>{row.original.frequency_count}</Typography>
      }),
      columnHelper.accessor('schedule', {
        header: 'schedule',
        cell: ({ row }) => <Typography>{row.original.schedule}</Typography>
      }),
      columnHelper.accessor('publish_mode', {
        header: 'publish mode',
        cell: ({ row }) => <Typography>{row.original.publish_mode}</Typography>
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <>
              <Tooltip title='Edit'>
                <IconButton
                  size='small'
                  onClick={() => {
                    editUser(Number(row.original.id))
                  }}
                >
                  <i className='ri-pencil-line' style={{ color: 'green' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='View Log'>
                <IconButton
                  size='small'
                >
                  <i className='ri-eye-line' style={{ color: '' }} />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title='Delete'>
                <IconButton size='small' onClick={() => handleDeleteClick(Number(row.original.id))}>
                  <i className='ri-delete-bin-7-line text-red-600' />
                </IconButton>
              </Tooltip> */}
            </>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false
      })
    ],
    [data, permissions]
  )

  const fetchUsers = async () => {
    setloaderMain(true)
    try {
      const formData = new FormData()
      formData.append('announcement_id', paginationInfo.perPage.toString())
      formData.append('per_page', paginationInfo.perPage.toString())
      formData.append('page', (paginationInfo.page + 1).toString())
      formData.append('search', globalFilter)

      const res = await api.get(`${endPointApi.getCampaignAnnounceWise}`, {
        params: {
          announcement_id: ids,
          // search: searchData,
          per_page: paginationInfo.perPage.toString(),
          page: (paginationInfo.page + 1).toString(),
        }
      })

      setTotalRows(res.data.data.total)
      setData(res.data.data.data)
      setloaderMain(false)
    } catch (err:any) {
      setloaderMain(false)
       if (err.response?.status === 500) {
        toast.error('Internal Server Error.')
      } else {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [paginationInfo.page, paginationInfo.perPage, globalFilter])

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id)
    setDeleteOpen(true)
  }
  const editUser = async (id: number) => {
    router.push(`${getLocalizedUrl('/apps/announcement/add-campaign', locale as Locale)}?id=${id}`)
  }

  const deleteUser = async (id: number) => {
    try {
      setDeleteOpen(false)
      setLoading(true)

      const response = await api.delete(`${endPointApi.deleteAnnouncements}/${id}`)

      if (response.data?.status === 200) {
        setLoading(false)
        fetchUsers()
      }
    } catch (error: any) {
      setLoading(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <p style={{ color: settings.primaryColor }} className="font-bold flex items-center gap-2 mb-1">
        <span className="inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer"
         onClick={() => router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))}>
          <i className="ri-arrow-go-back-line text-lg"></i>
        </span>
        Announcement / Campaign
      </p>
      <Card>
        {/* <CardHeader title='Filters' className='pbe-4' /> */}
        <Divider />

        <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
          {loading ? (
            <>
              <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
              <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
            </>
          ) : (
            <>
              <div className='flex flex-col !items-start max-sm:w-full sm:flex-row sm:items-center gap-4'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  className='max-sm:w-full min-w-[220px]'
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Campaign...'
                />
              </div>

              <Button
                variant='contained'
                onClick={() => {
                  router.replace(getLocalizedUrl('/apps/announcement/add-campaign', locale as Locale))
                }}
                className='w-full sm:w-auto'
                startIcon={<i className='ri-add-line' />}
              >
                Add Campaign
              </Button>
            </>
          )}
        </CardContent>

        {loaderMain ? (
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(8)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant='text' height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(8)].map((_, colIndex) => (
                      <td key={colIndex}>
                        <Skeleton variant='text' height={50} width='100%' />
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
            <ReactTable
              data={data}
              columns={columns}
              count={totalRows}
              page={paginationInfo.page}
              rowsPerPage={paginationInfo.perPage}
              onPageChange={(_, newPage) => setPaginationInfo(prev => ({ ...prev, page: newPage }))}
              onRowsPerPageChange={newSize => setPaginationInfo({ page: 0, perPage: newSize })}
            />
            {/* <AgGridTable data={data} columnDefs={columnDefs}/> */}
          </div>
        )}
      </Card>

    </>
  )
}

export default CampaignListPage
