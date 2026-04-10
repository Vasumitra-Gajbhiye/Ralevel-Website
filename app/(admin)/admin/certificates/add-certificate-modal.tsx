// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useState } from "react";

// type Props = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (data: {
//     name: string;
//     email: string;
//     certType: string;
//     applicationID: string;
//     discordUserId: string;
//   }) => void;
// };

// export function AddCertificateModal({ open, onOpenChange, onSubmit }: Props) {
//   // ✅ state for inputs
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [certType, setCertType] = useState("");
//   const [applicationID, setApplicationID] = useState("");
//   const [discordID, setDiscordID] = useState("");
//   const [isCustom, setIsCustom] = useState(false);
//   const [customType, setCustomType] = useState("");
//   const [message, setMessage] = useState("");
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   function handleSubmit() {
//     if (!validate()) return;

//     onSubmit({
//       name,
//       email,
//       certType: isCustom ? customType : certType,
//       discordUserId: discordID,
//       applicationID,
//     });

//     // reset
//     setName("");
//     setEmail("");
//     setCertType("");
//     setApplicationID("");
//     setIsCustom(false);
//     setCustomType("");
//     setDiscordID("");
//     setErrors({});
//   }
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   function validate() {
//     const newErrors: { [key: string]: string } = {};

//     if (!name.trim()) newErrors.name = "Name is required";

//     if (!email.trim()) newErrors.email = "Email is required";
//     else if (!emailRegex.test(email)) newErrors.email = "Invalid email";

//     if (!applicationID.trim())
//       newErrors.applicationID = "Application ID is required";

//     if (!discordID.trim()) newErrors.discordID = "Discord ID is required";

//     if (isCustom) {
//       if (!customType.trim()) newErrors.certType = "Custom type is required";
//     } else {
//       if (!certType) newErrors.certType = "Select a certificate type";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add Certificate</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Name */}
//           <div className="space-y-1">
//             <Label>Name</Label>
//             <Input
//               placeholder="Student name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             {errors.name && (
//               <p className="text-sm text-red-500">{errors.name}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div className="space-y-1">
//             <Label>Email</Label>
//             <Input
//               placeholder="student@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             {errors.email && (
//               <p className="text-sm text-red-500">{errors.email}</p>
//             )}
//           </div>

//           {/* Application ID */}
//           <div className="space-y-1">
//             <Label>Application ID (Discord)</Label>
//             <Input
//               placeholder="sdf-sdv348f-sdfkdn248uj-dsf"
//               value={applicationID}
//               onChange={(e) => setApplicationID(e.target.value)}
//             />
//             {errors.applicationID && (
//               <p className="text-sm text-red-500">{errors.applicationID}</p>
//             )}
//           </div>

//           {/* Discord ID */}
//           <div className="space-y-1">
//             <Label>Discord User ID</Label>
//             <Input
//               placeholder="23409875230974"
//               value={discordID}
//               onChange={(e) => setDiscordID(e.target.value)}
//             />
//             {errors.discordID && (
//               <p className="text-sm text-red-500">{errors.discordID}</p>
//             )}
//           </div>

//           {/* Certificate Type */}
//           <div className="space-y-1">
//             <Label>Certificate Type</Label>

//             <select
//               className="w-full border rounded-md p-2"
//               value={isCustom ? "custom" : certType}
//               onChange={(e) => {
//                 const value = e.target.value;

//                 if (value === "custom") {
//                   setIsCustom(true);
//                   setCertType("");
//                 } else {
//                   setIsCustom(false);
//                   setCertType(value);
//                 }
//               }}
//             >
//               <option value="">Select type</option>
//               <option value="helper">helper</option>
//               <option value="resource">resource</option>
//               <option value="moderation">moderation</option>
//               <option value="management">management</option>
//               <option value="writer">writer</option>
//               <option value="graphic">graphic</option>
//               <option value="custom">custom</option>
//             </select>

//             {isCustom && (
//               <Input
//                 placeholder="Enter custom type (no spaces)"
//                 value={customType}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\s/g, "");
//                   setCustomType(value);
//                 }}
//               />
//             )}

//             {errors.certType && (
//               <p className="text-sm text-red-500">{errors.certType}</p>
//             )}
//           </div>

//           <Button className="w-full" onClick={handleSubmit}>
//             Save Certificate
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react"; // Using Lucide icons, standard with shadcn
import { useState } from "react";

// Map your standard messages into a dictionary for easy lookups
const DEFAULT_MESSAGES: Record<string, string> = {
  helper: "FOR HELPING AND GUIDING THE STUDENTS OF THE r/alevel COMMUNITY",
  resource:
    "FOR MAKING ACADEMIC RESOURCES AND HELPING THE STUDENTS OF r/alevel COMMUNITY",
  moderation:
    "FOR MODERATING AND ENSURING SAFETY WITHIN THE r/alevel ACADEMIC COMMUNITY",
  management: "FOR MANAGING AND DIRECTING THE r/alevel ACADEMIC COMMUNITY",
  writer:
    "FOR WRITING INFORMATIVE AND CREATIVE PIECES FOR THE r/alevel ACADEMIC COMMUNITY",
  graphic:
    "FOR ARTISTICALLY DEVELOPING GRAPHIC DESIGN FOR THE r/alevel ACADEMIC COMMUNITY",
  "2024WriterCompFirstPlace":
    "FOR FIRST PLACE IN THE r/alevel 2024 CREATIVE & ESSAY WRITING COMPETITION",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    email: string;
    certType: string;
    applicationID: string;
    discordUserId: string;
    hasCustomMessage?: boolean;
    message?: string; // 👈 Added message to output
  }) => void;
};

export function AddCertificateModal({ open, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [certType, setCertType] = useState("");
  const [applicationID, setApplicationID] = useState("");
  const [discordID, setDiscordID] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [customType, setCustomType] = useState("");
  const [hasCustomMessage, setHasCustomMessage] = useState(false);

  // ✅ New state for messages
  const [message, setMessage] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    if (value === "custom") {
      setIsCustom(true);
      setCertType("");
      setMessage(""); // Clear message for custom
      setIsEditingMessage(true); // Always editable for custom
    } else {
      setIsCustom(false);
      setCertType(value);
      setMessage(DEFAULT_MESSAGES[value] || "");
      setIsEditingMessage(false); // Lock it by default for standard types
    }
  }

  function handleEditClick() {
    if (isCustom) return;

    // Show warning before unlocking
    const confirmEdit = window.confirm(
      "Warning: You are about to edit a standardized community message. Are you sure you want to customize this?"
    );

    if (confirmEdit) {
      setHasCustomMessage(true);
      setIsEditingMessage(true);
    }
  }

  function validate() {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email";

    if (!applicationID.trim())
      newErrors.applicationID = "Application ID is required";

    if (!discordID.trim()) newErrors.discordID = "Discord ID is required";

    if (isCustom) {
      if (!customType.trim()) newErrors.certType = "Custom type is required";
    } else {
      if (!certType) newErrors.certType = "Select a certificate type";
    }

    if (!message.trim()) newErrors.message = "Certificate message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    hasCustomMessage
      ? onSubmit({
          name,
          email,
          certType: isCustom ? customType : certType,
          discordUserId: discordID,
          applicationID,
          hasCustomMessage: hasCustomMessage,
          message: message.trim(), // 👈 Pass the message up
        })
      : onSubmit({
          name,
          email,
          certType: isCustom ? customType : certType,
          hasCustomMessage: false,
          discordUserId: discordID,
          applicationID,
        });

    // reset
    setName("");
    setEmail("");
    setCertType("");
    setApplicationID("");
    setIsCustom(false);
    setCustomType("");
    setDiscordID("");
    setMessage("");
    setIsEditingMessage(false);
    setHasCustomMessage(false);
    setErrors({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="Student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              placeholder="student@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Application ID */}
          <div className="space-y-1">
            <Label>Application ID (Discord)</Label>
            <Input
              placeholder="sdf-sdv348f-sdfkdn248uj-dsf"
              value={applicationID}
              onChange={(e) => setApplicationID(e.target.value)}
            />
            {errors.applicationID && (
              <p className="text-sm text-red-500">{errors.applicationID}</p>
            )}
          </div>

          {/* Discord ID */}
          <div className="space-y-1">
            <Label>Discord User ID</Label>
            <Input
              placeholder="23409875230974"
              value={discordID}
              onChange={(e) => setDiscordID(e.target.value)}
            />
            {errors.discordID && (
              <p className="text-sm text-red-500">{errors.discordID}</p>
            )}
          </div>

          {/* Certificate Type */}
          <div className="space-y-1">
            <Label>Certificate Type</Label>

            <select
              className="w-full border rounded-md p-2 bg-background text-sm"
              value={isCustom ? "custom" : certType}
              onChange={handleTypeChange}
            >
              <option value="">Select type</option>
              <option value="helper">helper</option>
              <option value="resource">resource</option>
              <option value="moderation">moderation</option>
              <option value="management">management</option>
              <option value="writer">writer</option>
              <option value="graphic">graphic</option>
              <option value="2024WriterCompFirstPlace">
                2024 Writer Comp 1st Place
              </option>
              <option value="custom">custom</option>
            </select>

            {isCustom && (
              <Input
                className="mt-2"
                placeholder="Enter custom type (no spaces)"
                value={customType}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "");
                  setCustomType(value);
                }}
              />
            )}

            {errors.certType && (
              <p className="text-sm text-red-500">{errors.certType}</p>
            )}
          </div>

          {/* Certificate Message */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Certificate Message</Label>
              {/* Only show edit button if a standard type is selected AND it's not already being edited */}
              {!isCustom && certType !== "" && !isEditingMessage && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {/* Using a textarea for messages so long text is readable */}
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter the certificate reason/message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isEditingMessage && !isCustom && certType !== ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <Button className="w-full mt-2" onClick={handleSubmit}>
            Save Certificate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
