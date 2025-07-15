'use client'

// pages/announcements/index.tsx
import { useEffect, useState } from 'react'
import { Typography, Grid, TextField, Card, CardContent, Divider, Skeleton, Box, Autocomplete } from '@mui/material'
// import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { toast } from 'react-toastify'
import UploadMultipleFile, { FileProp } from './UploadMultipleFile'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import CustomIconButton from '@/@core/components/mui/IconButton'
import classNames from 'classnames'
import '@/libs/styles/tiptapEditor.css'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import SaveButton from '@/comman/button/SaveButton'
import CancelButtons from '@/comman/button/CancelButtons'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter,useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'
interface AnnouncementForm {
  title: string
  description: string
  status: string
  category: string
  attachments: File[]
}

const AnnouncementCreatePage = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const editId = useSearchParams()?.get('id')

  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '',
    description: '',
    status: '',
    category: '',
    attachments: [] as File[]
  })
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileProp[]>([])
  const [description, setDescription] = useState('')
 const [status, setStatus] = useState('')
  const adminStore = useSelector((state: RootState) => state.admin)
  const [loadings, setLoadings] = useState(false)

  const statusOptions = [
  { id: 'draft', name: 'Draft' },
  { id: 'ready_to_publish', name: 'Ready to Publish' },
  { id: 'published', name: 'Published' }
]

  const fetchUsers = async () => {
    // setloaderMain(true)
    try {
      const res = await api.get(`${endPointApi.getAnnouncements}`, {
        params: {
          id: editId || '',
        }
      })
      setAnnouncementForm(res.data.data)
      setDescription(res.data.data.description)
      setLoading(false)
    } catch (err) {
      // setloaderMain(false)
    }
  }

  useEffect(()=>{
    fetchUsers()
  },[editId])

  const handleChange = (field: string, value: any) => {
    setAnnouncementForm({ ...announcementForm, [field]: value })
  }

  const handleSubmit = async () => {
    setLoadings(true)

    const formData = new FormData()

    formData.append('id', editId ? String(editId) : '0')
    formData.append('school_id', adminStore.school_id.toString())
    formData.append('tenant_id', adminStore.tenant_id)
    formData.append('title', announcementForm.title)
    formData.append('description', description)

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
  }, [announcementForm])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],
    content: '',
    // onUpdate: ({ editor }) => {
    //   setDescription(editor.getHTML())
    // }
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setDescription(html === '<p></p>' ? '' : html)
    }
  })

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(description || '') // ✅ always set, even if empty
    }
  }, [editor, description])

  return (
    <>
      {loadings && <Loader />}
      <Card>
        <div className='p-6'>
          <Typography variant='h5' gutterBottom>
            {editId ? 'Edit Announcement' : 'Create Announcement'}
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

                  <Grid item xs={6}>
                    <Autocomplete
                      fullWidth
                      options={statusOptions}
                      getOptionLabel={(option) => option.name}
                      value={statusOptions.find((item) => item.id === status) || null}
                      onChange={(event, newValue) => {
                        setStatus(newValue ? newValue.id : '')
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField {...params} label="Status" />
                      )}
                      clearOnEscape
                    />
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12}>
                    <Typography className='mbe-1'>Description (Optional)</Typography>
                    <Card className='p-0 border shadow-none'>
                      <CardContent className='p-0'>
                        <EditorToolbar editor={editor} />
                        <Divider className='mli-5' />
                        <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex ' />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Buttons */}
                  <Grid item xs={12}>
                    <Box display='flex' gap={2}>
                      <SaveButton
                        name='Save'
                        type='submit'
                        disabled={announcementForm?.title === '' || description === ''}
                      />
                      <CancelButtons
                        name='Cancel'
                        onClick={() =>
                          router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))
                        }
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

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-5 pbe-4 pli-5'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classNames('ri-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classNames('ri-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classNames('ri-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classNames('ri-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className={classNames('ri-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classNames('ri-align-center', {
            'text-textSecondary': !editor.isActive({ textAlign: 'center' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classNames('ri-align-right', {
            'text-textSecondary': !editor.isActive({ textAlign: 'right' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classNames('ri-align-justify', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>
    </div>
  )
}

const AnnouncementSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {/* Title */}
      <Grid item xs={12}>
        {/* <Skeleton variant="text" width="60%" height={40} /> */}
        <Skeleton variant='rectangular' height={56} sx={{ mt: 1, borderRadius: 1 }} />
      </Grid>

      {/* Description Editor */}
      <Grid item xs={12}>
        <Skeleton variant='text' width='20%' height={30} />
        <Card className='p-0 border shadow-none' sx={{ mt: 1 }}>
          <CardContent className='p-0'>
            <Skeleton variant='rectangular' height={40} width='100%' />
            <Divider sx={{ my: 1 }} />
            <Skeleton variant='rectangular' height={135} width='100%' />
          </CardContent>
        </Card>
      </Grid>

      {/* File Uploader */}
      <Grid item xs={12}>
        <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 2, mt: 1 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant='rectangular' height={56} sx={{ mt: 1, borderRadius: 1 }} />
        <Skeleton variant='rectangular' height={56} sx={{ mt: 1, borderRadius: 1 }} />
        <Skeleton variant='rectangular' height={56} sx={{ mt: 1, borderRadius: 1 }} />
      </Grid>

      {/* Save Button */}
      <Grid item xs={12}>
        <Skeleton variant='rectangular' width={100} height={40} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  )
}