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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Form Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Device name is required." }),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  type: z.string().min(1, { message: "Select a device type." }),
  description: z.string().optional(),
  measurementParameter: z.string().min(1, { message: "Required field." }),
  minThreshold: z.coerce.number(),
  maxThreshold: z.coerce.number().refine((val) => val > 0, {
    message: "Must be greater than 0.",
  }),
  measurementUnit: z.string().min(1, {
    message: "Measurement unit is required.",
  }),
  manufacturer: z.string().optional(),
  seller: z.string().optional(),
});

type DeviceFormValues = z.infer<typeof formSchema>;

export function AddDeviceForm() {
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      type: "",
      description: "",
      measurementParameter: "",
      measurementUnit: "",
      manufacturer: "",
      seller: "",
      minThreshold: 0,
      maxThreshold: 100,
    },
  });

  function onSubmit(values: DeviceFormValues) {
    console.log("Submitted:", { ...values, image });
    // TODO: API Integration
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="shadow-lg rounded-2xl border-none w-full max-w-2xl bg-[hsl(172.5,_66%,_50.4%)]">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-transparent text-black">
              Add New Device
            </span>
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

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter device model" {...field} />
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
                    <div className="flex flex-col">
                      <FormLabel>Location</FormLabel>
                      <Link href="/locations" passHref>
                        <Button className="bg-white text-black border border-gray-300 hover:bg-[hsl(172.5,_66%,_50.4%)]/50 hover:text-black text-sm px-6 py-2 mt-2 w-full transition-all hover:scale-105 hover:shadow-md">
                          Add Location Details
                        </Button>
                      </Link>
                    </div>

                    {/* Image Upload */}
                    <FormItem>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Manufacturer */}
                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manufacturer</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter manufacturer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Seller */}
                    <FormField
                      control={form.control}
                      name="seller"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter seller name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional description..." {...field} />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Min Threshold */}
                    <FormField
                      control={form.control}
                      name="minThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Threshold</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Max Threshold */}
                    <FormField
                      control={form.control}
                      name="maxThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Threshold</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
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
