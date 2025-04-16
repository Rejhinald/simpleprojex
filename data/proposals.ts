import { ProposalData } from "@/types/create-proposal";

export const emptyProposal = {
  id: 0,
  name: "",
  title: "",
  description: "",
  // image: "",
  modules: [],
  parameters: [
   
  ],
  useGlobalMarkup: false,
  globalMarkupPercentage: 15,
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  created_at: "",
  updated_at: "",
  template_elements: [],
};

export const proposals = [
  {
    id: 1,
    title: "Full House Remodel Template",
    description:
      "Complete overhaul of the interior and exterior to enhance aesthetics and functionality.\nThe renovation includes new flooring, upgraded plumbing, and modern electrical systems.\nSmart home integrations and energy-efficient materials will be incorporated.",
    categories: [
      {
        id: 1,
        name: "Wall Framing",
        elements: [
          {
            id: 1,
            name: "External Wall Framing",
            material_cost: "Wall Length * Wall Width * Material Base Cost",
            labor_cost: "Wall Length * Wall Width * Hourly Rate",
          },
          {
            id: 2,
            name: "Internal Wall Framing",
            material_cost: "Wall Length * Wall Width * Material Base Cost",
            labor_cost: "Wall Length * Wall Width * Hourly Rate",
          },
        ],
      },
      {
        id: 2,
        name: "Flooring",
        elements: [
          {
            id: 3,
            name: "Flooring Installation",
            material_cost: "Floor Length * Floor Width * Material Base Cost",
            labor_cost: "Floor Length * Floor Width * Hourly Rate",
          },
          {
            id: 4,
            name: "Tiles Installation",
            material_cost: "Floor Length * Floor Width * Material Base Cost",
            labor_cost: "Floor Length * Floor Width * Hourly Rate",
          },
        ],
      },
    ],
    variables: [
      { id: 1, name: "Wall Length", type: "Linear Feet" },
      { id: 2, name: "Wall Width", type: "Linear Feet" },
      { id: 3, name: "Floor Length", type: "Linear Feet" },
      { id: 4, name: "Floor Width", type: "Linear Feet" },
    ],
    created_at: "2025-04-15",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    title: "Kitchen Renovation Plan",
    description:
      "A modernized kitchen with high-end finishes and state-of-the-art appliances.\nThis remodel includes custom cabinetry, stylish countertops, and efficient lighting solutions.\nWe will also optimize the space for better functionality and ease of movement.",
    categories: [
      {
        id: 1,
        name: "Cabinetry",
        elements: [
          {
            id: 5,
            name: "Custom Cabinets",
            material_cost:
              "Cabinet Height * Cabinet Width * Material Base Cost",
            labor_cost: "Cabinet Height * Cabinet Width * Hourly Rate",
          },
        ],
      },
      {
        id: 2,
        name: "Countertops",
        elements: [
          {
            id: 6,
            name: "Granite Countertops",
            material_cost:
              "Countertop Length * Countertop Width * Material Base Cost",
            labor_cost: "Countertop Length * Countertop Width * Hourly Rate",
          },
        ],
      },
    ],
    variables: [
      { id: 5, name: "Cabinet Height", type: "Inches" },
      { id: 6, name: "Cabinet Width", type: "Inches" },
      { id: 7, name: "Countertop Length", type: "Linear Feet" },
      { id: 8, name: "Countertop Width", type: "Linear Feet" },
    ],
    created_at: "2025-04-16",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "Bathroom Upgrade Plan",
    description:
      "Transform your bathroom into a spa-like retreat with elegant finishes.\nThis project includes a new shower system, modern tiling, and energy-efficient fixtures.\nHeated flooring and smart lighting will be installed for added luxury.",
    categories: [
      {
        id: 1,
        name: "Plumbing",
        elements: [
          {
            id: 7,
            name: "Shower Installation",
            material_cost: "Shower Area * Material Base Cost",
            labor_cost: "Shower Area * Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 9, name: "Shower Area", type: "Square Feet" }],
    created_at: "2025-04-17",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    title: "Basement Finishing Plan",
    description:
      "Turn your unfinished basement into a functional living space.\nThis includes installing drywall, flooring, and energy-efficient lighting.\nThe design will also focus on proper insulation and moisture control.",
    categories: [
      {
        id: 3,
        name: "Drywall Installation",
        elements: [
          {
            id: 8,
            name: "Wall Drywall",
            material_cost: "Wall Area * Material Base Cost",
            labor_cost: "Wall Area * Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 10, name: "Wall Area", type: "Square Feet" }],
    created_at: "2025-04-18",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    title: "Outdoor Deck Construction",
    description:
      "Build a beautiful outdoor deck to enhance your backyard.\nThis project includes wooden flooring, railings, and weather-resistant coatings.\nCustom-built seating and lighting can be added for a premium experience.",
    categories: [
      {
        id: 4,
        name: "Decking",
        elements: [
          {
            id: 9,
            name: "Deck Floor Installation",
            material_cost: "Deck Length * Deck Width * Material Base Cost",
            labor_cost: "Deck Length * Deck Width * Hourly Rate",
          },
        ],
      },
    ],
    variables: [
      { id: 11, name: "Deck Length", type: "Linear Feet" },
      { id: 12, name: "Deck Width", type: "Linear Feet" },
    ],
    created_at: "2025-04-19",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    title: "Garage Conversion Plan",
    description:
      "Convert your garage into a home office, gym, or living space.\nThe renovation will include insulation, flooring, and proper ventilation.\nElectrical wiring and lighting upgrades will ensure a comfortable environment.",
    categories: [
      {
        id: 5,
        name: "Insulation & Flooring",
        elements: [
          {
            id: 10,
            name: "Garage Insulation",
            material_cost: "Garage Area * Material Base Cost",
            labor_cost: "Garage Area * Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 13, name: "Garage Area", type: "Square Feet" }],
    created_at: "2025-04-20",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    title: "Roof Replacement Plan",
    description:
      "Upgrade your home’s roof with durable and weather-resistant materials.\nThis project involves removing old shingles and installing a new roofing system.\nEnergy-efficient insulation will be incorporated for better temperature control.",
    categories: [
      {
        id: 6,
        name: "Roofing",
        elements: [
          {
            id: 11,
            name: "Shingle Installation",
            material_cost: "Roof Area * Material Base Cost",
            labor_cost: "Roof Area * Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 14, name: "Roof Area", type: "Square Feet" }],
    created_at: "2025-04-21",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 8,
    title: "Home Office Setup",
    description:
      "Design a functional home office space for remote work.\nThis includes custom-built furniture, soundproofing, and efficient lighting.\nTechnology integration will allow for seamless work-from-home efficiency.",
    categories: [
      {
        id: 7,
        name: "Office Customization",
        elements: [
          {
            id: 12,
            name: "Furniture Installation",
            material_cost: "Office Area * Material Base Cost",
            labor_cost: "Office Area * Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 15, name: "Office Area", type: "Square Feet" }],
    created_at: "2025-04-22",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 9,
    title: "Smart Home Upgrade",
    description:
      "Integrate smart technology for enhanced security and convenience.\nThis includes smart locks, automated lighting, and voice-controlled devices.\nEnergy-efficient climate control systems will also be installed.",
    categories: [
      {
        id: 8,
        name: "Smart Technology",
        elements: [
          {
            id: 13,
            name: "Smart Security System",
            material_cost: "System Cost",
            labor_cost: "Installation Hourly Rate",
          },
        ],
      },
    ],
    variables: [{ id: 16, name: "System Cost", type: "Fixed Cost" }],
    created_at: "2025-04-23",
    imageUrl:
      "https://images.unsplash.com/photo-1593623671658-6b842c7f9697?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
