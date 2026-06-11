import type { ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { createQueryPersistOptions } from './queryPersist';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // ⚠️ persist 전제 조건: gcTime(기본 5분)이 지난 쿼리는 dehydrate 대상에서 빠진다.
            // persistOptions.maxAge(24h, queryPersist.ts) 이상으로 유지해야 오프라인 복원이 동작한다.
            gcTime: 1000 * 60 * 60 * 24,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [persistOptions] = useState(createQueryPersistOptions);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};
