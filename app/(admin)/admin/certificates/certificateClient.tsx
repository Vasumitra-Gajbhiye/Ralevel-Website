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
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { AddCertificateModal } from "./add-certificate-modal";

export type Certificate = {
  _id: string;
  admin: string;
  certId: string;
  certType: string;
  issueDate: string;
  name: string;
  owner: string;

  // planned / optional
  email?: string;
  discordUserId?: string;
  certificateDesigned?: boolean;
  certificateDelivered?: boolean;
  dateGiven?: string;
};

const mockCertificates: Certificate[] = [
  {
    _id: "6989f2416329125a6c3547fe",
    admin: "scrim",
    certId: "2i00sd238bye",
    certType: "helper",
    issueDate: "9 Feb 2026",
    name: "Mohammad Touhid Hossain",
    owner: "vas",

    email: "touhid@email.com",
    discordUserId: "482938492384923",
    certificateDesigned: true,
    certificateDelivered: false,
    dateGiven: "10 Feb 2026",
  },
];

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
};

export default function CertificatesAdminPage({ initialCertificates }: Props) {
  const [certificates, setCertificates] =
    useState<Certificate[]>(initialCertificates);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleAddCertificate(data: {
    name: string;
    email: string;
    certType: string;
  }) {
    const newCert: Certificate = {
      _id: crypto.randomUUID(),
      certId: Math.random().toString(36).slice(2, 12),
      admin: "vas", // later from session
      issueDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      owner: "vas",
      name: data.name,
      email: data.email,
      certType: data.certType,
      certificateDesigned: false,
      certificateDelivered: false,
    };

    setCertificates((prev) => [newCert, ...prev]);
    setModalOpen(false);
  }

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
              <TableHead>Issued</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {initialCertificates.map((cert) => {
              const expanded = openRow === cert._id;

              return (
                <Fragment key={cert._id}>
                  {/* Main row */}
                  <TableRow key={cert._id} className="bg-background">
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

                    <TableCell>{cert.issueDate}</TableCell>

                    <TableCell>{cert.admin}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded panel */}
                  {expanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-muted/30 px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <Info label="Owner" value={cert.owner} />
                            <Info label="Email" value={cert.email} />
                            <Info
                              label="Discord User ID"
                              value={cert.discordUserId}
                            />
                            <Info
                              label="Certificate Designed"
                              value={cert.certificateDesigned ? "Yes" : "No"}
                            />
                            <Info
                              label="Certificate Delivered"
                              value={cert.certificateDelivered ? "Yes" : "No"}
                            />
                            <Info label="Date Given" value={cert.dateGiven} />
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
