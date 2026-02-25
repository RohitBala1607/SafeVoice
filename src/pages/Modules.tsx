import { useState } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const POSH_MODULES = [
    {
        id: 1,
        name: "Physical Harassment",
        content: `
LEGAL DEFINITION:
Physical harassment refers to any unwelcome physical contact or advance without consent.

POSH Act Section Alignment:
 Section 2(n)  Definition of Sexual Harassment
 Section 3(2)  Physical contact and advances

TYPES:
* Touching body intentionally
* Holding hands forcefully
* Hugging without consent
* Attempting to kiss
* Blocking movement
* Physical intimidation

PUNISHMENT:
Termination + Legal action


Related IPC Sections (Criminal Law):

* IPC 354   Assault on woman
* IPC 354A  Physical sexual harassment
`
    },
    {
        id: 2,
        name: "Verbal Harassment",
        content: `
LEGAL DEFINITION:
Sexual comments, jokes, or remarks causing discomfort.

POSH Act Section Alignment:
 Section 2(n)(ii)
 Section 3(2)(ii) Demand or request for sexual favours

EXAMPLES:
• * Sexual comments
* Dirty jokes
* Sexual remarks
* Asking sexual questions

PUNISHMENT:
Suspension / Termination

Related IPC:

* IPC 509 – Word or gesture insulting modesty
`

    },
    {
        id: 3,
        name: "Visual Harassment",
        content: `
LEGAL DEFINITION:
Showing sexual content or gestures

POSH Act Section Alignment:
 Section 2(n)(iii)  Showing pornography
 Section 3(2)(iii)

EXAMPLES:
* Showing porn
* Sending sexual photos
* Sexual gestures
* Staring sexually

PUNISHMENT:
Strict action

Related IPC

* IPC 354A(1)(iv)
`
    },
    {
        id: 4,
        name: "Quid Pro Quo Harassment",
        content: `
LEGAL DEFINITION:
Demanding sexual favor for job benefits

POSH Act Section Alignment:
 Section 3(2)(ii) – Demand or request for sexual favours

PUNISHMENT:
Immediate termination

Related IPC

 * IPC 354A
`
    },
    {
        id: 5,
        name: "Online Harassment",
        content: `
LEGAL DEFINITION:
Harassment via WhatsApp, Email

POSH Act Section Alignment:
 Covered under Section 2(o) – Workplace includes virtual workplace

PUNISHMENT:
Legal action

Acts Covered:

* WhatsApp harassment
* Email harassment
* Social media harassment

Related IT Act:

* IT Act Section 67 – Sending obscene content
`
    },
    {
        id: 6,
        name: "Hostile Work Environment",
        content: `
LEGAL DEFINITION:
Unsafe workplace

POSH Act Section Alignment:
 Section 3(2)(iv) – Creating hostile environment

PUNISHMENT:
Disciplinary action

Related IPC:

Section 19 - Employer's responsibility
`
    }
];

export default function Modules() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<any>(null);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <AppHeader
                title="POSH Act Modules"
                subtitle="Know Your Legal Rights"
                showBack
                onBack={() => navigate("/dashboard")}
            />

            <div className="p-4 flex-1">
                {selected === null && (
                    <div className="grid gap-4">
                        {POSH_MODULES.map((module) => (
                            <motion.div
                                key={module.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="border rounded-xl p-5 bg-card shadow hover:shadow-lg transition cursor-pointer"
                                onClick={() => setSelected(module)}
                            >
                                <h2 className="font-bold text-lg text-primary">
                                    {module.name}
                                </h2>
                                <p className="text-sm mt-2 text-muted-foreground">
                                    Tap to read full explanation
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border rounded-xl shadow p-5"
                    >
                        <button
                            onClick={() => setSelected(null)}
                            className="text-primary mb-3 text-sm font-medium hover:underline"
                        >
                            ← Back to Modules
                        </button>

                        <h1 className="text-xl font-bold mb-4">
                            {selected.name}
                        </h1>

                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                                {selected.content}
                            </pre>
                        </div>

                        <button
                            onClick={() => navigate("/file-complaint", { state: { selectedType: selected.name } })}
                            className="mt-5 w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            File Complaint under this Category
                        </button>
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
