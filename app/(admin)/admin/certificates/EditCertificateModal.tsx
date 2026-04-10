// "use client";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { format } from "date-fns";
// import { useEffect, useState } from "react";
// import { Certificate } from "./certificateClient";
// type Props = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   certificate: Certificate | null;
//   onSubmit: (updated: Certificate) => void;
// };

// export function EditCertificateModal({
//   open,
//   onOpenChange,
//   certificate,
//   onSubmit,
// }: Props) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [applicationID, setApplicationID] = useState("");
//   const [discordID, setDiscordID] = useState("");
//   const [certType, setCertType] = useState("");
//   const [owner, setOwner] = useState("");
//   const [admin, setAdmin] = useState("");
//   const [handler, setHandler] = useState("");
//   const [issueDate, setIssueDate] = useState<Date | undefined>();

//   const [certificateDesigned, setCertificateDesigned] = useState(false);
//   const [certificateDelivered, setCertificateDelivered] = useState(false);

//   const [isCustom, setIsCustom] = useState(false);
//   const [customType, setCustomType] = useState("");

//   useEffect(() => {
//     if (certificate) {
//       setName(certificate.name || "");
//       setEmail(certificate.email || "");
//       setApplicationID(certificate.applicationID || "");
//       setDiscordID(certificate.discordUserId || "");
//       setCertType(certificate.certType || "");
//       setOwner(certificate.owner || "");
//       setAdmin(certificate.admin || "");
//       setHandler(certificate.handler || "");
//       setCertificateDesigned(!!certificate.certificateDesigned);
//       setCertificateDelivered(!!certificate.certificateDelivered);
//       setIssueDate(certificate.issueDate || undefined);
//       setIsCustom(false);
//       setCustomType("");
//     }
//   }, [certificate]);

//   function handleSubmit() {
//     if (!certificate) return;

//     const updated: Certificate = {
//       ...certificate,
//       name,
//       email,
//       applicationID,
//       discordUserId: discordID,
//       certType: isCustom ? customType : certType,
//       owner,
//       admin,
//       handler,
//       certificateDesigned,
//       certificateDelivered,
//       issueDate: issueDate || null,
//     };

//     onSubmit(updated);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Edit Certificate</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Name */}
//           <div className="space-y-1">
//             <Label>Name</Label>
//             <Input value={name} onChange={(e) => setName(e.target.value)} />
//           </div>

//           {/* Email */}
//           <div className="space-y-1">
//             <Label>Email</Label>
//             <Input value={email} onChange={(e) => setEmail(e.target.value)} />
//           </div>

//           {/* Application ID */}
//           <div className="space-y-1">
//             <Label>Application ID</Label>
//             <Input
//               value={applicationID}
//               onChange={(e) => setApplicationID(e.target.value)}
//             />
//           </div>

//           {/* Discord ID */}
//           <div className="space-y-1">
//             <Label>Discord User ID</Label>
//             <Input
//               value={discordID}
//               onChange={(e) => setDiscordID(e.target.value)}
//             />
//           </div>

//           {/* Owner */}
//           <div className="space-y-1">
//             <Label>Lead (Owner)</Label>
//             <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
//           </div>

//           {/* Admin */}
//           <div className="space-y-1">
//             <Label>Admin</Label>
//             <Input value={admin} onChange={(e) => setAdmin(e.target.value)} />
//           </div>

//           {/* Handler */}
//           <div className="space-y-1">
//             <Label>Handler</Label>
//             <Input
//               value={handler}
//               onChange={(e) => setHandler(e.target.value)}
//             />
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
//           </div>

//           <div className="flex items-center justify-between">
//             <Label>Certificate Delivered</Label>
//             <input
//               type="checkbox"
//               checked={certificateDelivered}
//               onChange={(e) => setCertificateDelivered(e.target.checked)}
//             />
//           </div>

//           {/* Issue Date */}
//           <div className="space-y-1">
//             <Label>Issue Date</Label>

//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start text-left font-normal"
//                 >
//                   {issueDate ? format(issueDate, "PPP") : "Pick a date"}
//                 </Button>
//               </PopoverTrigger>

//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="single"
//                   selected={issueDate}
//                   onSelect={setIssueDate}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//           </div>

//           <Button className="w-full" onClick={handleSubmit}>
//             Save Changes
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Edit2 } from "lucide-react"; // 👈 Added icon
import { useEffect, useState } from "react";
import { Certificate } from "./certificateClient"; // Adjust this import based on your actual file structure

// 👈 Copied over the standard messages dictionary
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
  certificate: Certificate | null;
  onSubmit: (updated: Certificate) => void;
};

export function EditCertificateModal({
  open,
  onOpenChange,
  certificate,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [applicationID, setApplicationID] = useState("");
  const [discordID, setDiscordID] = useState("");
  const [certType, setCertType] = useState("");
  const [owner, setOwner] = useState("");
  const [admin, setAdmin] = useState("");
  const [handler, setHandler] = useState("");
  const [issueDate, setIssueDate] = useState<Date | undefined>();

  const [certificateDesigned, setCertificateDesigned] = useState(false);
  const [certificateDelivered, setCertificateDelivered] = useState(false);

  const [isCustom, setIsCustom] = useState(false);
  const [customType, setCustomType] = useState("");

  // ✅ New state for handling messages
  const [hasCustomMessage, setHasCustomMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  useEffect(() => {
    if (certificate) {
      setName(certificate.name || "");
      setEmail(certificate.email || "");
      setApplicationID(certificate.applicationID || "");
      setDiscordID(certificate.discordUserId || "");
      setOwner(certificate.owner || "");
      setAdmin(certificate.admin || "");
      setHandler(certificate.handler || "");
      setCertificateDesigned(!!certificate.certificateDesigned);
      setCertificateDelivered(!!certificate.certificateDelivered);
      setIssueDate(certificate.issueDate || undefined);

      // Figure out if the existing type is standard or custom
      const isStandardType = Object.keys(DEFAULT_MESSAGES).includes(
        certificate.certType
      );

      if (isStandardType) {
        setIsCustom(false);
        setCertType(certificate.certType);
        setCustomType("");
      } else {
        setIsCustom(true);
        setCertType("");
        setCustomType(certificate.certType);
      }

      // Initialize message states based on DB data
      setHasCustomMessage(!!certificate.hasCustomMessage);

      if (certificate.hasCustomMessage && certificate.message) {
        setMessage(certificate.message);
        setIsEditingMessage(true); // Unlock it since it's already customized
      } else {
        // Fallback to default dictionary if it's standard
        setMessage(DEFAULT_MESSAGES[certificate.certType] || "");
        setIsEditingMessage(!isStandardType); // Lock standard types, unlock custom types
      }
    }
  }, [certificate]);

  // ✅ Mirroring handleTypeChange from Add Modal
  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    if (value === "custom") {
      setIsCustom(true);
      setCertType("");
      setMessage("");
      setIsEditingMessage(true);
      setHasCustomMessage(true);
    } else {
      setIsCustom(false);
      setCertType(value);
      setMessage(DEFAULT_MESSAGES[value] || "");
      setIsEditingMessage(false);
      setHasCustomMessage(false); // Reset custom override if they go back to a standard type
    }
  }

  // ✅ Mirroring handleEditClick from Add Modal
  function handleEditClick() {
    if (isCustom) return;

    const confirmEdit = window.confirm(
      "Warning: You are about to edit a standardized community message. Are you sure you want to customize this?"
    );

    if (confirmEdit) {
      setHasCustomMessage(true);
      setIsEditingMessage(true);
    }
  }

  function handleSubmit() {
    if (!certificate) return;

    // Package the payload conditionally based on custom message state
    const baseUpdated: any = {
      ...certificate,
      name,
      email,
      applicationID,
      discordUserId: discordID,
      certType: isCustom ? customType : certType,
      owner,
      admin,
      handler,
      certificateDesigned,
      certificateDelivered,
      issueDate: issueDate || null,
    };

    if (hasCustomMessage && message.trim()) {
      baseUpdated.hasCustomMessage = true;
      baseUpdated.message = message.trim();
    } else {
      baseUpdated.hasCustomMessage = false;
      baseUpdated.message = undefined; // Clear it out if it's back to standard
    }

    onSubmit(baseUpdated as Certificate);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Application ID */}
          <div className="space-y-1">
            <Label>Application ID</Label>
            <Input
              value={applicationID}
              onChange={(e) => setApplicationID(e.target.value)}
            />
          </div>

          {/* Discord ID */}
          <div className="space-y-1">
            <Label>Discord User ID</Label>
            <Input
              value={discordID}
              onChange={(e) => setDiscordID(e.target.value)}
            />
          </div>

          {/* Owner */}
          <div className="space-y-1">
            <Label>Lead (Owner)</Label>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>

          {/* Admin */}
          <div className="space-y-1">
            <Label>Admin</Label>
            <Input value={admin} onChange={(e) => setAdmin(e.target.value)} />
          </div>

          {/* Handler */}
          <div className="space-y-1">
            <Label>Handler</Label>
            <Input
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
            />
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
          </div>

          {/* ✅ Certificate Message */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Certificate Message</Label>
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

            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter the certificate reason/message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isEditingMessage && !isCustom && certType !== ""}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label>Certificate Delivered</Label>
            <input
              type="checkbox"
              checked={certificateDelivered}
              onChange={(e) => setCertificateDelivered(e.target.checked)}
            />
          </div>

          {/* Issue Date */}
          <div className="space-y-1 pb-4">
            <Label>Issue Date</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {issueDate ? format(issueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={setIssueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
