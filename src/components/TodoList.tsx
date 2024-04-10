import React, { useMemo } from 'react'
import axios from 'axios';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface PostProps { }

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos'

const columnHelper = createColumnHelper<any>()

const columnsList = [
  columnHelper.accessor('id', {
    cell: info => info.getValue(),
    header: () => <span>S.No</span>
  }),
  columnHelper.accessor(row => row.title, {
    id: 'title',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
  }),
  columnHelper.accessor('completed', {
    header: () => 'Status',
    cell: (info: any) => {
      <div>
        <strong>{JSON.stringify(info.getValue())}</strong>
      </div>
    },
  })
];

const retrieveTodo = async (pageNumber: number) => {
  console.log('pageNumber :>>', pageNumber);
  try {
    const response = await axios.get(`${BASE_URL}?_page=${pageNumber}`);
    console.log('response :>>', response);
    return response.data;
  } catch (error) {
    console.log('Error :>>', error);
  }
};

const TodoList: React.FC<PostProps> = () => {
  const finalColumns = useMemo(() => columnsList, [])

  const [page, setPage] = React.useState(1)

  const { isLoading, error, data } =
    useQuery<any>({
      queryKey: ['todo', page],
      queryFn: async () => retrieveTodo(page),
    });

  // const { isLoading, error, data } =
  //   useQuery<any>({
  //     queryKey: ['todo', page],
  //     queryFn: async () => retrieveTodo(page),
  //     initialPageParam: 0,
  //     getNextPageParam: (_lastGroup, groups) => groups.length,
  //     refetchOnWindowFocus: false,
  //     placeholderData: keepPreviousData,
  //   });

  const todoList = useMemo(() => {
    return data && data.length ? data : []
  }, [data])
  
  const table = useReactTable({
    data: todoList,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <>Loading...</>
  }

  if (error) {
    return <div>{error?.message || 'Something went wrong'}</div>
  }

  return (
    <section className='todo-blk'>
      <h2>Todo list</h2>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className='pagination-blk'>
        <p>Current Page: {page}</p>
        <button
          onClick={() => setPage((prevState) => prevState - 1)}
          disabled={page === 0}
        >
          Previous Page
        </button>{' '}
        <button
          onClick={() => {
            setPage((prevState) => (prevState + 1))
          }}
        // disabled={isPlaceholderData || !data?.hasMore}
        >
          Next Page
        </button>
      </div>
    </section>
  );
}

export default TodoList;