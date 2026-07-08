const REQUIRED_STRING_FIELDS = [
  "fullName",
  "phone",
  "contactMethod",
  "cityCounty",
  "canContactMessage",
  "housingSituation",
  "timeframe",
  "referralSource",
  "biggestChallenge",
  "willingStructured",
  "willingRoadmap",
  "willingSubstanceFree",
  "employmentStatus",
  "incomeSource",
  "hasPhotoId",
  "hasWorkDocs",
  "transportationStatus",
  "immediateCrisis",
  "workingWithOrg",
  "needsAccommodation",
];

const REQUIRED_ACKNOWLEDGEMENTS = [
  "ackNotGuarantee",
  "ackStaffConversation",
  "ackNoSensitiveData",
  "ackAccurate",
  "ackPermissionContact",
];

const clean = (value) => String(value ?? "").trim();

export function validatePrescreen(input) {
  if (!input || REQUIRED_STRING_FIELDS.some((field) => !clean(input[field]))) {
    return { ok: false, error: "Please complete all required pre-screen fields." };
  }

  if (!Array.isArray(input.supportGoals) || input.supportGoals.length === 0) {
    return { ok: false, error: "Please complete all required pre-screen fields." };
  }

  if (
    input.workingWithOrg === "Yes" &&
    !clean(input.permissionContactOrg)
  ) {
    return { ok: false, error: "Please complete all required pre-screen fields." };
  }

  const email = clean(input.email).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (
    !input.acknowledgements ||
    REQUIRED_ACKNOWLEDGEMENTS.some((key) => input.acknowledgements[key] !== true)
  ) {
    return {
      ok: false,
      error: "Please review and accept all required acknowledgements.",
    };
  }

  const nameParts = clean(input.fullName).split(/\s+/);
  return {
    ok: true,
    value: {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || "Applicant",
      phone: clean(input.phone),
      email,
      contactMethod: clean(input.contactMethod),
      cityCounty: clean(input.cityCounty),
      canContactMessage: clean(input.canContactMessage),
      housingSituation: clean(input.housingSituation),
      timeframe: clean(input.timeframe),
      referralSource: clean(input.referralSource),
      requestedSupports: input.supportGoals.map(clean).filter(Boolean),
      primaryChallenge: clean(input.biggestChallenge),
      futureGoals: clean(input.futureGoals),
      willingStructured: clean(input.willingStructured),
      willingRoadmap: clean(input.willingRoadmap),
      willingSubstanceFree: clean(input.willingSubstanceFree),
      employmentStatus: clean(input.employmentStatus),
      incomeSource: clean(input.incomeSource),
      hasPhotoId: clean(input.hasPhotoId),
      hasWorkDocs: clean(input.hasWorkDocs),
      transportationStatus: clean(input.transportationStatus),
      immediateCrisis: clean(input.immediateCrisis),
      safeContactDetails: clean(input.safeContactDetails),
      workingWithOrg: clean(input.workingWithOrg),
      permissionContactOrg: clean(input.permissionContactOrg),
      needsAccommodation: clean(input.needsAccommodation),
      additionalNotes: clean(input.additionalNotes),
      acknowledgements: { ...input.acknowledgements },
    },
  };
}
