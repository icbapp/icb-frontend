'use client'

import { useState, useEffect } from 'react'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { UsersType } from '@/types/apps/userTypes'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
import { optionCommon } from '@/utils/optionComman'
import { Autocomplete, Skeleton, TextField } from '@mui/material'

type TableFiltersProps = {
  role: UsersType['role']
  setRole: React.Dispatch<React.SetStateAction<UsersType['role']>>
  status: UsersType['status']
  setStatus: React.Dispatch<React.SetStateAction<UsersType['status']>>
}

const TableFilters = ({ role, setRole, status, setStatus }: TableFiltersProps) => {
  const [plan, setPlan] = useState<UsersType['currentPlan']>('')
  const [rolesList, setRolesList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)

        const response = await api.get('roles')

        const roles = response.data.data.filter((item: any) => item.name !== 'Super Admin')
        // setRolesList(Array.from(new Set(roles)))
        setRolesList(roles)
      } catch (err) {
        // alert(err)
        return null
      }
      finally {
        setLoading(false)

      }
    }
    fetchRoles()
  }, [])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={rolesList}
                getOptionLabel={(option: any) => option.name}
                value={rolesList.find((item: any) => item.id === role) || null}
                onChange={(event, newValue: any) => {
                  setRole(newValue ? newValue.id : '')
                }}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Select Role" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={optionCommon}
                getOptionLabel={(option) => option.name}
                value={optionCommon.find((item) => item.value === status) || null}
                onChange={(event, newValue) => {
                  setStatus(newValue ? newValue.value : '')
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => (
                  <TextField {...params} label="Select Status" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
