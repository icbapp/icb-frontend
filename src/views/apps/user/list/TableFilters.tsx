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
import { Autocomplete, TextField } from '@mui/material'

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
        // const roles = response.data.data.map((r: any) => r.name).filter((r: any) => typeof r === 'string')
        // setRolesList(Array.from(new Set(roles)))
        setRolesList(response.data.data)
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
      {loading && <Loader />}

      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            {/* <InputLabel id='role-select'>Select Role</InputLabel> */}
            {/* <Select
              fullWidth
              id='select-role'
              value={role}
              onChange={e => setRole(e.target.value)}
              label='Select Role '
              labelId='role-select'
              inputProps={{ placeholder: 'Select Role' }}
            >
              {rolesList.map((r: any, idx) => (
                <MenuItem key={idx} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select> */}
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
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            {/* <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              {optionCommon.map((item, index) => (
                <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
              ))}
            </Select> */}
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
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
