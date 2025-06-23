/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
// Third-party Imports

import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

import Loader from '@/components/Loader'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@/configs/i18n'

// Component Imports
// import Logo from '@components/layout/shared/Logo'

// Config Imports

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { saveToken } from '@/utils/tokenManager'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { Checkbox, FormControlLabel } from '@mui/material'
import { toast } from 'react-toastify'
import { setLoginInfo } from '@/redux-store/slices/login'
import { setUserPermissionInfo } from '@/redux-store/slices/userPermission'
import { clearSidebarPermission } from '@/redux-store/slices/sidebarPermission'
import endPointApi from '@/utils/endPointApi'
import showMsg from '@/utils/showMsg'
import { api } from '@/utils/axiosInstance'


type ErrorType = {
  message: string[]
}
type School = {
  name: string
  logo: string
  background_image: string
  [key: string]: any
}

type FormData = InferInput<typeof schema>

const schema = object({
  username: pipe(string(), nonEmpty('This field is required'),),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const adminStore = useSelector((state: RootState) => state.admin)
console.log("adminStore",adminStore);

  const [loading, setLoading] = useState(false)
  const [bgUrl, setBgUrl] = useState<string>('')

  const dispatch = useDispatch();

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const logo = '/images/apps/ecommerce/product-25.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    // defaultValues: {
    //   username: 'aashadeep',
    //   password: '12345678',
    // }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)


  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {

    // setLoading(true);
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    // formData.append('tenant_id', adminStore?.tenant_id || '');
    formData.append('tenant_id', "myschool" || '');

    api.post(`${endPointApi.login}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(async (response) => {
        if (response.data.status === 200 && response.data.message === 'Login Success') {
          saveToken(response.data.access_token);
          toast.success(`${showMsg.login}`);
          dispatch(setLoginInfo(response.data.data));

          const redirectURL = searchParams.get('redirectTo') ?? '/dashboards/academy';
          router.replace(getLocalizedUrl(redirectURL, locale as Locale));

          // Fetch permission after login
          if (response.data.data.username !== response.data.data.tenant_id) {
            const rolesResponse = await api.get(`${endPointApi.getRole}?id=${response.data.data.id}`);
            dispatch(setUserPermissionInfo(rolesResponse.data.roles));
          }
        } else {
          const message = response?.data?.message || 'Login failed';
          toast.error(message);
        }
      })
      .catch((error) => {
        const message = error?.response?.data?.message || 'Username or Password is incorrect';
        if (error?.response?.status === 404) {
          toast.error(message);
        } else if (error?.response?.status === 400) {
          toast.error(message);
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

  }

  useEffect(() => {
    if (adminStore?.background_image) {
      setBgUrl(adminStore?.background_image)
    }
  }, [adminStore])


  return (
    <div className='flex bs-full justify-center'
    >
      {loading && <Loader />}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >

        {/* <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' /> */}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        {/* <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div> */}
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div className='self-center m-5 "w-[50px]"'>
            {adminStore?.l_logo &&
              <img src={adminStore?.l_logo || logo}
                className='max-bs-[73px] max-is-full bs-auto'
                alt='School Logo' />}
          </div>

          <div>
            <Typography variant='h5'>
              {adminStore && `Welcome to ${adminStore?.name}! 👋🏻`}
            </Typography>
          </div>
          <form
            noValidate
            action={() => { }}
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >

            <Controller
              name='username'
              control={control}
              rules={{ required: true }}

              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type="username"
                  label="Username"
                  value={field.value ?? ''} // this prevents the warning!
                  onChange={(e) => {
                    field.onChange(e.target.value)

                    errorState !== null && setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              height: '100%',
                              backgroundColor: 'var(--mui-palette-primary-main)',
                              color: '#fff !important',
                              fontWeight: 600,
                              padding: '15px 12px',
                              borderTopRightRadius: '8px',
                              borderBottomRightRadius: '8px'
                            }}
                          >
                            {adminStore?.tenant_id || 'School_ID'}
                          </span>
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      pl: 0, // ✅ Removes left padding from input container
                      borderRadius: '8px',
                      paddingInlineEnd: '0px !important',
                    },
                    '& input': {
                      pl: 0 // ✅ Removes padding from actual input field
                    }
                  }}
                  error={!!errors.username || !!errorState}
                  helperText={errors?.username?.message || errorState?.message?.[0]}
                />


              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  value={field.value ?? ''} // this prevents the warning!
                  label='Password'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <div className='flex justify-start items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me ' />

            </div>
            <Button disabled={loading} fullWidth variant='contained' type='submit'>
              Log In
            </Button>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <Typography
                className=''
                color=''
                component={Link}
                href={getLocalizedUrl('/forgot-username', locale as Locale)}
              >
                Forgot Username?
              </Typography>
              <Typography
                className=''
                color=''
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale as Locale)}
              >
                Forgot Password?
              </Typography>
            </div>
            {/* <div className='flex justify-end items-center flex-wrap gap-2'>
              <Typography>New on our platform? </Typography>
              <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary.main'>
                Create an account 
              </Typography>
            </div> */}
          </form>
          {/* <Divider className='gap-3'>or</Divider>
          <Button
            color='secondary'
            className='self-center text-textPrimary'
            startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
            sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
          >
            Sign in with Google
          </Button> */}
        </div>
      </div>
    </div>
  )
}

export default Login
