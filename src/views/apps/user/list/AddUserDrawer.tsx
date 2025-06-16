// React Imports
'use client'
import { useState, useEffect } from 'react'
import CardContent from '@mui/material/CardContent'
import type { ChangeEvent } from 'react'
import Chip from '@mui/material/Chip'

// MUI Imports
import {
  Button, Drawer, FormControl, IconButton, InputLabel, MenuItem,
  Select, TextField, FormHelperText, Typography, Divider
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import api from '@/utils/axiosInstance'
import Loader from '@/components/Loader'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
// Types Imports
import type { UsersType } from '@/types/apps/userTypes'
import { toast } from 'react-toastify'

type Props = {
  open: boolean
  handleClose: () => void
  userData?: UsersType[]
  user?: UsersType
  setData: (data: UsersType[]) => void
  fetchUsers: () => void
}

type SchoolDetailsType = {
  school_id?: string
  tenant_id?: string
}

type FormValidateType = {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  role: number[]
}

type FormNonValidateType = {
  company: string
  country: string
  contact: string
}

const initialData: FormNonValidateType = {
  company: '',
  country: '',
  contact: ''
}

type RoleOption = {
  id: number
  name: string
}


const AddUserDrawer = ({ open, handleClose, userData, user, setData, fetchUsers }: Props) => {
  const [formDataState, setFormDataState] = useState<FormNonValidateType>(initialData)

  const [role, setRole] = useState<number[]>([])
  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(false)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/2.png')
  const [fileInput, setFileInput] = useState<string>('')
  const adminStore = useSelector((state: RootState) => state.admin)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    getValues,
    formState: { errors, isValid }
  } = useForm<FormValidateType>({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: []
    },
    mode: 'onChange',
    shouldUnregister: true // Ensures form resets on user change

  })

  const handleFileInputChange = (file: ChangeEvent) => {

    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      // preview image
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(selectedFile)

      // store the actual file instead of base64 string
      setFileInput(selectedFile as any) // ❗ Type assertion since `fileInput` is string
    }
  }
  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/2.png')
  }
  useEffect(() => {
    if (user) {
      // Prefill in edit mode
      resetForm({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: []
      })
      setFormDataState({
        contact: user.contact || '',
        company: user.company || '',
        country: user.country || ''
      })
      // Optional: preselect existing roles if editing
    } else {
      // Clear form in add mode
      resetForm()
      setFormDataState(initialData)
      setRole([])
    }
  }, [user, resetForm])

  useEffect(() => {
    console.log(role)
  }, [role])

  const fetchRoles = async () => {
    try {
      const response = await api.get('roles')
      const roles: RoleOption[] = response.data.data.map((r: any) => ({ id: r.id, name: r.name }))
      setRolesList(roles)
    } catch (err) {
      console.error('Error fetching Roles:', err)
      // alert(err)

    }
  }
  useEffect(() => {


    fetchRoles()
    // if (typeof window !== 'undefined') {
    //   const stored = localStorage.getItem('user')
    //   if (stored) {
    //     const parsed: SchoolDetailsType = JSON.parse(stored)
    //     setSchoolDetails(parsed)
    //   }
    // }
  }, [])

  const onSubmit = async (data: FormValidateType) => {
    try {
      setLoading(true)

      // ✅ Add this line to console your role array:
      console.log('Selected role IDs:', role)

      const formdata = new FormData()

      formdata.append('full_name', data.fullName || '')
      formdata.append('username', data.username || '')
      formdata.append('email', data.email || '')
      formdata.append('password', data.password || '')
      formdata.append('password_confirmation', data.password || '')
      formdata.append('phone', formDataState.contact || '0000000000')
      formdata.append('school_id', adminStore?.school_id.toString() || '')
      formdata.append('tenant_id', adminStore?.tenant_id.toString() || '')
      formdata.append('id', user?.id ? String(user.id) : '0')

      const selectedRoles = getValues('role')
      console.log('Selected role IDs:', selectedRoles)

      selectedRoles.forEach((id, index) => {
        formdata.append(`role_ids[${index}]`, String(id))
      })


      const response = await api.post('user-add', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.success === true) {
        toast.success(response.data.message)
        fetchRoles()
        // Success logic (unchanged)

        handleReset()
        fetchUsers()
      }

    } catch (error: any) {
      const message = 'Something went wrong'
    } finally {
      setLoading(false)
    }
  }


  const handleReset = () => {
    handleClose()
    setFormDataState(initialData)

    resetForm({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: [],
    })
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }
        }
      }}
    >
      {loading && <Loader />}

      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Add New User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5' autoComplete='off'>
          {/* <CardContent className='mbe-5'>
            <div className='flex max-sm:flex-col items-center gap-6'>
              <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
              <div className='flex flex-grow flex-col gap-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                    Upload New Photo
                    <input
                      hidden
                      type='file'
                      accept='image/png, image/jpeg'
                      onChange={handleFileInputChange}
                      id='account-settings-upload-image'
                    />

                  </Button>
                  <Button variant='outlined' color='error' onClick={handleFileInputReset}>
                    Reset
                  </Button>
                </div>
                <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
              </div>
            </div>
          </CardContent> */}
          <Controller
            name='fullName'
            control={control}
            rules={{ required: 'Full Name is required' }}

            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Full Name'
                placeholder='John Doe'
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                autoComplete='off'

              />
            )}
          />
          <Controller
            name='username'
            control={control}

            rules={{ required: 'Username is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Username'
                placeholder='johndoe'
                error={!!errors.username}
                helperText={errors.username?.message}
                autoComplete='off'

              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: 'Email is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete='off'

              />
            )}
          />
          <TextField
            label='Contact'
            type='tel'
            fullWidth
            placeholder='(397) 294-5153'
            value={formDataState.contact}
            onChange={e => setFormDataState({ ...formDataState, contact: e.target.value })}
            autoComplete='off'

          />
          <Controller
            name='password'
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='password'
                label='Password'
                placeholder='Enter password'
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete='off'

              />
            )}
          />
          {/* <Controller
            name='confirmPassword'
            control={control}
            rules={{
              required: 'Confirm Password is required',
              validate: value => value === getValues('password') || 'Passwords do not match'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='password'
                label='Confirm Password'
                placeholder='Re-enter password'
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          /> */}

          {/* <FormControl fullWidth>
            <InputLabel id='country'>Select Country</InputLabel>
            <Select
              fullWidth
              id='country'
              value={formDataState.country}
              onChange={e => setFormDataState({ ...formDataState, country: e.target.value })}
              label='Select Country'
              labelId='country'
            >
              <MenuItem value='India'>India</MenuItem>
              <MenuItem value='USA'>USA</MenuItem>
              <MenuItem value='Australia'>Australia</MenuItem>
              <MenuItem value='Germany'>Germany</MenuItem>
            </Select>
          </FormControl> */}
          <FormControl fullWidth>
            {/* <InputLabel id='role-select'>Select Role</InputLabel> */}
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="role-select">Select Role</InputLabel>
                  <Select
                    {...field}
                    multiple
                    fullWidth
                    id="select-role"
                    value={field.value || []}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
                    }}
                    // label="Role"
                    // labelId="role-select"
                    renderValue={(selected) => (
                      <div className="flex flex-wrap gap-2">
                        {(selected as number[]).map((roleId) => {
                          const roleName = rolesList.find(r => r.id === roleId)?.name;
                          return (
                            <Chip
                              key={roleId}
                              label={roleName}
                              size="small"
                              onDelete={() => {
                                const newValue = (field.value as number[]).filter(id => id !== roleId);
                                field.onChange(newValue);
                              }}
                              deleteIcon={
                                <i
                                  className="ri-close-circle-fill"
                                  onMouseDown={(event) => event.stopPropagation()}
                                />
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  >
                    {rolesList.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.role?.message}</FormHelperText>
                </FormControl>
              )}
            />
            {/* <FormHelperText>Select one or more roles</FormHelperText> */}
          </FormControl>
          <div className='flex self-end items-center gap-4'>
            <Button variant='contained' type='submit' disabled={!isValid && !user?.id}>
              Submit
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
