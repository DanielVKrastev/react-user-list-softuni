export const fromIsoDate = (isoDate) => {
    const date = new Date(isoDate);

    const formatedDate = date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

    return formatedDate;
}