'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './styles.css'
import { AgGridReact } from 'ag-grid-react'
import {
  ClientSideRowModelModule,
  QuickFilterModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule,
  themeQuartz
} from 'ag-grid-community'
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { RowApiModule } from 'ag-grid-community';
import { IconButton, Tooltip } from '@mui/material'
import { useSettings } from '@/@core/hooks/useSettings'
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
  RowApiModule, 
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : [])
])

export interface Props {
  setSelectedIds: any
  selectedData: any
}

const theme = themeQuartz
  .withParams(
    {
      backgroundColor: '#ffffffff',
      foregroundColor: '#3b2d37ff',
      browserColorScheme: 'light'
    },
    'light-red'
  )
  .withParams(
    {
      backgroundColor: '#30334e',
      foregroundColor: '#FFFFFFCC',
      browserColorScheme: 'dark'
    },
    'dark-red'
  )

const LocalAudienceGrid = ({ setSelectedIds, selectedData }: Props) => {

  // const gridRef = useRef(null)
  const gridRef = useRef<AgGridReact<any>>(null)
  const { settings } = useSettings()

  const containerStyle = useMemo(() => ({ width: '100%', height: '50vh' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const [columnDefs] = useState([
    { field: 'role_name', rowGroup: true, hide: true },
    { field: 'full_name', headerName: 'Full Name' },
    { field: 'email' },
    { field: 'username', headerName: 'User Name' },
    // {
    //   headerName: 'Action',
    //   field: 'action',
    //   cellRenderer: (params: any) => {
    //     return params.data?.role_name ? (
    //       <Tooltip title='Delete'>
    //         <IconButton size='small'>
    //           <i className='ri-delete-bin-7-line text-red-600' />
    //         </IconButton>
    //       </Tooltip>
    //     ) : null
    //   }
    // }
  ])
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
  const paginationPageSize = 10
  const paginationPageSizeSelector = [10, 20, 50, 100]

  const handleSelectionChanged = () => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes()
      setSelectedIds(selectedNodes.map((node: any) => node.data.id))
    }
  }

  useEffect(() => {
    document.body.dataset.agThemeMode = settings.mode === 'light' ? 'light-red' : 'dark-red'
  }, [settings])

   const onFirstDataRendered = useCallback(params => {
    params.api.forEachNode(node => {
      if (!node.group && node.data?.check === true) {
        node.setSelected(true)
      }
    })
  }, [])

  return (
    <>
      <div style={containerStyle}>
        <div className='example-wrapper'>
          <div style={gridStyle}>
            <AgGridReact
              theme={theme}
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
              groupIncludeFooter={true}
              onFirstDataRendered={onFirstDataRendered}
              overlayNoRowsTemplate={'<span >Choose filters to display data</span>'} F
            />
          </div>
        </div>
      </div>
    </>
  )
}
export default LocalAudienceGrid
