import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
      <Card className="bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">
            Total Devices
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            10
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col  gap-1 text-md ">
          Total number of devices registered
        </CardFooter>
      </Card>

      <Card className="bg-[#B5F6B2] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">
            Active Devices
          </CardDescription>
          <CardTitle className="text-4xl  tabular-nums pt-2">
            08
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-1 text-md ">
          Number of Currently Active devices
        </CardFooter>
      </Card>

      <Card className=" bg-[#FF97978A] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl ">
            Inactive Devices
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            02
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col  gap-1 text-md">
          Number of Currently Inactive devices
        </CardFooter>
      </Card>
    </div>
  );
}
