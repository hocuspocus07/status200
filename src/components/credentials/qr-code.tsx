"use client"; 
import React from 'react';
import QRCode from 'react-qr-code';
import { ExternalLink, QrCode } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface QrCodeModalProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
}

export function QrCodeModal({ url, isOpen, onClose }: QrCodeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="sm:max-w-[425px] p-6 flex flex-col items-center">
                {/* Modal Header */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <QrCode className="w-6 h-6 text-primary" />
                        Scan QR Code
                    </DialogTitle>
                    <DialogDescription>
                        Scan this code with your mobile device to access the URL.
                    </DialogDescription>
                </DialogHeader>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border rounded-lg w-full max-w-[260px] mx-auto">
                    {url ? (
                        <div className="p-2 bg-white rounded-md shadow-inner w-full">
                            <div className="w-full max-w-[220px]">
                                <QRCode
                                    value={url}
                                    className="w-full h-auto"
                                    level="H"
                                    fgColor="#000000"
                                    bgColor="#FFFFFF"
                                />
                            </div>

                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">No valid URL provided.</p>
                    )}
                </div>

                <p className="text-md text-muted-foreground text-center flex break-words mt-2">
                    Link: <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline  text-sm ml-2"><ExternalLink/></a>
                </p>

            </DialogContent>
        </Dialog>
    );
}