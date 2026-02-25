import { HarassmentModule } from "../types/complaints";

export const HARASSMENT_MODULES: HarassmentModule[] = [
    {
        id: "physical",
        name: "Physical Harassment",
        description: "Unwelcome physical contact or advance without consent.",
        iconName: "Hand",
    },
    {
        id: "verbal",
        name: "Verbal Harassment",
        description: "Sexual comments, jokes, or remarks causing discomfort.",
        iconName: "MessageSquare",
    },
    {
        id: "visual",
        name: "Visual Harassment",
        description: "Display of sexual content or gestures.",
        iconName: "Eye",
    },
    {
        id: "quid-pro-quo",
        name: "Quid Pro Quo Harassment",
        description: "Demanding sexual favor for job benefits.",
        iconName: "ArrowLeftRight",
    },
    {
        id: "online",
        name: "Online Harassment",
        description: "Harassment via WhatsApp, Email, or Social Media.",
        iconName: "Globe",
    },
    {
        id: "hostile-environment",
        name: "Hostile Work Environment",
        description: "Conduct that creates an unsafe or intimidating workplace.",
        iconName: "Users",
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
        description: "Any other form of harassment under the POSH Act.",
        iconName: "HelpCircle",
    },
];

export const getHarassmentTypeNames = () => HARASSMENT_MODULES.map(m => m.name);
