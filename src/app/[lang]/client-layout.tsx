'use client'

import Loader from '@/components/Loader';
import { resetAdminInfo, setAdminInfo } from '@/redux-store/slices/admin';
import axios, { AxiosResponse } from 'axios';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux-store';

export interface AdminData {
    accent_color: string;
    background_image: string;
    d_logo: string;
    domain: string;
    f_logo: string;
    l_logo: string;
    name: string;
    primary_color: string;
    school_id: number;
    secondary_color: string;
    tenant_id: string;
    username: string;
    id: string;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const [hostname, setHostname] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [adminData, setAdminData] = useState<{ name: string; favicon: string }>({ name: '', favicon: '/favicon.ico' });
    const pathname = usePathname();
    const router = useRouter()
    const { lang: locale } = useParams()
    const adminStore = useSelector((state: RootState) => state.admin)
    
    useEffect(() => {
        if (typeof window === 'undefined' || !window.location) return;
        const host = window.location.hostname;
        setHostname(host.split('.')[0]);
    }, []);

    const getAdminData = async () => {
        try {

            setLoading(true);
            const formData = new FormData();
            formData.append('type', hostname);
            // const response = await axios.post(`/api/school`, formData) as AxiosResponse<SchoolResponse>;
            // const data = response.data.data;
        //   const response = await axios.post('https://petrolpe.com/api',formData)
            // console.log("Response from API:", response);
            const adminData: AdminData = {
            d_logo: "https://petrolpe.com/uploads/myschool/logo/dark_1750770795_light_1749633297_Group_2.png000000",
            f_logo: "https://petrolpe.com/uploads/myschool/logo/favicon_1750770626_favicon_1750091713_685047b488bcf_download.jpg",
            l_logo: "https://petrolpe.com/uploads/myschool/logo/dark_1750770795_light_1749633297_Group_2.png",
            background_image: "https://petrolpe.com/uploads//background.png",
            primary_color: '#433d3d',
            secondary_color: '#000000',
            accent_color: '#000000',
            tenant_id: 'myschool',
            school_id: 11,
            name: 'My School',
            username: 'myschool',
            domain: 'myschool.icbapp',
            id: ''
            };
            // if (response.data.success) {
                dispatch(setAdminInfo(adminData))
                // setAdminData({
                //     name: adminStore?.name || '',
                //     favicon: adminStore?.f_logo || '/favicon.ico'
                // })
            // } else {
            //     setAdminData({ name: '', favicon: '/favicon.ico' })
            //     router.replace(getLocalizedUrl("/login", locale as Locale))

            // }
        } catch (err) {
            dispatch(resetAdminInfo())
        } finally {
            setLoading(false);
        }
    }

    // useEffect(() => {
    //     if (!hostname) return;

    //     getAdminData();
    // }, [hostname]);

    useEffect(() => {

        getAdminData();
    }, []);

    useEffect(() => {
        if (!adminStore.name && !adminStore.f_logo) return

        // Update title only if it's different
        if (document.title !== adminStore.name) {
            document.title = adminStore.name
        }

        // Update f_logo dynamically
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        if (link.href !== adminStore.f_logo) {
            link.href = adminStore.f_logo
        }
    }, [adminStore, pathname])

  const firstApiCall = async () => {
      const formData = new FormData();
      
      formData.append('type', 'myschool');
      // const response = await axios.post(`https://petrolpe.com/api/`,formData)
      const response = await axios.post(`/api/school`, formData);
      if(response.data.status === 200) {
        dispatch(setAdminInfo(response.data.data))
      }
    }

    useEffect(() => {
        firstApiCall();
    }, []);

    return (
        <>
            {loading && <Loader />}
            {children}
        </>
    )
}
