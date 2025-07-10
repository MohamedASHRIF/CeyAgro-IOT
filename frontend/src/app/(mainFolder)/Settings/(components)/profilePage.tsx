// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { z } from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Pencil, Camera } from "lucide-react";
// import axios from "axios";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import {
//   AlertDialog,
//   AlertDialogFooter,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogCancel,
// } from "@/components/ui/alert-dialog";
// import { Skeleton } from "@/components/ui/skeleton";

// const API_BASE = "http://localhost:3002/user";

// interface ProfileFormValues {
//   name: string;
//   email: string;
//   gender: string;
//   nic: string;
//   telephone: string;
//   address: string;
// }

// interface ProfileData {
//   _id?: string;
//   name: string;
//   email: string;
//   nickname?: string;
//   gender: string;
//   nic: string;
//   telephone: string;
//   address: string;
//   picture?: string;
// }

// export default function ProfilePage() {
//   const { user, error, isLoading } = useUser();
//   const [profileData, setProfileData] = useState<ProfileData | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [alertSuccess, setAlertSuccess] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const form = useForm<ProfileFormValues>({
//     defaultValues: {
//       name: "",
//       email: "",
//       gender: "",
//       nic: "",
//       telephone: "",
//       address: "",
//     },
//   });

//   const formSchema = z.object({
//     telephone: z
//       .string()
//       .regex(
//         /^\+94 7\d{8}$/,
//         "Invalid Sri Lankan phone number format (e.g., +94 712345678)"
//       ),
//     nic: z
//       .string()
//       .min(10, "NIC must be at least 10 characters")
//       .max(12, "NIC must be at most 12 characters"),
//   });

//   const getDisplayName = (data: ProfileData): string => {
//     if (data.name && data.name !== data.email) {
//       return data.name;
//     }
//     return data.nickname || data.email.split("@")[0];
//   };

//   useEffect(() => {
//     if (!isLoading && user && typeof user.email === "string") {
//       const fetchProfile = async () => {
//         try {
//           const email = user.email as string;
//           console.log("Fetching profile for", email);
//           const { data } = await axios.get(
//             `${API_BASE}/profile/${encodeURIComponent(email)}`
//           );

//           console.log("Profile data received:", data);

//           let profileName = data.name;
//           if (!profileName || profileName === data.email) {
//             profileName = data.nickname || data.email.split("@")[0];
//           }

//           setProfileData({
//             ...data,
//             name: profileName,
//           });

//           form.reset({
//             name: profileName,
//             email: data.email,
//             gender: data.gender,
//             nic: data.nic,
//             telephone: data.telephone,
//             address: data.address,
//           });
//         } catch (err) {
//           console.error("Error fetching profile:", err);
//           setAlertSuccess(false);
//           setAlertMessage("Failed to load profile.");
//           setShowAlert(true);
//         }
//       };

//       fetchProfile();
//     }
//   }, [isLoading, user, form]);

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleSave = async (values: ProfileFormValues) => {
//     setIsUpdating(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", values.name);
//       formData.append("gender", values.gender);
//       formData.append("nic", values.nic);
//       formData.append("telephone", values.telephone);
//       formData.append("address", values.address);

//       const fileInput = document.getElementById("picture") as HTMLInputElement;
//       const newPicture = fileInput?.files?.[0];

//       if (newPicture) {
//         formData.append("picture", newPicture);
//       }

//       console.log(
//         "Updating profile with data:",
//         Object.fromEntries(formData.entries())
//       );

//       const { data } = await axios.patch(
//         `${API_BASE}/profile/${encodeURIComponent(values.email)}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       console.log("Update response:", data);

//       setProfileData({
//         ...data,
//         name: data.name,
//       });

//       form.reset({
//         name: data.name,
//         email: data.email,
//         gender: data.gender,
//         nic: data.nic,
//         telephone: data.telephone,
//         address: data.address,
//       });

//       setAlertSuccess(true);
//       setAlertMessage("Profile updated successfully.");
//       setShowAlert(true);
//       setIsEditing(false);

//       // Always reload after successful update
//       window.location.reload();
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setAlertSuccess(false);
//       setAlertMessage("Failed to update profile. Please try again.");
//       setShowAlert(true);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileData((prev: any) => ({
//           ...prev,
//           picture: reader.result as string,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   if (!profileData) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-center">
//           <Skeleton className="h-32 w-32 rounded-full mx-auto mb-2" />
//           <Skeleton className="h-6 w-48 mx-auto mb-2" />
//           <Skeleton className="h-6 w-64 mx-auto" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <Card className="max-w-3xl mx-auto bg-teal-400">
//         <CardHeader>
//           <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 min-h-[400px]">
//             {/* Left Side */}
//             <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
//               <label
//                 htmlFor="picture"
//                 className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
//               >
//                 <img
//                   src={
//                     profileData.picture
//                       ? profileData.picture.startsWith("data:")
//                         ? profileData.picture
//                         : profileData.picture.startsWith("/uploads")
//                         ? `http://localhost:3002${profileData.picture}`
//                         : "/default.png"
//                       : "/default.png"
//                   }
//                   alt="Profile Picture"
//                   className="object-cover w-full h-full rounded-full"
//                 />

//                 {isEditing && (
//                   <div className="absolute inset-0 bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                     <Camera className="w-10 h-10 text-white" />
//                   </div>
//                 )}

//                 <input
//                   id="picture"
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageUpload}
//                   disabled={!isEditing}
//                 />
//               </label>
//               <div className="flex flex-col items-center mt-6">
//                 <h2 className="text-xl font-bold text-black">
//                   {getDisplayName(profileData)}
//                 </h2>
//                 <p className="text-md text-gray-800">{profileData.email}</p>
//                 <Button
//                   variant="ghost"
//                   size="lg"
//                   className={`bg-white text-black text-md mt-4 md:mt-10 ${
//                     isEditing
//                       ? "opacity-50 cursor-not-allowed"
//                       : "cursor-pointer"
//                   }`}
//                   onClick={handleEditToggle}
//                   disabled={isEditing}
//                 >
//                   <Pencil className="h-4 w-4 mr-2" /> Edit Profile
//                 </Button>
//               </div>
//             </div>
//             {/* Right Side - Form */}
//             <div className="w-full md:w-2/3">
//               <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
//                 <Form {...form}>
//                   <form
//                     className="space-y-4"
//                     onSubmit={form.handleSubmit(handleSave)}
//                   >
//                     <FormField
//                       name="name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Name</FormLabel>
//                           <FormControl>
//                             <Input {...field} disabled={!isEditing} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input {...field} disabled />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       name="gender"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Gender</FormLabel>
//                           <FormControl>
//                             <div className="flex gap-4">
//                               {["Male", "Female", "Other"].map((opt) => {
//                                 const id = `gender-${opt.toLowerCase()}`;
//                                 return (
//                                   <label
//                                     key={opt}
//                                     className="flex items-center"
//                                     htmlFor={id}
//                                   >
//                                     <input
//                                       type="radio"
//                                       id={id}
//                                       value={opt}
//                                       checked={field.value === opt}
//                                       onChange={() => field.onChange(opt)}
//                                       disabled={!isEditing}
//                                       className="mr-2"
//                                     />
//                                     {opt}
//                                   </label>
//                                 );
//                               })}
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       name="nic"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>NIC</FormLabel>
//                           <FormControl>
//                             <Input
//                               {...field}
//                               placeholder="Enter NIC"
//                               maxLength={12}
//                               disabled={!isEditing}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       name="telephone"
//                       control={form.control}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Telephone</FormLabel>
//                           <FormControl>
//                             <Input
//                               {...field}
//                               type="tel"
//                               placeholder="+94 7xxxxxxxx"
//                               pattern="\+94 7\d{8}"
//                               disabled={!isEditing}
//                               maxLength={13}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       name="address"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Address</FormLabel>
//                           <FormControl>
//                             <Textarea {...field} disabled={!isEditing} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     {isEditing && (
//                       <div className="flex flex-col sm:flex-row gap-2 justify-center">
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => setIsEditing(false)}
//                           className="w-full sm:w-32"
//                           disabled={isUpdating}
//                         >
//                           Cancel
//                         </Button>
//                         <Button
//                           type="submit"
//                           className="w-full sm:w-32"
//                           disabled={isUpdating}
//                         >
//                           {isUpdating ? "Saving..." : "Save"}
//                         </Button>
//                       </div>
//                     )}
//                   </form>
//                 </Form>
//               </div>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>
//       <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle
//               className={alertSuccess ? "text-green-600" : "text-red-600"}
//             >
//               {alertSuccess ? "Success" : "Error"}
//             </AlertDialogTitle>
//             <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="bg-black text-white text-md">
//               Close
//             </AlertDialogCancel>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { Pencil, Camera, X } from "lucide-react";
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

const API_BASE = "http://localhost:3001/user";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email(),
  gender: z.string().optional(),
  nic: z.string().min(10, "NIC must be at least 10 characters").max(12, "NIC must be at most 12 characters").optional().or(z.literal("")),
  telephone: z.string().regex(/^\+94 7\d{8}$/, "Invalid Sri Lankan phone number format").optional().or(z.literal("")),
  address: z.string().optional(),
});

// Infer the type from the schema to ensure consistency
type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileData {
  _id?: string;
  name: string;
  email: string;
  nickname?: string;
  gender?: string;
  nic?: string;
  telephone?: string;
  address?: string;
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
  const [imageToRemove, setImageToRemove] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      nic: "",
      telephone: "",
      address: "",
    },
  });

  // Get display name - prioritize actual name over email-derived names
  const getDisplayName = (data: ProfileData): string => {
    // If name exists and is not empty
    if (data.name && data.name.trim()) {
      // If name is equal to the full email, show just the email prefix
      if (data.name === data.email) {
        return data.email.split("@")[0];
      }
      // If name is not just the email prefix, use the actual name
      if (data.name !== data.email.split("@")[0]) {
        return data.name;
      }
    }

    // Fall back to nickname or email prefix
    return data.nickname || data.email.split("@")[0];
  };

  // Get the name to display in the form field
  const getFormDisplayName = (data: ProfileData): string => {
    // If name exists and is not empty
    if (data.name && data.name.trim()) {
      // If name is equal to the full email, show just the email prefix
      if (data.name === data.email) {
        return data.email.split("@")[0];
      }
      // Otherwise, use the actual name
      return data.name;
    }

    // Fall back to nickname or email prefix
    return data.nickname || data.email.split("@")[0];
  };

  // Handle edit toggle function
  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form to original values and reset image removal flag
      setImageToRemove(false);
      if (profileData) {
        form.reset({
          name: getFormDisplayName(profileData),
          email: profileData.email,
          gender: profileData.gender || "",
          nic: profileData.nic || "",
          telephone: profileData.telephone || "",
          address: profileData.address || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    if (!isLoading && user && typeof user.email === "string") {
      const fetchProfile = async () => {
        try {
          const email = user.email as string;
          console.log("Fetching profile for email:", email);

          const { data } = await axios.get(
            `${API_BASE}/profile/${encodeURIComponent(email)}`
          );

          console.log("Fetched profile data:", data);

          // Don't modify the name from the database
          setProfileData(data);

          // Use the processed name values in the form
          const formValues = {
            name: getFormDisplayName(data),
            email: data.email || email,
            gender: data.gender || "",
            nic: data.nic || "",
            telephone: data.telephone || "",
            address: data.address || "",
          };

          console.log("Setting form values:", formValues);
          form.reset(formValues);
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

  const handleSave = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();

      // Always send the name field if it exists
      if (values.name && values.name.trim()) {
        formData.append("name", values.name.trim());
      }
      if (values.gender) {
        formData.append("gender", values.gender);
      }
      if (values.nic && values.nic.trim()) {
        formData.append("nic", values.nic.trim());
      }
      if (values.telephone && values.telephone.trim()) {
        formData.append("telephone", values.telephone.trim());
      }
      if (values.address && values.address.trim()) {
        formData.append("address", values.address.trim());
      }

      // Handle image removal
      if (imageToRemove) {
        formData.append("removePicture", "true");
        console.log("🗑️ Frontend: Sending removePicture flag");
      }

      const fileInput = document.getElementById("picture") as HTMLInputElement;
      const newPicture = fileInput?.files?.[0];

      if (newPicture) {
        formData.append("picture", newPicture);
        console.log("📸 Frontend: Sending new picture");
      }

      console.log("Updating profile with data:", Object.fromEntries(formData.entries()));

      const { data } = await axios.patch(
        `${API_BASE}/profile/${encodeURIComponent(values.email)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Update response:", data);

      // Verify the response contains the updated name
      if (values.name && values.name.trim() && (!data.name || data.name !== values.name.trim())) {
        console.warn("Server response doesn't contain updated name:", {
          sent: values.name.trim(),
          received: data.name
        });
      }

      // Update local state with the response from server
      setProfileData(data);

      // Reset form with updated values from server response
      const updatedFormValues = {
        name: getFormDisplayName(data),
        email: data.email || values.email,
        gender: data.gender || "",
        nic: data.nic || "",
        telephone: data.telephone || "",
        address: data.address || "",
      };

      console.log("Resetting form with updated values:", updatedFormValues);
      form.reset(updatedFormValues);

      // Reset image removal flag and clear file input
      setImageToRemove(false);
      const fileInputElement = document.getElementById("picture") as HTMLInputElement;
      if (fileInputElement) {
        fileInputElement.value = "";
      }

      setAlertSuccess(true);
      setAlertMessage("Profile updated successfully.");
      setShowAlert(true);
      setIsEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err)) {
        console.error("Response data:", err.response?.data);
        console.error("Response status:", err.response?.status);
      }
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
        setProfileData((prev: any) => ({
          ...prev,
          picture: reader.result as string,
        }));
        // Reset the remove flag since we're adding a new image
        setImageToRemove(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    console.log("🗑️ Frontend: Image removal requested");
    setImageToRemove(true);
    setProfileData((prev: any) => ({
      ...prev,
      picture: null,
    }));
    // Clear the file input
    const fileInput = document.getElementById("picture") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
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
      <Card className="max-w-3xl mx-auto bg-teal-400">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 min-h-[400px]">
            {/* Left Side */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              <div className="relative">
                <label
                  htmlFor="picture"
                  className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group block"
                >
                  <img
                    src={
                      profileData.picture && !imageToRemove
                        ? profileData.picture.startsWith("data:")
                          ? profileData.picture
                          : profileData.picture.startsWith("/uploads")
                            ? `http://localhost:3001${profileData.picture}`
                            : "/default.png"
                        : "/default.png"
                    }
                    alt="Profile Picture"
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

                {/* Remove image button */}
                {isEditing && profileData.picture && !imageToRemove && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-white hover:bg-gray-200 text-black rounded-full p-1 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center mt-6">
                <h2 className="text-xl font-bold text-black">
                  {getDisplayName(profileData)}
                </h2>
                <p className="text-md text-gray-800">{profileData.email}</p>
                <Button
                  variant="ghost"
                  size="lg"
                  className={`bg-white text-black text-md mt-4 md:mt-10 ${isEditing
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                  onClick={handleEditToggle}
                  disabled={isEditing}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </div>
            </div>
            {/* Right Side - Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telephone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+94 7xxxxxxxx"
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
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEditToggle}
                          className="w-full sm:w-32"
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="w-full sm:w-32"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save"}
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
