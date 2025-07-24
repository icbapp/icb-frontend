'use client'

// pages/announcements/index.tsx
import { useEffect, useState } from 'react'
import { Typography, Grid, TextField, Card, Skeleton, Box, Autocomplete } from '@mui/material'
// import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { toast } from 'react-toastify'
import UploadMultipleFile, { FileProp } from './UploadMultipleFile'
import '@/libs/styles/tiptapEditor.css'
import SaveButton from '@/comman/button/SaveButton'
import CancelButtons from '@/comman/button/CancelButtons'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import MyCKEditor from '../EditorToolbar'
import { useSettings } from '@/@core/hooks/useSettings'

interface AnnouncementForm {
  title: string
  description: string
  status: string
  category: string
  attachments: File[]
  location: string
}

const AnnouncementCreatePage = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const editId = useSearchParams()?.get('id')
  const { settings } = useSettings()

  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '',
    description: '',
    status: '',
    category: '',
    attachments: [] as File[],
    location: ''
  })

  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileProp[]>([])
  const [description, setDescription] = useState('')
  const adminStore = useSelector((state: RootState) => state.admin)
  const [loadings, setLoadings] = useState(false)
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(dayjs())

  const config = {
    readonly: false,
    height: 400,
    spellcheck: false,
    autofocus: true,
    toolbarButtonSize: 'medium',
    uploader: { insertImageAsBase64URI: true },
    buttons: [
      'source',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'ul',
      'ol',
      '|',
      'outdent',
      'indent',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'file',
      'video',
      'table',
      'link',
      '|',
      'align',
      'undo',
      'redo',
      '|',
      'hr',
      'eraser',
      'copyformat',
      '|',
      'fullsize',
      'selectall',
      'print'
    ]
  }

  const statusOptions = [
    { id: '1', name: 'Draft' },
    { id: '2', name: 'Ready to Publish' },
    { id: '3', name: 'Published' }
  ]

  const fetchUsers = async () => {
    // setloaderMain(true)
    try {
      const formData = new FormData()
      formData.append('id', editId || '')

      const res = await api.post(`${endPointApi.getAnnouncements}`, formData)
      // const combined = `${res.data.data.date} ${res.data.data.time}`

      // const parsed = dayjs(combined, 'DD-MM-YYYY hh:mm A')

      // if (parsed.isValid()) {
      //   setStartDateTime(parsed)
      // }

      setAnnouncementForm(res.data.data)
      setDescription(res.data.data.description)
      setLoading(false)
    } catch (err) {
      // setloaderMain(false)
    }
  }

  useEffect(() => {
    if (editId) {
      fetchUsers()
    }
  }, [editId])

  const handleChange = (field: string, value: any) => {
    setAnnouncementForm({ ...announcementForm, [field]: value })
  }

  const handleSubmit = async () => {
    setLoadings(true)

    // const formatted = startDateTime.format('YYYY-MM-DD hh:mm A')

    // const [datePart, timePart, ampm] = formatted.split(' ')
    // const date = datePart
    // const time = `${timePart} ${ampm}`

    const formData = new FormData()

    formData.append('id', editId ? String(editId) : '0')
    formData.append('school_id', adminStore.school_id.toString())
    formData.append('tenant_id', adminStore.tenant_id)
    formData.append('title', announcementForm.title)
    formData.append('description', description)
    // formData.append('date', date)
    // formData.append('time', time)
    formData.append('location', announcementForm.location)
    formData.append('status', announcementForm.status)

    if (Array.isArray(files) && files.length > 0) {
      files.forEach((fileWrapper, i) => {
        if (fileWrapper.file instanceof File) {
          formData.append(`attachments[${i}]`, fileWrapper.file)
        } else if (fileWrapper instanceof File) {
          formData.append(`attachments[${i}]`, fileWrapper)
        }
      })
    }

    try {
      const res = await api.post(`${endPointApi.addAnnouncements}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res) {
        setLoadings(false)
        toast.success(res.data.message || 'Announcement created successfully!')
        router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))
      }
    } catch (error: any) {
      setLoadings(false)
      toast.error(error?.data?.data?.message || 'Something went wrong!')
      console.error('Error:', error.data.data)
    }
  }

  useEffect(() => {
    setFiles(announcementForm.attachments)
  }, [announcementForm.attachments])

  return (
    <>
     {/* <p style={{ color: settings.primaryColor }} className="font-bold"><i className="ri-arrow-go-back-line mr-2"></i>Announcement / {editId ? 'Edit' : 'Create'} Announcement</p> */}
    <p style={{ color: settings.primaryColor }} className="font-bold flex items-center gap-2 mb-1">
      <span className="inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer"
       onClick={() => router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))}>
        <i className="ri-arrow-go-back-line text-lg"></i>
      </span>
      Announcement / {editId ? 'Edit' : 'Create'} Announcement
    </p>
      <Card>
        <div className='p-6'>
          <Typography variant='h5' gutterBottom>
            {editId ? 'Edit' : 'Create'} Announcement
          </Typography>
          {loading ? (
            <AnnouncementSkeleton />
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault() // ✅ prevent page reload
                handleSubmit()
              }}
            >
              <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    {/* Top Title */}
                    <Grid item xs={12}>
                      <TextField
                        label='Title'
                        fullWidth
                        value={announcementForm?.title}
                        onChange={e => handleChange('title', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={4} style={{ marginTop: '3px' }}>
                      <Autocomplete
                        fullWidth
                        options={statusOptions}
                        getOptionLabel={option => option.name}
                        value={statusOptions.find(item => item.id === String(announcementForm.status)) || null}
                        onChange={(event, newValue) => {
                          setAnnouncementForm(prev => ({
                            ...prev,
                            status: newValue ? newValue.id : ''
                          }))
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={params => <TextField {...params} label='Status' />}
                        clearOnEscape
                      />
                    </Grid>

                    {/* <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']}>
                          <DateTimePicker
                            label='Start Date Time'
                            value={startDateTime}
                            onChange={newValue => setStartDateTime(newValue)}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </Grid> */}
                    <Grid item xs={4} style={{ marginTop: '3px' }}>
                      <TextField
                        label='Location'
                        fullWidth
                        value={announcementForm?.location}
                        onChange={e => handleChange('location', e.target.value)}
                      />
                    </Grid>
                    {/* Description */}
                    <Grid item xs={12}>
                      <Typography className='mbe-1'>Description (Optional)</Typography>
                      <Card className='p-0 border shadow-none'>
                        {/* <CardContent className='p-0'>
                        <EditorToolbar editor={editor} />
                        <Divider className='mli-5' />
                        <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex ' />
                      </CardContent> */}
                        <div className='bg-white rounded-xl shadow p-4'>
                          <MyCKEditor value={description} onChange={setDescription} />
                        </div>
                      </Card>
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12}>
                      <Box display='flex' gap={2}>
                        <SaveButton name='Save' type='submit' disabled={announcementForm?.title === ''} />
                        <CancelButtons
                          name='Cancel'
                          onClick={() => router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={4}>
                  <UploadMultipleFile files={files} setFiles={setFiles} />
                </Grid>
              </Grid>
            </form>
          )}
        </div>
      </Card>
    </>
  )
}

export default AnnouncementCreatePage

const AnnouncementSkeleton = () => {
  return (
   <Grid container spacing={4}>
      {/* Left Column */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          {/* Top Title */}
          <Grid item xs={12}>
            <Skeleton variant='rectangular' height={56} sx={{ borderRadius: 1 }} />
          </Grid>

          {/* Status */}
          <Grid item xs={4}>
            <Skeleton variant='rectangular' height={56} sx={{ mt: '3px', borderRadius: 1 }} />
          </Grid>

          {/* Location */}
          <Grid item xs={4}>
            <Skeleton variant='rectangular' height={56} sx={{ mt: '3px', borderRadius: 1 }} />
          </Grid>

          {/* Description Editor */}
          <Grid item xs={12}>
            <Typography className='mbe-1'>Description (Optional)</Typography>
            <Card className='p-0shadow-none' sx={{ mt: 1 }}>
              <div className='bg-white rounded-xl shadow p-4'>
                <Skeleton variant='rectangular' height={380} sx={{ borderRadius: 1 }} />
              </div>
            </Card>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box display='flex' gap={2}>
              <Skeleton variant='rectangular' width={100} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant='rectangular' width={100} height={40} sx={{ borderRadius: 1 }} />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={4}>
         <Card>
          <div className='bg-white rounded-xl shadow p-4'>
          <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 1 }} />
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}
