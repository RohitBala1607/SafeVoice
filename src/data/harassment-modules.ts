import { HarassmentModule } from "../types/complaints";

export const HARASSMENT_MODULES: HarassmentModule[] = [
    {
        id: "verbal",
        name: "Verbal Harassment",
        description: "Unwelcome comments, jokes, or suggestions of a sexual nature.",
        iconName: "MessageSquare",
    },
    {
        id: "physical",
        name: "Physical Harassment",
        description: "Unwelcome physical contact, touching, or gestures.",
        iconName: "Hand",
    },
    {
        id: "visual",
        name: "Visual Harassment",
        description: "Display of sexually suggestive posters, pictures, or drawings.",
        iconName: "Eye",
    },
    {
        id: "quid-pro-quo",
        name: "Quid Pro Quo",
        description: "Implied or explicit promise of preferential treatment in exchange for sexual favors.",
        iconName: "ArrowLeftRight",
    },
    {
        id: "hostile-environment",
        name: "Hostile Work Environment",
        description: "Conduct that unreasonably interferes with work performance or creates an intimidating environment.",
        iconName: "Users",
    },
    {
        id: "cyber",
        name: "Cyber Harassment",
        description: "Harassment via digital devices, social media, or electronic messages.",
        iconName: "Globe",
    },
    {
        id: "stalking",
        name: "Stalking",
        description: "Persistent following, monitoring, or unwanted attention.",
        iconName: "MapPin",
    },
    {
        id: "other",
        name: "Other",
        description: "Any other form of harassment as defined under the POSH Act.",
        iconName: "HelpCircle",
    },
];

export const getHarassmentTypeNames = () => HARASSMENT_MODULES.map(m => m.name);
