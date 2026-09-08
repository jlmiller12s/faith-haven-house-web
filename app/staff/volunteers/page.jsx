import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentStaffUser, checkStaffAccess } from "@/lib/rapAuth";
import { POSITION_LABELS, VOLUNTEER_ROLES } from "@/lib/volunteer.mjs";
import styles from "./volunteers.module.css";

export const dynamic = "force-dynamic";

export default async function VolunteersPage({ searchParams }) {
  const client = await createSupabaseServerClient();
  const staff = await getCurrentStaffUser(client);
  if (!checkStaffAccess(staff).allowed || !VOLUNTEER_ROLES.includes(staff?.role)) {
    redirect("/staff/unauthorized");
  }
  const params = await searchParams;
  const requestedPage = Number(params?.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
  const pageSize = 25;
  const { data, error, count } = await client.from("volunteer_applications")
    .select("id,created_at,firstname,lastname,email,phone,positions,skills,availability", { count: "exact" })
    .order("created_at", { ascending: false }).order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  return (
    <main className={styles.page}>
      <h1 className="crm-title">Volunteer applications</h1>
      <p>Applications from the website, newest first. Open an application to review details and follow up.</p>
      {error ? <div role="alert" className={styles.card}>Applications could not be loaded. Please refresh or try again later. <Link href="/staff/volunteers">Retry</Link></div> : <>
        <p>{count} application{count === 1 ? "" : "s"}</p>
        {!data?.length && <div className={styles.card}>No volunteer applications on this page.</div>}
        {data?.map((application) => (
          <details key={application.id} className={styles.card}>
            <summary><strong>{application.firstname} {application.lastname}</strong><span>Received {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(application.created_at))} (Central)</span></summary>
            <dl className={styles.details}>
              <div><dt>Email</dt><dd><a href={`mailto:${application.email}`}>{application.email}</a></dd></div>
              <div><dt>Phone</dt><dd>{application.phone}</dd></div>
              <div><dt>Positions of interest</dt><dd>{application.positions.map((position) => POSITION_LABELS[position] || position).join(", ") || "Not specified"}</dd></div>
              <div><dt>Skills and background</dt><dd>{application.skills || "Not provided"}</dd></div>
              <div><dt>Availability</dt><dd>{application.availability || "Not provided"}</dd></div>
            </dl>
          </details>
        ))}
        <nav aria-label="Application pages" className={styles.pagination}>
          {page > 1 && <Link href={`/staff/volunteers?page=${page - 1}`}>Previous</Link>}
          <span>Page {page}</span>
          {page * pageSize < count && <Link href={`/staff/volunteers?page=${page + 1}`}>Next</Link>}
        </nav>
      </>}
    </main>
  );
}
