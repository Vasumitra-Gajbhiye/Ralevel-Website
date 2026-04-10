"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateAndDownloadCertificate } from "@/lib/generateCertificate";
import { ChevronDown, ChevronUp, Download, Pencil, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import {
  createCertificate,
  deleteCertificate,
  updateCertificate,
} from "./actions";
import { AddCertificateModal } from "./add-certificate-modal";
import { EditCertificateModal } from "./EditCertificateModal";
export type Certificate = {
  _id: string;
  admin: string;
  certId: string;
  certType: string;
  issueDate: Date | null;
  name: string;
  owner: string;

  // planned / optional
  email?: string;
  discordUserId?: string;
  certificateDesigned?: boolean;
  handler?: string | null;
  hasCustomMessage?: boolean;
  message?: string;
  applicationID?: string;
  certificateDelivered?: boolean;
  dateGiven?: string;
};

// const mockCertificates: Certificate[] = [
//   {
//     _id: "6989f2416329125a6c3547fe",
//     admin: "scrim",
//     certId: "2i00sd238bye",
//     certType: "helper",
//     issueDate: "9 Feb 2026",
//     name: "Mohammad Touhid Hossain",
//     owner: "vas",

//     email: "touhid@email.com",
//     discordUserId: "482938492384923",
//     certificateDesigned: true,
//     certificateDelivered: false,
//     dateGiven: "10 Feb 2026",
//   },
// ];

// const initialCertificates: Certificate[] = [
//   {
//     _id: "6989f2416329125a6c3547fe",
//     admin: "scrim",
//     certId: "2i00sd238bye",
//     certType: "helper",
//     issueDate: "9 Feb 2026",
//     name: "Mohammad Touhid Hossain",
//     owner: "vas",
//     email: "touhid@email.com",
//     discordUserId: "482938492384923",
//     certificateDesigned: true,
//     certificateDelivered: false,
//     dateGiven: "10 Feb 2026",
//   },
// ];

type Props = {
  initialCertificates: Certificate[];
  handler: string | null | undefined;
};

function randomDigit() {
  return Math.floor(Math.random() * 10).toString();
}

function randomLetter() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return letters[Math.floor(Math.random() * letters.length)];
}

function generateCertId(): string {
  return (
    randomDigit() + // 1
    randomLetter() + // 2
    randomDigit() +
    randomDigit() + // 3-4
    randomLetter() +
    randomLetter() + // 5-6
    randomDigit() +
    randomDigit() +
    randomDigit() + // 7-9
    randomLetter() +
    randomLetter() +
    randomLetter() // 10-12
  );
}

export default function CertificatesAdminPage({
  initialCertificates,
  handler,
}: Props) {
  if (!handler) {
    return <h1>No Handler Session Found</h1>;
  }
  const [certificates, setCertificates] =
    useState<Certificate[]>(initialCertificates);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  function generateUniqueCertId(existingIds: string[]): string {
    let id;

    do {
      id = generateCertId();
    } while (existingIds.includes(id));

    return id;
  }

  async function handleDeleteCertificate(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this certificate?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCertificate(id);

      setCertificates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete certificate:", err);
    }
  }

  async function handleEditCertificate(updated: Certificate) {
    try {
      const saved = await updateCertificate({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        certType: updated.certType,
        applicationID: updated.applicationID,
        discordUserId: updated.discordUserId,
        owner: updated.owner,
        admin: updated.admin,
        handler: updated.handler,
        hasCustomMessage: updated.hasCustomMessage,
        message: updated.message,
        certificateDelivered: updated.certificateDelivered,
        issueDate: updated.issueDate, // ✅ important
      });

      setCertificates((prev) =>
        prev.map((c) => (c._id === saved._id ? saved : c))
      );

      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update certificate:", err);
    }
  }
  async function handleAddCertificate(data: {
    name: string;
    email: string;
    certType: string;
    applicationID: string;
    discordUserId: string;
    hasCustomMessage?: boolean;
    message?: string;
  }) {
    let attempts = 0;
    let created = null;

    while (attempts < 5) {
      try {
        const certId = generateCertId(); // 🔥 don't rely on existingIds
        let payload;
        data.hasCustomMessage
          ? (payload = {
              certId,
              name: data.name,
              email: data.email,
              certType: data.certType,
              applicationID: data.applicationID,
              discordUserId: data.discordUserId,
              admin: "scrim",
              owner: "vas",
              hasCustomMessage: data.hasCustomMessage,
              message: data.message,
              handler: handler,
            })
          : (payload = {
              certId,
              name: data.name,
              email: data.email,
              certType: data.certType,
              applicationID: data.applicationID,
              discordUserId: data.discordUserId,
              admin: "scrim",
              owner: "vas",
              handler: handler,
            });

        console.log("Trying ID:", certId);

        created = await createCertificate(payload);

        console.log("Saved to DB:", created);
        break; // ✅ success
      } catch (err: any) {
        if (err.message === "DUPLICATE_CERT_ID") {
          console.warn("Duplicate ID, retrying...");
          attempts++;
        } else {
          console.error("Error creating certificate:", err);
          return;
        }
      }
    }

    if (!created) {
      console.error("Failed after multiple attempts");
      return;
    }

    setCertificates((prev) => [created, ...prev]);
    setModalOpen(false);
  }

  const handleDownload = async (cert: Certificate) => {
    if (!cert.issueDate) {
      toast.error(`Invalid Issue Date for ${cert.name}`);
    } else {
      await generateAndDownloadCertificate({
        name: cert.name,
        certId: cert.certId,
        issueDate: String(cert.issueDate),
        message:
          "FOR MAKING ACADEMIC RESOURCES AND HELPING THE STUDENTS OF R/ALEVEL COMMUNITY",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Manage issued certificates
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Certificate</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Cert ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Delivered?</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Handler</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {certificates.map((cert) => {
              const expanded = openRow === cert._id;
              return (
                <Fragment key={cert._id}>
                  {/* Main row */}
                  <TableRow
                    key={cert._id}
                    className={` ${
                      cert.certificateDelivered
                        ? "bg-green-50"
                        : "bg-background"
                    } `}
                  >
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setOpenRow(expanded ? null : cert._id)}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="font-medium">{cert.name}</TableCell>

                    <TableCell className="font-mono text-sm">
                      {cert.certId}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">{cert.certType}</Badge>
                    </TableCell>

                    <TableCell>
                      {cert.certificateDelivered ? "yes" : "no"}
                    </TableCell>

                    <TableCell>
                      {cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not Issued"}
                    </TableCell>

                    <TableCell>{cert.handler?.split(" ")[0]}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCert(cert);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCertificate(cert._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>

                      {/* <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadQRCode(cert.certId)}
                      >
                        <Download />
                      </Button> */}

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDownload(cert)}
                      >
                        <Download />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded panel */}
                  {expanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-muted/30 px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <Info label="Lead" value={cert.owner} />
                            <Info label="Email" value={cert.email} />
                            <Info
                              label="Discord User ID"
                              value={cert.discordUserId}
                            />
                            <Info label="Admin" value={cert.admin} />
                            <Info
                              label="applicationID"
                              value={
                                cert.applicationID
                                  ? cert.applicationID
                                  : "No ID provided"
                              }
                            />
                            <Info
                              label="Certificate Delivered"
                              value={cert.certificateDelivered ? "Yes" : "No"}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AddCertificateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleAddCertificate}
      />
      <EditCertificateModal
        open={editOpen}
        onOpenChange={setEditOpen}
        certificate={selectedCert}
        onSubmit={handleEditCertificate}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
