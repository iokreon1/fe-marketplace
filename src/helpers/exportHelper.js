import { formatRupiah, formatToClientTimezone } from './format';

const escapeCSVField = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (/[",\n\r]/.test(str)) {
        str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
};

export function exportTransactionToCSV(transaction) {
    if (!transaction) return;

    const data = [
        ['Detail Transaksi', transaction.code || ''],
        [],
        ['Tanggal', formatToClientTimezone(transaction.created_at) || ''],
        ['Nama Toko', transaction.store?.name || ''],
        ['Nama Pembeli', transaction.buyer?.user?.name || ''],
        ['Email Pembeli', transaction.buyer?.user?.email || ''],
        ['No. Telepon Pembeli', transaction.buyer?.phone_number || ''],
        ['Alamat Pengiriman', `${transaction.address || ''}, ${transaction.city || ''}, ${transaction.postal_code || ''}`],
        ['Kurir', `${transaction.shipping || ''} (${transaction.shipping_type || ''})`],
        ['Ongkos Kirim', `Rp ${formatRupiah(transaction.shipping_cost) || 0}`],
        ['Pajak (11%)', `Rp ${formatRupiah(transaction.tax) || 0}`],
        ['Grand Total', `Rp ${formatRupiah(transaction.grand_total) || 0}`],
        ['Status Pembayaran', transaction.payment_status || ''],
        ['Status Pengiriman', transaction.delivery_status || ''],
        [],
        ['Daftar Produk:'],
        ['Nama Produk', 'Kategori', 'Harga', 'Jumlah', 'Subtotal']
    ];

    if (transaction.transaction_details && transaction.transaction_details.length > 0) {
        transaction.transaction_details.forEach(detail => {
            data.push([
                detail.product?.name || '',
                detail.product?.product_category?.name || '',
                `Rp ${formatRupiah(detail.product?.price) || 0}`,
                detail.qty || 0,
                `Rp ${formatRupiah(detail.subtotal) || 0}`
            ]);
        });
    }

    const csvContent = "\uFEFF" + data.map(row => row.map(escapeCSVField).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Transaction_${transaction.code || 'Export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
