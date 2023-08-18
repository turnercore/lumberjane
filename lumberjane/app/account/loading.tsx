import { Skeleton } from "@/components/ui/skeleton";

const LoadingProfile = () => {
  return (
    <div className="mx-auto max-w-sm shadow-md">
      <Skeleton className="w-full h-10 rounded-md mb-4" />
      <Skeleton className="w-64 h-64 mx-auto rounded-full mb-4" />
      <Skeleton className="w-full h-5 rounded-md mb-4" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-8 rounded-md mb-4" />
      ))}
      <Skeleton className="w-full h-10 rounded-md" />
    </div>
  );
};

export default LoadingProfile;
