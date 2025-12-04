"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function RegistrationPage() {
  const form = useForm();
  const [guests, setGuests] = useState(0);
  const increaseGuests = () => setGuests(guests + 1);
  const decreaseGuests = () => setGuests(guests > 0 ? guests - 1 : 0);

  const onSubmit = (data) => {
    data.guests = guests;
    // console.log("Form Submitted:", data);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 my-10">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">
          CPSCM Reunion & Silver Jubilee Celebration 2025
        </h1>
        <p className="text-gray-600 text-lg">Registration Form</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact No *</FormLabel>
                <FormControl>
                  <Input placeholder="01XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Present Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Your present address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SSC + HSC from CPSCM */}
          <FormField
            control={form.control}
            name="completion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Did you complete SSC & HSC both from CPSCM?</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Class Group */}
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Group *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SSC Roll */}
          <FormField
            control={form.control}
            name="sscRoll"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SSC Roll No.</FormLabel>
                <FormControl>
                  <Input placeholder="SSC Roll" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HSC Roll */}
          <FormField
            control={form.control}
            name="hscRoll"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSC Roll No.</FormLabel>
                <FormControl>
                  <Input placeholder="HSC Roll" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guests */}
          <div>
            <FormLabel>Number of Guests</FormLabel>
            <div className="flex items-center gap-4 mt-2">
              <Button type="button" variant="outline" onClick={decreaseGuests}>-</Button>
              <span className="text-xl">{guests}</span>
              <Button type="button" variant="outline" onClick={increaseGuests}>+</Button>
            </div>
          </div>

          {/* T-shirt Size */}
          <FormField
            control={form.control}
            name="tshirt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>T-Shirt Size *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {["S","M","L","XL","XXL","3XL"].map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Favorite Teacher */}
          <FormField
            control={form.control}
            name="favoriteTeacher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Favorite Teacher(s)</FormLabel>
                <FormControl>
                  <Input placeholder="Type here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Request / Message</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Write your message..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Volunteer */}
          <FormField
            control={form.control}
            name="volunteer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Would you like to volunteer?</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="No" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload Photo */}
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Your Photo *</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="payment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Payment Method *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="bank">Bank Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Button */}
          <Button type="submit" className="w-full text-lg py-6 bg-purple-700 hover:bg-purple-800">
            Proceed to Payment
          </Button>

        </form>
      </Form>
    </div>
  );
}
