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
import { Forecast } from './components/forecast';

export default function App() {
  return (
    <div>
      <FetchingIndicator />
      <Sl />
      <Smhi />
    </div>
  );
}

function Sl() {
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
  if (error || !data) return <ErrorBox>SL: Error loading data</ErrorBox>;

  return (
    <div>
      {data.map((result) => {
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

function Smhi() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['smhi'],
    queryFn: async () => {
      const res = await apiClient.api.smhi.$get();
      if (res.ok) return await res.json();
      throw new Error('Failed to fetch SMHI data');
    },
    refetchInterval: 60_000 * 10, // 10 minutes
  });

  if (isLoading) return <LoadingMessage />;
  if (error || !data) return <ErrorBox>SMHI: Error loading data</ErrorBox>;

  return (
    <div>
      {data.map((result) => {
        if (result.error === true || !result.forecast) {
          return <ErrorBox>Error loading data</ErrorBox>;
        }

        return (
          <div key={result.displayName} className="px-5 pt-10 ">
            <DisplayNameHeader>{result.displayName}</DisplayNameHeader>
            <Forecast forecastList={result.forecast} />
          </div>
        );
      })}
    </div>
  );
}
