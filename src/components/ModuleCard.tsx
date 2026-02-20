import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { HarassmentModule } from "../types/complaints";

interface ModuleCardProps {
    module: HarassmentModule;
    onClick?: () => void;
}

const ModuleCard = ({ module, onClick }: ModuleCardProps) => {
    // Dynamically get the icon component
    const Icon = (Icons as any)[module.iconName] || Icons.HelpCircle;

    return (
        <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-elevated"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h3 className="font-display text-sm font-bold text-foreground">{module.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {module.description}
                </p>
            </div>
        </motion.button>
    );
};

export default ModuleCard;
