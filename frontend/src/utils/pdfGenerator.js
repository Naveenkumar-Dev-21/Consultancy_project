import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order, userName) => {
    console.log("generateInvoice start", { orderId: order?._id, userName });

    if (!order) {
        console.error("generateInvoice called with no order");
        return;
    }

    try {
        const doc = new jsPDF();
        console.log("jsPDF instance created");

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text('Aadhiran Kids Collection', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Order ID: ${order._id || 'N/A'}`, 20, 40);
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        doc.text(`Date: ${dateStr}`, 20, 45);

        // Billing Details
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text('Shipping Details:', 20, 60);

        doc.setFontSize(10);
        doc.setTextColor(100);
        if (userName) doc.text(`Customer: ${userName}`, 20, 65);

        const address = order.shippingAddress || {};
        doc.text(`${address.address || 'No Address'}`, 20, 70);
        doc.text(`${address.city || ''} ${address.postalCode || ''}`, 20, 75);
        doc.text(`${address.country || ''}`, 20, 80);

        // Table
        const orderItems = order.orderItems || [];
        const tableData = orderItems.map(item => [
            item.name || 'Product',
            `Rs. ${item.price || 0}`,
            item.qty || 1,
            `Rs. ${((item.price || 0) * (item.qty || 1)).toFixed(2)}`
        ]);

        console.log("Preparing table data", tableData);

        // Use autoTable as an imported function
        autoTable(doc, {
            startY: 95,
            head: [['Product', 'Price', 'Qty', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillStyle: [252, 165, 165] }, // beelittle-coral style
        });
        console.log("Table generated");

        // Total
        const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 150;
        doc.setFontSize(14);
        doc.setTextColor(40);
        const total = typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : '0.00';
        doc.text(`Total Amount: Rs. ${total}`, 190, finalY, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Thank you for shopping with Aadhiran Kids Collection!', 105, finalY + 30, { align: 'center' });

        // Save
        const fileName = `Invoice_${(order._id || 'order').substring(0, 8)}.pdf`;
        doc.save(fileName);
        console.log(`Invoice generated and saved: ${fileName}`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        console.error(error.stack);
        alert(`Failed to generate invoice: ${error.message}`);
    }
};
