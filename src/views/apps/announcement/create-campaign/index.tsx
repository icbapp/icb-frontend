'use client'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
// src/views/announcements/CampaignDialog.tsx
import { Button, TextField, Grid, Box, Typography, Autocomplete, Card, MenuItem, InputAdornment } from '@mui/material'
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
import {
  campaignStatusType,
  frequencyTypeDropDown,
  publishingModeType,
  scheduleTypeDropDown
} from '@/comman/dropdownOptions/DropdownOptions'
import { ShowErrorToast, ShowSuccessToast } from '@/comman/toastsCustom/Toast'

const CreateCampaign = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const announcementId = localStorage.getItem('announcementId')
  const searchParams = useSearchParams()
  const ids = searchParams.get('id')
  const adminStore = useSelector((state: RootState) => state.admin)

  const [selectedChannel, setSelectedChannel] = useState<string[]>([])
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
  const [openChart, setOpenChart] = useState(false)
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

  const handleFilterChange = (newValues: any) => {
    setSelectedLabels(newValues)

    if (newValues && newValues.length > 0) {
      const selectedRoles = newValues.map((val: any) => val.name.toLowerCase())
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
        const select = selectedLabels.map((val: any) => val.id)
        const body = {
          tenant_id: adminStore.tenant_id,
          school_id: adminStore.school_id,
          role_ids: select ?? ''
        }
        const response = await api.post(`${endPointApi.postRoleWiseUsersList}`, body)

        // if (ids) {
        setSelectedData(response.data.users)
        // }
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

      if (Array.isArray(res?.data?.role_only)) {
        const selected = res.data.role_only.map((item: any) => ({
          id: item.role_id,
          name: item.role_name
        }))
        setSelectedLabels(selected)
      }
      setSelectedData(res.data.users)

      setNote(res.data.note)
      setStatus(res.data.campaign_status)
      setMode(res.data.publish_mode)
      setScheduleType(res.data.schedule)
      setRecurringCount(res.data.frequency_count)
      setRecurringType(res.data.frequency_type)
      setSelectedChannel(res.data.channels)
      setStartDateTime(dayjs(res.data.campaign_date + ' ' + res.data.formatted_campaign_time))
      setAnnouncementTitle(res.data.announcement.title)
    } catch (err: any) {
      if (err.response?.status === 500) {
        toast.error('Internal Server Error.')
      }
    }
  }

  useEffect(() => {
    fetchEditCampign()
  }, [ids])
  const launchCampaign = async (status: string) => {
    try {
      if (!selectedIds || selectedIds.length === 0) {
        ShowErrorToast('Please select at least one user to launch the campaign.')
        return
      }

      if (selectedChannel === '' || selectedChannel == undefined) {
        ShowErrorToast('The Communication Channels required.')
        return
      }
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
        announcements_id: localStorage.getItem('announcementId'),
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id,
        user_ids: selectedIds,
        channels: ids ? [selectedChannel] : selectedChannel,
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
        ShowSuccessToast(response.data.message)
        router.replace(getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale))
      }
    } catch (error: any) {
      if (error.response?.status === 500) {
        ShowErrorToast('Internal Server Error.')
      }
    }
  }

  const statuses = ['Draft', 'Ready', 'In Progress', 'Stopped', 'Done'] as const
  type StatusType = (typeof statuses)[number]

  const scheduleDates = []
  const maxDates = Math.min(recurringCount, 5) // ✅ limit to 5

  for (let i = 0; i < maxDates; i++) {
    let nextDate = dayjs(startDateTime)

    switch (recurringType) {
      case 'year':
        nextDate = nextDate.add(i, 'year')
        break
      case 'month':
        nextDate = nextDate.add(i, 'month')
        break
      case 'week':
        nextDate = nextDate.add(i, 'week')
        break
      case 'day':
        nextDate = nextDate.add(i, 'day')
        break
    }

    scheduleDates.push(nextDate.format('DD-MM-YYYY'))
  }

  const toggleChannel = (key: string) => {
    setSelectedChannel(prev => {
      const safe = Array.isArray(prev) ? prev : []

      if (ids) {
        // Edit mode = single select
        return [key]
      } else {
        return safe.includes(key) ? safe.filter(k => k !== key) : [...safe, key]
      }
    })
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
          {ids ? (
            <Button variant='contained' onClick={() => setOpenDialog(true)}>
              View Log
            </Button>
          ) : (
            ''
          )}
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
              onChange={(event, newValue) => handleFilterChange(newValue)}
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
          {/* <Button variant='contained'>
              Bulk Delete
            </Button> */}
          {/* Grid */}
          <AudienceGrid selectedData={selectedData} setSelectedIds={setSelectedIds} />
          {/* <AudienceGrid selectedData={selectedData} setSelectedIds={setSelectedIds} /> */}
        </Box>
      </Card>
      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          <Grid container spacing={4}>
            {/* <Grid item xs={12} md={4}>
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
            </Grid> */}

            {/* Publishing Mode */}
            <Grid item xs={12} md={4}>
              <TextField
                label='Publishing Mode'
                select
                fullWidth
                value={mode}
                onChange={e => setMode(e.target.value)}
                disabled={status === 'in_progress'}
              >
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
                disabled={status === 'in_progress'}
              >
                {scheduleTypeDropDown.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DateTime */}
            {scheduleType === 'schedule' && (
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']}>
                    <DateTimePicker
                      label='Start Date Time'
                      value={startDateTime}
                      onChange={newValue => setStartDateTime(newValue)}
                      format='DD-MM-YYYY hh:mm A'
                      minDateTime={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: false,
                          helperText: '',
                          FormHelperTextProps: { sx: { display: 'none' } },
                          InputLabelProps: {
                            sx: { color: 'inherit !important' }
                          }
                        }
                      }}
                      disabled={status === 'in_progress'}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
            )}

            {/* Recurring Settings */}
            {isRecurring && (
              <>
                <Grid item xs={6} md={4}>
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
                    disabled={status === 'in_progress'}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    label='Duration'
                    select
                    fullWidth
                    value={recurringType}
                    onChange={e => setRecurringType(e.target.value)}
                    disabled={status === 'in_progress'}
                  >
                    {frequencyTypeDropDown.map((option, index) => (
                      <MenuItem key={index} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
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
                // const isSelected = selectedChannel === channel.key
                const isSelected = selectedChannel?.includes(channel.key) ?? false

                return (
                  <Grid item xs={6} sm={3} key={channel.key}>
                    <Box
                      onClick={() => {
                        if (ids) toggleChannel(channel.key)
                      }}
                      sx={{
                        cursor: ids ? 'not-allowed' : 'pointer',
                        pointerEvents: ids ? 'none' : 'auto',
                        opacity: ids ? 0.5 : 1,
                        border: isSelected ? `2px solid ${channel.color}` : '1px solid #e0e0e0',
                        borderRadius: 3,
                        height: 200,
                        p: 3,
                        backgroundColor: ids
                          ? '#f5f5f5' // grey-out
                          : isSelected
                            ? `${channel.color}20`
                            : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': ids
                          ? {}
                          : {
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
                  {/* This campaign will be send <b>{announcementTitle}</b> to select  advisor via  <b>{selectedChannel}</b> on{' '}
                  <b>{startDateTime ? startDateTime.format('DD-MM-YYYY hh:mm A') : ''}</b> this will repeat for <b>{recurringCount} {recurringType}(s)</b> at same time(s). */}
                  This campaign will send <b>{announcementTitle}</b> to the selected advisor via{' '}
                  <b>{ids ? selectedChannel : selectedChannel && selectedChannel.map(x => x).join(', ')}</b> on{' '}
                  <b>
                    {dayjs(startDateTime).isValid()
                      ? dayjs(startDateTime).format('DD-MM-YYYY hh:mm A')
                      : 'DD-MM-YYYY hh:mm A'}
                  </b>
                  . It will repeat{' '}
                  <b>
                    {recurringCount} {recurringType}
                    {recurringCount > 1 ? 's' : ''}
                  </b>{' '}
                  at the same time.
                  {/* {isRecurring && (
                    <>
                      {' '}
                      This will repeat <b>{recurringCount}</b> at same time <b>{recurringType}</b>.
                    </>
                  )} */}
                </Typography>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-blue-700 mb-3 flex items-center'>
                    <i className='ri-calendar-event-line mr-2 text-base' /> Scheduled Dates {recurringType}
                  </h4>
                  <ul className='space-y-2'>
                    {scheduleDates.map((date, idx) => (
                      <li
                        key={idx}
                        className='flex items-center gap-3 text-sm text-gray-800 border border-gray-200 rounded px-3 py-2 bg-white shadow-sm'
                      >
                        <span className='font-bold text-blue-600'>{idx + 1}</span>:
                        <span className='text-gray-700'>{date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Box>
            </Grid>
          )}

          {/* Action Buttons */}
          <Box display='flex' justifyContent='flex-start' alignItems='center' gap={2}>
            {/* Left-side buttons */}
            <Button
              variant='contained'
              onClick={() => launchCampaign('draft')}
              disabled={status === 'stop' || status === 'in_progress' || status === 'done'}
            >
              Draft
            </Button>
            <Button
              variant='contained'
              onClick={() => launchCampaign('in_progress')}
              disabled={status === 'stop' || status === 'in_progress' || status === 'done'}
            >
              In Progress
            </Button>
            {ids && (
              <Button
                variant='contained'
                onClick={() => launchCampaign(status === 'stop' ? 'in_progress' : 'stop')}
                disabled={status === 'done'}
              >
                {status === 'stop' ? 'Continue' : 'Stop'}
              </Button>
            )}

            <Button
              variant='outlined'
              onClick={() =>
                router.replace(
                  getLocalizedUrl(`/apps/announcement/campaign?id=${announcementId || ''}`, locale as Locale)
                )
              }
            >
              Cancel
            </Button>
            {/* Spacer pushes this button to right */}
            {/* <div
              className='relative inline-block group'
              onMouseEnter={() => setOpenChart(true)}
              onMouseLeave={() => setOpenChart(false)}
            >
              <i className='ri-home-fill text-2xl cursor-pointer text-gray-700' />
              {openChart && <StatusFlow />}
            </div> */}
          </Box>
        </Box>
      </Card>

      {openDialog && (
        <CampaignViewLogDialog open={openDialog} setOpen={setOpenDialog} selectedChannel={selectedChannel} />
      )}
    </>
  )
}

export default CreateCampaign

const StatusFlow = () => {
  return (
    <div className='p-6 max-w-6xl mx-auto text-center'>
      <h2 className='text-lg font-semibold text-gray-700 mb-6'>📊 Campaign Status Flow</h2>

      <div className='flex flex-wrap justify-center items-center gap-4'>
        {/* Draft */}
        <div className='bg-gray-100 border-2 border-gray-300 rounded-md px-4 py-2 text-gray-800'>
          📝 Draft
          <p className='text-xs text-gray-500'>Not sending</p>
        </div>

        <span className='text-2xl text-gray-400'>→</span>

        {/* Ready */}
        <div className='bg-blue-50 border-2 border-blue-300 rounded-md px-4 py-2 text-blue-700'>
          🚀 Ready
          <p className='text-xs text-blue-500'>Launch campaign</p>
        </div>

        <span className='text-2xl text-gray-400'>→</span>

        {/* In Progress */}
        <div className='bg-green-50 border-2 border-green-400 rounded-md px-4 py-2 text-green-700 relative'>
          📢 In Progress
          <p className='text-xs text-green-500'>Cannot change settings</p>
          <div className='absolute top-full mt-3 left-1/2 -translate-x-1/2'>
            <div className='flex flex-col items-center'>
              <div className='border border-red-500 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium'>
                ⛔ Stop
              </div>
              <div className='w-0 h-0 border-l-4 border-r-4 border-t-8 border-t-red-500 mt-1'></div>
            </div>
          </div>
        </div>

        <span className='text-2xl text-gray-400'>→</span>

        {/* Stopped */}
        <div className='bg-red-50 border-2 border-red-400 rounded-md px-4 py-2 text-red-600 relative'>
          ⛔ Stopped
          <p className='text-xs text-red-500'>Paused, no edit</p>
          <div className='absolute top-full mt-3 left-1/2 -translate-x-1/2'>
            <div className='flex flex-col items-center'>
              <div className='border border-green-500 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
                🔄 Continue
              </div>
              <div className='w-0 h-0 border-l-4 border-r-4 border-t-8 border-t-green-500 mt-1'></div>
            </div>
          </div>
        </div>

        <span className='text-2xl text-gray-400'>→</span>

        {/* Done */}
        <div className='bg-gray-200 border-2 border-gray-400 rounded-md px-4 py-2 text-gray-700'>
          ✅ Done
          <p className='text-xs text-gray-600'>Final stage</p>
        </div>
      </div>
    </div>
  )
}
