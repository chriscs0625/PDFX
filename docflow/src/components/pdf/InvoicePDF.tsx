import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "@/lib/pdf-theme";
import type { InvoiceData } from "@/schemas/invoice.schema";

const styles = StyleSheet.create({
  page: { 
    padding: pdfTheme.spacing.page.padding, 
    fontFamily: pdfTheme.fonts.body,
    backgroundColor: pdfTheme.colors.background 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.border,
    paddingBottom: 20,
    marginBottom: 30
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold",
    fontFamily: pdfTheme.fonts.heading,
    color: pdfTheme.colors.text 
  },
  invoiceNo: { 
    fontSize: 16, 
    color: pdfTheme.colors.textMuted 
  },
  infoBlock: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 30 
  },
  column: { width: "45%" },
  label: { 
    fontSize: 10, 
    fontWeight: "bold", 
    color: pdfTheme.colors.textMuted, 
    marginBottom: 5 
  },
  text: { 
    fontSize: 12, 
    color: pdfTheme.colors.text,
    marginBottom: 3 
  },
  badge: {
    padding: "4 8",
    borderRadius: 4,
    fontSize: 10,
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 10
  },
  table: { width: "100%", marginBottom: 30 },
  row: { 
    flexDirection: "row", 
    borderBottomWidth: 1, 
    borderBottomColor: pdfTheme.colors.border, 
    minHeight: pdfTheme.spacing.table.rowHeight,
    alignItems: "center"
  },
  headerRow: { 
    backgroundColor: pdfTheme.colors.surface,
    fontWeight: "bold"
  },
  colDesc:  { width: "50%", paddingLeft: 8, fontSize: 11 },
  colQty:   { width: "15%", textAlign: "center", fontSize: 11 },
  colPrice: { width: "15%", textAlign: "right", fontSize: 11 },
  colTotal: { width: "20%", textAlign: "right", paddingRight: 8, fontSize: 11 },
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end"
  },
  totalLabel: { fontSize: 14, fontWeight: "bold", marginRight: 20 },
  totalValue: { fontSize: 14, fontWeight: "bold" },
  notesText: {
    fontSize: 10,
    fontStyle: "italic",
    color: pdfTheme.colors.textMuted,
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: pdfTheme.colors.muted
  }
});

const formatCurrency = (val: number, curr: string) => {
  return \`\${val.toFixed(2)} \${curr}\`;
};

const getBadgeColor = (status: string) => {
  switch(status) {
    case "PAID": return pdfTheme.colors.success;
    case "OVERDUE": return pdfTheme.colors.danger;
    default: return pdfTheme.colors.muted;
  }
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const total = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title.toUpperCase()}</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.badge, { backgroundColor: getBadgeColor(data.status) }]}>
              {data.status}
            </Text>
            <Text style={styles.invoiceNo}>#{data.invoiceNo}</Text>
            <Text style={{ fontSize: 10, color: pdfTheme.colors.textMuted, marginTop: 4 }}>
              Issued: {data.issueDate}
            </Text>
            <Text style={{ fontSize: 10, color: pdfTheme.colors.textMuted }}>
              Due: {data.dueDate}
            </Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.column}>
            <Text style={styles.label}>FROM</Text>
            <Text style={styles.text}>{data.fromName}</Text>
            <Text style={styles.text}>{data.fromEmail}</Text>
            <Text style={styles.text}>{data.fromAddress}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>TO</Text>
            <Text style={styles.text}>{data.toName}</Text>
            <Text style={styles.text}>{data.toEmail}</Text>
            <Text style={styles.text}>{data.toAddress}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          
          {data.lineItems.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.quantity * item.unitPrice, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due:</Text>
          <Text style={styles.totalValue}>{formatCurrency(total, data.currency)}</Text>
        </View>

        {data.notes && (
          <Text style={styles.notesText}>{data.notes}</Text>
        )}

        <Text style={styles.footer} fixed>Generated by DocFlow</Text>
      </Page>
    </Document>
  );
};
