import React, { CSSProperties, LegacyRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Column,
  TableInstance,
  useExpanded,
  useGroupBy,
  usePagination,
  UsePaginationInstanceProps,
  UsePaginationState,
  useRowSelect,
  useTable,
} from "react-table";

declare type CustomTableProps<T extends object> = {
  columnList: ExtendedColumnGroups<T>[];
  className?: string;
  thClassName?: string;
  tdClassName?: string;
  trClassName?: string;
  style?: React.CSSProperties;
  expandableTrStyle?: CSSProperties;
  serverData: T[];
};

declare type ExtendedColumnGroups<T extends object> = Column<T> & {
  header?: string;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  Cell?: any;
  width?: any;
};

interface ITable<T extends object> {
  className?: string;
  thClassName?: string;
  tdClassName?: string;
  trClassName?: string;
  style?: React.CSSProperties;
  expandableTrStyle?: CSSProperties;
  columns: ExtendedColumnGroups<T>[];
  data: T[];
  totalResult: number;
}

const CustomToggle = React.forwardRef(
  (
    { children, onClick }: { children: JSX.Element; onClick: any },
    ref: LegacyRef<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      className="border-0 bg-transparent p-0"
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </button>
  )
);

function Table<T extends object>({
  columns,
  style,
  data,
  totalResult,
  className,
  ...props
}: ITable<T>) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    setPageSize,
    previousPage,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
    },
    useGroupBy,
    useExpanded,
    usePagination,
    useRowSelect
  ) as TableInstance<T> &
    UsePaginationInstanceProps<T> & { state: UsePaginationState<T> };

  // Render the UI for your table
  return (
    <>
      <div className="table-responsive" style={style}>
        <table
          className={`custom-table m-0 overflow-hidden ${className}`}
          {...getTableProps({
            style: {
              width: "100%",
              minWidth: "800px",
            },
          })}
        >
          <thead
            style={{
              backgroundColor: "#000",
              color: "#fff",
            }}
          >
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: headerKey, ...headerProps } =
                      column.getHeaderProps();
                    return (
                      <th
                        key={headerKey}
                        className={props.thClassName}
                        style={{ borderColor: "#fff" }}
                        {...headerProps}
                      >
                        {column.render("Header")}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length > 0 ? (
              <>
                {page.map((row: any) => {
                  prepareRow(row);
                  const { key: rowKey, ...rowProps } = row.getRowProps();
                  const rowData = row.original as { parentId: number };
                  return (
                    <tr
                      key={rowKey}
                      {...rowProps}
                      className={props.trClassName}
                      style={rowData?.parentId ? props.expandableTrStyle : {}}
                    >
                      {row.cells.map((cell: any) => {
                        const { key: cellKey, ...cellProps } =
                          cell.getCellProps();
                        return (
                          <td key={cellKey} {...cellProps}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </>
            ) : (
              <tr>
                <td
                  colSpan={{ ...headerGroups[0] }.headers.length}
                  className="text-center"
                >
                  There is no data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div
        className="pagination flex justify-between items-center py-2 px-4"
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <div className="flex gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Showing {pageSize}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                {[5, 10, 20, 50, 100].map((e, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      setPageSize(e);
                    }}
                  >
                    <div className="flex justify-between items-center flex-grow">
                      <div>Show {e}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-column items-center">
            <span className="align-items-center flex flex-fill">
              {page.length} / {totalResult}
            </span>
          </div>
        </div>

        <div className="flex flex-column items-center">
          <span className="align-items-center flex px-3">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>

          <button
            className="py-2 px-3 border-0 bg-transparent"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {"<"}
          </button>
          <button
            className="py-2 px-3 border-0 bg-transparent"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {">"}
          </button>
        </div>
      </div>
    </>
  );
}

const CustomTable = <T extends object>({
  columnList,
  style,
  serverData,
  className,
  ...props
}: CustomTableProps<T>) => {
  return (
    <Table
      className={className || ""}
      columns={columnList}
      data={serverData}
      style={style}
      totalResult={serverData.length}
      {...(props as any)}
    />
  );
};

export default CustomTable;
