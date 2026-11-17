export interface GuideSection {
  title: string;
  intro?: string;
  points?: string[];
  steps?: string[];
  note?: string;
}
export interface BusinessGuide {
  id: string;
  title: string;
  summary: string;
  sections: GuideSection[];
}

export const cipaGuide: BusinessGuide = {
  id: "cipa-guide",
  title: "Registering Your Business with CIPA",
  summary: "From creating your CIPA profile to running a fully registered company in Botswana.",
  sections: [
    {
      title: "Section 1 — Create Your CIPA Profile",
      intro: "Your CIPA profile is your access point for registering, filing annual returns and making changes. Create it once and use it for the life of the business.",
      points: [
        "Full name exactly as on your ID",
        "Residential address, contact number and email",
        "Certified copy of your national ID or passport",
      ],
      steps: ["Go to cipa.co.bw and click \"Create Profile\".", "Fill in your details and set a username and password (free, about 5 minutes).", "Keep your login details safe — you will need them every year."],
    },
    {
      title: "Section 2 — Gather Your Documents",
      intro: "Have everything ready before opening the registration form. For every director, shareholder and secretary collect:",
      points: [
        "Full legal name, residential and postal address, email and phone",
        "Certified copy of ID or passport — stamped and signed by a Commissioner of Oaths (not a plain photocopy)",
        "Signed consent forms (director, shareholder, beneficial owner, secretary) from cipa.co.bw → Forms and Downloads",
        "Constitution template (Company Limited by Shares)",
      ],
      note: "Sign every form with pen — a typed name is not a signature. Fill in \"Completed By\" and \"Postal Address\" at the end of each consent form. On the constitution's Controllers Form: shareholders write \"Shareholder\" plus their percentage; directors only write \"Director\" and leave the percentage blank.",
    },
    {
      title: "Section 3 — Business Name or Company?",
      points: [
        "Business Name (P150): simple and cheap for sole traders and partnerships, but you are personally liable for all debts.",
        "Private Limited Company (P360): a separate legal entity, limited liability, more credibility with banks, clients and investors.",
      ],
      note: "If you are serious about growing, register a company — the extra cost buys real protection.",
    },
    {
      title: "Fees at a Glance",
      points: [
        "Name reservation: P20",
        "Extend name reservation: P40",
        "Business name registration: P150 (total P170)",
        "Private company registration: P360 (total P380)",
        "Annual returns: P500 every year",
        "Professional company secretary: P500 – P1,500",
      ],
      note: "Pay online by VISA card or mobile money — have it ready before you start.",
    },
    {
      title: "Section 4 — Reserve Your Name",
      points: [
        "Make it unique, simple and easy to spell; search the portal first.",
        "Words like investments, holdings, enterprises, solutions, services, trading, projects, ventures, group, Botswana, BW and Africa do not make a name unique.",
      ],
      steps: ["Log in → \"Start a Business\" → name reservation.", "Search to confirm the name is free.", "Pay P20 — the name is held for 30 days.", "Need more time? Click the name → \"Extend Name\" → pay P40 for 30 more days."],
    },
    {
      title: "Section 5 — Register a Business Name",
      points: [
        "Your personal details, business contact info and a specific description of what the business does",
        "Copy of ID and proof of address",
      ],
      note: "Pay P150. Processing takes about 24 hours. Print and keep your Certificate of Registration — banks, licences and contracts need it.",
    },
    {
      title: "Section 6 — Register a Private Company",
      steps: [
        "Go to \"Start a Business\" → \"Register a Private Company\".",
        "Select \"Company Limited by Shares\".",
        "Choose \"Use Approved Name\" and pick your reserved name.",
        "Upload the signed constitution (name on page one, adoption date, completed Controllers Form).",
        "Enter the registered address and contact details.",
        "Add each director with their signed consent form.",
        "Add each shareholder with percentage and amount paid (P1 per share keeps it simple).",
        "Make sure share percentages match the paper consent forms exactly and add up to 100%.",
        "Company secretary and tax agent are optional for now.",
        "Review every field, submit and pay P360 (about 24 hours to process).",
      ],
    },
    {
      title: "Why Applications Get Rejected",
      points: [
        "Name too similar to an existing one",
        "Wrong Position/percentage on the Controllers Form",
        "Blank \"Completed By\" or postal address on consent forms",
        "Typed names instead of real signatures",
        "Share percentages that don't match between forms and the online application",
        "Company secretary without a valid practicing certificate",
      ],
      note: "If rejected, read CIPA's comments, fix exactly what was flagged and resubmit.",
    },
    {
      title: "Section 7 — Staying Registered",
      points: [
        "File annual returns every year (P500) — missing them can get the company struck off.",
        "Appoint a qualified company secretary with a valid practicing certificate.",
        "Update CIPA whenever your address, directors or shareholders change.",
        "Guard your Certificate of Incorporation; download a fresh Company Extract when needed.",
      ],
    },
    {
      title: "Section 8 — Next Steps",
      steps: [
        "Open a business bank account (certificate, company extract, ID, proof of address).",
        "Register for tax with BURS to get your TIN (burs.org.bw).",
        "Get a trading licence from your local council.",
        "Register for PPRA tendering codes if you want government work.",
        "Keep records of all money in and out from day one.",
      ],
      note: "CIPA → BURS → Bank account → Trading licence → PPRA codes → Operating.",
    },
  ],
};

export const ppraGuide: BusinessGuide = {
  id: "ppra-guide",
  title: "Preparing for Government Tenders (PPRA)",
  summary: "How to get PPRA tendering codes so your business can bid on government work.",
  sections: [
    {
      title: "Section 1 — What PPRA Codes Are",
      intro: "Every company selling to government must be registered on the PPRA IPMS system. Your codes say what tenders you may bid on — without the right code your bid is not considered.",
      points: [
        "Services — cleaning, security, transport, maintenance",
        "Supplies — stationery, food, equipment, materials",
        "Consultation — engineering, accounting, legal, IT advice",
        "Works — buildings, roads, plumbing, electrical",
        "Each category has codes and sub-codes; you pay per sub-code.",
        "Works codes have grades (A, B, C…) that set the contract size you can bid for.",
        "Codes expire, usually after two years — renew before they lapse.",
      ],
    },
    {
      title: "Section 2 — Before You Start",
      points: [
        "CIPA certificate and registration number (UIN)",
        "Company bank account details",
        "BURS tax number (TIN) and trading licence",
        "IDs for all directors and shareholders",
        "Company secretary details (if appointed)",
      ],
      note: "Download and read the 7 \"Contractor Registration Requirements\" documents from the PPRA IPMS homepage — they list every code, its requirements and fees.",
    },
    {
      title: "Section 3 — Choosing the Right Codes",
      steps: [
        "Deliver physical products? → Supplies",
        "Provide a non-physical service? → Services",
        "Give professional advice? → Consultation (needs qualified staff with CVs and certificates)",
        "Build, install or repair infrastructure? → Works (needs vehicles, equipment, staff and project history)",
      ],
      note: "Only apply for codes you can prove today. You can add more codes later.",
    },
    {
      title: "Section 4 — Costs",
      points: [
        "Initial registration: P200",
        "Per sub-code, youth (18–35): P150",
        "Per sub-code, standard (36+): P300",
        "Renewal: similar to initial registration",
        "Example: youth with 4 sub-codes = P800; standard = P1,400",
      ],
      note: "Pay by VISA after PPRA approves your application — not at submission.",
    },
    {
      title: "Section 5 — Registering on IPMS",
      steps: [
        "Create your account on the PPRA IPMS homepage (one account per organisation; if previously on PPADB, ask the service desk for your details).",
        "Complete your Basic Profile: company details, address, primary and secondary contact.",
        "Click \"Apply/Upgrade/View Status\" to open the registration forms.",
        "Fill in banker details, affiliates, directors and shareholders (with certified IDs).",
        "Works/Consultation: add employees with CVs and certificates; Works: vehicles, equipment and past projects.",
        "Add company secretary (with practicing certificate) and upload trading licence and tax clearance.",
        "Select every code and sub-code you can support, review and submit.",
      ],
    },
    {
      title: "Section 6 — Common Rejection Reasons",
      points: [
        "Staff qualifications that don't match Consultation code requirements",
        "Missing or expired company secretary practicing certificate",
        "Project references that can't be verified",
        "Vehicles or equipment without registration documents",
      ],
    },
    {
      title: "Section 7 — Approval and Your Certificate",
      steps: [
        "Watch \"My Alerts\" while your application is reviewed, then pay when approved.",
        "On the IPMS homepage click \"Search Registered Contractors\".",
        "Enter your company name, discipline, code, sub-code and grade, then search.",
        "Click \"Generate PDF\" to download your official code certificate.",
      ],
    },
  ],
};

export const businessGuides: Record<string, BusinessGuide> = {
  [cipaGuide.id]: cipaGuide,
  [ppraGuide.id]: ppraGuide,
};
