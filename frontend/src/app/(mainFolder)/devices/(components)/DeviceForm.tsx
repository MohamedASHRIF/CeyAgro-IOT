"use client";

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
  //  const [imageFile, setImageFile] = useState<File | null>(null);
    //const [imagePreview, setImagePreview] = useState<string | null>(null);
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

   /* const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };*/

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
            }*/

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
           // setImageFile(null);
           // setImagePreview(null);
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
                                {/* General Details */}
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

                                  {/*  <FormItem className="mb-6">
                                        <FormLabel>Upload Image</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" onChange={handleImageChange} />
                                        </FormControl>
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Device Preview"
                                                className="mt-4 max-h-48 object-contain rounded-md border"
                                            />
                                        )}
                                    </FormItem>*/}

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

                                {/* Dynamic Device Types */}
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

                                {/* Submit / Cancel Buttons */}
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
} 