import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order, userName) => {
    if (!order) return;

    try {
        const doc = new jsPDF();
        
        // Colors - High-end Corporate Palette
        const primaryColor = [79, 70, 229];    // Indigo 600
        const secondaryColor = [99, 102, 241]; // Indigo 500
        const accentColor = [15, 23, 42];     // Slate 900
        const lightBg = [249, 250, 251];      // Gray 50

        // --- Premium Header Design ---
        // Main Header Block
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 45, 'F');
        
        // Stylish Slanted Element
        doc.setFillColor(...secondaryColor);
        doc.triangle(120, 0, 210, 0, 210, 45, 'F');
        
        // Background Decorative Patterns (Subtle Circles)
        doc.setFillColor(255, 255, 255, 0.05);
        doc.circle(200, 10, 40, 'F');
        doc.circle(20, 45, 15, 'F');

        // Brand Identity
        try {
            // Logo Placement
            doc.addImage('/logo-removebg-preview.png', 'PNG', 15, 8, 30, 30);
            
            // Brand Name & Subtext
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('Aadhiran Kids Collections', 52, 22);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(240, 240, 240);
            doc.text('Premium Essentials for Little Ones', 52, 29);
        } catch (e) {
            // Fallback if logo fails
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text('Aadhiran Kids Collections', 20, 25);
        }

        // Floating "INVOICE" Badge with Shadow Effect
        doc.setFillColor(0, 0, 0, 0.2); // Shadow
        doc.rect(161, 16, 38, 14, 'F'); 
        doc.setFillColor(255, 255, 255); // Top layer
        doc.rect(160, 15, 38, 14, 'F'); 
        
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 179, 24, { align: 'center' });

        // --- Contact & Order Summary Bar ---
        doc.setFillColor(...lightBg);
        doc.rect(0, 45, 210, 50, 'F');
        
        doc.setDrawColor(226, 232, 240); // border-slate-200
        doc.line(0, 45, 210, 45);
        doc.line(0, 95, 210, 95);

        // Grid Layout for Info
        doc.setTextColor(...accentColor);
        doc.setFontSize(10);
        
        // Left: Bill From
        doc.setFont('helvetica', 'bold');
        doc.text('FROM:', 20, 58);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('Aadhiran Kids Collections', 20, 65);
        doc.text('21,TVS street,PS park,Erode,Tamilnadu,638001', 20, 70);
        doc.text('Email: aadhiranbabyproducts@gmail.com', 20, 75);

        // Center: Order Info
        doc.setTextColor(...accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDER DETAILS:', 85, 58);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(147, 51, 234); // Purple 600
        doc.setFontSize(9);
        doc.text(`ID: #${order._id?.substring(0, 12).toUpperCase()}`, 85, 65);
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        doc.setTextColor(100);
        doc.text(`DATE: ${dateStr}`, 85, 70);
        
        // Right: Bill To
        doc.setTextColor(...accentColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 145, 58);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(userName || 'Customer', 145, 65);
        const address = order.shippingAddress || {};
        doc.text(`${address.address || 'Address N/A'}`, 145, 70);
        doc.text(`${address.city || ''}, ${address.postalCode || ''}`, 145, 75);

        // --- Products Table ---
        const tableData = (order.orderItems || []).map((item, idx) => [
            { content: (idx + 1).toString(), styles: { halign: 'center' } },
            item.name || 'Product',
            { content: `Rs. ${item.price?.toLocaleString()}`, styles: { halign: 'right' } },
            { content: item.qty?.toString() || '1', styles: { halign: 'center' } },
            { content: `Rs. ${((item.price || 0) * (item.qty || 1)).toLocaleString()}`, styles: { halign: 'right', fontStyle: 'bold' } }
        ]);

        autoTable(doc, {
            startY: 105,
            head: [['#', 'Item Description', 'Unit Price', 'Qty', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { 
                fillColor: primaryColor, 
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                padding: 5
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                font: 'helvetica'
            },
            alternateRowStyles: {
                fillColor: [252, 253, 255]
            },
            margin: { left: 20, right: 20 }
        });

        // --- Grand Total Footer ---
        const finalY = doc.lastAutoTable.finalY + 15;
        const totalAmount = order.totalPrice || 0;

        // Visual underline/separator
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(130, finalY - 5, 190, finalY - 5);

        doc.setFontSize(12);
        doc.setTextColor(...accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', 140, finalY + 5);
        
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text(`Rs. ${totalAmount.toLocaleString()}`, 190, finalY + 5, { align: 'right' });

        // Status Ribbon
        const statusColor = order.isPaid ? [16, 185, 129] : [245, 158, 11]; // Green vs Amber
        doc.setFillColor(...statusColor);
        doc.rect(20, finalY, 60, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(order.isPaid ? 'PAYMENT SUCCESS' : 'PAYMENT PENDING', 50, finalY + 5.5, { align: 'center' });

        // --- Final Professional Footer ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(...accentColor); 
        doc.rect(0, pageHeight - 25, 210, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Aadhiran Kids Collections - Thank you for trusting us with your little one\'s comfort!', 105, pageHeight - 12, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Visit us again at www.aadhirankidscollections.com', 105, pageHeight - 7, { align: 'center' });

        // Save
        const fileName = `Invoice_${(order._id || 'order').substring(0, 8)}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error("PDF Component Error:", error);
        alert(`Design Module Issue: ${error.message}`);
    }
};
