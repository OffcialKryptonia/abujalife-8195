/** Abuja-first expansion catalogue. All named businesses below are fictional game entities. */
export type MobilityTier = "public" | "personal" | "executive" | "luxury" | "aviation";
export type InstitutionType = "university" | "polytechnic" | "college" | "specialized";

export const ABUJA_VEHICLES = [
  { id: "bicycle", name: "City Bicycle", tier: "public" as const, price: 45000, speed: 1.4, rep: 0, desc: "Cheap, healthy and very Abuja-in-the-morning." },
  { id: "okada", name: "Motorbike", tier: "personal" as const, price: 650000, speed: 0.7, rep: 2, desc: "Fast through traffic; weather matters." },
  { id: "tokunbo", name: "Tokunbo Saloon", tier: "personal" as const, price: 4500000, speed: 0.6, rep: 10, desc: "Foreign-used saloon with working AC." },
  { id: "corolla", name: "Executive Saloon", tier: "executive" as const, price: 9500000, speed: 0.52, rep: 22, desc: "Reliable executive transport for work and city life." },
  { id: "suv", name: "Executive SUV", tier: "executive" as const, price: 18000000, speed: 0.48, rep: 40, desc: "Comfortable SUV for everyday Abuja movement." },
  { id: "range_rover", name: "Range Rover Autobiography", tier: "luxury" as const, price: 165000000, speed: 0.34, rep: 180, desc: "Flagship luxury SUV with serious status." },
  { id: "g_wagon", name: "Mercedes-AMG G 63", tier: "luxury" as const, price: 185000000, speed: 0.32, rep: 200, desc: "High-profile luxury performance SUV." },
  { id: "maybach", name: "Mercedes-Maybach S-Class", tier: "luxury" as const, price: 240000000, speed: 0.3, rep: 240, desc: "Rear-seat executive luxury." },
  { id: "bentley", name: "Bentley Flying Spur", tier: "luxury" as const, price: 320000000, speed: 0.28, rep: 300, desc: "Ultra-luxury grand touring sedan." },
  { id: "rolls_royce", name: "Rolls-Royce Ghost", tier: "luxury" as const, price: 520000000, speed: 0.25, rep: 450, desc: "Peak prestige mobility." },
  { id: "helicopter", name: "Executive Helicopter", tier: "aviation" as const, price: 1800000000, speed: 0.12, rep: 800, desc: "Private rotorcraft for premium travel." },
  { id: "private_jet", name: "Light Private Jet", tier: "aviation" as const, price: 6500000000, speed: 0.08, rep: 1500, desc: "Private aviation for inter-city and VIP travel." },
] as const;

export const ABUJA_INSTITUTIONS = [
  { id: "uniabuja", name: "University of Abuja", short: "UNIABUJA", type: "university" as InstitutionType, ownership: "public", district: "gwarinpa", campus: "Large federal university campus", studentLife: ["Lectures", "Hostel life", "Student clubs", "Sports", "Campus events"] },
  { id: "abuad_fictional", name: "Abuja Metropolitan University", short: "AMU", type: "university" as InstitutionType, ownership: "private", district: "guzape", campus: "Private urban campus", studentLife: ["Lectures", "Entrepreneurship", "Societies", "Cafeteria", "Internships"] },
  { id: "abupoly", name: "Abuja Polytechnic", short: "ABUPOLY", type: "polytechnic" as InstitutionType, ownership: "public", district: "kubwa", campus: "Applied-technology campus", studentLife: ["Practical classes", "Workshops", "Hostels", "Sports", "Student union"] },
  { id: "fcet_zuba", name: "Federal College of Education, Zuba", short: "FCE Zuba", type: "college" as InstitutionType, ownership: "public", district: "karmo", campus: "Teacher-training campus", studentLife: ["Lectures", "Teaching practice", "Clubs", "Sports"] },
  { id: "abuja_business_school", name: "Capital Business School", short: "CBS", type: "specialized" as InstitutionType, ownership: "private", district: "wuse2", campus: "Professional education centre", studentLife: ["Executive classes", "Networking", "Case competitions"] },
] as const;

export const ABUJA_POLITICAL_OFFICES = [
  { id: "fct_minister", title: "Minister of the FCT", jurisdiction: "Federal Capital Territory", level: "fct", elected: false, appointment: true },
  { id: "fct_senator", title: "Senator representing the FCT", jurisdiction: "Federal Capital Territory", level: "federal", elected: true, appointment: false },
  { id: "fct_rep", title: "House of Representatives Member", jurisdiction: "FCT Federal Constituency", level: "federal", elected: true, appointment: false },
  { id: "area_chairman", title: "Area Council Chairman", jurisdiction: "FCT Area Council", level: "local", elected: true, appointment: false },
  { id: "area_councillor", title: "Area Council Councillor", jurisdiction: "FCT Ward", level: "local", elected: true, appointment: false },
] as const;

export const STATE_POLITICAL_OFFICES = [
  { id: "governor", title: "Governor", level: "state", elected: true },
  { id: "deputy_governor", title: "Deputy Governor", level: "state", elected: true },
  { id: "senator", title: "Senator", level: "federal", elected: true },
  { id: "house_rep", title: "House of Representatives Member", level: "federal", elected: true },
  { id: "assembly_member", title: "State House of Assembly Member", level: "state", elected: true },
  { id: "lga_chairman", title: "Local Government Chairman", level: "local", elected: true },
  { id: "councillor", title: "Councillor", level: "local", elected: true },
] as const;

export const CITY_ROADMAP = [
  { id: "abuja", status: "active", priority: 1 },
  { id: "kano", status: "planned", priority: 2 },
  { id: "kaduna", status: "planned", priority: 3 },
  { id: "benin", status: "planned", priority: 4 },
  { id: "lokoja", status: "planned", priority: 5 },
] as const;
