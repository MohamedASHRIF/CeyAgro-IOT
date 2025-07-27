/*"use client";

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

export default DevicePage;*/
"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Pencil,
  BarChart,
  Plus,
  Trash2,
  Settings,
  MapPin,
  Hash,
  Monitor,
  FileText,
  Gauge,
  ArrowLeft,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
type DeviceType = {
  type: string
  minValue: number
  maxValue: number
}

type DeviceData = {
  deviceId: string
  deviceName: string
  serialNumber: string
  location: string
  description: string
  isActive: boolean
  deviceTypes: DeviceType[]
}

type UserDevice = {
  email: string
  deviceId: string
}

type CombinedDevice = DeviceData & Partial<UserDevice>

type DevicePageProps = {
  deviceId: string
  userEmail: string
}

const DevicePage = ({ deviceId, userEmail }: DevicePageProps) => {
  const email = userEmail
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userDeviceData, setUserDeviceData] = useState<CombinedDevice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertSuccess, setAlertSuccess] = useState(true)
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<string[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device-types`)
        const data = await res.json()
        if (res.ok) {
          setDeviceTypeOptions(data)
        } else {
          console.error("Failed to fetch device types:", data.message)
        }
      } catch (err) {
        console.error("Error fetching device types:", err)
      } finally {
        setLoadingTypes(false)
      }
    }
    fetchDeviceTypes()
  }, [])

  const form = useForm<CombinedDevice>({ defaultValues: {} })
  const { control, reset, handleSubmit, setError, clearErrors } = form
  const { fields, append, remove } = useFieldArray({ control, name: "deviceTypes" })

  const fetchDeviceData = useCallback(async () => {
    if (!deviceId || !email) return
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/device?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
      )
      if (!res.ok) throw new Error("Failed to fetch device data")
      const json = await res.json()
      if (!json.success) throw new Error("API returned failure")
      const combined: CombinedDevice = {
        ...json.data.deviceData,
        ...json.data.userDevice,
      }
      setUserDeviceData(combined)
      reset(combined)
    } catch (error: any) {
      setAlertSuccess(false)
      setAlertMessage(error.message || "Failed to load device data from server")
      setShowAlert(true)
    }
  }, [deviceId, email, reset])

  useEffect(() => {
    fetchDeviceData()
  }, [fetchDeviceData])

  const handleEditToggle = () => setIsEditing(true)

  const handleCancel = () => {
    setIsEditing(false)
    if (userDeviceData) reset(userDeviceData)
    clearErrors("deviceTypes")
  }

  const handleRemoveType = (index: number) => {
    if (fields.length > 1) {
      remove(index)
      clearErrors("deviceTypes")
    } else {
      setError("deviceTypes", { type: "manual", message: "At least one device type is required." })
    }
  }

  const onSubmit = (values: CombinedDevice) => {
    if (!values.deviceTypes || values.deviceTypes.length === 0) {
      setError("deviceTypes", { type: "manual", message: "At least one device type is required." })
      return
    }

    for (let i = 0; i < values.deviceTypes.length; i++) {
      const { minValue, maxValue } = values.deviceTypes[i]

      // Convert to numbers for proper comparison
      const minNum = Number(minValue)
      const maxNum = Number(maxValue)

      // Check if the values are valid numbers
      if (isNaN(minNum) || isNaN(maxNum)) {
        setAlertSuccess(false)
        setAlertMessage(`Type #${i + 1}: Please enter valid numbers for Min and Max values.`)
        setShowAlert(true)
        return
      }

      if (minNum === maxNum) {
        setAlertSuccess(false)
        setAlertMessage(`Type #${i + 1}: Min and Max values cannot be equal.`)
        setShowAlert(true)
        return
      }

      if (minNum > maxNum) {
        setAlertSuccess(false)
        setAlertMessage(`Type #${i + 1}: Min value cannot be greater than Max value.`)
        setShowAlert(true)
        return
      }
    }

    clearErrors("deviceTypes")
    handleSave(values)
  }

  const handleSave = async (values: CombinedDevice) => {
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "deviceTypes" && value !== undefined && value !== null) {
          formData.append(key, typeof value === "boolean" ? String(value) : String(value))
        }
      })

      if (values.deviceTypes && Array.isArray(values.deviceTypes)) {
        values.deviceTypes.forEach((typeObj, index) => {
          formData.append(`deviceTypes[${index}][type]`, typeObj.type)
          formData.append(`deviceTypes[${index}][minValue]`, String(typeObj.minValue))
          formData.append(`deviceTypes[${index}][maxValue]`, String(typeObj.maxValue))
        })
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/update?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
        {
          method: "PATCH",
          body: formData,
        },
      )

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update device")
      }

      await fetchDeviceData()
      setIsEditing(false)
      setAlertSuccess(true)
      setAlertMessage("Device updated successfully!")
      setShowAlert(true)
    } catch (error: any) {
      setAlertSuccess(false)
      setAlertMessage(error.message || "Failed to update device.")
      setShowAlert(true)
    }
  }

  const handleDeleteDevice = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/unregister?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
        { method: "DELETE" },
      )
      const data = await res.json()
      if (res.ok) {
        setUserDeviceData(null)
        setAlertSuccess(true)
        setAlertMessage("Device unregistered successfully")
        setShowAlert(true)
      } else {
        throw new Error(data.message || "Failed to delete device")
      }
    } catch (err: any) {
      setAlertSuccess(false)
      setAlertMessage(err.message || "Error deleting device.")
      setShowAlert(true)
    } finally {
      setShowDeleteDialog(false)
    }
  }

  if (!userDeviceData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No device to display</h2>
            <p className="text-gray-600 mb-6">Your device has been deleted or is not available.</p>
            <Link href="/dashboard">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
      

        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-gray-200 via-gray-600 to-gray-200 px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                <div className="bg-white/20 p-3 rounded-full">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">{userDeviceData.deviceName}</h2>
                  <Badge
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                      userDeviceData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${userDeviceData.isActive ? "bg-green-600" : "bg-red-600"}`}
                    />
                    <span>{userDeviceData.isActive ? "Active" : "Inactive"}</span>
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center md:justify-end gap-4">
                <Button
                  onClick={handleEditToggle}
                  disabled={isEditing}
                  className={`bg-white text-black hover:bg-white cursor-pointer font-semibold ${
                    isEditing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Pencil className="h-4 w-4" /> Edit Device
                </Button>
                <Link href="/device-visualization">
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <BarChart className="h-4 w-4 " /> Visualize Data
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 " /> Delete Device
                </Button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* General Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    General Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="deviceId"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                            Device ID
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="h-11 bg-gray-50 border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="deviceName"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                            Device Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="serialNumber"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium">Serial Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="h-11 bg-gray-50 border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                            Location
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
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
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={8}
                              disabled={!isEditing}
                              className="min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Device Types */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    Device Types & Ranges
                  </h3>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border border-gray-200 bg-gray-50/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <FormField
                              control={control}
                              name={`deviceTypes.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Type</FormLabel>
                                  <FormControl>
                                    {isEditing ? (
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="h-11 border-gray-300 focus:border-gray-500 focus:ring-green-500">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        {loadingTypes ? (
                                          <p className="p-2 text-sm text-gray-500">Loading types...</p>
                                        ) : (
                                          <SelectContent>
                                            {deviceTypeOptions.map((option) => (
                                              <SelectItem key={option} value={option}>
                                                {option}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        )}
                                      </Select>
                                    ) : (
                                      <Input {...field} disabled className="h-11 bg-gray-50 border-gray-300" />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name={`deviceTypes.${index}.minValue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Min Value</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      disabled={!isEditing}
                                      className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name={`deviceTypes.${index}.maxValue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Max Value</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      disabled={!isEditing}
                                      className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {isEditing && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveType(index)}
                                className="h-11"
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {isEditing && (
                     <Button
  type="button"
  variant="outline"
  onClick={() => {
    append({ type: "", minValue: 0, maxValue: 0 })
    clearErrors("deviceTypes")
  }}
  className="w-fit px-3 py-1.5 text-sm text-black hover:bg-teal-400 bg-teal-400 cursor-pointer flex items-center"
>
  <Plus className="w-4 h-4 mr-2" />
  Add Device Type
</Button>

                    )}
                    {form.formState.errors.deviceTypes && (
                      <p className="text-red-600 text-sm mt-2">{form.formState.errors.deviceTypes.message as string}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                 <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
  <Button type="submit" className="w-full sm:w-40 bg-black text-white">
    Save Changes
  </Button>
  <Button
    type="button"
    variant="outline"
    className="w-full sm:w-32 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
    onClick={handleCancel}
  >
    Cancel
  </Button>
</div>

                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

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
            <AlertDialogCancel className="bg-gray-900 text-white hover:bg-gray-800">Close</AlertDialogCancel>
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
  )
}

export default DevicePage

