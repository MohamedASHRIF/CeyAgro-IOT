"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { Pencil, BarChart, X, Upload } from "lucide-react";

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

type DeviceData = {
  deviceId: string;
  deviceName: string;
  serialNumber: string;
  type: string;
  measurementParameter: string;
  measurementUnit: string;
  minThreshold: string;
  maxThreshold: string;
  location: string;
  description: string;
  deviceImage?: string | null;
  isActive: boolean;
};

type UserDevice = {
  email: string;
  deviceId: string;
  deviceImage?: string | null;
};

type CombinedDevice = DeviceData & Partial<UserDevice>;

const DevicePage = () => {
  const deviceId = "d111";
  const email = "hasini20020116@gmail.com";
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [userDeviceData, setUserDeviceData] = useState<CombinedDevice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true);
  const [imageToRemove, setImageToRemove] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CombinedDevice>({
    defaultValues: {} as CombinedDevice,
  });

  useEffect(() => {
    if (!deviceId || !email) return;

    const fetchDeviceData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/device-user/device?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`
        );

        if (!res.ok) throw new Error("Failed to fetch device data");

        const json = await res.json();
        if (!json.success) throw new Error("API returned failure");

        const combined: CombinedDevice = {
          ...json.data.deviceData,
          ...json.data.userDevice,
        };

        setUserDeviceData(combined);
        form.reset(combined);

        // Set initial preview image
        if (combined.deviceImage) {
          setPreviewImage(combined.deviceImage);
        }
      } catch (error: any) {
        console.error("Error fetching device data:", error);
        setAlertSuccess(false);
        setAlertMessage(error.message || "Failed to load device data from server");
        setShowAlert(true);
      }
      
    };

    fetchDeviceData();
  }, [deviceId, email, form]);

  const handleEditToggle = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setImageToRemove(false);
    setSelectedFile(null);
    setPreviewImage(userDeviceData?.deviceImage || null);
    if (userDeviceData) form.reset(userDeviceData);
  };

  const handleSave = async (values: CombinedDevice) => {
    try {
      const formData = new FormData();

      // Append form fields (excluding deviceImage from values)
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'deviceImage' && value !== undefined && value !== null) {
          formData.append(key, typeof value === "boolean" ? String(value) : value);
        }
      });

      // Handle image removal
      if (imageToRemove) {
        formData.append("removedeviceImage", "true");
      }

      // Handle new image upload
      if (selectedFile) {
        formData.append("deviceImage", selectedFile);
      }

      const res = await fetch(
        `http://localhost:3002/device-user/update?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to update device");

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Update failed");
      }

      // Update local state with the response data
      const updatedDevice = {
        ...userDeviceData!,
        ...values,
        deviceImage: json.data.deviceImage // Use the image path from the response
      };

      setUserDeviceData(updatedDevice);
      setPreviewImage(json.data.deviceImage);
      setIsEditing(false);
      setImageToRemove(false);
      setSelectedFile(null);
      setAlertSuccess(true);
      setAlertMessage("Device updated successfully!");
      setShowAlert(true);

    } catch (error: any) {
      console.error("Error saving device:", error);
      setAlertSuccess(false);
      setAlertMessage(error.message || "Failed to update device.");
      setShowAlert(true);
    }
  };
const handleDeleteDevice = async () => {
  try {
    const res = await fetch(`http://localhost:3002/device-user/unregister?email=${encodeURIComponent(email)}&deviceId=${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (res.ok) {
       setUserDeviceData(null); 
      setAlertSuccess(true);
      setAlertMessage("Device unregistered successfully");
      setShowAlert(true);
      // Optional: Redirect or UI update here
    } else {
      throw new Error(data.message || "Failed to delete device");
    }
  } catch (err: any) {
    console.error(err);
    setAlertSuccess(false);
    setAlertMessage(err.message || "Error deleting device.");
    setShowAlert(true);
  } finally {
    setShowDeleteDialog(false);
  }
};

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlertSuccess(false);
        setAlertMessage("Please select a valid image file.");
        setShowAlert(true);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setAlertSuccess(false);
        setAlertMessage("Image size must be less than 5MB.");
        setShowAlert(true);
        return;
      }

      setSelectedFile(file);
      setImageToRemove(false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageToRemove(true);
    setSelectedFile(null);
    setPreviewImage(null);

    // Clear the file input
    const fileInput = document.getElementById("deviceImage") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const getImageSrc = () => {
    if (imageToRemove) return "/placeholder-device.jpg";
    if (previewImage) {
      if (previewImage.startsWith("data:")) {
        return previewImage; // Base64 preview
      }
      if (previewImage.startsWith("/uploads")) {
        return `http://localhost:3002${previewImage}`;
      }
      return previewImage;
    }
    return "/placeholder-device.jpg";
  };

  if (!userDeviceData)
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">No device to display</h2>
      <p className="text-gray-600">Your device has been deleted or not available.</p>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Success</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-black text-white text-md">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );


  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto bg-teal-400">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 min-h-[400px]">
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              <div className="relative">
                <label
                  htmlFor="deviceImage"
                  className="relative w-48 h-48 rounded-md overflow-hidden border-2 border-white cursor-pointer group block"
                >
                  <img
                    src={getImageSrc()}
                    alt="Device Image"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm">Change Image</span>
                      </div>
                    </div>
                  )}
                  <input
                    id="deviceImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={!isEditing}
                  />
                </label>

                {/* Remove button */}
                {isEditing && (previewImage || userDeviceData.deviceImage) && !imageToRemove && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center w-full mt-6 px-2">
                <h2 className="text-2xl font-bold text-black">
                  {userDeviceData.deviceName}
                </h2>
                <div
                  className={`mt-2 inline-flex items-center gap-3 px-3 py-1 rounded-full font-semibold ${userDeviceData.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full ${userDeviceData.isActive ? "bg-green-600" : "bg-red-600"
                      }`}
                  />
                  <span>{userDeviceData.isActive ? "Active" : "Inactive"}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    className="text-black bg-white cursor-pointer flex items-center gap-2"
                    disabled={isEditing}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Device
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black bg-white cursor-pointer flex items-center gap-2"
                    onClick={() => alert("Visualize Device Clicked")}
                  >
                    <BarChart className="h-4 w-4" />
                    Visualize
                  </Button>
                 <Button
  variant="destructive"
  size="sm"
  className="flex items-center gap-2"
  onClick={() => setShowDeleteDialog(true)}
>
  <X className="h-4 w-4" />
  Delete
</Button>


                </div>
              </div>
            </div>

            {/* Device Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Form {...form}>
                  <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="deviceId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="deviceName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="serialNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="measurementParameter" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement Parameter</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="measurementUnit" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement Unit</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="minThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Threshold</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField name="maxThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Threshold</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <FormField name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} disabled={!isEditing} />
                        </FormControl>
                      </FormItem>
                    )} />

                    {isEditing && (
                      <div className="flex gap-4 justify-center">
                        <Button type="submit" className="w-full sm:w-32">
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-32"
                          onClick={handleCancel}
                        >
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
            <AlertDialogTitle
              className={alertSuccess ? "text-green-600" : "text-red-600"}
            >
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
      <AlertDialogAction
        className="bg-red-600 hover:bg-red-700"
        onClick={handleDeleteDevice}
      >
        Yes, delete it
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </div>
  );
};

export default DevicePage;