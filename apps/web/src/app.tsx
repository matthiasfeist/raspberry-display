import { useQuery } from '@tanstack/react-query';
import { apiClient } from './lib/apiClient';
import type { SlResultObj } from '@raspberry-display/api/types';
import './index.css';
import { DisplayNameHeader } from './components/displayNameHeader';
import { LoadingMessage } from './components/loadingMessage';
import { ErrorBox } from './components/errorBox';
import { DeparturesList } from './components/departures';
import { DeviationsList } from './components/deviations';
import { FetchingIndicator } from './components/fetchingIndicator';

export default function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sl'],
    queryFn: async () => {
      const res = await apiClient.api.sl.$get();
      if (res.ok) return await res.json();
      throw new Error('Failed to fetch SL data');
    },
    refetchInterval: 15_000, // 15 seconds
  });

  if (isLoading) return <LoadingMessage />;
  if (error || !data) return <ErrorBox>Error loading data</ErrorBox>;

  return (
    <div>
      <FetchingIndicator />
      {data.map((result: SlResultObj) => {
        if (result.error === true || !result.departures || !result.deviations) {
          return <ErrorBox>Error loading data</ErrorBox>;
        }

        return (
          <div key={result.displayName} className="px-5 pt-5 ">
            <DisplayNameHeader>{result.displayName}</DisplayNameHeader>
            <DeparturesList departures={result.departures} />
            <DeviationsList deviations={result.deviations} />
          </div>
        );
      })}
    </div>
  );
}
