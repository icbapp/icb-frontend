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
  Card
} from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AudienceGrid from './AudienceGrid'
import { RoleOption } from '../../user/list/AddUserDrawer'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { useSettings } from '@/@core/hooks/useSettings'

const CreateCampaign = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const [selectedChannel, setSelectedChannel] = useState('email')
  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [role, setRole] = useState<string[]>([])

  const channels = [
    { key: 'email', label: 'Email', icon: '📧', sub: 'Send via email' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', sub: 'WhatsApp messages' },
    { key: 'push', label: 'Push Notifications', icon: '🔔', sub: 'Mobile app notifications' },
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

  return (
    <>
      <p style={{ color: settings.primaryColor }} className="font-bold flex items-center gap-2 mb-1">
        <span className="inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer" onClick={() => router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))}>
          <i className="ri-arrow-go-back-line text-lg"></i>
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
          <Grid item xs={12} sm={3}>
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
          </Grid>
        </Grid>

        {/* Grid */}
        <AudienceGrid />

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
        <Box display='flex' justifyContent='flex-end' gap={2}>
          <Button variant='contained' onClick={() => alert('Campaign Launched!')}>
            Launch Campaign
          </Button>
          <Button
            onClick={() => {
              router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))
            }}
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
