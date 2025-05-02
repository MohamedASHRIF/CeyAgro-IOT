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
import { Pencil } from "lucide-react";
import axios from "axios";

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

const DevicePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true);

  const form = useForm({
    defaultValues: {
      dname: "",
      serialNumber: "",
      model: "", // Added model field
      type: "",
      manufacturer: "",
      seller: "",
      measurementParameter: "",
      measurementUnit: "",
      minThreshold: "",
      maxThreshold: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3002/users/full-profile/amali@example.com"
        );
        const data = await response.json();
        setUser(data);
        // Update form values with device data when available
        form.setValue("dname", data.dname || "");
        form.setValue("serialNumber", data.serialNumber || "");
        form.setValue("model", data.model || ""); // Initialize model field
        form.setValue("type", data.type || "");
        form.setValue("manufacturer", data.manufacturer || "");
        form.setValue("seller", data.seller || "");
        form.setValue("measurementParameter", data.measurementParameter || "");
        form.setValue("measurementUnit", data.measurementUnit || "");
        form.setValue("minThreshold", data.minThreshold || "");
        form.setValue("maxThreshold", data.maxThreshold || "");
        form.setValue("description", data.description || "");
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
    // Reset form values to original user data
    if (user) {
      form.setValue("dname", user.dname || "");
      form.setValue("serialNumber", user.serialNumber || "");
      form.setValue("model", user.model || "");
      form.setValue("type", user.type || "");
      form.setValue("manufacturer", user.manufacturer || "");
      form.setValue("seller", user.seller || "");
      form.setValue("measurementParameter", user.measurementParameter || "");
      form.setValue("measurementUnit", user.measurementUnit || "");
      form.setValue("minThreshold", user.minThreshold || "");
      form.setValue("maxThreshold", user.maxThreshold || "");
      form.setValue("description", user.description || "");
    }
  };

  const handleSave = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("dname", values.dname);
      formData.append("serialNumber", values.serialNumber);
      formData.append("model", values.model); // Include model in form data
      formData.append("type", values.type);
      formData.append("manufacturer", values.manufacturer);
      formData.append("seller", values.seller);
      formData.append("measurementParameter", values.measurementParameter);
      formData.append("measurementUnit", values.measurementUnit);
      formData.append("minThreshold", values.minThreshold);
      formData.append("maxThreshold", values.maxThreshold);
      formData.append("description", values.description);

      // Append the image if it exists
      const fileInput = document.getElementById("picture") as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("picture", fileInput.files[0]);
      }

      // Log FormData content to check
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // send PATCH request to backend
      const response = await axios.patch(
        `http://localhost:3002/devices/${values.serialNumber}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response.data);

      // Update device data with returned data
      setUser((prev: any) => ({
        ...prev,
        ...response.data,
        picture: fileInput?.files?.[0]
          ? URL.createObjectURL(fileInput.files[0])
          : response.data.pictureUrl || prev.picture,
      }));

      setIsEditing(false);
      setAlertSuccess(true);
      setAlertMessage("Device updated successfully!");
      setShowAlert(true);
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

  useEffect(() => {
    if (user && user.picture) {
      console.log(user.picture);
    }
  }, [user]);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-teal-400  border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto bg-teal-400">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 min-h-[400px]">
            {/* Left Side - Device Image Section */}
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

              <div className="flex flex-col items-center mt-6 space-y-2">
                <h2 className="text-2xl font-bold text-black">{user.dname}</h2>

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
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(handleSave)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Device Name */}
                      <FormField
                        name="dname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Serial Number */}
                      <FormField
                        name="serialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Model - Added this new field */}
                      <FormField
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Device Type */}
                      <FormField
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Type</FormLabel>
                            <FormControl>
                              {isEditing ? (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sensor type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="temperatureSensor">
                                      Temperature Sensor
                                    </SelectItem>
                                    <SelectItem value="pressureSensor">
                                      Pressure Sensor
                                    </SelectItem>
                                    <SelectItem value="proximitySensor">
                                      Proximity Sensor
                                    </SelectItem>
                                    <SelectItem value="motionSensor">
                                      Motion Sensor
                                    </SelectItem>
                                    <SelectItem value="lightSensor">
                                      Light Sensor
                                    </SelectItem>
                                    <SelectItem value="soundSensor">
                                      Sound Sensor
                                    </SelectItem>
                                    <SelectItem value="gasSensor">
                                      Gas Sensor
                                    </SelectItem>
                                    <SelectItem value="humiditySensor">
                                      Humidity Sensor
                                    </SelectItem>
                                    <SelectItem value="touchSensor">
                                      Touch Sensor
                                    </SelectItem>
                                    <SelectItem value="magneticSensor">
                                      Magnetic Sensor
                                    </SelectItem>
                                    <SelectItem value="imageSensor">
                                      Image Sensor
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input {...field} disabled />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Manufacturer */}
                      <FormField
                        name="manufacturer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacturer</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Seller */}
                      <FormField
                        name="seller"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seller</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Measurement Parameter */}
                      <FormField
                        name="measurementParameter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurement Parameter</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Measurement Unit */}
                      <FormField
                        name="measurementUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurement Unit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Min Threshold */}
                      <FormField
                        name="minThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Threshold</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Max Threshold */}
                      <FormField
                        name="maxThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Threshold</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="mt-2"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <FormField
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="mt-2"
                              disabled={!isEditing}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Save and Cancel buttons */}
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

      {/* Alert dialog */}
      <AlertDialog
        open={showAlert}
        onOpenChange={(isOpen) => setShowAlert(isOpen)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertSuccess ? "Success!" : "Error!"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>
              Close
            </AlertDialogCancel>
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
