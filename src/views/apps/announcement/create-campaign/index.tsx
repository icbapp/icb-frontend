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
import { useParams, useRouter } from 'next/navigation'
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

const campaignStatusType = [
  { name: 'One Time', value: 'one_time' },
  { name: 'Recurring', value: 'recurring' },
  { name: 'In Progress', value: 'in_progress' }
]
const publishingModeType = [
  { name: 'Recurring', value: 'recurring' },
    { name: 'One Time', value: 'one_time' },
]
const scheduleTypeDropDown = [
  { name: 'Now', value: 'now' },
  { name: 'Schedule', value: 'schedule' }
]

const CreateCampaign = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const announcementId = localStorage.getItem('announcementId')
  const adminStore = useSelector((state: RootState) => state.admin)

  const [selectedChannel, setSelectedChannel] = useState('email')
  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [role, setRole] = useState<string[]>([])
  const [selectedData, setSelectedData] = useState([])
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(dayjs())

  const [status, setStatus] = useState('One Time')
  const [selectedIds, setSelectedIds] = useState([])
  const [mode, setMode] = useState('One Time')
  const [scheduleType, setScheduleType] = useState('Now')
  const [recurringCount, setRecurringCount] = useState(5)
  const [recurringType, setRecurringType] = useState('month')
  const [note, setNote] = useState('')

  const announcementTitle = 'Independence Day Celebration'

  const isRecurring = mode === 'recurring'

  const channels = [
    { key: 'email', label: 'Email', icon: '📧', sub: 'Send via email' },
    { key: 'wp', label: 'WhatsApp', icon: '💬', sub: 'WhatsApp messages' },
    { key: 'push_notification', label: 'Push Notifications', icon: '🔔', sub: 'Mobile app notifications' },
    { key: 'sms', label: 'SMS', icon: '📱', sub: 'Text messages' }
  ]

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
      try {
        const body = {
          tenant_id: adminStore.tenant_id,
          school_id: adminStore.school_id,
          role_ids: role
        }

        const response = await api.post(`${endPointApi.postRoleWiseUsersList}`, body)
        console.log('response**', response.data)

        // Optionally set state:
        setSelectedData(response.data.users)
      } catch (error) {
        console.error('Error fetching role-wise users:', error)
      }
    }

    fetchRoleWiseUsers()
  }, [role])

  const launchCampaign = async () => {
    try {
      const formatted = startDateTime.format('YYYY-MM-DD hh:mm A')

      const [datePart, timePart, ampm] = formatted.split(' ')
      const date = datePart
      const time = `${timePart}`
      const timeampn = `${ampm}`
      const body = {
        id: 0,
        note:'demo',
        announcements_id: 57,
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id,
        user_ids: [51],
        // user_ids: selectedIds,
        channels: selectedChannel,
        frequency_type: recurringType,
        campaign_status: status,
        publish_mode: mode,
        schedule: scheduleType,
        frequency_count: recurringCount,
        campaign_date: date,
        campaign_time: time,
        campaign_ampm: timeampn
      }
      const response = await api.post(`${endPointApi.postLaunchCampaign}`, body)
    } catch (error) {
      console.error('Error fetching role-wise users:', error)
    }
  }
  return (
    <>
      <p style={{ color: settings.primaryColor }} className='font-bold flex items-center gap-2 mb-1'>
        <span
          className='inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer'
          onClick={() => router.replace(getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale))}
        >
          <i className='ri-arrow-go-back-line text-lg'></i>
        </span>
        Announcement / {'Create'} Campaign
      </p>
      <Card>
        <Box p={6}>
          {/* Title */}
          <Typography variant='h6' fontWeight={600} mb={3}>
            Launch Campaign
          </Typography>

          {/* Audience Selection */}
          {/* <Typography variant='h6' fontWeight={600} mb={3}>
          Filter
        </Typography> */}
          <Grid container spacing={2} mb={4}>
            {/* <Grid item xs={12} sm={3}>
            <Autocomplete
              multiple
              fullWidth
              options={rolesList}
              getOptionLabel={(option: any) => option.name}
              value={rolesList.filter((item: any) => role.includes(item.id))}
              onChange={(event, newValue: any[]) => {
                setRole(newValue.map((item: any) => item.id))
              }}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              renderInput={params => <TextField {...params} label='Select Roles' />}
              clearOnEscape
            />
          </Grid> */}
            {/* <Grid item xs={12} sm={3}>
            <Autocomplete
              fullWidth
              options={rolesList}
              getOptionLabel={(option: any) => option.name}
              value={rolesList.find((item: any) => item.id === role) || null}
              onChange={(event, newValue: any) => {
                setRole(newValue ? newValue.id : '')
              }}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              renderInput={params => <TextField {...params} label='Years' />}
              clearOnEscape
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              fullWidth
              options={rolesList}
              getOptionLabel={(option: any) => option.name}
              value={rolesList.find((item: any) => item.id === role) || null}
              onChange={(event, newValue: any) => {
                setRole(newValue ? newValue.id : '')
              }}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              renderInput={params => <TextField {...params} label='Class' />}
              clearOnEscape
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              fullWidth
              options={rolesList}
              getOptionLabel={(option: any) => option.name}
              value={rolesList.find((item: any) => item.id === role) || null}
              onChange={(event, newValue: any) => {
                setRole(newValue ? newValue.id : '')
              }}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              renderInput={params => <TextField {...params} label='Departments' />}
              clearOnEscape
            />
          </Grid> */}
            <TextField label='Note' value={note} onChange={e => setNote(e.target.value)} />
          </Grid>
        </Box>
      </Card>
      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* Grid */}
          <AudienceGrid role={role} rolesList={rolesList} selectedData={selectedData} setSelectedIds={setSelectedIds} />
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
                      <MenuItem value='day'>Day</MenuItem>
                      <MenuItem value='week'>Week</MenuItem>
                      <MenuItem value='month'>Month</MenuItem>
                      <MenuItem value='year'>Year</MenuItem>
                    </Select>
                    {/* <FormHelperText>Frequency</FormHelperText> */}
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Preview */}
            {scheduleType === 'schedule' && (
              <Grid item xs={12}>
                <Box sx={{ background: '#f4f6f8', p: 2, borderRadius: 2 }}>
                  <Typography variant='subtitle1' fontWeight='600'>
                    Preview:
                  </Typography>
                  <Typography>
                    The system will send <b>{announcementTitle}</b> to users on{' '}
                    <b>{startDateTime.format('DD-MM-YYYY hh:mm A')}</b>.
                    {isRecurring && (
                      <>
                        {' '}
                        This will repeat <b>{recurringCount}</b> times every <b>{recurringType}</b>.
                      </>
                    )}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          {/* Communication Channels */}
          <Box>
            <Typography fontWeight={600} mb={1} mt={3}>
              Communication Channels
            </Typography>
            <Grid container spacing={2} mb={3}>
              {channels.map(channel => (
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
                    <Typography variant='caption'>{channel.sub}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box display='flex' justifyContent='flex-start' gap={2}>
            <Button variant='contained' onClick={launchCampaign}>
              Launch Campaign
            </Button>
            <Button
              onClick={() => router.replace(getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale))}
              variant='outlined'
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  )
}

export default CreateCampaign
