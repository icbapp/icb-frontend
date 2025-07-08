'use client'

// pages/announcements/index.tsx
import { useEffect, useState } from 'react'
import {
  Button,
  IconButton,
  Typography,
  Grid,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  Drawer,
  CardHeader,
  CardContent,
  Divider,
  Skeleton
} from '@mui/material'
// import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { toast } from 'react-toastify'
import UploadMultipleFile, { FileProp } from './UploadMultipleFile'
import Loader from '@/components/Loader'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import CustomIconButton from '@/@core/components/mui/IconButton'
import classNames from 'classnames'
import '@/libs/styles/tiptapEditor.css'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

type Props = {
  fetchUsers: () => void
  selectedUser: number
  setAnnouncementForm: (form: any) => void
  open: boolean
  handleClose: () => void
  files: FileProp[];
  setFiles: React.Dispatch<React.SetStateAction<FileProp[]>>;
  announcementForm: {
    title: string
    description: string
    status: string
    attachments: File[]
  }
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
}
const AnnouncementCreatePage = ({ fetchUsers,selectedUser, setAnnouncementForm, announcementForm,files,setFiles, open, handleClose, description, setDescription,loading }: Props) => {
 
  const adminStore = useSelector((state: RootState) => state.admin)
  const [loadings, setLoadings] = useState(false)

  const handleChange = (field: string, value: any) => {
    setAnnouncementForm({ ...announcementForm, [field]: value })
  }
  
  const handleSubmit = async () => {
  setLoadings(true);

  const formData = new FormData()

  formData.append('id', selectedUser ? selectedUser.toString() : '0')
  formData.append('school_id', adminStore.school_id.toString())
  formData.append('tenant_id', adminStore.tenant_id)
  formData.append('title', announcementForm.title)
  formData.append('description', description)
  // formData.append('description', announcementForm.description)

  if (Array.isArray(files) && files.length > 0) {
  files.forEach((fileWrapper, i) => {
    if (fileWrapper.file instanceof File) {
      formData.append(`attachments[${i}]`, fileWrapper.file)
    }
    else if (fileWrapper instanceof File) {
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
          fetchUsers()
          setAnnouncementForm({
              title: '',
              description: '',
              status: '',
              attachments: []
          })
          setFiles([])
          handleClose()
          toast.success(res.data.message || 'Announcement created successfully!')
          setLoadings(false)
        }
        
    } catch (error: any) {
        setLoadings(false)
        toast.error(error?.data?.data?.message || 'Something went wrong!')
        console.error('Error:', error.data.data)
    }
}

useEffect(()=>{
  setFiles(announcementForm.attachments)
},[announcementForm])


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
    editor.commands.setContent(description || '')  // ✅ always set, even if empty
  }
}, [editor, description])

  return (
    <>
      {loadings && <Loader />}
      <Drawer
            open={open}
            anchor='right'
            variant='temporary'
            onClose={handleClose}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: { xs: 800, sm: 800 } } }}
          >
        <Card>
          <div className="p-6">
          <Typography variant="h5" gutterBottom>
            Create Announcement
          </Typography>
          {loading ? <AnnouncementSkeleton/> :
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  fullWidth
                  value={announcementForm.title}
                  onChange={e => handleChange('title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                {/* <TextField
                  label="description"
                  fullWidth
                  value={announcementForm.description}
                  onChange={e => handleChange('description', e.target.value)}
                /> */}
                {/* <EditorBasic content={form.description} onContentChange={handleContentChange}/> */}
                <Typography className='mbe-1'>Description (Optional)</Typography>
                <Card className='p-0 border shadow-none'>
                  <CardContent className='p-0'>
                    <EditorToolbar editor={editor} />
                    <Divider className='mli-5' />
                    <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex ' />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <UploadMultipleFile files={files} setFiles={setFiles} fetchUsers={fetchUsers}/>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSubmit} 
                disabled={announcementForm.title === '' || description === ''}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          }
          </div>
        </Card>
      </Drawer>
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
        <Skeleton variant="rectangular" height={56} sx={{ mt: 1, borderRadius: 1 }} />
      </Grid>

      {/* Description Editor */}
      <Grid item xs={12}>
        <Skeleton variant="text" width="20%" height={30} />
        <Card className="p-0 border shadow-none" sx={{ mt: 1 }}>
          <CardContent className="p-0">
            <Skeleton variant="rectangular" height={40} width="100%" />
            <Divider sx={{ my: 1 }} />
            <Skeleton variant="rectangular" height={135} width="100%" />
          </CardContent>
        </Card>
      </Grid>

      {/* File Uploader */}
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 1 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={56} sx={{ mt: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 1, borderRadius: 1 }} />
      </Grid>

      {/* Save Button */}
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  )
}