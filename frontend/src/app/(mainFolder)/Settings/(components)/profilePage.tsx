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

// Base URL for your NestJS user endpoints
const API_BASE = "http://localhost:3002/users";

interface ProfileFormValues {
  name: string;
  email: string;
  gender: string;
  nic: string;
  telephone: string;
  address: string;
}

export default function ProfilePage() {
  const { user, error, isLoading } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(true);

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
  // check Auth0 state
  useEffect(() => {
    console.log("Auth0 isLoading:", isLoading);
    console.log("Auth0 user:", user);
    console.log("Auth0 error:", error);
  }, [user, isLoading, error]);

  // Fetch backend profile after getting a valid email
  useEffect(() => {
    if (!isLoading && user && typeof user.email === "string") {
      const email = user.email;
      console.log("Fetching profile for", email);
      axios
        .get(`${API_BASE}/profile/${encodeURIComponent(email)}`)
        .then(({ data }) => {
          console.log("Profile data received:", data);
          setProfileData(data);

          // Conditionally set the name
          const name =
            data.name && data.name.includes("@")
              ? data.name.split("@")[0]
              : data.name;

          form.setValue("name", name || "");
          form.setValue("email", data.email || "");
          form.setValue("gender", data.gender || "");
          form.setValue("nic", data.nic || "");
          form.setValue("telephone", data.telephone || "");
          form.setValue("address", data.address || "");
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          setAlertSuccess(false);
          setAlertMessage("Failed to load profile.");
          setShowAlert(true);
        });
    }
  }, [isLoading, user, form]);

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleSave = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("gender", values.gender);
      formData.append("nic", values.nic);
      formData.append("telephone", values.telephone);
      formData.append("address", values.address);

      const fileInput = document.getElementById("picture") as HTMLInputElement;
      const newPicture = fileInput?.files?.[0];

      if (newPicture) {
        formData.append("picture", newPicture);
      }

      console.log("Updating profile for", values.email);
      const res = await axios.patch(
        `${API_BASE}/profile/${encodeURIComponent(values.email)}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Update response:", res.data);

      const nameChanged = values.name !== profileData?.name;
      const imageChanged = !!newPicture; // reload only if a new file was submitted

      setProfileData(res.data);
      setIsEditing(false);
      setAlertSuccess(true);
      setAlertMessage("Profile updated successfully.");
      setShowAlert(true);

      if (nameChanged || imageChanged) {
        window.location.reload(); // refresh only if name or image changed
      }
    } catch (err) {
      console.error("Error updating profile:", err);
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
                className="relative w-40 h-40 rounded-full overflow-hidden  cursor-pointer group"
              >
                <img
                  src={
                    profileData.picture
                      ? profileData.picture.startsWith("data:") // Base64 preview
                        ? profileData.picture
                        : profileData.picture.startsWith("/uploads") // Saved path
                        ? `http://localhost:3002${profileData.picture}`
                        : "/default.png"
                      : "/default.png"
                  }
                  alt="Profile Picture"
                  style={{ width: "160px", height: "160px" }}
                  className="object-cover w-full h-full rounded-full"
                />

                {isEditing && (
                  <div className="absolute inset-0 bg-gray-200  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="flex flex-col items-center mt-6 ">
                <h2 className="text-xl font-bold text-black">
                  {profileData.name && profileData.name.includes("@")
                    ? profileData.name.split("@")[0] // Extract part before @
                    : profileData.name ||
                      (profileData.email && profileData.email.split("@")[0])}
                </h2>

                <p className="text-md text-gray-800">{profileData.email}</p>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleEditToggle}
                  className="bg-white text-black text-md cursor-pointer mt-10"
                >
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>
            {/* Right Side - Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md ">
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
                          <FormLabel htmlFor="gender">Gender</FormLabel>{" "}
                          {/* Update for to reference the correct id */}
                          <FormControl>
                            <div className="flex gap-4">
                              {["Male", "Female", "Other"].map((opt) => {
                                const id = `gender-${opt.toLowerCase()}`; // Generate a unique id for each radio button
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
                      <Button type="submit" className="w-full cursor-pointer">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      {/*Alert box  for successfull update*/}
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
            <AlertDialogCancel className="bg-black text-white">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
