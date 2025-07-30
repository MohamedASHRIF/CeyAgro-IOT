/*"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Inside your component



const formSchema = z.object({
    deviceId: z.string().min(1, { message: "Device ID is required." }),
    deviceName: z.string().min(2, { message: "Device name is required." }),
    serialNumber: z.string().optional(),
    location: z.string().min(1, { message: "Location is required." }),
    description: z.string().optional(),
    deviceTypes: z.array(
        z.object({
            type: z.string().min(1, "Type is required"),
            minValue: z.coerce.number(),
            maxValue: z.coerce.number(),
        })
    ).min(1, { message: "At least one device type is required." }),
});

type DeviceFormValues = z.infer<typeof formSchema>;
type AddDeviceFormProps = {
    email: string;
};
//const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
export function AddDeviceForm({ email }: AddDeviceFormProps) {

    const [deviceTypesList, setDeviceTypesList] = useState<string[]>([]);
const [loadingTypes, setLoadingTypes] = useState(true);

useEffect(() => {
  async function fetchDeviceTypes() {
    try {
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device-types`);
      const data = await res.json(); // This will be just an array

      setDeviceTypesList(data); // directly assign
    } catch (error) {
      console.error("Failed to fetch device types:", error);
    } finally {
      setLoadingTypes(false);
    }
  }

  fetchDeviceTypes();
}, []);
  
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSuccess, setAlertSuccess] = useState(false);

    const form = useForm<DeviceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deviceId: "",
            deviceName: "",
            serialNumber: "",
            location: "",
            description: "",
            deviceTypes: [{ type: "", minValue: 0, maxValue: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "deviceTypes",
    });

 

    async function onSubmit(values: DeviceFormValues) {
        // --- Min/Max validation ---
        for (let i = 0; i < values.deviceTypes.length; i++) {
            const { minValue, maxValue } = values.deviceTypes[i];
            if (minValue === maxValue) {
                setAlertSuccess(false);
                setAlertMessage(`Type #${i + 1}: Min and Max values cannot be equal.`);
                setShowAlert(true);
                return;
            }
            if (minValue > maxValue) {
                setAlertSuccess(false);
                setAlertMessage(`Type #${i + 1}: Min value cannot be greater than Max value.`);
                setShowAlert(true);
                return;
            }
        }
        // --- End Min/Max validation ---

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("deviceId", values.deviceId);
            formData.append("deviceName", values.deviceName);
            formData.append("serialNumber", values.serialNumber || "");
            formData.append("location", values.location);
            formData.append("description", values.description || "");

            /*if (imageFile) {
                formData.append("deviceImage", imageFile);
            }

            values.deviceTypes.forEach((typeObj, index) => {
                formData.append(`deviceTypes[${index}][type]`, typeObj.type);
                formData.append(`deviceTypes[${index}][minValue]`, typeObj.minValue.toString());
                formData.append(`deviceTypes[${index}][maxValue]`, typeObj.maxValue.toString());
            });

            // const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/register`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to register device");
            }

            setAlertSuccess(true);
            setAlertMessage("Device registered successfully!");
            setShowAlert(true);

            form.reset();
         
        } catch (error: any) {
            setAlertSuccess(false);
            setAlertMessage(`${error.message}`);
            setShowAlert(true);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="shadow-lg rounded-2xl border-none w-full max-w-2xl bg-[hsl(172.5,_66%,_50.4%)]">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-center text-black">
                        Add New Device
                    </h1>
                </CardHeader>
                <CardContent>
                    <div className="bg-white p-8 rounded-lg">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* General Details 
                                <div className="border-b pb-8 mb-8 border-gray-600">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                        General Details
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <FormField
                                            control={form.control}
                                            name="deviceId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Device ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter unique ID" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="deviceName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Device Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Air Quality Sensor" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <FormField
                                            control={form.control}
                                            name="serialNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Serial Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter serial number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Building A - Floor 3" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                              

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Additional details of the device..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Dynamic Device Types *
                                <div className="border-b pb-8 mb-8 border-gray-600">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                        Device Types & Ranges
                                    </h2>

                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-4"
                                        >
                                           <FormField
    control={form.control}
    name={`deviceTypes.${index}.type`}
    render={({ field }) => (
        <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                </FormControl>
                {loadingTypes ? (
                    <p className="p-2 text-sm">Loading types...</p>
                ) : (
                    <SelectContent>
                        {deviceTypesList.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                )}
            </Select>
            <FormMessage />
        </FormItem>
    )}
/>


                                            <FormField
                                                control={form.control}
                                                name={`deviceTypes.${index}.minValue`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Min Value</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="e.g., 10" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`deviceTypes.${index}.maxValue`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max Value</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="e.g., 50" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => remove(index)}
                                                    className="mt-2"
                                                >
                                                    🗑️
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => append({ type: "", minValue: 0, maxValue: 0 })}
                                    >
                                        ➕ Add Device Type
                                    </Button>
                                </div>

                                {/* Submit / Cancel Buttons 
                                <div className="flex gap-4">
                                    <Button type="submit" className="transition-all hover:scale-105 hover:shadow-md">
                                        Add Device
                                    </Button>
                                    <Link href="/dashboard">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="transition-all hover:scale-105 hover:shadow-md"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={alertSuccess ? "text-green-600" : "text-red-600"}>
                            {alertSuccess ? "Success" : "Error"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-black text-white text-md">
                            Close
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { Plus, Trash2, Settings, MapPin, Hash, Monitor, FileText, Gauge, ArrowLeft } from "lucide-react"

const formSchema = z.object({
  deviceId: z.string().min(1, { message: "Device ID is required." }),
  deviceName: z.string().min(2, { message: "Device name is required." }),
  serialNumber: z.string().optional(),
  location: z.string().min(1, { message: "Location is required." }),
  description: z.string().optional(),
  deviceTypes: z
    .array(
      z.object({
        type: z.string().min(1, "Type is required"),
        minValue: z.coerce.number(),
        maxValue: z.coerce.number(),
      }),
    )
    .min(1, { message: "At least one device type is required." }),
})

type DeviceFormValues = z.infer<typeof formSchema>

type AddDeviceFormProps = {
  email: string
}

export function AddDeviceForm({ email }: AddDeviceFormProps) {
  const [deviceTypesList, setDeviceTypesList] = useState<string[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  useEffect(() => {
    async function fetchDeviceTypes() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device-types`)
        const data = await res.json()
        setDeviceTypesList(data)
      } catch (error) {
        console.error("Failed to fetch device types:", error)
      } finally {
        setLoadingTypes(false)
      }
    }
    fetchDeviceTypes()
  }, [])

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertSuccess, setAlertSuccess] = useState(false)

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: "",
      deviceName: "",
      serialNumber: "",
      location: "",
      description: "",
      deviceTypes: [{ type: "", minValue: 0, maxValue: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deviceTypes",
  })

  async function onSubmit(values: DeviceFormValues) {
    // Min/Max validation
    for (let i = 0; i < values.deviceTypes.length; i++) {
      const { minValue, maxValue } = values.deviceTypes[i]
      if (minValue === maxValue) {
        setAlertSuccess(false)
        setAlertMessage(`Type #${i + 1}: Min and Max values cannot be equal.`)
        setShowAlert(true)
        return
      }
      if (minValue > maxValue) {
        setAlertSuccess(false)
        setAlertMessage(`Type #${i + 1}: Min value cannot be greater than Max value.`)
        setShowAlert(true)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("deviceId", values.deviceId)
      formData.append("deviceName", values.deviceName)
      formData.append("serialNumber", values.serialNumber || "")
      formData.append("location", values.location)
      formData.append("description", values.description || "")

      values.deviceTypes.forEach((typeObj, index) => {
        formData.append(`deviceTypes[${index}][type]`, typeObj.type)
        formData.append(`deviceTypes[${index}][minValue]`, typeObj.minValue.toString())
        formData.append(`deviceTypes[${index}][maxValue]`, typeObj.maxValue.toString())
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/register`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to register device")
      }

      setAlertSuccess(true)
      setAlertMessage("Device registered successfully!")
      setShowAlert(true)
      form.reset()
    } catch (error: any) {
      setAlertSuccess(false)
      setAlertMessage(`${error.message}`)
      setShowAlert(true)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
       
        <Card className="shadow-xl border-0 overflow-hidden !pt-0">
{/* Header Section */}
<div className="bg-gradient-to-br from-gray-200 via-gray-600 to-gray-200 px-8 py-8">
  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
    {/* Icon */}
    <div className="bg-white/20 p-4 rounded-full flex-shrink-0">
      <Monitor className="w-14 h-14 text-white" />
    </div>

    {/* Text + Button */}
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
      <h2 className="text-3xl font-bold text-white">Device Registration</h2>
      <p className="text-white font-semibold">Configure your new monitoring device</p>
      <Link href="/dashboard">
        <Button
          variant="secondary"
          size="lg"
          className="mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  </div>
</div>



          {/* Form Section */}
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* General Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-700" />
                    General Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Device ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter unique device ID"
                              {...field}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deviceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Device Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Air Quality Sensor"
                              {...field}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Serial Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter serial number (optional)"
                              {...field}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Location
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Building A - Floor 3"
                              {...field}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional details about the device..."
                              className="min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Device Types & Ranges */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-gray-700" />
                    Device Types & Ranges
                  </h3>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border border-gray-200 bg-gray-50/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <FormField
                              control={form.control}
                              name={`deviceTypes.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    {loadingTypes ? (
                                      <p className="p-2 text-sm text-gray-500">Loading types...</p>
                                    ) : (
                                      <SelectContent>
                                        {deviceTypesList.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    )}
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`deviceTypes.${index}.minValue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Min Value</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="e.g., 10"
                                      {...field}
                                      className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`deviceTypes.${index}.maxValue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Max Value</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="e.g., 50"
                                      {...field}
                                      className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-11"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
  type="button"
  variant="outline"
  onClick={() => append({ type: "", minValue: 0, maxValue: 0 })}
  className="w-auto px-3 py-1.5 text-sm  text-black bg-teal-400 hover:bg-teal-400 cursor-pointer inline-flex items-center justify-center"
>
  <Plus className="w-4 h-4 mr-2" />
  Add Device Type
</Button>

                  </div>
                </div>

 <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
  <Button type="submit" className="w-full sm:w-40 bg-black text-white">
    Add Device
  </Button>
  <Link href="/dashboard">
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-32 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
    >
      Cancel
    </Button>
  </Link>
</div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={alertSuccess ? "text-green-600" : "text-red-600"}>
              {alertSuccess ? "Success" : "Error"}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-900 text-white hover:bg-gray-800">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
