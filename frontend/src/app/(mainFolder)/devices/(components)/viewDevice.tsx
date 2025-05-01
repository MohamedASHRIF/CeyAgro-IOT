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

const DevicePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true); 

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      nic: "",
      telephone: "",
      address: "",
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
        form.setValue("name", data.name);
        form.setValue("email", data.email);
        form.setValue("gender", data.gender || "");
        form.setValue("nic", data.nic || "");
        form.setValue("telephone", data.telephone || "");
        form.setValue("address", data.address || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [form]);

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleSave = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("gender", values.gender);
      formData.append("nic", values.nic);
      formData.append("telephone", values.telephone);
      formData.append("address", values.address);
      formData.append("email", values.email);

      // Append the image if it exists
      const fileInput = document.getElementById("picture") as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("picture", fileInput.files[0]);
      }

      // Log FormData content to check
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // send PATCH request to backend based on email
      const response = await axios.patch(
        `http://localhost:3002/users/profile/${values.email}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",//multipart means different input types like text, file
          },
        }
      );

      console.log("Response:", response.data);

      // Update user profile with returned data
      setUser((prev: any) => ({
        ...prev,
        name: values.name,
        gender: values.gender,
        nic: values.nic,
        telephone: values.telephone,
        address: values.address,
        picture: fileInput?.files?.[0]
          ? URL.createObjectURL(fileInput.files[0])
          : response.data.pictureUrl || prev.picture, // response returns the image as URL
      }));

      setIsEditing(false);
      setAlertSuccess(true);
      setAlertMessage("Profile updated successfully!");
      setShowAlert(true);
    } catch (error) {
      console.error("Error saving changes:", error);
      setAlertSuccess(false);
      setAlertMessage("Failed to update profile.");
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
          picture: reader.result, // Preview the uploaded image
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    if (user && user.picture) {
      console.log(user.picture); // This will log the value of user.picture
    }
  }, [user]);
  if (!user) return <p>Loading User Data...</p>;

  return (
    <div className="container  mx-auto p-4">
      <Card className="max-w-6xl mx-auto bg-[hsl(172.5,_66%,_50.4%)]">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 min-h-[400px]">
            {/* Left Side - Profile Section */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              {/* Profile Picture Upload */}
              <label
  htmlFor="picture"
  className="relative w-100 h-80 rounded-none overflow-hidden border-3 border-white group cursor-pointer"
>
  {/* Current profile picture */}
  <img
    src="{device.picture} "// Don't add '/uploads' again
    alt="Device Image"
    style={{ width: "700px", height: "500px" }} // Adjust size here
  />

  {/* Hidden file input */}
  <input
    id="picture"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleImageUpload}
    disabled={!isEditing} // Disable file input if not in editing mode
  />
</label>


              {/* Name, Email, and Edit Button */}
              <div className="flex flex-col items-center mt-6 space-y-2">
                <h2 className="text-2xl font-bold text-black">Device Name</h2>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditToggle}
                  className="text-black bg-white cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full md:w-2/3">
  <div className="bg-white p-6 rounded-lg shadow-md">
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Name */}
          <FormField
            name="dname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Name</FormLabel>
                <FormControl>
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
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
                  <Input {...field} className="mt-2" disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description (single column) */}
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="mt-2" disabled={!isEditing} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Save button only appears when editing */}
        {isEditing && (
          <div>
            <Button type="submit" className="w-full">
              Save Changes
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

      {/* Alert dialog after updaing*/}
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
