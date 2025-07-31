'use client'

import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/redux-store'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  DialogActions,
  Button,
  LinearProgress
} from '@mui/material'

import type { RoleType } from '@/types/apps/roleType'
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { useSettings } from '@core/hooks/useSettings'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'
import ReactTable from '@/comman/table/ReactTable'
import { createColumnHelper } from '@tanstack/react-table'
import { ThemeColor } from '@/@core/types'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { ColumnDef } from '@tanstack/table-core'

type CampaignDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  selectedChannel: string
}
type ErrorType = {
  message: string[]
}
const defaultData: string[] = [
  'User Management',
  'Content Management',
  'Disputes Management',
  'Database Management',
  'Financial Management',
  'Reporting',
  'API Control',
  'Repository Management',
  'Payroll'
]

type ProjectListDataType = {
  id: number
  img: string
  hours: string
  totalTask: string
  projectType: string
  projectTitle: string
  progressValue: number
  progressColor: ThemeColor
}
// Vars
const projectTable: ProjectListDataType[] = [
  {
    id: 1,
    hours: '18:42',
    progressValue: 78,
    totalTask: '122/240',
    progressColor: 'success',
    projectType: 'React Project',
    projectTitle: 'BGC eCommerce App',
    img: '/images/logos/react-bg.png'
  },
  {
    id: 2,
    hours: '20:42',
    progressValue: 18,
    totalTask: '9/56',
    progressColor: 'error',
    projectType: 'Figma Project',
    projectTitle: 'Falcon Logo Design',
    img: '/images/logos/figma-bg.png'
  },
  {
    id: 3,
    hours: '120:87',
    progressValue: 62,
    totalTask: '290/320',
    progressColor: 'primary',
    projectType: 'VueJs Project',
    projectTitle: 'Dashboard Design',
    img: '/images/logos/vue-bg.png'
  },
  {
    id: 4,
    hours: '89:19',
    progressValue: 8,
    totalTask: '7/63',
    progressColor: 'error',
    projectType: 'Xamarin Project',
    projectTitle: 'Foodista Mobile App',
    img: '/images/icons/mobile-bg.png'
  },
  {
    id: 5,
    hours: '230:10',
    progressValue: 49,
    totalTask: '120/186',
    progressColor: 'warning',
    projectType: 'Python Project',
    projectTitle: 'Dojo React Project',
    img: '/images/logos/python-bg.png'
  },
  {
    id: 6,
    hours: '342:41',
    progressValue: 92,
    totalTask: '99/109',
    progressColor: 'success',
    projectType: 'Sketch Project',
    projectTitle: 'Blockchain Website',
    img: '/images/logos/sketch-bg.png'
  },
  {
    id: 7,
    hours: '12:45',
    progressValue: 88,
    totalTask: '98/110',
    progressColor: 'success',
    projectType: 'HTML Project',
    projectTitle: 'Hoffman Website',
    img: '/images/logos/html-bg.png'
  }
]

const columnHelper = createColumnHelper<ProjectListDataType>()

const CampaignViewLogDialog = ({ open, setOpen, selectedChannel }: CampaignDialogProps) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [loading, setLoading] = useState(false)

  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const roleStore = useSelector((state: { roleReducer: RoleType[] }) => state.roleReducer)

  const router = useRouter()
  const { lang: locale } = useParams()

  const [data, setData] = useState(...[projectTable])

  // Hooks
  const columns = useMemo<ColumnDef<ProjectListDataType, any>[]>(() => {
    if (selectedChannel === 'email') {
      return [
        columnHelper.accessor('hours', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Email',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Read Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Action',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    } else if (selectedChannel === 'sms') {
      return [
        columnHelper.accessor('hours', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Phone',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Message',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    } else if (selectedChannel === 'push_notification') {
      return [
        columnHelper.accessor('hours', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Phone',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Message',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    } else {
      return [
        columnHelper.accessor('hours', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Phone',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Message Preview',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Attachments',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Read Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    }
  }, [selectedChannel])

  useEffect(() => {
    const totalPermissions = defaultData.length * 3
    setIsIndeterminateCheckbox(selectedCheckbox.length > 0 && selectedCheckbox.length < totalPermissions)
  }, [selectedCheckbox])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (loading) return
      setLoading(true)
      const payload = {
        name: roleName,
        permissions: [],
        tenant_id: schoolDetails.school?.tenant_id || '',
        school_id: schoolDetails.school?.id || ''
      }

      const response = await api.post('/roles', payload)

      if (response.data?.status === true) {
        router.replace(getLocalizedUrl('/roles', locale as Locale))
      }

      // if (addRoleToDB.fulfilled.match(resultAction)) {
      //   handleClose()
      // } else {
      //   console.error(' Failed to save:', resultAction.payload)
      // }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })
        toast.error('something went wrong, please try again later.')
      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
        toast.error('something went wrong, please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRoleName('')
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setOpen(false)
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '1200px' } }}
    >
      {/* {loading && <Loader />} */}

      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        View Log ({selectedChannel})
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible'>
          <IconButton onClick={handleClose} className='absolute top-4 right-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <div className='flex flex-col overflow-x-auto'>
            <ReactTable
              data={data}
              columns={columns}
              // count={totalRows}
              // page={paginationInfo.page}
              // rowsPerPage={paginationInfo.perPage}
              // onPageChange={(_, newPage) => setPaginationInfo(prev => ({ ...prev, page: newPage }))}
              // onRowsPerPageChange={newSize => setPaginationInfo({ page: 0, perPage: newSize })}
            />
          </div>
        </DialogContent>

        <DialogActions className='justify-center py-6'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CampaignViewLogDialog
