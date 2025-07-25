'use client'
import React, { useMemo, useRef, useState } from 'react'
import './styles.css'
import { AgGridReact } from 'ag-grid-react'
import {
  ClientSideRowModelModule,
  QuickFilterModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule
} from 'ag-grid-community'
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { Autocomplete, IconButton, TextField, Tooltip } from '@mui/material'
// Register required AG Grid modules
ModuleRegistry.registerModules([
  QuickFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  RowGroupingModule,
  RowSelectionModule,
  PaginationModule,
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : [])
])

export interface Props {
  setSelectedIds: any
  selectedData: any
}

const AudienceGrid = ({ setSelectedIds, selectedData }: Props) => {
  const gridRef = useRef(null)
  const containerStyle = useMemo(() => ({ width: '100%', height: '50vh' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const [columnDefs] = useState([
    { field: 'role_name', rowGroup: true, hide: true },
    { field: 'full_name', headerName: 'Full Name' },
    { field: 'email' },
    { field: 'username', headerName: 'User Name' },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: params => {
        return params.data?.role_name ? (
          <Tooltip title='Delete'>
            <IconButton size='small'>
              <i className='ri-delete-bin-7-line text-red-600' />
            </IconButton>
          </Tooltip>
        ) : null
      }
    }
  ])
  // console.log("data",data);
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true
    }),
    []
  )

  const autoGroupColumnDef = useMemo(
    () => ({
      headerName: 'Role',
      field: 'role_name',
      minWidth: 250,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRendererParams: {
        suppressCount: true
      }
    }),
    []
  )

  const pagination = true
  const paginationPageSize = 2
  const paginationPageSizeSelector = [2, 20, 50, 100]

  const handleSelectionChanged = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes()
    setSelectedIds(selectedNodes.map((node: any) => node.data.id))
  }
  return (
    <>
      <div style={containerStyle}>
        <div className='example-wrapper'>
          <div style={gridStyle}>
            <AgGridReact
              groupIncludeFooter={true}
              ref={gridRef}
              rowData={selectedData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              autoGroupColumnDef={autoGroupColumnDef}
              rowSelection='multiple'
              groupSelectsChildren={true}
              groupSelects='descendants'
              animateRows={true}
              suppressAggFuncInHeader={true}
              suppressRowClickSelection={true}
              pagination={pagination}
              paginationPageSize={paginationPageSize}
              paginationPageSizeSelector={paginationPageSizeSelector}
              onSelectionChanged={handleSelectionChanged}
            />
          </div>
        </div>
      </div>
    </>
  )
}
export default AudienceGrid
