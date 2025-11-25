import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

/**
 * Helper function to convert ArrayBuffer to Base64 Data URL.
 * Required because jsPDF's addImage method often prefers data URLs for image data in a Node environment.
 * @param buffer The image data as an ArrayBuffer.
 * @param mimeType The MIME type of the image (e.g., 'image/png').
 * @returns A base64 encoded data URL string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer, mimeType: string): string {
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(req: Request) {
  if (typeof window !== 'undefined') {
    return new NextResponse("This API route must run in a server environment.", { status: 500 });
  }

const { certificates } = await req.json();

  const doc = new jsPDF();
  const pdfWidth = doc.internal.pageSize.getWidth();
  const margin = 10; // 10pt margin

  // Calculate the target width for the image to fit the page with margins
  const targetWidth = pdfWidth - (2 * margin);
  let firstPage = true;

for (const { url, name,id } of certificates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch image: ${url}`);
        continue;
      }
      
      const imgBytes = await response.arrayBuffer();
      const isPng = url.toLowerCase().endsWith(".png");
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      
      // Convert ArrayBuffer to the Base64 Data URL format jspdf needs
      const imgData = arrayBufferToBase64(imgBytes, mimeType);

      // If it's not the first image, add a new page
      if (!firstPage) {
        doc.addPage();
      }
      firstPage = false;
      
      // Add the image to the PDF. 
      // By setting the height parameter to 0, jsPDF will automatically calculate 
      const textY = 20;         // name position
const imageY = textY + 20; // push image down

doc.text(name, margin, textY);
doc.setFontSize(10);
doc.text(`${process.env.PROJECT_URL}/dashboard/certificates/${id}`, margin, textY + 10);
doc.addImage(imgData, isPng ? 'PNG' : 'JPEG', margin, imageY, targetWidth, 0);
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
      continue;
    }
  }

  // Finalize PDF and get the ArrayBuffer output.
  const pdfBuffer = doc.output('arraybuffer') as ArrayBuffer;

  // Directly return the ArrayBuffer in a new Response object.
  // This successfully bypasses the 'BlobPart' type issue in Next.js.
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="report.pdf"',
      "Content-Length": pdfBuffer.byteLength.toString(),
    },
  });
}