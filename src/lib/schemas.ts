import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Use a valid campus email."),
  college: z.string().min(2, "College is required."),
});

export const listingSchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.number().min(1, "Price must be positive."),
  category: z.enum(["Books", "Electronics", "Lab Supplies", "Furniture", "Stationery", "Other"]),
  condition: z.enum(["New", "Like New", "Good", "Fair"]),
  pickupLocation: z.string().min(2, "Pickup location is required."),
  imageUrl: z.string().url("Image URL is required."),
  status: z.enum(["available", "sold"]).optional(),
  isbn: z.string().optional(),
});

export const messageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty.").max(500, "Message is too long."),
});
