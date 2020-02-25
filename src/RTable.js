import React from "react";
import { useTable, useSortBy, useFilters, useGlobalFilter, useFlexLayout, useResizeColumns, useExpanded } from "react-table";
import CustomInput from "./CustomInput";
import { rt7Expander } from './randomData'

window.Date.prototype.isValid = function () {
  // An invalid date object returns NaN for getTime() and NaN is the only
  // object not strictly equal to itself.
  // eslint-disable-next-line
  return this.getTime() === this.getTime();
};

// value and onChange function
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
  console.log(setGlobalFilter, 'global filter')
  return (
    <CustomInput
      value={globalFilter || ""}
      onChange={e => {
        setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search All ...`}
    />
  );
};

const ColumnFilter = ({ column: { filterValue, setFilter, filter } }) => {
  return (
    <CustomInput
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${filter ? filter : ""}...`}
    />
  );
};

/**
 * As in the previous versions, any react table needs colums where at the core we have a field Header, and accessor
 * As in the previous versions, a react table has data that consist of an array of JSONs
 */
const ReactTable = ({ columns, data, renderRowSubComponent, isExpandable }) => {
  // functions to run when a column is filtered depending on the type
  if (isExpandable) {
    columns = [rt7Expander, ...columns]
  }
  const filterTypes = {
    year: (rows, id, filterValue) => {
      return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue !== undefined &&
          Number(filterValue) &&
          new Date(rowValue) &&
          new Date(rowValue).isValid()
          ? new Date(rowValue).getFullYear() === Number(filterValue)
          : true;
      });
    },
    text: (rows, id, filterValue) => {
      return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue !== undefined
          ? String(rowValue)
            .toLowerCase()
            .startsWith(String(filterValue).toLowerCase())
          : true;
      });
    }
  };
  const defaultColumn = React.useMemo(() => ({
    // Let's set up our default Filter UI
    Filter: ColumnFilter,
    minWidth: 10,
    maxWidth: 400
  }), [])
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter },
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes
    },
    // hooks for filters
    useFilters,
    useGlobalFilter,
    // hook for sorting
    useSortBy,
    // hooks for resizing
    useFlexLayout,
    useResizeColumns,
    // hooks for exander,
    useExpanded
  );
  return (
    <div>
      <div
        className="p-1 border-0 d-flex justify-content-end"
      >
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>
      <div className='table' {...getTableProps()}>
        <div >
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className='tr'>
              {headerGroup.headers.map((column, i) => {
                // three new addition to column: isSorted, isSortedDesc, getSortByToggleProps
                const {
                  render,
                  getHeaderProps,
                  isSorted,
                  isSortedDesc,
                  getSortByToggleProps,
                  // filter,
                  canFilter,
                  //resizer
                  isResizing,
                  getResizerProps,
                } = column;
                const extraClass = isSorted
                  ? isSortedDesc
                    ? "desc"
                    : "asc"
                  : "";
                const { onClick, ...rest } = getHeaderProps(getSortByToggleProps())
                return (
                  <div
                    key={`th-${i}`}
                    className={`${extraClass} th`}
                    {...rest}
                  // getHeaderProps now receives a function
                  >
                    <div onClick={onClick}>
                      {render("Header")}
                    </div>
                    {/* resizer div */}
                    <div
                      {...getResizerProps()}
                      className={`resizer ${isResizing ? 'isResizing' : ''}`}
                    />
                    {/* Render the columns filter UI */}
                    <div>{canFilter ? render("Filter") : null}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} >
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <React.Fragment  key={`rt-tb-trs${i}`}>
                <div className="tr" {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <div {...cell.getCellProps()} className="td">{cell.render("Cell")}</div>
                    );
                  })}
                </div>
                {row.isExpanded && isExpandable ? (
                  <div className="tr">
                    <div>
                      {/*
                              Inside it, call our renderRowSubComponent function. In reality,
                              you could pass whatever you want as props to
                              a component like this, including the entire
                              table instance. But for this example, we'll just
                              pass the row
                            */}
                      {renderRowSubComponent({ row })}
                    </div>
                  </div>
                ) : null}
              </React.Fragment>

            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReactTable;
