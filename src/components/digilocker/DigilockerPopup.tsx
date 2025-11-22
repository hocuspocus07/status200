"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type DigiCertificate = {
  _id: string;
  certificateId: string;
  name: string;
  type: string;
  createdAt: string;
};

type DigiCertificateDetails = {
  success: boolean;
  certificateId: string;
  type: string;
  name: string;
  details?: any;
  contentType: string;
  file: string;
  createdAt: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCertificateSelect: (data: DigiCertificateDetails) => void;
};

export default function DigilockerPopup({ open, onOpenChange, onCertificateSelect }: Props) {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "list">("email");
  const [token, setToken] = useState("");
  const [certificates, setCertificates] = useState<DigiCertificate[]>([]);

  const sendOtp = async () => {
    const res = await fetch(`http://localhost:5500/auth/send-otp`, {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if(!data.success){
      toast.error(data.message);
      return;
    }

    toast.success("OTP sent!");
    setStep("otp");
  };

  const verifyOtp = async () => {
    const res = await fetch(`http://localhost:5500/auth/verify-otp`, {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if(!data.success){
      toast.error("OTP Invalid");
      return;
    }

    toast.success("OTP verified!");
    localStorage.setItem("digilocker_token", data.token);
    setToken(data.token);

    fetchCertificates(data.token);
  };

  const fetchCertificates = async (token: string) => {
    const res = await fetch(`http://localhost:5500/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setCertificates(data.certificates || []);
    setStep("list");
  };

  const select = async (certId: string) => {

    const res = await fetch(`http://localhost:5500/certificates/${certId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const cert: DigiCertificateDetails = await res.json();

    onCertificateSelect(cert);

    toast.success("Certificate loaded!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader><DialogTitle>Import from Digilocker</DialogTitle></DialogHeader>

        {/* STEP 1 */}
        {step === "email" && (
          <>
            <Input placeholder="Enter Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <Button className="w-full mt-3" onClick={sendOtp}>Send OTP</Button>
          </>
        )}

        {/* STEP 2 */}
        {step === "otp" && (
          <>
            <Input placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
            <Button className="w-full mt-3" onClick={verifyOtp}>Verify OTP</Button>
          </>
        )}

        {/* STEP 3 */}
        {step === "list" && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {certificates.map(c => (
              <div key={c._id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{c.type}</p>
                  <p className="text-xs">{c.name}</p>
                </div>
                <Button size="sm" onClick={()=>select(c.certificateId)}>Import</Button>
              </div>
            ))}
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}