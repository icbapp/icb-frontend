'use client'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
// src/views/announcements/CampaignDialog.tsx
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Autocomplete,
  Card,
  MenuItem,
  InputAdornment,
  FormControl,
  Select,
  FormHelperText
} from '@mui/material'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AudienceGrid from './AudienceGrid'
import { RoleOption } from '../../user/list/AddUserDrawer'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import dayjs, { Dayjs } from 'dayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { toast } from 'react-toastify'
import CampaignViewLogDialog from '@/components/dialogs/campaign-view-log'

const campaignStatusType = [
  { name: 'One Time', value: 'one_time' },
  { name: 'Recurring', value: 'recurring' },
  { name: 'In Progress', value: 'in_progress' }
]
const publishingModeType = [
  { name: 'Recurring', value: 'recurring' },
  { name: 'One Time', value: 'one_time' }
]
const scheduleTypeDropDown = [
  { name: 'Now', value: 'now' },
  { name: 'Schedule', value: 'schedule' }
]
const frequencyTypeDropDown = [
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' }
]

const CreateCampaign = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const announcementId = localStorage.getItem('announcementId')
  const searchParams = useSearchParams()
  const ids = searchParams.get('id')
  const adminStore = useSelector((state: RootState) => state.admin)

  const [selectedChannel, setSelectedChannel] = useState('email')
  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [selectedData, setSelectedData] = useState([])
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(dayjs())

  const [selectedIds, setSelectedIds] = useState([])
  const [status, setStatus] = useState('One Time')
  const [mode, setMode] = useState('One Time')
  const [scheduleType, setScheduleType] = useState('Now')
  const [recurringCount, setRecurringCount] = useState(5)
  const [recurringType, setRecurringType] = useState('month')
  const [note, setNote] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const isRecurring = mode === 'recurring'

  const channels = [
    {
      key: 'wp',
      label: 'WhatsApp',
      icon: '<i class="ri-whatsapp-line"></i>',
      sub: 'WhatsApp messages',
      color: '#25D366',
      bg: '#E8F5E9',
      text: 'text-green-600'
    },
    {
      key: 'sms',
      label: 'SMS',
      icon: '<i class="ri-message-2-line"></i>',
      sub: 'SMS messages',
      bg: '#FCE7F3',
      color: '#DB2777',
      text: 'text-pink-600'
    },
    {
      key: 'email',
      label: 'Email',
      icon: '<i class="ri-mail-line"></i>',
      sub: 'Email notifications',
      bg: '#E0E7FF',
      color: '#4338CA',
      text: 'text-indigo-600'
    },
    {
      key: 'push_notification',
      label: 'Push',
      icon: '<i class="ri-notification-3-line"></i>',
      sub: 'Mobile push alerts',
      bg: '#FEF9C3',
      color: '#CA8A04',
      text: 'text-yellow-600'
    }
  ]

  const handleFilterChange = (event, newValues) => {
    setSelectedLabels(newValues)

    if (newValues && newValues.length > 0) {
      const selectedRoles = newValues.map(val => val.name.toLowerCase())

      // Example filter logic (if your data has 'role' field)
      // const filtered = data.filter(item =>
      //   selectedRoles.includes(item.role.toLowerCase())
      // );
      // setFilteredData(filtered);
    } else {
      setSelectedData([]) // or show all
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await api.get(`${endPointApi.getRolesDropdown}`)
      const roles: RoleOption[] = response.data.data
        .filter((r: any) => r.name !== 'Super Admin')
        .map((r: any) => ({ id: r.id, name: r.name }))
      setRolesList(roles)
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    const fetchRoleWiseUsers = async () => {
      if (selectedLabels.length === 0) return
      try {
        const select = selectedLabels.map(val => val.id)
        const body = {
          tenant_id: adminStore.tenant_id,
          school_id: adminStore.school_id,
          role_ids: select ?? ''
        }
        const response = await api.post(`${endPointApi.postRoleWiseUsersList}`, body)
        setSelectedData(response.data.users)
      } catch (error) {
        console.error('Error fetching role-wise users:', error)
      }
    }

    fetchRoleWiseUsers()
  }, [selectedLabels])

  const fetchEditCampign = async () => {
    // setloaderMain(true)
    try {
      const res = await api.get(`${endPointApi.getCampaignAnnounceWise}`, {
        params: {
          announcement_id: localStorage.getItem('announcementId'),
          campaign_id: ids
        }
      })
      console.log('res', res.data.data.data)

      setNote(res.data.data.data.note)
      setStatus(res.data.data.data.campaign_status)
      setMode(res.data.data.data.publish_mode)
      setScheduleType(res.data.data.data.schedule)
      setRecurringCount(res.data.data.data.frequency_count)
      setRecurringType(res.data.data.data.frequency_type)
      setSelectedChannel(res.data.data.data.channels)
      setStartDateTime(dayjs(res.data.data.data.campaign_date + ' ' + res.data.data.data.formatted_campaign_time))
      setAnnouncementTitle(res.data.data.data.announcement.title)
    } catch (err: any) {
      if (err.response?.status === 500) {
        toast.error('Internal Server Error.')
      }
    }
  }

  useEffect(() => {
    fetchEditCampign()
  }, [ids])
  const launchCampaign = async () => {
    try {
      let date = ''
      let time = ''
      let timeampm = ''

      if (startDateTime && dayjs(startDateTime).isValid()) {
        const formatted = dayjs(startDateTime).format('YYYY-MM-DD hh:mm A')
        const [datePart, timePart, ampm] = formatted.split(' ')
        date = datePart || ''
        time = timePart || ''
        timeampm = ampm || ''
      }

      const body = {
        id: ids ? Number(ids) : 0,
        note: note || '',
        announcements_id: 57,
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id,
        user_ids: selectedIds,
        channels: selectedChannel,
        frequency_type: recurringType || '',
        campaign_status: status,
        publish_mode: mode,
        schedule: scheduleType || '',
        frequency_count: recurringCount || 0,
        campaign_date: date,
        campaign_time: time,
        campaign_ampm: timeampm
      }
      const response = await api.post(`${endPointApi.postLaunchCampaign}`, body)
      if (response.data.status === 200) {
        toast.success(response.data.message)
        router.replace(getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale))
      }
    } catch (error) {
      console.error('Error fetching role-wise users:', error)
    }
  }
  return (
    <>
      <p style={{ color: settings.primaryColor }} className='font-bold flex items-center gap-2 mb-1'>
        <span
          className='inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer'
          onClick={() =>
            router.replace(getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale))
          }
        >
          <i className='ri-arrow-go-back-line text-lg'></i>
        </span>
        Announcement / {'Create'} Campaign
      </p>
      <Card>
        <Box p={3} display='flex' justifyContent='space-between' alignItems='center'>
          {/* Title and Button in one line */}
          <Typography variant='h6' fontWeight={600}>
            Launch Campaign
          </Typography>
          <Button variant='contained' onClick={() => setOpenDialog(true)}>
            View Log
          </Button>
        </Box>
      </Card>

      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* Audience Selection */}
          <Typography variant='h6' fontWeight={600} mb={3}>
            Filter
          </Typography>
          <Grid container spacing={2} mb={4}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={rolesList}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedLabels}
              onChange={handleFilterChange}
              sx={{ width: 400, marginBottom: 2 }}
              renderInput={params => <TextField {...params} label='Select Roles' />}
            />
          </Grid>
        </Box>
      </Card>
      <Card sx={{ mt: 4 }}>
        <Box p={6} position='relative'>
          <TextField
            label='Note'
            placeholder='Note.....'
            value={note}
            onChange={e => {
              if (e.target.value?.length <= 100) {
                setNote(e.target.value)
              }
            }}
            fullWidth
            multiline
            minRows={2}
            error={note?.length > 100}
            helperText={`${note?.length || 0}/100 characters`}
          />
        </Box>
      </Card>

      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* Grid */}
          <AudienceGrid
            rolesList={rolesList}
            selectedLabels={selectedLabels}
            selectedData={selectedData}
            setSelectedIds={setSelectedIds}
          />
        </Box>
      </Card>
      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* <Grid container spacing={2} mb={4}>
            <Grid item xs={4} style={{ marginTop: '3px' }}>
              <Autocomplete
                fullWidth
                options={frequencyType}
                getOptionLabel={option => option.name}
                // value={frequencyType.find(item => item.id === String(announcementForm.status)) || null}
                // onChange={(event, newValue) => {
                //   setAnnouncementForm(prev => ({
                //     ...prev,
                //     status: newValue ? newValue.id : ''
                //   }))
                // }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={params => <TextField {...params} label='Status' />}
                clearOnEscape
              />
            </Grid>
            <Grid item xs={4} style={{ marginTop: '3px' }}>
               <TextField
                  label='Number of Times'
                  fullWidth
                  // value={announcementForm?.title}
                  // onChange={e => handleChange('title', e.target.value)}
                />
            </Grid>
            <Grid item xs={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker']}>
                  <DateTimePicker
                    label='Start Date Time'
                    value={startDateTime}
                    onChange={newValue => setStartDateTime(newValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>
          </Grid> */}
          <Grid container spacing={4}>
            {/* Status */}
            <Grid item xs={12} md={4}>
              <TextField
                label='Campaign Status'
                select
                fullWidth
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {campaignStatusType.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              {/* {status !== 'Scheduled' && (
          <FormHelperText sx={{ color: 'error.main' }}>
            ❌ Cannot delete campaign unless status is <b>Scheduled</b>
          </FormHelperText>
        )} */}
            </Grid>

            {/* Publishing Mode */}
            <Grid item xs={12} md={4}>
              <TextField label='Publishing Mode' select fullWidth value={mode} onChange={e => setMode(e.target.value)}>
                {publishingModeType.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Schedule Type */}
            <Grid item xs={12} md={4}>
              <TextField
                label='Schedule'
                select
                fullWidth
                value={scheduleType}
                onChange={e => setScheduleType(e.target.value)}
              >
                {/* {publishingModeType.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))} */}
                {scheduleTypeDropDown.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
                {/* <MenuItem value='Now'>Now</MenuItem>
                <MenuItem value='Schedule'>Schedule</MenuItem> */}
              </TextField>
            </Grid>

            {/* DateTime */}
            {scheduleType === 'schedule' && (
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']}>
                    <DateTimePicker
                      label='Start Date Time'
                      value={startDateTime}
                      onChange={newValue => setStartDateTime(newValue)}
                      minDateTime={dayjs()} // ✅ restrict to current date and time onwards
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
            )}

            {/* Recurring Settings */}
            {isRecurring && (
              <>
                <Grid item xs={6} md={3}>
                  <TextField
                    label='Repeat'
                    type='number'
                    fullWidth
                    inputProps={{ min: 1, max: 10 }}
                    value={recurringCount}
                    onChange={e => setRecurringCount(Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>times</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth>
                    <Select value={recurringType} onChange={e => setRecurringType(e.target.value)}>
                      {frequencyTypeDropDown.map((option, index) => (
                        <MenuItem key={index} value={option.value}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* <FormHelperText>Frequency</FormHelperText> */}
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
          {/* Communication Channels */}
          <Box>
            <Typography fontWeight={600} mb={1} mt={3}>
              Communication Channels
            </Typography>
            <Grid container spacing={3} mb={3}>
              {channels.map(channel => {
                const isSelected = selectedChannel === channel.key

                return (
                  <Grid item xs={6} sm={3} key={channel.key}>
                    <Box
                      onClick={() => setSelectedChannel(channel.key)}
                      sx={{
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${channel.color}` : '1px solid #e0e0e0',
                        borderRadius: 3,
                        height: 200,
                        p: 3,
                        backgroundColor: isSelected ? `${channel.color}20` : '',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          boxShadow: 4,
                          backgroundColor: isSelected ? `${channel.color}25` : ''
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          backgroundColor: channel.bg,
                          color: channel.color,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                          boxShadow: 2,
                          mb: 1
                        }}
                        dangerouslySetInnerHTML={{ __html: channel.icon }}
                      />
                      {/* <img src={channel.img} className={classNames('max-bs-[100px] bs-[102px] rounded-lg')} /> */}
                      <Typography fontWeight={600} variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                        {channel.label}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' textAlign='center'>
                        {channel.sub}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Box>

          {/* Preview */}
          {scheduleType === 'schedule' && (
            <Grid item xs={12} mb={2}>
              <Box sx={{ background: '#f4f6f8', p: 2, borderRadius: 2 }}>
                <Typography variant='subtitle1' fontWeight='600'>
                  Preview:
                </Typography>
                <Typography>
                  This campaign will be send <b>{announcementTitle}</b> to selected users on{' '}
                  <b>{startDateTime.format('DD-MM-YYYY hh:mm A')}</b>.
                  {isRecurring && (
                    <>
                      {' '}
                      This will repeat <b>{recurringCount}</b> at same time <b>{recurringType}</b>.
                    </>
                  )}
                </Typography>
              </Box>
            </Grid>
          )}
          {/* Action Buttons */}
          <Box display='flex' justifyContent='flex-start' gap={2}>
            <Button variant='contained' onClick={launchCampaign}>
              Launch Campaign
            </Button>
            <Button
              onClick={() =>
                router.replace(
                  getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale)
                )
              }
              variant='outlined'
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Card>
      {openDialog && <CampaignViewLogDialog open={openDialog} setOpen={setOpenDialog} />}
    </>
  )
}

export default CreateCampaign
