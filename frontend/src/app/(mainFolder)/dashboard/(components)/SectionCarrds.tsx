
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-10 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      <Card className="@container//card border border-gray-300 dark:border-gray-900">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="@[250px]/card:text-3xl text-4xl font-semibold">
            Total Devices
          </CardDescription>
          <CardTitle className="@[250px]/card: text-5xl font-semibold tabular-nums">
            10
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-center gap-1 text-md text-center">
          <div className="text-muted-foreground">
            Total number of devices registered
          </div>
        </CardFooter>
      </Card>

      <Card className="@container//card border border-gray-300 dark:border-gray-700">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="@[250px]/card:text-3xl text-4xl font-semibold">
            Active Devices
          </CardDescription>
          <CardTitle className="@[250px]/card: text-5xl font-semibold tabular-nums">
            08
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-center gap-1 text-md text-center">
          <div className="text-muted-foreground">
            Number of Currently Active devices
          </div>
        </CardFooter>
      </Card>

      <Card className="@container//card border border-gray-300 dark:border-gray-700">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="@[250px]/card:text-3xl text-4xl font-semibold">
            Inactive Devices
          </CardDescription>
          <CardTitle className="@[250px]/card: text-5xl font-semibold tabular-nums">
            02
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-center gap-1 text-md text-center">
          <div className="text-muted-foreground">
            Number of Currently Inactive devices
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
