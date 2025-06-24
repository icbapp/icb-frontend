'use client'

import Loader from '@/components/Loader';
import { resetAdminInfo, setAdminInfo } from '@/redux-store/slices/admin';
import { SchoolResponse } from '@/views/interface/school.interface';
import axios, { AxiosResponse } from 'axios';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

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
            const adminData: AdminData = {
            d_logo: "https://petrolpe.com/uploads/myschool/logo/dark_1750770795_light_1749633297_Group_2.png",
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
                //     name: data?.name || '',
                //     favicon: data?.f_logo || '/favicon.ico'
                // })
            // } else {
            //     setAdminData({ name: '', favicon: '/favicon.ico' })
            //     router.replace(getLocalizedUrl("/login", locale as Locale))

            // }
        } catch (err) {
            dispatch(resetAdminInfo())
            console.error('Failed to load school data:', err)
            setAdminData({ name: '', favicon: '/favicon.ico' })

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
        if (!adminData.name && !adminData.favicon) return

        // Update title only if it's different
        if (document.title !== adminData.name) {
            document.title = adminData.name
        }

        // Update favicon dynamically
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        if (link.href !== adminData.favicon) {
            link.href = adminData.favicon
        }
    }, [adminData, pathname])


    return (
        <>
            {loading && <Loader />}
            {children}
        </>
    )
}
