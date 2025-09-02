import { useIsFetching } from '@tanstack/react-query';
import { RiLoopRightLine } from 'react-icons/ri';

export function FetchingIndicator() {
  const isFetching = useIsFetching();

  if (isFetching < 1) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 p-5">
      <RiLoopRightLine className="animate-spin" size={30} />
    </div>
  );
}
