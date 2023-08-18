import { Card, Button, CardTitle, CardContent } from '@/components/ui';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingKeysDashboard = () => {
  return (
    <Card className='mx-auto max-w-2xl p-3 shadow-md'>
      <CardTitle className='text-center text-lg'>API Keys</CardTitle>
      <CardContent>
      <div className="divide-y divide-gray-200 m-3 p-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center py-2">
            <div className='mb-4'>
              <Skeleton className="w-24 h-5 mb-2" />
              <Skeleton className='w-48 h-5 mb-2' />
              <Skeleton className='w-64 h-5 mb-2' />
            </div>
            <div className="space-x-2">
            <Button disabled>
                Loading...
            </Button>
            <Button variant="destructive" disabled >
              Loading...
            </Button>
            </div>
          </div>
        ))}
        <Button disabled>+ Add New Key</Button>
      </div>
      </CardContent>
    </Card>
  );
};

export default LoadingKeysDashboard;
