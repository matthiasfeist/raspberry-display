import { useIsFetching } from '@tanstack/react-query';
import { RiLoopRightLine } from '@remixicon/react';

export function FetchingIndicator() {
  const isFetching = useIsFetching();

  if (isFetching < 1) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 p-5">
      <RiLoopRightLine className="animate-spin" size={30} />
    </div>
  );
}
