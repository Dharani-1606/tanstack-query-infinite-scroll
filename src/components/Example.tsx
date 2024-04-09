import React, { useState } from 'react'
// import Link from 'next/link'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos'

const queryClient = new QueryClient()

export default function AppTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { ref, inView } = useInView()
  const [search, setSearch] = useState('')

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['projects', search],
    queryFn: async ({ pageParam }) => {
      // const res = await axios.get(`${BASE_URL}?_page=${pageParam}`)
      if(search){
        const res = await axios.get(`https://dummyjson.com/products/search?q=${search}&limit=10&skip=${pageParam}`)      
        return res.data
      } else {
        const res = await axios.get(`https://dummyjson.com/products?limit=10&skip=${pageParam}`)      
        return res.data
      }
      
    },
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => firstPage.skip - 10 ?? undefined,
    getNextPageParam: (lastPage) => lastPage.skip + 10 ?? undefined,
  })

  React.useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView])

  return (
    <div>
      <h1>Infinite Loading</h1>
      {status === 'pending' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          <div>
            <button
              onClick={() => fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
            >
              {isFetchingPreviousPage
                ? 'Loading more...'
                : hasPreviousPage
                  ? 'Load Older'
                  : 'Nothing more to load'}
            </button>
          </div>
          {/* {JSON.stringify()} */}
          <input type='text' onChange={(e: any) => setSearch(e.target.value)}  value={search}/>
          {data.pages.map((page:any) => (
            <React.Fragment>
              {page.products.map((project: any) => (
                <p
                  style={{
                    border: '1px solid gray',
                    borderRadius: '5px',
                    padding: '10rem 1rem',
                    background: `hsla(${project.id * 30}, 60%, 80%, 1)`,
                  }}
                  key={project.id}
                >
                  {project.title}
                </p>
              ))}
            </React.Fragment>
          ))}
          <div>
            <button
              ref={ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                  ? 'Load Newer'
                  : 'Nothing more to load'}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? 'Background Updating...'
              : null}
          </div>
        </>
      )}
      <hr />
      {/* <Link href="/about">Go to another page</Link> */}
      <ReactQueryDevtools initialIsOpen />
    </div>
  )
}
