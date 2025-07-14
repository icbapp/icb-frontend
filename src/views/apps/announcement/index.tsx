'use client'
import '@tanstack/table-core';
// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance';

import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Typography, Grid,  Skeleton, Tooltip,
  OutlinedInput
} from '@mui/material'
import AnnouncementCreatePage from './create-announcement';
import endPointApi from '@/utils/endPointApi';
import DeleteGialog from '@/comman/dialog/DeleteDialog';
import ImageGallery from './ImageGallery';
import ReactTable from '@/comman/table/ReactTable';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserCount = {
  active_count: number;
  inactive_count: number;
  [key: string]: any; // add more properties if needed
};

 interface UsersTypeWithAction {
  id: number | string
  title: string
  description: string
  status: 'active' | 'inactive'
  number_of_campaigns?: number
  updated_by?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  attachments?: File[]
  action?: string
}

interface AnnouncementForm {
  title: string;
  description: string;
  status: string;
  category: string;
  attachments: File[];
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const AnnouncementListPage = ({ tableData }: { tableData?: UsersType[] }) => {

  const permissions = useSelector((state: RootState) => state.sidebarPermission)
 
   const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '',
    description: '',
    status: '',
    category: '',
    attachments: [] as File[],
  });

  const [imagemainPopUpOpen, setImagemainPopUpOpen] = useState(false)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [data, setData] = useState<UsersType[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null); // ideally type this
  const [loading, setLoading] = useState(false)
  const [loaderMain, setloaderMain] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>('') // default 0 instead of null
  const [addOpen, setAddOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [totalRows, setTotalRows] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })

  const openPopUp = (id: number) => {
    const selectedData = data.find((item) => item.id === id);
    if (selectedData) {
      setSelectedUser(selectedData.attachments);
    }
  }  

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
  () => [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: ({ row }) => <Typography>{row.original.title}</Typography>
    }),

    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => {
        const htmlToText = (html: string): string => {
          const temp = document.createElement('div')
          temp.innerHTML = html
          return temp.textContent || temp.innerText || ''
        }

        const text = htmlToText(row.original.description || '')
        const truncated = text.length > 30 ? `${text.slice(0, 30)}...` : text

        return (
          <Tooltip title={text} arrow placement='bottom-start'>
            <Typography noWrap>{truncated}</Typography>
          </Tooltip>
        )
      }
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      // cell: ({ row }) => <Typography>{row.original.status}</Typography>
    }),

    columnHelper.accessor('number_of_campaigns', {
      header: 'Number of Campaigns',
      // cell: ({ row }) => <Typography>{row.original.number_of_campaigns}</Typography>
    }),

    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: ({ row }) => <Typography>{row.original.created_at}</Typography>
    }),

    columnHelper.accessor('created_by', {
      header: 'Created By',
      // cell: ({ row }) => <Typography>{row.original.created_by}</Typography>
    }),

    columnHelper.accessor('updated_at', {
      header: 'Updated At',
      cell: ({ row }) => <Typography>{row.original.updated_at}</Typography>
    }),

    columnHelper.accessor('updated_by', {
      header: 'Updated By',
      // cell: ({ row }) => <Typography>{row.original.updated_by}</Typography>
    }),

    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <>
            <Tooltip title='Doc'>
              <IconButton
                size='small'
                onClick={() => {
                  setImagemainPopUpOpen(true)
                  openPopUp(Number(row.original.id))
                }}
                disabled={(row.original.attachments?.length ?? 0) === 0}
              >
                <i className='ri-multi-image-line text-info' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Edit'>
              <IconButton
                size='small'
                onClick={() => {
                  setAddOpen(true)
                  editUser(Number(row.original.id))
                }}
              >
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton
                size='small'
                onClick={() => handleDeleteClick(Number(row.original.id))}
              >
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            </Tooltip>
          </>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false
    })
  ],
  [data, permissions]
)
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
    setloaderMain(true)
    try {
      const res = await api.get(`${endPointApi.getAnnouncements}`, {
        params: {
          per_page: paginationInfo.perPage.toString(),
          page: paginationInfo.page + 1,
          id: '',
        }
      })
      setTotalRows(res.data.data.total)
      setData(res.data.data.data);
      setloaderMain(false) 
    } catch (err) {
      setloaderMain(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [paginationInfo.page, paginationInfo.perPage])

  const handleDeleteClick = (id: number) => {
  setSelectedUserId(id)
  setDeleteOpen(true)
}
  const editUser = async (id:number) => {
    setSelectedUser(id)
    setLoading(true)
    const response = await api.get(`${endPointApi.getAnnouncements}`,{ 
        params: {
        id: id || '',
    }})
    if(response){
        setAnnouncementForm(response.data.data)
        setDescription(response.data.data.description)
        setLoading(false)
    }
    // if(response.data.message === "User fetched successfully"){
    // setEditUserData(response.data)
    // }
  }

  const deleteUser = async (id: number) => {
    try {
      setDeleteOpen(false)
      setLoading(true)

      const response = await api.delete(`${endPointApi.deleteAnnouncements}/${id}`)
      
      if (response.data?.status === 200) {
        setLoading(false)
        fetchUsers();
      }
    } catch (error: any) {
        setLoading(false)
      return null
    } finally {
        setLoading(false)
    }
  };

  return (
    <>
      <Card>
        {/* <CardHeader title='Filters' className='pbe-4' /> */}
        <Divider />
      <div className='p-5'>
        {loaderMain ? (
          <div className='flex justify-end flex-wrap gap-4'>
            <Skeleton variant="rectangular" height={40} width={120} className="rounded" />
          </div>
        ) : (
          <div className='flex justify-end flex-wrap gap-4 items-center'>
             <Button
                variant='contained'
                onClick={() => {
                  setAddOpen(true);
                  setAnnouncementForm({ 
                  title: '',
                  description: '',
                  status: '',
                  category: '',
                  attachments: [] as File[]});
                  setFiles([])
                  setSelectedUser(null)
                  setDescription('')
                }}
                className='w-full sm:w-auto'
                startIcon={<i className="ri-add-line" />}
              >
                Add
              </Button>
             <Button
                variant='contained'
                onClick={() => {
                  setIsCampaignModalOpen(true);
                }}
                className='w-full sm:w-auto'
              >
                Open
              </Button>
          </div>
        )}
      </div>
        {loaderMain ? (
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(3)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant="text" height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(3)].map((_, colIndex) => (
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
            <ReactTable 
              data={data} 
              columns={columns}
              count={totalRows}
              page={paginationInfo.page}
              rowsPerPage={paginationInfo.perPage}
              onPageChange={(_, newPage) =>
                setPaginationInfo(prev => ({ ...prev, page: newPage }))
              }
              onRowsPerPageChange={newSize =>
                setPaginationInfo({ page: 0, perPage: newSize })
              }
            />
          </div>
        )}
      </Card>

      <AnnouncementCreatePage
        announcementForm={announcementForm}
        setAnnouncementForm={setAnnouncementForm}
        files={files}
        setFiles={setFiles}
        open={addOpen}
        handleClose={() => setAddOpen(false)}
        // editUserData={editUserData}
        fetchUsers={fetchUsers}
        selectedUser={selectedUser}
        description={description}
        setDescription={setDescription}
        loading={loading}
      />

      {deleteOpen && (
        <DeleteGialog open={deleteOpen} setOpen={setDeleteOpen} type={'delete-order'} onConfirm={() => deleteUser(selectedUserId)} selectedDeleteStatus='' />
      )}

      {imagemainPopUpOpen && (
        <ImageGallery open={imagemainPopUpOpen} setOpen={() => setImagemainPopUpOpen(false)} images={selectedUser}/>
      )}

      {isCampaignModalOpen &&
        <CampaignModal open={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} />
      }
    </>
  )
}

export default AnnouncementListPage

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
}

const CampaignModal = ({ open, onClose }: CampaignModalProps) => {
  // const [selectedRole, setSelectedRole] = useState('Parent')
  // const [selectedYear, setSelectedYear] = useState('All Years')
  // const [selectedClass, setSelectedClass] = useState('All Classes')
  // const [selectedDept, setSelectedDept] = useState('All Departments')
  // const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  // const [channel, setChannel] = useState('email')

  // const userList = [
  //   { name: 'Michael Brown', role: 'Parent' },
  //   { name: 'Emily Davis', role: 'Teacher - Science' },
  //   { name: 'David Wilson', role: 'Student - Grade 3' },
  //   { name: 'Lisa Anderson', role: 'Admin' }
  // ]

  // const communicationChannels = [
  //   { key: 'email', label: 'Email', icon: '📧' },
  //   { key: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  //   { key: 'push', label: 'Push Notifications', icon: '🔔' },
  //   { key: 'sms', label: 'SMS', icon: '💬' }
  // ]

  // const handleUserToggle = (name: string) => {
  //   setSelectedUsers(prev =>
  //     prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]
  //   )
  // }

  const [filters, setFilters] = useState({
    role: "Parent",
    year: "All Years",
    class: "All Classes",
    department: "All Departments",
  })

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedChannel, setSelectedChannel] = useState("email")

  const users = [
    { name: "Michael Brown", role: "Parent" },
    { name: "Emily Davis", role: "Teacher - Science" },
    { name: "David Wilson", role: "Student - Grade 3" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
    { name: "Lisa Anderson", role: "Admin" },
  ]

  const channels = [
    { key: "email", label: "Email", icon: "📧", sub: "Send via email" },
    { key: "whatsapp", label: "WhatsApp", icon: "💬", sub: "WhatsApp messages" },
    { key: "push", label: "Push Notifications", icon: "🔔", sub: "Mobile app notifications" },
    { key: "sms", label: "SMS", icon: "📱", sub: "Text messages" },
  ]

  const handleSelectAll = (e:any) => {
    setSelectedUsers(e.target.checked ? users.map((u) => u.name) : [])
  }

  const handleUserToggle = (name:any) => {
    setSelectedUsers((prev:any) =>
      prev.includes(name) ? prev.filter((n:any) => n !== name) : [...prev, name]
    )
  }
  return (
    // <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    //   <DialogTitle>Launch Announcement Campaign</DialogTitle>
    //   <DialogContent dividers>
    //     {/* Filters */}
    //     <Grid container spacing={2}>
    //       <Grid item xs={6} sm={3}>
    //         <FormControl fullWidth size="small">
    //           <InputLabel>Role</InputLabel>
    //           <Select 
    //             value={selectedRole} 
    //             onChange={e => setSelectedRole(e.target.value)}
    //             input={<OutlinedInput label="Role" />}
    //           >
    //             <MenuItem value="Parent">Parent</MenuItem>
    //             <MenuItem value="Teacher">Teacher</MenuItem>
    //             <MenuItem value="Student">Student</MenuItem>
    //           </Select>
    //         </FormControl>
    //       </Grid>
    //       <Grid item xs={6} sm={3}>
    //         <FormControl fullWidth size="small">
    //           <InputLabel>Year</InputLabel>
    //           <Select 
    //             value={selectedYear}
    //             onChange={e => setSelectedYear(e.target.value)}
    //             input={<OutlinedInput label="Year" />}
    //            >
    //             <MenuItem value="All Years">All Years</MenuItem>
    //             <MenuItem value="2025">2025</MenuItem>
    //           </Select>
    //         </FormControl>
    //       </Grid>
    //       <Grid item xs={6} sm={3}>
    //         <FormControl fullWidth size="small">
    //           <InputLabel>Class</InputLabel>
    //           <Select 
    //             value={selectedClass} 
    //             onChange={e => setSelectedClass(e.target.value)}
    //             input={<OutlinedInput label="Year" />}
    //           >
    //             <MenuItem value="All Classes">All Classes</MenuItem>
    //             <MenuItem value="Grade 3">Grade 3</MenuItem>
    //           </Select>
    //         </FormControl>
    //       </Grid>
    //       <Grid item xs={6} sm={3}>
    //         <FormControl fullWidth size="small">
    //           <InputLabel>Department</InputLabel>
    //           <Select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
    //             <MenuItem value="All Departments">All Departments</MenuItem>
    //             <MenuItem value="Science">Science</MenuItem>
    //           </Select>
    //         </FormControl>
    //       </Grid>
    //     </Grid>

    //     {/* Audience Selection */}
    //     <Box mt={3}>
    //       <Typography fontWeight={600}>Audience Selection</Typography>
    //       <FormControlLabel
    //         control={
    //           <Checkbox
    //             checked={selectedUsers.length === userList.length}
    //             onChange={(e) =>
    //               setSelectedUsers(e.target.checked ? userList.map(u => u.name) : [])
    //             }
    //           />
    //         }
    //         label="Select All"
    //       />
    //       {userList.map((user, index) => (
    //         <FormControlLabel
    //           key={index}
    //           control={
    //             <Checkbox
    //               checked={selectedUsers.includes(user.name)}
    //               onChange={() => handleUserToggle(user.name)}
    //             />
    //           }
    //           label={`${user.name} (${user.role})`}
    //         />
    //       ))}
    //     </Box>

    //     {/* Communication Channels */}
    //     <Box mt={3}>
    //       <Typography fontWeight={600}>Communication Channels</Typography>
    //       <Box display="flex" gap={2} mt={1}>
    //         {communicationChannels.map(chan => (
    //           <Button
    //             key={chan.key}
    //             variant={channel === chan.key ? 'contained' : 'outlined'}
    //             onClick={() => setChannel(chan.key)}
    //             startIcon={<span>{chan.icon}</span>}
    //           >
    //             {chan.label}
    //           </Button>
    //         ))}
    //       </Box>
    //     </Box>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onClose} variant="outlined">Cancel</Button>
    //     <Button variant="contained" onClick={() => alert('Campaign Launched!')}>
    //       Launch Campaign
    //     </Button>
    //   </DialogActions>
    // </Dialog>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight={600}>Launch Campaign</DialogTitle>
      <DialogContent dividers>
        {/* Filters */}
        <Grid container spacing={2} mb={2}>
          {Object.entries(filters).map(([label, value]) => (
            <Grid item xs={6} sm={3} key={label}>
              <FormControl fullWidth size="small">
                <InputLabel>{label[0].toUpperCase() + label.slice(1)}</InputLabel>
                <Select
                  value={value}
                  onChange={(e) =>
                    setFilters({ ...filters, [label]: e.target.value })
                  }
                  input={<OutlinedInput label={label} />}
                >
                  <MenuItem value={value}>{value}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>

        {/* Audience Selection */}
       <Box mb={3}>
        <Typography fontWeight={600} mb={2}>
          Audience Selection
        </Typography>

        {/* Select All */}
        <Box mb={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedUsers.length === users.length}
                indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                onChange={handleSelectAll}
              />
            }
            label={<Typography fontWeight={500}>Select All</Typography>}
          />
        </Box>

        {/* User List */}
        <Box
          sx={{
            maxHeight: 150,
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 2,
          }}
        >
         {users.map((user, i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                checked={selectedUsers.includes(user.name)}
                onChange={() => handleUserToggle(user.name)}
                sx={{ p: 0.5, mr: 1 }} // ✅ tighter padding + spacing
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <Typography>{`${user.name} (${user.role})`}</Typography>
              </Box>
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              m: 0
            }}
          />
        ))}
        </Box>
        </Box>

        {/* Communication Channels */}
        <Box>
        <Typography fontWeight={600} mb={1}>Communication Channels</Typography>
        <Grid container spacing={2}>
          {channels.map((channel) => (
            <Grid item xs={6} sm={3} key={channel.key}>
              <Box
                onClick={() => setSelectedChannel(channel.key)}
                sx={{
                  cursor: 'pointer',
                  border: selectedChannel === channel.key ? '2px solid #1976d2' : '1px solid #ccc',
                  borderRadius: 2,
                  height: 200,
                  p: 2,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <Typography fontSize={30}>{channel.icon}</Typography>
                <Typography fontWeight={600}>{channel.label}</Typography>
                <Typography variant="caption">{channel.sub}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      </DialogContent>

      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={() => alert("Campaign Launched!")}>Launch Campaign</Button>
      </DialogActions>
    </Dialog>
  )
}