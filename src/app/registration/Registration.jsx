"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Plus, Minus, Sparkles } from "lucide-react";

export default function Registration() {
  const form = useForm();

  const sscDone = form.watch("sscCompletion");
  const hscDone = form.watch("hscCompletion");

  const router = useRouter();

  const [guests, setGuests] = useState(0);
  const [preview, setPreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);


  // console.log(uploadedImageUrl);

  

  const increaseGuests = () => setGuests((p) => p + 1);
  const decreaseGuests = () => setGuests((p) => (p > 0 ? p - 1 : 0));

  // -----------------------
  // CLOUDINARY UPLOAD
  // -----------------------
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true)

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lt4vyrjl");
    formData.append("cloud_name", "datldhldb");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/datldhldb/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setLoading(false);
      setUploadedImageUrl(data.secure_url); // <— final image URL
      form.setValue("photo", data.secure_url);
      // console.log("uploadedImageUrl", data.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // -----------------------
  // SUBMIT HANDLER
  // -----------------------
  const onSubmit = (data) => {
    data.guests = guests;
    data.photo = uploadedImageUrl; // attach actual Cloudinary URL

    // Save data temporarily
    localStorage.setItem("formData", JSON.stringify(data));

    router.push("/paymentConfirmation");
  };

  return (
    <div className="min-h-screen bg-[#0F1319]">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-4 md:pb-12 px-4 overflow-hidden">
        <div
          className="absolute bg-linear-to-br from-[#101F25] via-background to-[#151521] animate-gradient-shift"
          style={{ backgroundSize: "200% 200%" }}
        />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-2">
            <div className="inline-block mb-4 animate-scale-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-[#04d5ecf5]" />
                Registration Open
              </span>
            </div>

            <h1 className="text-2xl text-white md:text-6xl font-bold mb-4 animate-fade-in-up">
              CPSCM Reunion &amp;<br />
              <span className="bg-linear-90 from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">Silver Jubilee 2025</span>
            </h1>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="p-8 md:p-12 border border-gray-800 animate-fade-in-up bg-[#13171E]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ---------------- PERSONAL INFO ---------------- */}
                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ required: "Full Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name (As per School/College Record) *</FormLabel>
                        <FormControl>
                          <Input className="bg-white" {...field} placeholder="Enter your name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email address is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email *</FormLabel>
                        <FormControl>
                          <Input className="bg-white" type="email" {...field} placeholder="example@gmail.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone + Size */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ required: "Contact Number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contact No *</FormLabel>
                        <FormControl>
                          <Input className="bg-white" {...field} placeholder="01XXXXXXXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Present Address *</FormLabel>
                      <FormControl>
                        <Input className="bg-white" {...field} placeholder="Your address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <div className="">
                  

                  <div className="w-full md:w-[50%] my-4 mx-auto">
                    <img
                      src="https://res.cloudinary.com/datldhldb/image/upload/v1764828484/qapibrah5lzfhb9kset2.png"
                      alt="Preview"
                      className="w-full object-cover rounded-lg border"
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tshirt"
                    rules={{ required: "T-shirt size is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white w-full">Your T-Shirt Size *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="text-white w-full">
                              <SelectValue className="text-white" placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#13171E]">
                              {["S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                                <SelectItem className="bg-purple-400 my-0.5" key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                

                {/* ---------------- ACADEMIC ---------------- */}
                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">
                  Academic Information
                </h2>

                <div className="grid md:grid-cols-1 gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                    control={form.control}
                    name="sscCompletion"
                    rules={{ required: "This information is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Completed SSC from CPSCM?</FormLabel>
                        <FormControl>
                          <Select className="bg-white" onValueChange={field.onChange}>
                          <SelectTrigger className="text-white w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent  className="bg-[#13171E]">
                            <SelectItem className="bg-purple-400 my-0.5" value="yes">Yes</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="hscCompletion"
                    rules={{ required: "This information is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Completed HSC from CPSCM?</FormLabel>
                        <FormControl>
                          <Select className="bg-white" onValueChange={field.onChange}>
                          <SelectTrigger className="text-white w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent  className="bg-[#13171E]">
                            <SelectItem className="bg-purple-400 my-0.5" value="yes">Yes</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                    />
                    
                  </div>

                  {sscDone === "yes" && (
                    <div className="ssc grid md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                      name="ssc-batch"
                      rules={sscDone === "yes" ? { required: "SSC batch is required" }: {}}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">SSC Batch *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Choose group" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#13171E]">
                              {[
                                  "SSC 1997", "SSC 1998", "SSC 1999", "SSC 2000",
                                  "SSC 2001", "SSC 2002", "SSC 2003", "SSC 2004",
                                  "SSC 2005", "SSC 2006", "SSC 2007", "SSC 2008",
                                  "SSC 2009", "SSC 2010", "SSC 2011", "SSC 2012",
                                  "SSC 2013", "SSC 2014", "SSC 2015", "SSC 2016",
                                  "SSC 2017", "SSC 2018", "SSC 2019", "SSC 2020",
                                  "SSC 2021", "SSC 2022", "SSC 2023", "SSC 2024",
                                  "SSC 2025", "Not from CPSCM"
                                ].map((s) => (
                                <SelectItem className="bg-purple-400 my-0.5" key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                      name="ssc-group"
                      rules={sscDone === "yes"? { required: "SSC group is required" }: {}}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">SSC Group *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Choose group" />
                          </SelectTrigger>
                          <SelectContent  className="bg-[#13171E]">
                            <SelectItem className="bg-purple-400 my-0.5" value="science">Science</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="commerce">Commerce</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                    />

                    <FormField
                        control={form.control}
                      name="ssc-roll"
                      rules={sscDone === "yes"?{ required: "SSC roll number is required" }:{}}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">SSC Roll Number *</FormLabel>
                            <FormControl>
                              <Input className="bg-white" {...field} placeholder="Your SSC Roll Number" />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                    
                  </div>
                  )}

                  {hscDone === "yes" && (
                    <div className="hsc grid md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                      name="hsc-batch"
                      rules={hscDone === "yes"?{ required: "HSC batch is required" }:{}}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">HSC Batch *</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange}>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Choose group" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#13171E]">
                              {[
                                  "HSC 1997", "HSC 1998", "HSC 1999", "HSC 2000",
                                  "HSC 2001", "HSC 2002", "HSC 2003", "HSC 2004",
                                  "HSC 2005", "HSC 2006", "HSC 2007", "HSC 2008",
                                  "HSC 2009", "HSC 2010", "HSC 2011", "HSC 2012",
                                  "HSC 2013", "HSC 2014", "HSC 2015", "HSC 2016",
                                  "HSC 2017", "HSC 2018", "HSC 2019", "HSC 2020",
                                  "HSC 2021", "HSC 2022", "HSC 2023", "HSC 2024",
                                  "HSC 2025", "Not from CPSCM"
                                ].map((s) => (
                                <SelectItem className="bg-purple-400 my-0.5" key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  
                  
                  <FormField
                    control={form.control}
                      name="hsc-group"
                      rules={hscDone === "yes" ?{ required: "HSC group is required" }:{}}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">HSC Group *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Choose group" />
                          </SelectTrigger>
                          <SelectContent  className="bg-[#13171E]">
                            <SelectItem className="bg-purple-400 my-0.5" value="science">Science</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="commerce">Commerce</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                        control={form.control}
                      name="hsc-roll"
                      rules={hscDone === "yes"? { required: "HSC roll number is required" }:{}}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">HSC Roll Number *</FormLabel>
                            <FormControl>
                              <Input className="bg-white" {...field} placeholder="Your HSC Roll Number" />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />

                   </div>
                  )}
                </div>

                {/* ---------------- EVENT DETAILS ---------------- */}
                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">
                  Event Details
                </h2>

                <p className="text-white">BDT 1700 per head. Each guest (adult) +BDT 1000. Guests allowed: spouse or children only. No payment for children under 5. (Please add guest names below.)</p>

                <div>
                  <FormLabel className="text-white">Number of Guests</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    <Button type="button" onClick={decreaseGuests} variant="outline" size="icon">
                      <Minus />
                    </Button>

                    <span className="text-4xl font-bold text-gradient flex-1 text-center text-white border">
                      {guests}
                    </span>

                    <Button type="button" onClick={increaseGuests} variant="outline" size="icon">
                      <Plus />
                    </Button>
                  </div>
                </div>
                
                <FormField
                    control={form.control}
                  name="parking"
                  rules={{ required: "This information is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Do you need Car Parking Facility?</FormLabel>
                        <FormControl>
                          <Select className="bg-white" onValueChange={field.onChange}>
                          <SelectTrigger className="text-white w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent  className="bg-[#13171E]">
                            <SelectItem className="bg-purple-400 my-0.5" value="yes">Yes</SelectItem>
                            <SelectItem className="bg-purple-400 my-0.5" value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                

                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">
                  Addition Info
                </h2>
                

                <FormField
                  control={form.control}
                  name="favoriteTeacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Your Favorite Teacher</FormLabel>
                      <FormControl>
                        <Input className="bg-white" {...field} placeholder="Type here..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Special Message</FormLabel>
                      <FormControl>
                        <Textarea className="bg-white" rows={4} {...field} placeholder="Write here..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ---------------- UPLOAD + PAYMENT ---------------- */}
                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#1DEDF4] to-[#9763EE] bg-clip-text text-transparent">
                  Upload Photo
                </h2>

                {/* SINGLE CLEAN UPLOAD FIELD */}
                <FormField
                  control={form.control}
                  name="photo"
                  rules={{ required: "Photo is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Upload Photo *</FormLabel>
                      <FormControl>
                        <div>
                          <input
                            
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden bg-white"
                            onChange={(e) => {
                              handleImageChange(e);
                              field.onChange(e.target.files?.[0]);
                            }}
                          />

                          <label
                            htmlFor="photo-upload"
                            className="flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30"
                          >
                            {
                              loading ? (
                                <span className="loading loading-bars loading-xs"></span>
                              ) : uploadedImageUrl ? (
                                <img
                                  src={uploadedImageUrl}
                                  className="h-40 w-40 object-cover rounded-md"
                                />
                              ) : (
                                <span className="text-muted-foreground text-white">
                                  Click to upload photo
                                </span>
                              )
                            }

                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
     

               <Button
                type="submit"
                size="lg"
                className="bg-[#1DEDF4] md:glass w-full text-lg py-6  text-white hover:bg-[#1DEDF4]"
                disabled={loading || !uploadedImageUrl}
              >
                Proceed Checkout <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>
    </div>
  );
}
