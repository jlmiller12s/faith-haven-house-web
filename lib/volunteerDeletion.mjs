import { z } from "zod";
import { VOLUNTEER_ROLES } from "./volunteer.mjs";

export async function deleteVolunteerApplication({ id, staff, createAdminClient }) {
  if (!staff?.isActive || !VOLUNTEER_ROLES.includes(staff.role) ||
      (staff.mfaRequired && staff.assuranceLevel !== "aal2")) {
    return { ok: false, error: "You do not have permission to delete volunteer applications." };
  }
  if (!z.uuid().safeParse(id).success) {
    return { ok: false, error: "Invalid application reference." };
  }
  // The service client is created only after verifying the server-resolved staff session.
  // Public and direct authenticated database deletion remain disabled.
  const { data, error } = await createAdminClient().from("volunteer_applications")
    .delete().eq("id", id).select("id");
  if (error) return { ok: false, error: "The application could not be deleted. Please try again." };
  if (!data?.length) return { ok: false, error: "This application no longer exists. Refresh the page." };
  return { ok: true };
}
