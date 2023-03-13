export interface Sponsor {
    name: string;  // Name of the sponsor
    logo: string;  // URL referencing the logo in assets/sponsors/
    url: string;  // URL to the sponsor's website
}

export const sponsors: Sponsor[] = [
    {
        name: 'Bratislavský kraj',
        logo: 'bk.svg',
        url: 'https://bratislavskykraj.sk/'
    },
    {
        name: 'Bratislava - Staré Mesto',
        logo: 'b-sm.svg',
        url: 'https://www.staremesto.sk/'
    },
    {
        name: 'Mesto Bratislava',
        logo: 'bratislava.svg',
        url: 'https://www.bratislava.sk/'
    },
    {
        name: 'Škubla & Partneri',
        logo: 'skubla.svg',
        url: 'https://www.skubla.sk/'
    },
    {
        name: 'Stilus',
        logo: 'stilus.svg',
        url: 'https://www.stilus.sk/'
    },
];

export default sponsors;