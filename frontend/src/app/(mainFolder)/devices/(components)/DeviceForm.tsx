"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Updated Schema
const formSchema = z.object({
  deviceId: z.string().min(1, { message: "Device ID is required." }),
  name: z.string().min(2, { message: "Device name is required." }),
  serialNumber: z.string().optional(),
  type: z.string().min(1, { message: "Select a device type." }),
  location: z.string().min(1, { message: "Location is required." }),
  description: z.string().optional(),
  measurementParameter: z.string().min(1, { message: "Required field." }),
  measurementUnit: z.string().min(1, {
    message: "Measurement unit is required.",
  }),
});

type DeviceFormValues = z.infer<typeof formSchema>;

export function AddDeviceForm() {
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: "",
      name: "",
      serialNumber: "",
      type: "",
      location: "",
      description: "",
      measurementParameter: "",
      measurementUnit: "",
    },
  });

  function onSubmit(values: DeviceFormValues) {
    console.log("Submitted:", { ...values, image });
   
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="shadow-lg rounded-2xl border-none w-full max-w-2xl bg-[hsl(172.5,_66%,_50.4%)]">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-black">
            Add New Device
          </h1>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-8 rounded-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* General Details */}
                <div className="border-b pb-8 mb-8 border-gray-600">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">General Details</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Device ID */}
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter unique ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Device Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Air Quality Sensor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Serial Number */}
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter serial number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Device Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="temperatureSensor">Temperature Sensor</SelectItem>
                              <SelectItem value="pressureSensor">Pressure Sensor</SelectItem>
                              <SelectItem value="proximitySensor">Proximity Sensor</SelectItem>
                              <SelectItem value="motionSensor">Motion Sensor</SelectItem>
                              <SelectItem value="lightSensor">Light Sensor</SelectItem>
                              <SelectItem value="soundSensor">Sound Sensor</SelectItem>
                              <SelectItem value="gasSensor">Gas Sensor</SelectItem>
                              <SelectItem value="humiditySensor">Humidity Sensor</SelectItem>
                              <SelectItem value="touchSensor">Touch Sensor</SelectItem>
                              <SelectItem value="magneticSensor">Magnetic Sensor</SelectItem>
                              <SelectItem value="imageSensor">Image Sensor</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Building A - Floor 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <FormItem className="mb-6">
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImage(file);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                  </div>

                  {/* Description as Single Row Input */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional short description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Measurement Details */}
                <div className="border-b pb-8 mb-8 border-gray-600">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Measurement Details</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Measurement Parameter */}
                    <FormField
                      control={form.control}
                      name="measurementParameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement Parameter</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Temperature" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Measurement Unit */}
                    <FormField
                      control={form.control}
                      name="measurementUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., °C, Pa, lux" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit/Cancel Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="transition-all hover:scale-105 hover:shadow-md"
                  >
                    Add Device
                  </Button>
                  <Link href="/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="transition-all hover:scale-105 hover:shadow-md"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
