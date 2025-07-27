// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Pencil, Camera, X } from "lucide-react";
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

// const BACKEND_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001";

// // Form validation schema
// const formSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
//   email: z.string().email(),
//   gender: z.string().optional(),
//   nic: z.string().min(10, "NIC must be at least 10 characters").max(12, "NIC must be at most 12 characters").optional().or(z.literal("")),
//   telephone: z.string()
//     .regex(/^\+947\d{8}$/, "Telephone must be in the format +947xxxxxxxx"),
//   address: z.string().optional(),
// });

// // Infer the type from the schema to ensure consistency
// type ProfileFormValues = z.infer<typeof formSchema>;

// interface ProfileData {
//   _id?: string;
//   name: string;
//   email: string;
//   nickname?: string;
//   gender?: string;
//   nic?: string;
//   telephone?: string;
//   address?: string;
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
//   const [imageToRemove, setImageToRemove] = useState(false);

//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       gender: "",
//       nic: "",
//       telephone: "",
//       address: "",
//     },
//   });

//   // Get display name - prioritize actual name over email-derived names
//   const getDisplayName = (data: ProfileData): string => {
//     if (data.name && data.name.trim()) {
//       if (data.name === data.email) {
//         return data.email.split("@")[0];
//       }
//       if (data.name !== data.email.split("@")[0]) {
//         return data.name;
//       }
//     }
//     return data.nickname || data.email.split("@")[0];
//   };

//   // Get the name to display in the form field
//   const getFormDisplayName = (data: ProfileData): string => {
//     if (data.name && data.name.trim()) {
//       if (data.name === data.email) {
//         return data.email.split("@")[0];
//       }
//       return data.name;
//     }
//     return data.nickname || data.email.split("@")[0];
//   };

//   // Handle edit toggle function
//   const handleEditToggle = () => {
//     if (isEditing) {
//       setImageToRemove(false);
//       if (profileData) {
//         form.reset({
//           name: getFormDisplayName(profileData),
//           email: profileData.email,
//           gender: profileData.gender || "",
//           nic: profileData.nic || "",
//           telephone: profileData.telephone || "",
//           address: profileData.address || "",
//         });
//       }
//     }
//     setIsEditing(!isEditing);
//   };

//   useEffect(() => {
//     if (!isLoading && user && typeof user.email === "string") {
//       const fetchProfile = async () => {
//         try {
//           const email = user.email as string;
//           const { data } = await axios.get(
//             `${BACKEND_URL}/user/profile/${encodeURIComponent(email)}`
//           );
//           setProfileData(data);
//           const formValues = {
//             name: getFormDisplayName(data),
//             email: data.email || email,
//             gender: data.gender || "",
//             nic: data.nic || "",
//             telephone: data.telephone || "",
//             address: data.address || "",
//           };
//           form.reset(formValues);
//         } catch (err) {
//           setAlertSuccess(false);
//           setAlertMessage("Failed to load profile.");
//           setShowAlert(true);
//         }
//       };
//       fetchProfile();
//     }
//   }, [isLoading, user, form]);

//   const handleSave = async (values: ProfileFormValues) => {
//     setIsUpdating(true);
//     try {
//       const formData = new FormData();
//       if (values.name && values.name.trim()) {
//         formData.append("name", values.name.trim());
//       }
//       if (values.gender) {
//         formData.append("gender", values.gender);
//       }
//       if (values.nic && values.nic.trim()) {
//         formData.append("nic", values.nic.trim());
//       }
//       if (values.telephone && values.telephone.trim()) {
//         formData.append("telephone", values.telephone.trim());
//       }
//       if (values.address && values.address.trim()) {
//         formData.append("address", values.address.trim());
//       }
//       if (imageToRemove) {
//         formData.append("removePicture", "true");
//       }
//       const fileInput = document.getElementById("picture") as HTMLInputElement;
//       const newPicture = fileInput?.files?.[0];
//       if (newPicture) {
//         formData.append("picture", newPicture);
//       }
//       const { data } = await axios.patch(
//         `${BACKEND_URL}/user/profile/${encodeURIComponent(values.email)}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       setProfileData(data);
//       const updatedFormValues = {
//         name: getFormDisplayName(data),
//         email: data.email || values.email,
//         gender: data.gender || "",
//         nic: data.nic || "",
//         telephone: data.telephone || "",
//         address: data.address || "",
//       };
//       form.reset(updatedFormValues);
//       setImageToRemove(false);
//       const fileInputElement = document.getElementById("picture") as HTMLInputElement;
//       if (fileInputElement) {
//         fileInputElement.value = "";
//       }
//       setAlertSuccess(true);
//       setAlertMessage("Profile updated successfully.");
//       setShowAlert(true);
//       setIsEditing(false);
//       setTimeout(() => {
//         window.location.reload();
//       }, 500);
//     } catch (err) {
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
//         setImageToRemove(false);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveImage = () => {
//     setImageToRemove(true);
//     setProfileData((prev: any) => ({
//       ...prev,
//       picture: null,
//     }));
//     const fileInput = document.getElementById("picture") as HTMLInputElement;
//     if (fileInput) {
//       fileInput.value = "";
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
//               <div className="relative">
//                 <label
//                   htmlFor="picture"
//                   className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group block"
//                 >
//                   <img
//                     src={
//                       profileData.picture && !imageToRemove
//                         ? profileData.picture.startsWith("data:")
//                           ? profileData.picture
//                           : profileData.picture.startsWith("/uploads")
//                             ? `${BACKEND_URL}${profileData.picture}`
//                             : "/default.png"
//                         : "/default.png"
//                     }
//                     alt="Profile Picture"
//                     className="object-cover w-full h-full rounded-full"
//                   />

//                   {isEditing && (
//                     <div className="absolute inset-0 bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Camera className="w-10 h-10 text-white" />
//                     </div>
//                   )}

//                   <input
//                     id="picture"
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleImageUpload}
//                     disabled={!isEditing}
//                   />
//                 </label>

//                 {/* Remove image button */}
//                 {isEditing && profileData.picture && !imageToRemove && (
//                   <button
//                     type="button"
//                     onClick={handleRemoveImage}
//                     className="absolute -top-2 -right-2 bg-white hover:bg-gray-200 text-black rounded-full p-1 transition-colors cursor-pointer"
//                     title="Remove image"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//               <div className="flex flex-col items-center mt-6">
//                 <h2 className="text-xl font-bold text-black">
//                   {getDisplayName(profileData)}
//                 </h2>
//                 <Button
//                   variant="ghost"
//                   size="lg"
//                   className={`bg-white text-black text-md mt-4 md:mt-5 ${isEditing
//                       ? "opacity-50 cursor-not-allowed"
//                       : "cursor-pointer"
//                     }`}
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
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Telephone</FormLabel>
//                           <FormControl>
//                             <Input
//                               {...field}
//                               type="tel"
//                               placeholder="+947xxxxxxxx"
//                               disabled={!isEditing}
//                               maxLength={12}
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
//                           onClick={handleEditToggle}
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

//CLOUDINARY
/*"use client";

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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email(),
  gender: z.string().optional(),
  nic: z.string().min(10, "NIC must be at least 10 characters").max(12, "NIC must be at most 12 characters").optional().or(z.literal("")),
  telephone: z.string()
    .regex(/^\+947\d{8}$/, "Telephone must be in the format +947xxxxxxxx"),
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
    if (data.name && data.name.trim()) {
      if (data.name === data.email) {
        return data.email.split("@")[0];
      }
      if (data.name !== data.email.split("@")[0]) {
        return data.name;
      }
    }
    return data.nickname || data.email.split("@")[0];
  };

  // Get the name to display in the form field
  const getFormDisplayName = (data: ProfileData): string => {
    if (data.name && data.name.trim()) {
      if (data.name === data.email) {
        return data.email.split("@")[0];
      }
      return data.name;
    }
    return data.nickname || data.email.split("@")[0];
  };

  // Handle edit toggle function
  const handleEditToggle = () => {
    if (isEditing) {
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
          const { data } = await axios.get(
            `${BACKEND_URL}/user/profile/${encodeURIComponent(email)}`
          );
          setProfileData(data);
          const formValues = {
            name: getFormDisplayName(data),
            email: data.email || email,
            gender: data.gender || "",
            nic: data.nic || "",
            telephone: data.telephone || "",
            address: data.address || "",
          };
          form.reset(formValues);
        } catch (err) {
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
      if (imageToRemove) {
        formData.append("removePicture", "true");
      }
      const fileInput = document.getElementById("picture") as HTMLInputElement;
      const newPicture = fileInput?.files?.[0];
      if (newPicture) {
        formData.append("picture", newPicture);
      }
      const { data } = await axios.patch(
        `${BACKEND_URL}/user/profile/${encodeURIComponent(values.email)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfileData(data);
      const updatedFormValues = {
        name: getFormDisplayName(data),
        email: data.email || values.email,
        gender: data.gender || "",
        nic: data.nic || "",
        telephone: data.telephone || "",
        address: data.address || "",
      };
      form.reset(updatedFormValues);
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
        setImageToRemove(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageToRemove(true);
    setProfileData((prev: any) => ({
      ...prev,
      picture: null,
    }));
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
            {/* Left Side *}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 h-full">
              <div className="relative">
                <label
                  htmlFor="picture"
                  className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group block"
                >
                 <img
  src={
    profileData.picture && !imageToRemove
      ? profileData.picture.startsWith("data:") ||
        profileData.picture.startsWith("http")
        ? profileData.picture
        : profileData.picture.startsWith("/uploads")
          ? `${BACKEND_URL}${profileData.picture}`
          :  "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
      :  "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
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

                {/* Remove image button *}
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
                <Button
                  variant="ghost"
                  size="lg"
                  className={`bg-white text-black text-md mt-4 md:mt-5 ${isEditing
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
            {/* Right Side - Form *}
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
                              placeholder="+947xxxxxxxx"
                              disabled={!isEditing}
                              maxLength={12}
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
}*/

"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Pencil, Camera, X, User, Mail, Phone, MapPin, CreditCard, Users } from "lucide-react"
import axios from "axios"
import { useUser } from "@auth0/nextjs-auth0/client"
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email(),
  gender: z.string().optional(),
  nic: z
    .string()
    .min(10, "NIC must be at least 10 characters")
    .max(12, "NIC must be at most 12 characters")
    .optional()
    .or(z.literal("")),
  telephone: z.string().regex(/^\+947\d{8}$/, "Telephone must be in the format +947xxxxxxxx"),
  address: z.string().optional(),
})

// Infer the type from the schema to ensure consistency
type ProfileFormValues = z.infer<typeof formSchema>

interface ProfileData {
  _id?: string
  name: string
  email: string
  nickname?: string
  gender?: string
  nic?: string
  telephone?: string
  address?: string
  picture?: string
}

export default function ProfilePage() {
  const { user, error, isLoading } = useUser()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertSuccess, setAlertSuccess] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [imageToRemove, setImageToRemove] = useState(false)

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
  })

  // Get display name - prioritize actual name over email-derived names
  const getDisplayName = (data: ProfileData): string => {
    if (data.name && data.name.trim()) {
      if (data.name === data.email) {
        return data.email.split("@")[0]
      }
      if (data.name !== data.email.split("@")[0]) {
        return data.name
      }
    }
    return data.nickname || data.email.split("@")[0]
  }

  // Get the name to display in the form field
  const getFormDisplayName = (data: ProfileData): string => {
    if (data.name && data.name.trim()) {
      if (data.name === data.email) {
        return data.email.split("@")[0]
      }
      return data.name
    }
    return data.nickname || data.email.split("@")[0]
  }

  // Handle edit toggle function
  const handleEditToggle = () => {
    if (isEditing) {
      setImageToRemove(false)
      if (profileData) {
        form.reset({
          name: getFormDisplayName(profileData),
          email: profileData.email,
          gender: profileData.gender || "",
          nic: profileData.nic || "",
          telephone: profileData.telephone || "",
          address: profileData.address || "",
        })
      }
    }
    setIsEditing(!isEditing)
  }

  useEffect(() => {
    if (!isLoading && user && typeof user.email === "string") {
      const fetchProfile = async () => {
        try {
          const email = user.email as string
          const { data } = await axios.get(`${BACKEND_URL}/user/profile/${encodeURIComponent(email)}`)
          setProfileData(data)
          const formValues = {
            name: getFormDisplayName(data),
            email: data.email || email,
            gender: data.gender || "",
            nic: data.nic || "",
            telephone: data.telephone || "",
            address: data.address || "",
          }
          form.reset(formValues)
        } catch (err) {
          setAlertSuccess(false)
          setAlertMessage("Failed to load profile.")
          setShowAlert(true)
        }
      }

      fetchProfile()
    }
  }, [isLoading, user, form])

  const handleSave = async (values: ProfileFormValues) => {
    setIsUpdating(true)
    try {
      const formData = new FormData()
      if (values.name && values.name.trim()) {
        formData.append("name", values.name.trim())
      }
      if (values.gender) {
        formData.append("gender", values.gender)
      }
      if (values.nic && values.nic.trim()) {
        formData.append("nic", values.nic.trim())
      }
      if (values.telephone && values.telephone.trim()) {
        formData.append("telephone", values.telephone.trim())
      }
      if (values.address && values.address.trim()) {
        formData.append("address", values.address.trim())
      }
      if (imageToRemove) {
        formData.append("removePicture", "true")
      }

      const fileInput = document.getElementById("picture") as HTMLInputElement
      const newPicture = fileInput?.files?.[0]
      if (newPicture) {
        formData.append("picture", newPicture)
      }

      const { data } = await axios.patch(`${BACKEND_URL}/user/profile/${encodeURIComponent(values.email)}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setProfileData(data)
      const updatedFormValues = {
        name: getFormDisplayName(data),
        email: data.email || values.email,
        gender: data.gender || "",
        nic: data.nic || "",
        telephone: data.telephone || "",
        address: data.address || "",
      }
      form.reset(updatedFormValues)
      setImageToRemove(false)

      const fileInputElement = document.getElementById("picture") as HTMLInputElement
      if (fileInputElement) {
        fileInputElement.value = ""
      }

      setAlertSuccess(true)
      setAlertMessage("Profile updated successfully.")
      setShowAlert(true)
      setIsEditing(false)

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      setAlertSuccess(false)
      setAlertMessage("Failed to update profile. Please try again.")
      setShowAlert(true)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData((prev: any) => ({
          ...prev,
          picture: reader.result as string,
        }))
        setImageToRemove(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageToRemove(true)
    setProfileData((prev: any) => ({
      ...prev,
      picture: null,
    }))
    const fileInput = document.getElementById("picture") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
       

        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Profile Header Section */}
          <div className="bg-gradient-to-br from-gray-200 via-gray-600 to-gray-200 px-8 py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <label
                  htmlFor="picture"
                  className="relative block w-32 h-32 rounded-full overflow-hidden cursor-pointer group ring-4 ring-white shadow-lg"
                >
                  <img
                    src={
                      profileData.picture && !imageToRemove
                        ? profileData.picture.startsWith("data:") || profileData.picture.startsWith("http")
                          ? profileData.picture
                          : profileData.picture.startsWith("/uploads")
                            ? `${BACKEND_URL}${profileData.picture}`
                            : "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
                        : "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
                    }
                    alt="Profile Picture"
                    className="object-cover w-full h-full"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
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
                {isEditing && profileData.picture && !imageToRemove && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center md:text-left text-white">
                <h2 className="text-3xl font-bold mb-2">{getDisplayName(profileData)}</h2>
                <p className="text-white mb-4 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </p>
               
              </div>

              {/* Edit Button */}
              <div className="md:ml-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className={`bg-white text-black font-semibold ${
                    isEditing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleEditToggle}
                  disabled={isEditing}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-700" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium">Full Name</FormLabel>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="h-11 bg-gray-50 border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                          
                            Gender
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-6 pt-2">
                              {["Male", "Female", "Other"].map((opt) => {
                                const id = `gender-${opt.toLowerCase()}`
                                return (
                                  <label key={opt} className="flex items-center cursor-pointer" htmlFor={id}>
                                    <input
                                      type="radio"
                                      id={id}
                                      value={opt}
                                      checked={field.value === opt}
                                      onChange={() => field.onChange(opt)}
                                      disabled={!isEditing}
                                      className="mr-2 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-gray-600">{opt}</span>
                                  </label>
                                )
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
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                          
                            National ID (NIC)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter NIC number"
                              maxLength={12}
                              disabled={!isEditing}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-700" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+947xxxxxxxx"
                              disabled={!isEditing}
                              maxLength={12}
                              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-600 font-medium flex items-center gap-2">
                            
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter your full address"
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

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                      className="sm:w-32 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="sm:w-32 bg-black text-white"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
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
    </div>
  )
}
