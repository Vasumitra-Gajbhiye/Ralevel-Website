import { CertImgSkeleton } from "@/app/skeleton";
import { getCachedCertificateByCertId } from "@/lib/data/certificates";
import { cldImage, cldRaw } from "@/lib/cloudinary";
import {
  getCertificateMessage,
  splitCertificateMessageLines,
} from "@/lib/certificate-messages";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
const Skeleton = function () {
  return (
    <div
      className="font-poppins animate-pulse min-h-[200px] max-xxs:h-[400px] max-xs:h-[550px] max-sm:h-[720px] max-md:h-[950px] max-lg:h-[1200px] max-xl:h-[1300px] max-2xl:h-[1500px]"
      style={{
        maxWidth: "70rem",
        margin: "2rem auto",
        padding: "0 2rem",
        marginBottom: "30rem",
      }}
    >
      <CertImgSkeleton className="w-full h-full bg-gray-200 rounded-xl" />
      {/* <div className="w-full bg-gray-200 rounded-xl mt-4 xs:mt-12 md:mt-20"  style={{height:"100rem", marginTop:"-10rem"} }></div> */}
      <div className=" -mt-20 xs:-mt-12 mb-20 md2:-mt-6">
        <div className="mb-16">
          <div className="h-10 bg-gray-200 rounded w-2/3 mb-3 mt-24"></div>
        </div>
        <div className="flex flex-col mb-32 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default async function SingleResource({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="bg-white min-h-screen">
      {/* You can keep Navbar here */}
      <Suspense fallback={<Skeleton />}>
        <CertificateDisplay id={id} />
      </Suspense>
      {/* You can keep Footer here */}
    </div>
  );
}

interface Certificate {
  _id: any;
  name: string;
  certType: string;
  certId: string;
  issueDate: string;
  __v: Int32Array;
  admin: string;
  owner: string;
  hasCustomMessage?: boolean;
  customMessage?: string;
  message?: string;
}

function InvalidCertificate({ id }: { id: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-cy-100">
            <AlertCircle className="w-8 h-8 text-cy-600" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          Invalid Certificate
        </h1>

        <p className="text-gray-600 mb-6">
          We couldn’t find a certificate with ID{" "}
          <span className="font-medium text-cy-600">{id}</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/certificates"
            className="px-5 py-2 rounded-full bg-cy-500 text-white font-medium hover:bg-cy-600 transition"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="px-5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

async function CertificateDisplay({ id }: { id: string }) {
  let cert: Certificate | null = null;

  try {
    cert = await getCachedCertificateByCertId(id);
  } catch (err) {
    console.error("Error loading certificate:", err);
  }
  if (!cert) {
    return <InvalidCertificate id={id} />;
  }
  // 🔹 SKELETON PLACEHOLDER

  ///////////////////

  let admin;
  let adminSign;
  const width = admin === "Kush" ? 300 : 1263;
  const height = admin === "Kush" ? 200 : 360;

  if (cert?.admin == "kush") {
    admin = "Kush";
    adminSign = "Kush_sign.png";
  }
  if (cert?.admin == "scrim") {
    admin = "Jake Schwegler";
    adminSign = "Jake_sign.png";
  }

  const src = adminSign ? `/certificateImages/${adminSign}` : "/fallback.png";

  const { lineOne, lineTwo } = splitCertificateMessageLines(
    getCertificateMessage(cert),
  );

  // 🔹 ACTUAL CONTENT
  return (
    <Suspense fallback={<Skeleton />}>
      <div className="min-h-[200px] max-xxs:h-[400px] max-xs:h-[550px] max-sm:h-[720px] max-md:h-[950px] max-lg:h-[1200px] max-xl:h-[1300px] max-2xl:h-[1500px] flex justify-center items-start  bg-white">
        <div className="inline-block transform origin-top transition-transform duration-300 scale-[0.2] xxs:scale-[0.3] xs:scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] 2xl:scale-[1]">
          <div className="w-full flex items-center justify-center flex-col  ">
            {/* <div
        className="cert-con flex justify-center flex-col items-center "
        style={{ marginTop:"-56em", marginBottom:"0rem"}}
      > */}
            <div
              className="cert border-2 border-themBlue-100  flex flex-col items-center rounded-lg relative overflow-hidden  mb-12"
              // style={{ width: "140rem", padding: "23rem 18rem 55rem 18rem", marginTop:"-56em", marginBottom:"0rem" }}
              style={{
                width: "70rem",
                padding: "6.9rem auto 16.5rem auto",
                marginTop: "10rem",
                marginBottom: "0rem",
              }}
            >
              <div className="design ">
                <Image
                  className="c-design-img top-des absolute max-w-96 -z-10 top-0 left-0"
                  src={cldImage("/certificateImages/Group 41.png")}
                  width={486}
                  height={505}
                  alt="something"
                />

                <Image
                  className="c-design-img bottom-des absolute -z- bottom-0 left-0 w-full"
                  src={cldImage("/certificateImages/Group 42.png")}
                  alt="something"
                  height={539}
                  width={1135}
                />

                <Image
                  className="c-design-img bottom-dot absolute max-w-14 -z-10"
                  src={cldImage("/certificateImages/Group 40.png")}
                  width={114}
                  height={477}
                  alt="something"
                  style={{ bottom: "16%", left: "2%" }}
                />

                <Image
                  className="c-design-img top-dot absolute max-w-14 -z-10 "
                  src={cldImage("/certificateImages/Group 39.png")}
                  alt="something"
                  height={381}
                  width={116}
                  style={{ top: "2%", right: "2%" }}
                />
              </div>
              <div className="Text flex flex-col items-center justify-center gap-0 pt-40 pb-40">
                <div className="title-con relative text-center mb-4">
                  <h1
                    className="c-heading-main text-themBlue-300 text-center  font-bold"
                    style={{ fontSize: "5rem" }}
                  >
                    CERTIFICATE
                  </h1>
                  <h1
                    className="c-heading-main-shadow text-themBlue-100 absolute  top-1 left-1 -z-10 font-bold"
                    style={{ fontSize: "5rem" }}
                  >
                    CERTIFICATE
                  </h1>
                </div>
                <h2
                  className="c-sub-heading text-themBlue-200 text-2xl text-center tracking-widest font-semibold mb-7"
                  style={{ letterSpacing: "0.5rem" }}
                >
                  OF APPRECIATION
                </h2>
                <h2
                  className="c-name-intro text-themBlue-200 text-xl text-center font-medium mb-14 "
                  style={{ letterSpacing: "0.2rem" }}
                >
                  Proudly Presented To
                </h2>
                <h1
                  className="c-name border-themBlue-300 text-themBlue-300 text-5xl border-b text-center font-bold w-fit"
                  style={{
                    padding: "0 2.8rem 2rem 2rem",
                    margin: "0 auto 3rem auto",
                  }}
                >
                  {cert?.name ? cert.name : null}
                </h1>
                <h2
                  className="c-subtitle text-themBlue-200 text-center text-2xl font-medium"
                  style={{ lineHeight: "2.3rem" }}
                >
                  {lineOne}
                  {lineTwo ? (
                    <>
                      <br />
                      {lineTwo}
                    </>
                  ) : null}
                </h2>
                <div
                  className="auth w-full grid grid-cols-3 place-items-center content-center items-center  justify-center pb-80 pt-24 "
                  style={{ width: "55rem" }}
                >
                  <div className=" owner-info flex flex-col items-center gap-4">
                    <Image
                      className="owner-sign max-w-52 border-1 border-black "
                      src={cldImage("/certificateImages/Vasu_sign.jpg")}
                      width={1263}
                      height={360}
                      alt="Signature"
                    />
                    <h4 className="owner-name text-themBlue-300 text-2xl font-semibold">
                      Vasumitra GAJBHIYE
                    </h4>
                    <h6
                      className="owner-title text-themBlue-100 text-lg font-medium"
                      style={{ letterSpacing: "0.3rem" }}
                    >
                      COMMUNITY LEADER
                    </h6>
                  </div>
                  <div className="server-logo w-44 self-center">
                    <Image
                      className="server-logo-img w-full"
                      src={cldImage("/logo/Vertical logo.png")}
                      width={400}
                      height={292}
                      alt="Signature"
                    />
                  </div>
                  <div
                    className={`admin-info flex min-w-fit flex-col items-center gap-4 ${
                      admin == "Kush" ? "-mt-16" : ""
                    }`}
                  >
                    <Image
                      className={`admin-sign max-w-52 border-1 border-black ${
                        admin == "Kush" ? "" : ""
                      }`}
                      src={cldImage(src)}
                      height={height}
                      width={width}
                      alt="Signature"
                    />
                    <h4
                      className={`admin-name text-themBlue-300 text-2xl font-semibold ${
                        admin == "Kush" ? "-mt-8" : ""
                      }`}
                    >
                      {admin}
                    </h4>
                    <h6
                      className="admin-title text-themBlue-100 text-lg font-medium "
                      style={{ letterSpacing: "0.3rem" }}
                    >
                      CHIEF ADMINISTRATOR
                    </h6>
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
            <div className="download-btn mt-14 mb-44 max-w-96 bg-cy-500 py-1 px-12 rounded-2xl  transition-all hover:cursor-pointer hover:scale-10">
              <a
                href={cldRaw(`cert_pdf_doc/${cert?.certId}-pdf.pdf`)}
                target="_blank"
                className="download-btn-text text-white text-3xl font-bold no-underline flex justify-center items-center gap-8"
                style={{ letterSpacing: "0.5rem" }}
              >
                <svg
                  className="db-svg w-20 h-20 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>Download</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
