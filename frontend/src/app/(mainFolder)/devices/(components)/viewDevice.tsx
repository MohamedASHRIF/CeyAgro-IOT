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
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { Pencil, BarChart } from "lucide-react";

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

const DevicePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true);

  const sampleDeviceData = {
    id: "d002",
    dname: "Temperator Sensor 1",
    serialNumber: "SN-2023-8472",
    type: "Temperature Sensor",
    measurementParameter: "Temperator",
    measurementUnit: "K",
    minThreshold: "20",
    maxThreshold: "80",
    location: "Factory Floor A",
    description:
      "Professional-grade environmental sensor for temperature monitoring with high accuracy and reliability. Suitable for industrial and laboratory use.",
    picture: "/placeholder-device.jpg",
    isActive: true,
  };

  const form = useForm({
    defaultValues: sampleDeviceData,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setTimeout(() => {
          setUser(sampleDeviceData);
          form.reset(sampleDeviceData);
        }, 500);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [form]);

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      form.reset(user);
    }
  };

  const handleSave = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("dname", values.dname);
      formData.append("type", values.type);
      formData.append("measurementParameter", values.measurementParameter);
      formData.append("measurementUnit", values.measurementUnit);
      formData.append("location", values.location);
      formData.append("description", values.description);
      formData.append("isActive", values.isActive ? "true" : "false");

      const fileInput = document.getElementById("picture") as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("picture", fileInput.files[0]);
      }

      setTimeout(() => {
        const updatedData = {
          ...user,
          ...values,
          picture: fileInput?.files?.[0]
            ? URL.createObjectURL(fileInput.files[0])
            : user.picture,
        };

        setUser(updatedData);
        setIsEditing(false);
        setAlertSuccess(true);
        setAlertMessage("Device updated successfully!");
        setShowAlert(true);
      }, 1000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setAlertSuccess(false);
      setAlertMessage("Failed to update device.");
      setShowAlert(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev: any) => ({
          ...prev,
          picture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto bg-teal-400">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 min-h-[400px]">
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              <label
                htmlFor="picture"
                className="relative w-48 h-48 rounded-md overflow-hidden border-2 border-white cursor-pointer"
              >
                <img
                  src={user.picture || "/placeholder-device.jpg"}
                  alt="Device Image"
                  className="w-full h-full object-cover"
                />
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={!isEditing}
                />
              </label>

              <div className="flex flex-col items-start w-full mt-6 px-2">
                <h2 className="text-2xl font-bold text-black">{user.dname}</h2>
                <div
                  className={`mt-2 inline-flex items-center gap-3 px-3 py-1 rounded-full font-semibold
                  ${user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full ${user.isActive ? "bg-green-600" : "bg-red-600"
                      }`}
                  />
                  <span>{user.isActive ? "Active" : "Inactive"}</span>
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
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Form {...form}>
                  <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device ID</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="dname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="serialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Type</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="measurementParameter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurement Parameter</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="measurementUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurement Unit</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="minThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Threshold</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="maxThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Threshold</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} disabled={!isEditing} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

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

      <AlertDialog open={showAlert} onOpenChange={(isOpen) => setShowAlert(isOpen)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertSuccess ? "Success!" : "Error!"}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setShowAlert(false)}
              className={alertSuccess ? "bg-black" : "bg-red-500"}
            >
              {alertSuccess ? "Okay" : "Try Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DevicePage;
