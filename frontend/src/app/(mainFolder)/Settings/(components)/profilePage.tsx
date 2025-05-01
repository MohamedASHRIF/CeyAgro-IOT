"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { Pencil, Camera } from "lucide-react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "http://localhost:3002/user";

interface ProfileFormValues {
  name: string;
  email: string;
  gender: string;
  nic: string;
  telephone: string;
  address: string;
}

interface ProfileData {
  _id?: string;
  name: string;
  email: string;
  nickname?: string;
  gender: string;
  nic: string;
  telephone: string;
  address: string;
  picture?: string;
}

export default function ProfilePage() {
  const { user, error, isLoading } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      nic: "",
      telephone: "",
      address: "",
    },
  });

  const formSchema = z.object({
    telephone: z
      .string()
      .regex(
        /^\+94 7\d{8}$/,
        "Invalid Sri Lankan phone number format (e.g., +94 712345678)"
      ),
    nic: z
      .string()
      .min(10, "NIC must be at least 10 characters")
      .max(12, "NIC must be at most 12 characters"),
  });

  // Get display name based on business logic
  const getDisplayName = (data: ProfileData): string => {
    if (data.name) {
      return data.name;
    }
    return data.nickname || data.email.split('@')[0];
  };

  // Fetch backend profile after getting a valid email
  useEffect(() => {
    if (!isLoading && user && typeof user.email === "string") {
      const fetchProfile = async () => {
        try {
          const email = user.email as string;
          console.log("Fetching profile for", email);
          const { data } = await axios.get(`${API_BASE}/profile/${encodeURIComponent(email)}`);
          
          console.log("Profile data received:", data);
          
          // Ensure name is never empty
          const profileName = data.name || data.nickname || data.email.split('@')[0];
          
          setProfileData({
            ...data,
            name: profileName,
          });

          form.reset({
            name: profileName,
            email: data.email,
            gender: data.gender,
            nic: data.nic,
            telephone: data.telephone,
            address: data.address,
          });
        } catch (err) {
          console.error("Error fetching profile:", err);
          setAlertSuccess(false);
          setAlertMessage("Failed to load profile.");
          setShowAlert(true);
        }
      };

      fetchProfile();
    }
  }, [isLoading, user, form]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      // Ensure we never send empty name
      formData.append("name", values.name || values.email.split('@')[0]);
      formData.append("gender", values.gender);
      formData.append("nic", values.nic);
      formData.append("telephone", values.telephone);
      formData.append("address", values.address);

      const fileInput = document.getElementById("picture") as HTMLInputElement;
      const newPicture = fileInput?.files?.[0];

      if (newPicture) {
        formData.append("picture", newPicture);
      }

      console.log("Updating profile with data:", Object.fromEntries(formData.entries()));
      
      const { data } = await axios.patch(
        `${API_BASE}/profile/${encodeURIComponent(values.email)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Update response:", data);
      
      // Ensure the name in state is never set to email if it's empty
      const updatedName = data.name || data.nickname || values.email.split('@')[0];
      
      setProfileData({
        ...data,
        name: updatedName,
      });

      form.reset({
        name: updatedName,
        email: data.email,
        gender: data.gender,
        nic: data.nic,
        telephone: data.telephone,
        address: data.address,
      });

      setAlertSuccess(true);
      setAlertMessage("Profile updated successfully.");
      setShowAlert(true);
      setIsEditing(false);

      // Only reload if picture changed
      if (newPicture) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setAlertSuccess(false);
      setAlertMessage("Failed to update profile. Please try again.");
      setShowAlert(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev: any) => ({ ...prev, picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-2" />
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto bg-[hsl(172.5,_66%,_50.4%)]">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 min-h-[400px]">
            {/* Left Side */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              <label
                htmlFor="picture"
                className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
              >
                <img
                  src={
                    profileData.picture
                      ? profileData.picture.startsWith("data:")
                        ? profileData.picture
                        : profileData.picture.startsWith("/uploads")
                        ? `http://localhost:3002${profileData.picture}`
                        : "/default.png"
                      : "/default.png"
                  }
                  alt="Profile Picture"
                  style={{ width: "160px", height: "160px" }}
                  className="object-cover w-full h-full rounded-full"
                />

                {isEditing && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                )}

                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={!isEditing}
                />
              </label>
              <div className="flex flex-col items-center mt-6">
                <h2 className="text-xl font-bold text-black">
                  {getDisplayName(profileData)}
                </h2>
                <p className="text-md text-gray-800">{profileData.email}</p>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleEditToggle}
                    className="bg-white text-black text-md cursor-pointer mt-10"
                  >
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>
            {/* Right Side - Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(handleSave)}
                  >
                    <FormField
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              {["Male", "Female", "Other"].map((opt) => {
                                const id = `gender-${opt.toLowerCase()}`;
                                return (
                                  <label
                                    key={opt}
                                    className="flex items-center"
                                    htmlFor={id}
                                  >
                                    <input
                                      type="radio"
                                      id={id}
                                      value={opt}
                                      checked={field.value === opt}
                                      onChange={() => field.onChange(opt)}
                                      disabled={!isEditing}
                                      className="mr-2"
                                    />
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="nic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIC</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter NIC"
                              maxLength={12}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="telephone"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telephone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+94 7xxxxxxxx"
                              pattern="\+94 7\d{8}"
                              disabled={!isEditing}
                              maxLength={13}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="w-full"
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
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
    </div>
  );
}