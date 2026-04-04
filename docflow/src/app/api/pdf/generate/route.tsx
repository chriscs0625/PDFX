import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import { ReportPDF } from "@/components/pdf/ReportPDF";
import { CertificatePDF } from "@/components/pdf/CertificatePDF";
import { GradeReportPDF } from "@/components/pdf/GradeReportPDF";
import { uploadPDF } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, data } = body;
    const userId = session.user.id;

    let MyDocument: any = null;
    if (type === "INVOICE") MyDocument = <InvoicePDF data={data} />;
    else if (type === "REPORT") MyDocument = <ReportPDF data={data} />;
    else if (type === "CERTIFICATE") MyDocument = <CertificatePDF data={data} />;
    else if (type === "GRADE_REPORT") MyDocument = <GradeReportPDF data={data} />;
    else return NextResponse.json({ error: "Invalid document type" }, { status: 400 });

    const stream = await renderToStream(MyDocument);
    const chunks: Buffer[] = [];
    for await (const chunk of stream as any) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);

    const path = `${userId}/${type}/${Date.now()}.pdf`;
    const fileUrl = await uploadPDF(buffer, path);

    const doc = await prisma.document.create({
      data: {
        userId,
        type,
        title: data.title || type,
        inputData: data,
        fileUrl
      }
    });

    return NextResponse.json({ fileUrl, documentId: doc.id });
  } catch (error: any) {
    console.error("PDF generation failed", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
