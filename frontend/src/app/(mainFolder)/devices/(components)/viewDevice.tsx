"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { Pencil, BarChart, X } from "lucide-react";
import {
    AlertDialog,
    AlertDialogFooter,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Types
type DeviceType = {
    type: string;
    minValue: number;
    maxValue: number;
};

type DeviceData = {
    deviceId: string;
    deviceName: string;
    serialNumber: string;
    location: string;
    description: string;
    isActive: boolean;
    deviceTypes: DeviceType[];
};

type UserDevice = {
    email: string;
    deviceId: string;
};

type CombinedDevice = DeviceData & Partial<UserDevice>;

type DevicePageProps = {
    deviceId: string;
    userEmail: string;
};


const DevicePage = ({ deviceId, userEmail }: DevicePageProps) => {
    const email = userEmail;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userDeviceData, setUserDeviceData] = useState<CombinedDevice | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSuccess, setAlertSuccess] = useState(true);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [deviceTypeOptions, setDeviceTypeOptions] = useState<string[]>([]);

useEffect(() => {
    const fetchDeviceTypes = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device-types`);
            const data = await res.json();
            if (res.ok) {
                setDeviceTypeOptions(data); // assuming the API returns string[]
            } else {
                console.error("Failed to fetch device types:", data.message);
            }
        } catch (err) {
            console.error("Error fetching device types:", err);
        }
    };

    fetchDeviceTypes();
}, []);

    const form = useForm<CombinedDevice>({ defaultValues: {} });
    const { control, reset, handleSubmit, setError, clearErrors } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "deviceTypes" });

    const fetchDeviceData = useCallback(async () => {
        if (!deviceId || !email) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`
            );

            if (!res.ok) throw new Error("Failed to fetch device data");
            const json = await res.json();
            if (!json.success) throw new Error("API returned failure");

            const combined: CombinedDevice = {
                ...json.data.deviceData,
                ...json.data.userDevice,
            };

            setUserDeviceData(combined);
            reset(combined);
        } catch (error: any) {
            setAlertSuccess(false);
            setAlertMessage(error.message || "Failed to load device data from server");
            setShowAlert(true);
        }
    }, [deviceId, email, reset]);

    useEffect(() => {
        fetchDeviceData();
    }, [fetchDeviceData]);

    const handleEditToggle = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedFile(null);
        if (userDeviceData) reset(userDeviceData);
        clearErrors("deviceTypes");
    };

    const handleRemoveType = (index: number) => {
        if (fields.length > 1) {
            remove(index);
            clearErrors("deviceTypes");
        } else {
            setError("deviceTypes", { type: "manual", message: "At least one device type is required." });
        }
    };
const onSubmit = (values: CombinedDevice) => {
    if (!values.deviceTypes || values.deviceTypes.length === 0) {
        setError("deviceTypes", { type: "manual", message: "At least one device type is required." });
        return;
    }
    
    for (let i = 0; i < values.deviceTypes.length; i++) {
        const { minValue, maxValue } = values.deviceTypes[i];
        
        // Convert to numbers for proper comparison
        const minNum = Number(minValue);
        const maxNum = Number(maxValue);
        
        // Check if the values are valid numbers
        if (isNaN(minNum) || isNaN(maxNum)) {
            setAlertSuccess(false);
            setAlertMessage(`Type #${i + 1}: Please enter valid numbers for Min and Max values.`);
            setShowAlert(true);
            return;
        }
        
        if (minNum === maxNum) {
            setAlertSuccess(false);
            setAlertMessage(`Type #${i + 1}: Min and Max values cannot be equal.`);
            setShowAlert(true);
            return;
        }
        
        if (minNum > maxNum) {
            setAlertSuccess(false);
            setAlertMessage(`Type #${i + 1}: Min value cannot be greater than Max value.`);
            setShowAlert(true);
            return;
        }
    }
    
    clearErrors("deviceTypes");
    handleSave(values);
};

    const handleSave = async (values: CombinedDevice) => {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key !== "deviceTypes" && value !== undefined && value !== null) {
                    formData.append(key, typeof value === "boolean" ? String(value) : String(value));
                }
            });

            if (values.deviceTypes && Array.isArray(values.deviceTypes)) {
                values.deviceTypes.forEach((typeObj, index) => {
                    formData.append(`deviceTypes[${index}][type]`, typeObj.type);
                    formData.append(`deviceTypes[${index}][minValue]`, String(typeObj.minValue));
                    formData.append(`deviceTypes[${index}][maxValue]`, String(typeObj.maxValue));
                });
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/update?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
                {
                    method: "PATCH",
                    body: formData,
                }
            );

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to update device");
            }

            await fetchDeviceData();
            setIsEditing(false);
            setSelectedFile(null);
            setAlertSuccess(true);
            setAlertMessage("Device updated successfully!");
            setShowAlert(true);
        } catch (error: any) {
            setAlertSuccess(false);
            setAlertMessage(error.message || "Failed to update device.");
            setShowAlert(true);
        }
    };

    const handleDeleteDevice = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/unregister?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (res.ok) {
                setUserDeviceData(null);
                setAlertSuccess(true);
                setAlertMessage("Device unregistered successfully");
                setShowAlert(true);
            } else {
                throw new Error(data.message || "Failed to delete device");
            }
        } catch (err: any) {
            setAlertSuccess(false);
            setAlertMessage(err.message || "Error deleting device.");
            setShowAlert(true);
        } finally {
            setShowDeleteDialog(false);
        }
    };

    if (!userDeviceData)
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center px-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">No device to display</h2>
                <p className="text-gray-600">Your device has been deleted or not available.</p>
            </div>
        );
  
    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-3xl mx-auto bg-teal-400">
                <CardHeader>
                    <div className="flex flex-col items-center gap-8 w-full">
                        {/* Device Info Top Section */}
                        <div className="flex flex-col items-center w-full">
                            <h2 className="text-3xl font-bold text-black text-center">
                                {userDeviceData.deviceName}
                            </h2>
                            <div className={`mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-full font-semibold ${userDeviceData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                <span className={`h-4 w-4 rounded-full ${userDeviceData.isActive ? "bg-green-600" : "bg-red-600"
                                    }`} />
                                <span>{userDeviceData.isActive ? "Active" : "Inactive"}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-6 w-full">
                                <Button onClick={handleEditToggle} disabled={isEditing} className="text-black bg-white  hover:bg-gray-300 cursor-pointer">
                                    <Pencil className=" h-5 w-5" /> Edit Device
                                </Button>
                                <Link href="/device-visualization">
                                    <Button className="text-black bg-white  hover:bg-gray-300 cursor-pointer">
                                        <BarChart className=" h-5 w-5" /> Visualize
                                    </Button>
                                </Link>
                                <Button variant="destructive" className="cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
                                    <X className=" h-5 w-5" /> Delete
                                </Button>
                            </div>
                        </div>

                        {/* Device Form Section */}
                        <div className="w-full">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <Form {...form}>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <h2 className="text-xl font-bold mb-8 text-gray-800 border-b border-gray-300 pb-4">General Details</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <FormField name="deviceId" control={control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Device ID</FormLabel>
                                                    <FormControl><Input {...field} disabled /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField name="deviceName" control={control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Device Name</FormLabel>
                                                    <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField name="serialNumber" control={control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Serial Number</FormLabel>
                                                    <FormControl><Input {...field} disabled /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField name="location" control={control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <div className="md:col-span-2">
                                                <FormField name="description" control={control} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} rows={8} disabled={!isEditing} className="w-full" />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                        </div>

                                        {/* Device Types */}
                                        <div>
                                            <h2 className="text-xl font-bold mb-8 text-gray-800 border-b border-gray-300 pb-4 pt-4">Device Types & Ranges</h2>
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-12 gap-2 items-end mb-4">
                                                    <div className="col-span-4">
                                                        <FormField
                                                            control={control}
                                                            name={`deviceTypes.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Type</FormLabel>
                                                                    <FormControl>
                                                                        {isEditing ? (
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {deviceTypeOptions.map((option) => (
                                                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                                                    ))}

                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <Input {...field} disabled />
                                                                        )}
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <FormField control={control} name={`deviceTypes.${index}.minValue`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Min Value</FormLabel>
                                                                <FormControl><Input type="number" {...field} disabled={!isEditing} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <FormField control={control} name={`deviceTypes.${index}.maxValue`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Max Value</FormLabel>
                                                                <FormControl><Input type="number" {...field} disabled={!isEditing} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        {isEditing && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() => handleRemoveType(index)}
                                                                className="h-8 w-8"
                                                                disabled={fields.length === 1}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {isEditing && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        append({ type: "", minValue: 0, maxValue: 0 });
                                                        clearErrors("deviceTypes");
                                                    }}
                                                >
                                                    ➕ Add Device Type
                                                </Button>
                                            )}
                                            {form.formState.errors.deviceTypes && (
                                                <p className="text-red-600 text-sm mt-2">
                                                    {form.formState.errors.deviceTypes.message as string}
                                                </p>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button type="submit" className="w-full sm:w-32">Save Changes</Button>
                                                <Button type="button" variant="outline" className="w-full sm:w-32" onClick={handleCancel}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Alert dialogs */}
            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={alertSuccess ? "text-green-600" : "text-red-600"}>
                            {alertSuccess ? "Success" : "Error"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-black text-white text-md">Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Your device will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteDevice}>
                            Yes, delete it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DevicePage;
