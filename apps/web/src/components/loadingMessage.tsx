type LoadingProps = {
  whatIsLoading: string;
};
export function LoadingMessage(props: LoadingProps) {
  return (
    <div className="animate-pulse p-3 text-center font-medium">
      Loading {props.whatIsLoading}...
    </div>
  );
}
