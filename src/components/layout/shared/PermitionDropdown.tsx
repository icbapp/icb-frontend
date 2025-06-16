'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Autocomplete, TextField } from '@mui/material';
import { RootState } from '@/redux-store';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/utils/axiosInstance';
import { setSidebarPermissionInfo } from '@/redux-store/slices/sidebarPermission';
import Loader from '@/components/Loader';

interface Role {
    id: string
    name: string
}
const PermitionDropdown = () => {

    const dispatch = useDispatch();

    const userPermissionStore = useSelector((state: RootState) => state.userPermission)

    const loginStore = useSelector((state: RootState) => state.login)
    const userPermissionDataStore = useSelector((state: RootState) => state.login)

    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    useEffect(() => {
        if (!selectedRole && userPermissionStore.length > 0) {
            setSelectedRole(userPermissionStore[0]);
        }
    }, [userPermissionStore]);
    // API call on role change
    useEffect(() => {
        if (selectedRole) {

            const formData = new FormData()
            formData.append('role_id', selectedRole.id)
            formData.append('tenant_id', loginStore.tenant_id)
            formData.append('school_id', loginStore.school_id)
            formData.append('user_id', loginStore.id)

            api.post('get-role-permissions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    dispatch(setSidebarPermissionInfo(res.data))
                })
                .catch((err) => {
                    console.error('Error fetching role permissions:', err)
                })
        }
    }, [selectedRole, userPermissionStore])

    return (
        <>
            {!loginStore.super_admin &&
                <Autocomplete
                    disablePortal
                    options={userPermissionStore}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => setSelectedRole(newValue)}
                    value={selectedRole}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} placeholder='Select Permission'
                        sx={{
                            '& .MuiInputBase-root': {
                                height: 38,
                            },
                        }}
                    />}

                />
            }
        </>
    )
}

export default PermitionDropdown
