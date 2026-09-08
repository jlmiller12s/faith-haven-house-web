import { z } from "zod";

export const VOLUNTEER_ROLES = ["super_admin", "executive_director"];
export const POSITION_LABELS = {
  "Daytime Monitor": "Daytime House Monitor",
  "Meal Delivery": "Meal Train Delivery",
  "Life Skills": "Life Skills Coach",
  Mentor: "Resident Mentor",
};

export const volunteerSchema = z.object({
  firstname: z.string().trim().min(1).max(100),
  lastname: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(50),
  positions: z.array(z.enum(Object.keys(POSITION_LABELS))).max(4),
  skills: z.string().trim().max(5000),
  availability: z.string().trim().max(2000),
});

export async function saveVolunteerApplication(input, client) {
  const parsed = volunteerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, error: "Please check your contact details and form entries." };
  const { error } = await client.from("volunteer_applications").insert(parsed.data);
  if (error) throw new Error("Volunteer application could not be saved");
  return { ok: true, status: 201 };
}
