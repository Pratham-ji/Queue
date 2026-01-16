// src/services/mockData.ts

export type HospitalType = "Hospital" | "Clinic" | "Diagnostics";
export type Status = "available" | "limited";

export type Hospital = {
  id: number;
  name: string;
  location: string;
  status: Status;
  type: HospitalType;
  image: string;
  rating: number;
  time: string;
  bookedCount?: number; // Added for "social proof"
};

export const hospitalsNearby: Hospital[] = [
  {
    id: 1,
    name: "Synergy Institute of Medical Sciences",
    location: "Ballupur, Dehradun",
    status: "available",
    type: "Hospital",
    rating: 4.8,
    time: "12 min",
    bookedCount: 142,
    image:
      "https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?w=800&q=80",
  },
  {
    id: 2,
    name: "Max Super Speciality Hospital",
    location: "Mussoorie Diversion Road",
    status: "limited",
    type: "Hospital",
    rating: 4.9,
    time: "35 min",
    bookedCount: 89,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80",
  },
  {
    id: 3,
    name: "Graphic Era Hospital",
    location: "Clement Town",
    status: "available",
    type: "Hospital",
    rating: 4.6,
    time: "25 min",
    bookedCount: 56,
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  },
  {
    id: 4,
    name: "Dr. Ahuja's Path Lab",
    location: "Astley Hall, Rajpur Road",
    status: "available",
    type: "Diagnostics",
    rating: 4.7,
    time: "15 min",
    bookedCount: 210,
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
  },
  {
    id: 5,
    name: "CMI Hospital",
    location: "Haridwar Road",
    status: "available",
    type: "Hospital",
    rating: 4.3,
    time: "20 min",
    bookedCount: 34,
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0674514?w=800&q=80",
  },
  {
    id: 6,
    name: "Skin & Hair Clinic",
    location: "Vasant Vihar",
    status: "limited",
    type: "Clinic",
    rating: 4.5,
    time: "10 min",
    bookedCount: 12,
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
  },
  {
    id: 7,
    name: "Doon MRI & Diagnostics",
    location: "Clock Tower",
    status: "available",
    type: "Diagnostics",
    rating: 4.4,
    time: "30 min",
    bookedCount: 78,
    image:
      "https://images.unsplash.com/photo-1581595220892-b0739bbe3df8?w=800&q=80",
  },
  {
    id: 8,
    name: "Shri Mahant Indiresh",
    location: "Patel Nagar",
    status: "available",
    type: "Hospital",
    rating: 4.2,
    time: "40 min",
    bookedCount: 115,
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  },
];
