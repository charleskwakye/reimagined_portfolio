export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-12 w-12">
          <div className="absolute h-full w-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm font-medium">Loading content...</p>
      </div>
    </div>
  );
} 