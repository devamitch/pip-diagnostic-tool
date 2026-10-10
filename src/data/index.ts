import { ArticleCardData, ExerciseCardData } from "@/types";
import { BrainCircuit, ChartColumnIncreasing,Headset,House, Laptop, Laugh, Luggage, Shield, View, Zap } from "lucide-react";


export const blinkRateData = [ { v: 10 }, { v: 25 }, { v: 12 }, { v: 30 }, { v: 15 }, { v: 5 }, { v: 18 }];
export const eyeStrainData = [ { v: 15, high: false }, { v: 20, high: true }, { v: 18, high: false }, { v: 28, high: true }, { v: 12, high: false }, { v: 22, high: true }, { v: 10, high: false }];
export const eyeAgeData = [ { v: 10 }, { v: 15 }, { v: 25 }, { v: 20 }, { v: 30 }, { v: 18 }, { v: 22 }];
export const screenTimeData = [ { v: 10 }, { v: 15 }, { v: 12 }, { v: 30 }, { v: 18 }, { v: 22 }, { v: 14 }];

export const articlesData: ArticleCardData[] = [
    {
        title: 'Signs You Need an Eye Checkup',
        description: 'Regular eye exams are important for maintaining eye health.',
        image: '/mockData/eye.jpg',
    },
    {
        title: 'How to prevent digital eye strain',
        description: 'Learn how to prevent digital eye strain from screens.',
        image: '/mockData/eye2.jpg',
    },
    {
        title: 'How to prevent digital eyestrain',
        description: 'Tips for keeping your eyes healthy every day.',
        image: '/mockData/eye3.jpg',
    },
];

export const ExerciseData: ExerciseCardData[] = [
    {
        title: 'Relieve Eye Strain Naturally',
        image: '/mockData/exercise.png',
    },
    {
        title: 'Follow 20-20-20 Rule for Screen Breaks',
        image: '/mockData/exercise2.png',
    },
    {
        title: 'Blinking Less Than Last Week',
        image: '/mockData/exercise3.png',
    },
];

export const hospitalsData = [
  {
    title: "City Eye Hospital",
    description: "123 Main Street, Downtown",
    image: "/mockData/hospital.jpg"
  },
  {
  
    title: "Vision Care Center",
    description: "456 Park Avenue, Midtown",
    image: "/mockData/hospital2.jpg"
  },
  {
    title: "EyeCare Specialists",
    description: "789 Medical Plaza, Uptown",
    image: "/mockData/hospital3.jpg"
  },
  {
  
    title: "Advanced Eye Institute",
    description: "321 Health Boulevard, Westside",
    image: "/mockData/hospital4.jpg"
  }
];


export const productsData = [
  {
    
    key:'1',
    title: "Blink Contacts",
    description: "(10ml)",
    image: "/mockData/product.png"
  },
  {
       key:'2',
    title: "ratio-Prednisolone 1.0%",
    description: "(10ml)",
    image: "/mockData/product.png"
  },
  {
       key:'3',
    title: "Aqualens Contact Lens",
    description: "",
    image: "/mockData/product2.png"
  },
   {  key:'4',
    title: "Blink Contacts",
    description: "(10ml)",
    image: "/mockData/product.png"
  },
  {
       key:'5',
    title: "ratio-Prednisolone 1.0%",
    description: "(10ml)",
    image: "/mockData/product.png"
  },
];


export const mockReport = {
	date: '16 Jun 2025, 14:37',
	confidenceAverage: 95,
	condition: 'No conditions detected',
	percentage: 85,
	emoji: Laugh ,
};

export const mockReportBrief = {
	date: '16 Jun 2025, 14:37',
	confidenceAverage: 95,
	condition: 'No conditions detected',
}

export  const userData = {
    name: 'Preetham',
    email: 'preetham123@mail.com',
    image: '/mockData/profile.png',
  };

  
export const featureData = [
  {
    icon: House,
    title: 'Continuous Monitoring',
    description: 'Works in the background via existing webcams—no disruption to workflows.',

  },
  {
    icon: BrainCircuit,
    title: 'Real-Time Analysis',
    description: 'Uses AI to detect early signs of strain: reduced blink rate, gaze fatigue, and screen-glare impact.',

  },
  {
    icon: View,
    title: 'Proactive Guidance',
    description: 'Suggests short, tailored exercises, micro-breaks, and ergonomic adjustments—before strain impacts performance.',

  },
  {
    icon: ChartColumnIncreasing,
    title: 'Data-Driven Insights',
    description: 'Generates actionable reports for individuals and aggregated, anonymous insights for HR and wellness leads.',

  },
];

export const whoWeWorkWithData = [
  {
    icon: House,
    title: 'Enterprise Offices',
    description: 'Large teams working on screens all day.',

  },
  {
    icon: Headset,
    title: 'Call Centers',
    description: 'High-volume screen time, multiple shifts.',

  },
  {
    icon: Luggage,
    title: 'Tech & Creative Agencies',
    description: 'Extended design, coding, and editing hours.',

  },
  {
    icon: Laptop,
    title: 'Remote & Hybrid Teams',
    description: 'Wellness support wherever employees work.',

  },
];


  
export const benefitsOrganisationData = [
  {
    title: 'Boost Productivity',
    description: 'Prevent the drop in focus and performance from tired eyes',

  },
  {
    title: 'Support Wellbeing',
    description: 'A measurable wellness initiative that improves daily comfort and engagement',

  },
  {
    title: 'Lower Health Costs',
    description: 'Prevent chronic eye strain and cut down on optometry visits and sick leave',

  },
  {
    title: 'Show You Care',
    description: 'Position your company as a proactive employer that values employee health',

  },
];


export const reportHistory = [
  {
    date: 'July 17, 2025',
    time: '08:45 AM',
    result: 'Normal',
    status: 'Normal',
    action: 'Quick View',
  },
  {
    date: 'July 10, 2025',
    time: '08:07 AM',
    result: 'Slightly Low Blink Rate',
    status: 'Blink Rate',
    action: 'View Report',
  },
  {
    date: 'July 13, 2025',
    time: '06:45 AM',
    result: 'Eye Strain Detected',
    status: 'Eye Strain',
    action: 'View Report',
  },
    {
    date: 'July 10, 2025',
    time: '08:07 AM',
    result: 'Slightly Low Blink Rate',
    status: 'Blink Rate',
    action: 'View Report',
  },
  {
    date: 'July 13, 2025',
    time: '06:45 AM',
    result: 'Eye Strain Detected',
    status: 'Eye Strain',
    action: 'View Report',
  },
];

    export const problemPoints = [
        'Employees spend 6-10 hours daily in front of screens.',
        'Digital eye strain causes headaches, fatigue, and poor focus.',
        'Vision discomfort is a top factor in productivity loss.',
    ];

    export const impactPoints = [
        'Higher sick days',
        'Lower productivity',
        'Increased burnout',
    ];

    export const businessFeatures = [
    {
        title: 'Seamless Integration',
        description: 'Works with standard webcams on laptops and desktops.',
    },
    {
        title: 'Flexible Policies',
        description: 'Align break reminders with company wellness guidelines.',
    },
    {
        title: 'Analytics Dashboard',
        description: 'View real-time wellness indicators across teams.',
    },
    {
        title: 'Secure by Design',
        description: 'GDPR, PIPEDA, and SOC 2 aligned.',
    },
];

export const beforeRescueEyes = [
    '1 in 3 employees report daily headaches or eye discomfort',
    'Average 20-40 minutes of lost productivity per person per day',
];

export const afterRescueEyes = [
    'Reduced symptoms reported within 2 weeks',
    'Higher engagement scores in wellness surveys',
    'Documented reduction in sick leave related to eye strain',
];