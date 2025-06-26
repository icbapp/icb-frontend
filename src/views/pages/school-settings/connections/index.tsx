'use client'
// Next Imports
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

type ConnectedAccountsType = {
  title: string
  logo: string
  checked: boolean
  subtitle: string
}

type SocialAccountsType = {
  title: string
  logo: string
  username?: string
  isConnected: boolean
  href?: string
}

// Vars
const connectedAccountsArr: ConnectedAccountsType[] = [
  {
    checked: true,
    title: 'Google',
    logo: '/images/logos/google.png',
    subtitle: 'Calendar and Contacts'
  },
  {
    checked: false,
    title: 'Slack',
    logo: '/images/logos/slack.png',
    subtitle: 'Communications'
  },
  {
    checked: true,
    title: 'Github',
    logo: '/images/logos/github.png',
    subtitle: 'Manage your Git repositories'
  },
  {
    checked: true,
    title: 'Mailchimp',
    subtitle: 'Email marketing service',
    logo: '/images/logos/mailchimp.png'
  },
  {
    title: 'Asana',
    checked: false,
    subtitle: 'Task Communication',
    logo: '/images/logos/asana.png'
  }
]

const socialAccountsArr: SocialAccountsType[] = [
  {
    title: 'Microsoft',
    isConnected: false,
    logo: '/images/logos/Microsoft_logo.png'
  },
  {
    isConnected: false,
    username: '@Pixinvent',
    title: 'Google',
    logo: '/images/logos/google.png',
  },
  {
    title: 'Linkedin',
    isConnected: false,
    username: '@Pixinvent',
    logo: '/images/logos/linkedin.png',
    href: 'https://www.linkedin.com/in/pixinvent-creative-studio-561a4713b'
  },
  {
    title: 'Dribbble',
    isConnected: false,
    logo: '/images/logos/dribbble.png'
  },
  {
    title: 'Behance',
    isConnected: false,
    logo: '/images/logos/behance.png'
  }
]

const Connections = () => {
    const loginStore = useSelector((state: RootState) => state.login);
  
const [statuConnected, setStatusConnected] = useState(0);
  const [loading, setLoading] = useState(false)

  const redirectTo = async() =>{
    const response = await api.get('ms-auth/redirect', {
      params: {
        school_id: 11,
        tenant_id: "myschool"
      }
    });
    // window.open(response.data.redirect_url);
    window.location.href = response.data.redirect_url;
  }
  const deleteTo = async() =>{
    const response = await api.delete('ms-auth-token/school-token-delete');
    // window.open(response.data.redirect_url);
    if(response.data.status == 200) {
      setStatusConnected(0);
      toast.success(response.data.message)  
    }
  }


  const queryParams = window.location.search; // Get the entire query string after '?'
  const codeStartIndex = queryParams.indexOf('code=') + 5; // Get index after '?code='
  const encodedCode = queryParams.substring(codeStartIndex); // Get the encoded code string

    // Decode the URL-encoded code string
  const decodedCode = decodeURIComponent(encodedCode);

    // Remove the unwanted part '?code='
  const cleanCode = decodedCode.replace('?code=', '');



    const url = new URL(window.location.href); // Get the current URL
const params = new URLSearchParams(url.search); // Get query parameters

// // Extract specific query parameters
const code = params.get('code');
const state = params.get('state');
const sessionState = params.get('session_state');

 useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Make the GET request with query parameters
        const response = await api.get('ms-auth/callback', {
          params: {
            code: code,
            state: state,
            sessionState: sessionState
          }
        });

        if (response.data.message === 'Microsoft token saved successfully.') {
          setLoading(false);
          const newUrl = window.location.href.split('?')[0]; // Get the base URL
          window.history.replaceState({}, '', newUrl);
          toast.success(response.data.message);
        } 
      } catch (err) {
        console.error('Error during the API call:', err);
        setLoading(false);
      }
    };
fetchData()
  }, []); 

  
  useEffect(() => {
    api.get('/ms-auth-token/school-token-valide')
    .then((response) => {
      setStatusConnected(response.data.satus);
    })
  }, [cleanCode]);

  return (
    <Card>
            {loading && <Loader />}
      
      <Grid container>
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <CardHeader
            title='Connected Accounts'
            subheader='Display content from your connected accounts on your site'
          />
          <CardContent className='flex flex-col gap-4'>
            {connectedAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4'>
                  <img height={32} width={32} src={item.logo} alt={item.title} />
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2'>{item.subtitle}</Typography>
                  </div>
                </div>
                <Switch defaultChecked={item.checked} />
              </div>
            ))}
          </CardContent>
        </Grid> */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CardHeader title='Integration Accounts' subheader='Integration with diffrent account' />
          <CardContent className='flex flex-col gap-4'>
            {socialAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4'>
                  <img height={32} width={32} className='' src={item.logo} alt={item.title} style={{ opacity: item.title === 'Microsoft' && !item.isConnected  ? 1 : 0.5 }}/>
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    {item.title === 'Microsoft' && statuConnected == 1 ? (
                      <Typography color='primary.main'>
                        {/* {item.username} */}
                        {loginStore.microsoft_name}
                      </Typography>
                    ) : (
                      <Typography variant='body2'>Not Connected</Typography>
                    )}
                  </div>
                </div>
                 <CustomIconButton
                  variant='outlined'
                  color={item.title === 'Microsoft' && statuConnected == 1 ? 'error' : 'secondary'}
                  disabled={item.title !== 'Microsoft' && !item.isConnected} // Disable all except Microsoft when not connected
                >
                  <i
                    className={item.title === 'Microsoft' && statuConnected == 1 ? 'ri-delete-bin-line' : 'ri-link'}
                    onClick={item.title === 'Microsoft' && !item.isConnected && statuConnected !== 1 ? redirectTo : deleteTo}
                  />
                </CustomIconButton>
              </div> 
            ))}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Connections
