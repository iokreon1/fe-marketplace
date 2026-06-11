import numeral from 'numeral';
import { DateTime } from 'luxon';

export function formatRupiah(value) {
    return numeral(value).format('0,0[.]00');
}

export function parseRupiah(value) {
    return numeral(value).value();
}

export function formatPercentage(value) {
    return numeral(value).format('0,0[.]00%');
}

export function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    return new Date(date).toLocaleDateString('id-ID', options);
}

export function formatDateTime(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' };

    return new Date(date).toLocaleDateString('id-ID', options);
}

export function formatToClientTimezone(date) {
    if (!date) return '';
    let originalDate = DateTime.fromISO(date, { zone: 'utc' });
    if (!originalDate.isValid) {
        originalDate = DateTime.fromSQL(date, { zone: 'utc' });
    }
    if (!originalDate.isValid) {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            originalDate = DateTime.fromJSDate(parsed, { zone: 'utc' });
        }
    }
    if (!originalDate.isValid) return '';

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return originalDate
        .setZone(timezone)
        .setLocale('id')
        .toFormat('dd LLLL yyyy, HH:mm');
}

export function ucfirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

