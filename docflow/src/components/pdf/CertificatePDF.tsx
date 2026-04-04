import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "@/lib/pdf-theme";
import type { CertificateData } from "@/schemas/certificate.schema";

const styles = StyleSheet.create({
  page: { 
    padding: pdfTheme.spacing.page.padding, 
    fontFamily: pdfTheme.fonts.body,
    backgroundColor: pdfTheme.colors.background 
  },
  borderWrap: {
    border: `2pt solid ${pdfTheme.colors.primary}`,
    padding: 20,
    width: "100%",
    height: "100%",
    alignItems: "center"
  },
  heading: { 
    fontSize: 28, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary,
    marginTop: 40
  },
  certifiesText: { 
    fontSize: 16, 
    color: pdfTheme.colors.textMuted,
    fontStyle: "italic",
    marginVertical: 20
  },
  recipient: { 
    fontSize: 36, 
    fontWeight: "bold",
    color: pdfTheme.colors.primary,
    marginBottom: 20
  },
  completedText: { 
    fontSize: 16, 
    color: pdfTheme.colors.textMuted,
    marginBottom: 20
  },
  course: { 
    fontSize: 24, 
    color: pdfTheme.colors.secondary,
    marginBottom: 20
  },
  description: { 
    fontSize: 14, 
    color: pdfTheme.colors.text,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 40
  },
  issueDate: { 
    fontSize: 12, 
    color: pdfTheme.colors.textMuted 
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50
  },
  issuerVal: {
    fontSize: 16,
    fontWeight: "bold",
    color: pdfTheme.colors.text
  },
  issuerTitleVal: {
    fontSize: 12,
    color: pdfTheme.colors.textMuted
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "20%",
    transform: "rotate(-30deg)",
    fontSize: 100,
    color: pdfTheme.colors.primary,
    opacity: 0.1,
    zIndex: -1
  }
});

export const CertificatePDF = ({ data }: { data: CertificateData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.watermark}>CERTIFIED</Text>
      <View style={styles.borderWrap}>
        <Text style={styles.heading}>CERTIFICATE OF COMPLETION</Text>
        <Text style={styles.certifiesText}>This certifies that</Text>
        <Text style={styles.recipient}>{data.recipientName}</Text>
        <Text style={styles.completedText}>has successfully completed</Text>
        <Text style={styles.course}>{data.courseName}</Text>
        {data.description && <Text style={styles.description}>{data.description}</Text>}
        <Text style={styles.issueDate}>Issued on: {data.issueDate}</Text>

        <View style={styles.footer}>
          <View>
            <Text style={{ borderBottom: `1pt solid ${pdfTheme.colors.text}`, width: 200, marginBottom: 5 }}></Text>
            <Text style={styles.issuerVal}>{data.issuerName}</Text>
            {data.issuerTitle && <Text style={styles.issuerTitleVal}>{data.issuerTitle}</Text>}
          </View>
          <View>
            <Text style={{ fontSize: 10, color: pdfTheme.colors.muted }}>
              ID: {data.certificateId}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
