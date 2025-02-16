export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate?: string;
  endDate?: string;
  isPresent?: boolean;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  startDate?: string;
  endDate?: string;
  details: string;
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
  url?: string;
}

export interface Project {
  title: string;
  description: string;
  period: string;
  link?: string;
}

export interface Award {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Volunteer {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  id?: string;
}

export interface Publication {
  title: string;
  publisher: string;
  date: string;
  link?: string;
}

export interface ResumeContent {
  name: string;
  title: string;
  contact: Contact;
  photo?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects?: Project[];
  awards?: Award[];
  volunteer?: Volunteer[];
  languages?: Language[];
  certifications?: Certification[];
  publications?: Publication[];
} 